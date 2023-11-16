import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DiscountRepository } from './discount.repository';
import { CreateDiscountProductsDto } from './dto/create-discount-products.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from '@app/common';
import { Model } from 'mongoose';
import { CancelDiscountProductsDto } from './dto/cancel-discount-products.dto';

@Injectable()
export class DiscountService {
  constructor(
    private discountRepository: DiscountRepository,
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}

  async createDiscountProducts(
    createDiscountProductsDto: CreateDiscountProductsDto,
  ) {
    console.log(createDiscountProductsDto);
    const { products, discount_value, valid_until } = createDiscountProductsDto;

    //validate products
    await Promise.all(
      products.map(async (id) => {
        try {
          const product = await this.productModel.findById(id);
          if (!product) {
            throw new NotFoundException(
              `This product id: [${id}] is not found.`,
            );
          }
          if (product.isDiscount) {
            throw new NotFoundException(
              `This product id: [${id}] has been discounted.`,
            );
          }
        } catch (error) {
          throw new InternalServerErrorException(error.message);
        }
      }),
    );

    //validate valid_until date
    const today = new Date().getTime();
    const validUntil = new Date(valid_until).getTime();
    if (validUntil <= today) {
      throw new BadRequestException(
        '[valid_until] must be Bigger or Equal to today date',
      );
    }

    const newDiscount = await this.discountRepository.create({
      ...createDiscountProductsDto,
      valid_from: new Date(),
    });

    await Promise.all(
      products.map(async (id) => {
        const product = await this.productModel.findById(id);
        if (!product) {
          throw new NotFoundException(`This product id: [${id}] is not found.`);
        }

        const priceDiscount =
          product.base_price - product.base_price * (discount_value / 100);

        await this.productModel.findByIdAndUpdate(id, {
          price: priceDiscount,
          isDiscount: true,
          discountId: newDiscount._id,
        });
      }),
    );

    return newDiscount;
  }

  async cancelDiscountProducts(
    cancelDiscountProductsDto: CancelDiscountProductsDto,
  ) {
    const { products } = cancelDiscountProductsDto;

    //validate products
    await Promise.all(
      products.map(async (id) => {
        const product = await this.productModel.findById(id);
        if (!product) {
          throw new NotFoundException(`This product id: [${id}] is not found.`);
        }
        if (!product.isDiscount) {
          throw new NotFoundException(
            `This product id: [${id}] is not discount.`,
          );
        }
      }),
    );

    await Promise.all(
      products.map(async (id) => {
        const product = await this.productModel.findById(id);
        if (!product) {
          throw new NotFoundException(`This product id: [${id}] is not found.`);
        }

        await this.productModel.findByIdAndUpdate(id, {
          price: product.base_price,
          isDiscount: false,
          discountId: null,
        });
      }),
    );

    return { msg: 'Canceled success.' };
  }
}
