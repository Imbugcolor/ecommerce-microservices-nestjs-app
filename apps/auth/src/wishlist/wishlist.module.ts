import { DatabaseModule, Product, ProductSchema } from '@app/common';
import { Module } from '@nestjs/common';
import { Wishlist, WishlistSchema } from './models/wishlist.schema';
import { WishlistController } from './wishlist.controller';
import { WishlistService } from './wishlist.service';
import { WishlistRepository } from './wishlist.repository';

@Module({
  imports: [
    DatabaseModule.forFeature([
      { name: Wishlist.name, schema: WishlistSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  controllers: [WishlistController],
  providers: [WishlistService, WishlistRepository],
})
export class WishlistModule {}
