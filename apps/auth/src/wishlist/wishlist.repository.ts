import { AbstractRepository } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { Wishlist } from './models/wishlist.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class WishlistRepository extends AbstractRepository<Wishlist> {
  protected readonly logger = new Logger(WishlistRepository.name);

  constructor(@InjectModel(Wishlist.name) wishlistModel: Model<Wishlist>) {
    super(wishlistModel);
  }
}
