import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Wishlist } from './models/wishlist.schema';
import { Model, Types } from 'mongoose';
import { Product, User } from '@app/common';
import { WishlistRepository } from './wishlist.repository';
import { WishlistQuery } from './paginate/wishlist-query';

@Injectable()
export class WishlistService {
  constructor(
    private readonly wishlistRepository: WishlistRepository,
    @InjectModel(Wishlist.name) private wishlistModel: Model<Wishlist>,
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}

  async createWishlist(
    user: User,
    productIds?: Types.ObjectId[],
  ): Promise<Wishlist> {
    const newWishlist = await this.wishlistModel.create({
      _id: new Types.ObjectId(),
      user: user._id,
      products: productIds && productIds.length > 0 ? productIds : [],
    });

    return newWishlist;
  }

  async getWishlist(user: User): Promise<Wishlist> {
    const wishlist = await this.wishlistModel
      .findOne({ user: user._id })
      .populate(
        'products',
        '_id product_id price title description category images rating numReviews',
      );

    if (!wishlist) {
      return await this.createWishlist(user);
    }

    return wishlist;
  }

  async getWishlistPagination(
    user: User,
    wishlistquery?: WishlistQuery,
  ): Promise<Wishlist> {
    const offset = (wishlistquery.page - 1) * wishlistquery.limit;
    const stages: Wishlist[] = await this.wishlistModel.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: 'products',
          foreignField: '_id',
          as: 'products',
        },
      },
      {
        $match: {
          user: user._id,
        },
      },
      {
        $project: {
          products: {
            $slice: ['$products', offset, wishlistquery.limit],
          },
          user: 1,
          createdAt: 1,
          updatedAt: 1,
          numProducts: {
            $size: '$products',
          },
        },
      },
    ]);

    if (stages.length == 0) {
      return await this.createWishlist(user);
    }

    return stages[0];
  }

  async addWishlist(user: User, productId: string): Promise<Wishlist> {
    const product = await this.productModel.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not exists.');
    }

    const wishlist = await this.getWishlist(user);

    if (
      wishlist.products.find((product) => product._id.toString() === productId)
    ) {
      return await this.getWishlist(user);
    }

    await this.wishlistRepository.findByIdAndUpdate(wishlist._id.toString(), {
      $push: { products: new Types.ObjectId(productId) },
    });

    return await this.getWishlist(user);
  }

  async deleteOneWishlist(user: User, productId: string): Promise<Wishlist> {
    const wishlist = await this.getWishlist(user);

    if (
      !wishlist.products.find((product) => product._id.toString() === productId)
    ) {
      throw new NotFoundException('Product in Wishlist not exists.');
    }

    await this.wishlistRepository.findByIdAndUpdate(wishlist._id.toString(), {
      $pull: { products: new Types.ObjectId(productId) },
    });

    return await this.getWishlist(user);
  }
}
