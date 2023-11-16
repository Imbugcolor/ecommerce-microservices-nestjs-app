import { AbstractRepository, Discount } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class DiscountRepository extends AbstractRepository<Discount> {
  protected readonly logger = new Logger(DiscountRepository.name);
  constructor(@InjectModel(Discount.name) discountModel: Model<Discount>) {
    super(discountModel);
  }
}
