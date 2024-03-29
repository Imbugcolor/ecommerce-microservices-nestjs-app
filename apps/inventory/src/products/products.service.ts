import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ProductRepository } from './products.repository';
import { InjectModel } from '@nestjs/mongoose';
import {
  DataListQuery,
  DataResponse,
  Discount,
  OrderItem,
  Product,
} from '@app/common';
import { Model, Types } from 'mongoose';
import { CreateProductDto } from './dto/create-product.dto';
import { VariantService } from '../variant/variant.service';
import { UpdateProductDto } from './dto/update-product.dto';
import { RpcException } from '@nestjs/microservices';
import { CategoryRepository } from '../category/category.repository';
import { ProductQuery } from './input/product-query';

@Injectable()
export class ProductsService {
  constructor(
    private productRepository: ProductRepository,
    @InjectModel(Product.name) private productModel: Model<Product>,
    private variantService: VariantService,
    @InjectModel(Discount.name) private discountModel: Model<Discount>,
    private categoryRepository: CategoryRepository,
  ) {}

  async validate(id: string): Promise<Product> {
    const product = await this.productModel.findById(id);
    if (!product) {
      throw new RpcException(
        new NotFoundException(`This product id: [${id}] is not found.`),
      );
    }
    return product;
  }

  async getProduct(id: string): Promise<Product> {
    const product = await this.productModel.findById(id).populate([
      {
        path: 'variants',
        select: 'size color inventory productId',
      },
      {
        path: 'reviews',
        select: 'rating comment user productId',
      },
      {
        path: 'reviews',
        populate: {
          path: 'user',
          select: 'username avatar',
        },
      },
      {
        path: 'discountId',
        select: 'discount_value valid_until',
      },
    ]);
    if (!product) {
      throw new NotFoundException(`Product id: ${id} is not exist.`);
    }
    return product;
  }

