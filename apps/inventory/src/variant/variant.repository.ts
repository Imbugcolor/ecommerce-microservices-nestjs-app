import { AbstractRepository } from '@app/common';
import { Variant } from './models/variant.schema';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class VariantRepository extends AbstractRepository<Variant> {
  protected readonly logger = new Logger(VariantRepository.name);

  constructor(@InjectModel(Variant.name) variantModel: Model<Variant>) {
    super(variantModel);
  }
}
