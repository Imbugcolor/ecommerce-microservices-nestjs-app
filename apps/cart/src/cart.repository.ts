import { AbstractRepository } from '@app/common';
import { Cart } from './models/cart.schema';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class CartRepository extends AbstractRepository<Cart> {
  protected readonly logger = new Logger(CartRepository.name);

  constructor(@InjectModel(Cart.name) cartModel: Model<Cart>) {
    super(cartModel);
  }
}
