import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { GetUser, User } from '@app/common';
import { AccessTokenGuard } from '../guards/accessToken.guard';
import { WishlistQuery } from './paginate/wishlist-query';
import { PaginationTransformPipe } from './paginate/pagination.transfrom.pipe';

@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  @UseGuards(AccessTokenGuard)
  async getWishlist(
    @GetUser() user: User,
    @Query(new PaginationTransformPipe()) wishlistquery: WishlistQuery,
  ) {
    return this.wishlistService.getWishlistPagination(user, wishlistquery);
  }

  @Patch('add/:productId')
  @UseGuards(AccessTokenGuard)
  async addWishlist(
    @GetUser() user: User,
    @Param('productId') productId: string,
  ) {
    return this.wishlistService.addWishlist(user, productId);
  }

  @Patch('delete/:productId')
  @UseGuards(AccessTokenGuard)
  async deleteOne(
    @GetUser() user: User,
    @Param('productId') productId: string,
  ) {
    return this.wishlistService.deleteOneWishlist(user, productId);
  }
}
