import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Variant } from '@app/common';
import { FilterQuery, Model } from 'mongoose';
import { VariantRepository } from './variant.repository';
import { VariantType } from './types/variant.type';

@Injectable()
export class VariantService {
  constructor(
    private variantRepository: VariantRepository,
    @InjectModel(Variant.name) private variantModel: Model<Variant>,
  ) {}

  async validate(id: string): Promise<Variant> {
    return this.variantRepository.findById(id);
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

  async updateInventory(
    id: string,
    quantity: number,
    resold: boolean,
  ): Promise<Variant> {
    const newVariant = await this.variantRepository.findByIdAndUpdate(id, {
      $inc: { inventory: resold ? quantity : -quantity },
    });
    return newVariant;
  }
}
