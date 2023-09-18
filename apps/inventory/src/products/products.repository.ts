import { AbstractRepository } from '@app/common';
import { Product } from './models/products.schema';
import { Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class ProductRepository extends AbstractRepository<Product> {
  protected readonly logger = new Logger(ProductRepository.name);

  constructor(@InjectModel(Product.name) productModel: Model<Product>) {
    super(productModel);
  }
}
