import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ProductRepository } from './products.repository';
import { InjectModel } from '@nestjs/mongoose';
import { OrderItem, Product } from '@app/common';
import { Model, Types } from 'mongoose';
import { CreateProductDto } from './dto/create-product.dto';
import { VariantService } from '../variant/variant.service';
import { UpdateProductDto } from './dto/update-product.dto';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ProductsService {
  constructor(
    private productRepository: ProductRepository,
    @InjectModel(Product.name) private productModel: Model<Product>,
    private variantService: VariantService,
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
    ]);
    if (!product) {
      throw new NotFoundException(`Product id: ${id} is not exist.`);
    }
    return product;
  }

  async getProducts(): Promise<Product[]> {
    return this.productModel.find().populate([
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
    ]);
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

    const newProduct = new this.productModel({
      _id: new Types.ObjectId(),
      product_id,
      title: title.toLowerCase(),
      content,
      description,
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
        console.log(err);
        console.log(err.code);
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
    const oldProduct = await this.productModel.findById(id);

    const { variants, ...updateQuery } = updateProductDto;

    await this.productRepository.findByIdAndUpdate(id, updateQuery);

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
}
