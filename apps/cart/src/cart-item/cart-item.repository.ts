import { AbstractRepository } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CartItem } from '@app/common';

@Injectable()
export class CartItemRepository extends AbstractRepository<CartItem> {
  protected readonly logger = new Logger(CartItemRepository.name);

  constructor(@InjectModel(CartItem.name) cartItemModel: Model<CartItem>) {
    super(cartItemModel);
  }
}