  async getProducts(
    productQuery: ProductQuery,
  ): Promise<DataResponse<Product>> {
    try {
      const variant_ids: string[] = [];
      if (productQuery.sizes) {
        const sizesArray = productQuery.sizes.split(',');

        const variantsArr = await this.variantService.getVariantsByQuery({
          size: { $in: sizesArray },
        });
        variantsArr.forEach((item) => {
          return variant_ids.push(item._id.toString());
        });
      }

      const dataQuery = new DataListQuery(
        this.productModel.find(
          productQuery.sizes && { variants: { $in: variant_ids } },
        ),
        productQuery,
      )
        .filtering()
        .sorting();

      const total = await dataQuery.query;

      const productsQuery = new DataListQuery(
        this.productModel.find(
          productQuery.sizes && { variants: { $in: variant_ids } },
        ),
        productQuery,
      )
        .filtering()
        .sorting()
        .paginate();

      const products = await productsQuery.query.populate([
        {
          path: 'variants',
          select: 'size color inventory productId',
        },
        {
          path: 'reviews',
          select: 'rating comment user productId',
        },
        {
          path: 'reviews',
          populate: {
            path: 'user',
            select: 'username avatar',
          },
        },
        {
          path: 'discountId',
          select: 'discount_value valid_until',
        },
      ]);

      return {
        total: total.length,
        totalPerPage: products.length,
        data: products,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    const {
      product_id,
      title,
      description,
      content,
      price,
      images,
      category,
      variants,
    } = createProductDto;

    // validate category
    try {
      await this.categoryRepository.findById(category);
    } catch (error) {
      if (error.path === '_id' && error.kind === 'ObjectId') {
        throw new BadRequestException(
          '[_id] Argument passed in must be a string of 12 bytes or a string of 24 hex characters or an integer ',
        );
      }
      throw new InternalServerErrorException(error.message);
    }

    const newProduct = new this.productModel({
      _id: new Types.ObjectId(),
      product_id,
      title: title.toLowerCase(),
      content,
      description,
      base_price: price,
      price,
      images,
      category,
    });

    await Promise.all(
      variants.map(async (item) => {
        const variant = {
          size: item.size,
          color: item.color,
          inventory: item.inventory,
          productId: newProduct._id,
        };

        const newVariant = await this.variantService.createVariant(variant);

        newProduct.variants.push(newVariant);
      }),
    );

    try {
      return await newProduct.save();
    } catch (err) {
      if (err && err.code !== 11000) {
        throw new InternalServerErrorException();
      }

      //duplicate key
      if (err && err.code === 11000) {
        throw new ConflictException(
          `product_id [${product_id}] already exists.`,
        );
      }
    }
  }

  async updateProduct(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const { variants, ...updateQuery } = updateProductDto;

    // validate category
    if (updateQuery.category) {
      try {
        await this.categoryRepository.findById(updateQuery.category);
      } catch (error) {
        if (error.path === '_id' && error.kind === 'ObjectId') {
          throw new BadRequestException(
            '[_id] Argument passed in must be a string of 12 bytes or a string of 24 hex characters or an integer ',
          );
        }
        throw new InternalServerErrorException(error.message);
      }
    }

    const oldProduct = await this.productModel.findById(id);

    // check product is on sale
    if (updateQuery.price) {
      if (oldProduct.isDiscount && oldProduct.discountId) {
        const discount = await this.discountModel.findById(
          oldProduct.discountId,
        );

        await this.productRepository.findByIdAndUpdate(id, {
          ...updateQuery,
          price:
            updateQuery.price -
            updateQuery.price * (discount.discount_value / 100),
          base_price: updateQuery.price,
        });
      } else {
        await this.productRepository.findByIdAndUpdate(id, {
          ...updateQuery,
          base_price: updateQuery.price,
        });
      }
    } else {
      await this.productRepository.findByIdAndUpdate(id, updateQuery);
    }

    if (variants) {
      // Remove variants in variants schema if it removed in variants field of products schema
      const ids: any[] = [];
      variants.map((item) => {
        if (item._id) {
          return ids.push(item._id);
        }
      });

      const removeVariants = oldProduct.variants.filter(
        (item) => !ids.includes(item.toString()),
      );

      oldProduct.variants = oldProduct.variants.filter(
        (item) => !removeVariants.includes(item),
      );

      await oldProduct.save();

      await this.variantService.deleteVariants(removeVariants);

      // Update Variants - Add new Variants
      await Promise.all(
        variants.map(async (item) => {
          if (!item._id) {
            const newVariant = await this.variantService.createVariant(item);

            await this.productRepository.findByIdAndUpdate(id, {
              $push: {
                variants: newVariant,
              },
            });
          } else {
            const variant = {
              _id: item._id,
              size: item.size,
              color: item.color,
              inventory: item.inventory,
            };
            await this.variantService.updateVariant(variant);
          }
        }),
      );
    }

    const product = await this.getProduct(id);

    return product;
  }

  async soldCount(data: { items: OrderItem[]; resold: boolean }) {
    const newItems = data.items.map((item) => {
      return {
        ...item,
        productId: item.productId._id,
      };
    });

    const groupBy = function (xs: any[], id: string) {
      return xs.reduce(function (rv: any, x: any) {
        (rv[x[id]] = rv[x[id]] || []).push(x);
        return rv;
      }, {});
    };

    const keyId = 'productId';
    // Group by _id of items to calculate total sold each product in order items
    const groupById = groupBy(newItems, keyId);

    Object.keys(groupById).forEach((id) => {
      const sumQuantity = groupById[id].reduce((acc: number, curr: any) => {
        return acc + curr.quantity;
      }, 0);
      return this.updateSold(id, sumQuantity, data.resold);
    });
  }

  async updateSold(id: string, quantity: number, resold: boolean) {
    return this.productModel.findByIdAndUpdate(id, {
      $inc: { sold: resold ? -quantity : quantity },
    });
  }

  async deleteProduct(id: string) {
    const product = await this.productRepository.findById(id);

    const variantIds: string[] = [];
    product.variants.map((variant) => variantIds.push(variant.toString()));

    await this.productRepository.findByIdAndDelete(id);
    await this.variantService.deleteMany(variantIds);

    return { msg: 'Delete Successfully.' };
  }
}
