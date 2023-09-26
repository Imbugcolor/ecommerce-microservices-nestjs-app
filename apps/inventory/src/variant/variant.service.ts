import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CartItem, Variant } from '@app/common';
import { FilterQuery, Model } from 'mongoose';
import { VariantRepository } from './variant.repository';
import { VariantType } from './types/variant.type';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class VariantService {
  constructor(
    private variantRepository: VariantRepository,
    @InjectModel(Variant.name) private variantModel: Model<Variant>,
  ) {}

  async validate(id: string): Promise<Variant> {
    const variant = await this.variantRepository.findById(id);
    if (!variant) {
      throw new RpcException(
        new NotFoundException(`This product id: [${id}] is not found.`),
      );
    }
    return variant;
  }

  async createVariant(variant: VariantType): Promise<Variant> {
    const { size, color, inventory, productId } = variant;
    const newVariant = await this.variantRepository.create({
      size,
      color,
      inventory,
      productId,
    });
    return newVariant;
  }

  async updateVariant(variant: VariantType): Promise<Variant> {
    const { _id, size, color, inventory } = variant;
    const newVariant = await this.variantRepository.findByIdAndUpdate(
      _id.toString(),
      {
        size,
        color,
        inventory,
      },
    );
    return newVariant;
  }

  async deleteVariants(ids: any[]): Promise<any> {
    return this.variantModel.deleteMany({ _id: { $in: ids } });
  }

  async getVariantsByQuery(query: FilterQuery<Variant>): Promise<any> {
    return this.variantRepository.find(query);
  }

  async checkInStock(items: CartItem[]) {
    await Promise.all(
      items.map(async (items) => {
        const variant = await this.variantModel.findById(
          items.variantId._id.toString(),
        );

        if (!variant) {
          throw new RpcException(
            new BadRequestException(
              `Product has variant id : [${items.variantId._id.toString()}] is not found.`,
            ),
          );
        }

        if (variant.inventory - items.quantity < 0) {
          throw new RpcException(
            new BadRequestException(
              `Inventory of product has variant: [${items.variantId._id.toString()}] is not enough.`,
            ),
          );
        }

        return variant;
      }),
    );
  }

  async inventoryCount(data: { items: CartItem[]; resold: boolean }) {
    if (!data.resold) {
      await this.checkInStock(data.items);
    }

    await Promise.all(
      data.items.map(async (items) => {
        try {
          const newVariant = await this.variantRepository.findByIdAndUpdate(
            items.variantId._id.toString(),
            {
              $inc: {
                inventory: data.resold ? items.quantity : -items.quantity,
              },
            },
          );
          return newVariant;
        } catch (error) {
          throw new RpcException(
            new InternalServerErrorException(error.message),
          );
        }
      }),
    );

    return true;
  }
}
