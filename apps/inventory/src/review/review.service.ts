import { Order, Product, Review, User } from '@app/common';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ReviewRepository } from './review.repository';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<Review>,
    private reviewRepository: ReviewRepository,
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Order.name) private orderModel: Model<Order>,
  ) {}

  async createReview(
    createReviewDto: CreateReviewDto,
    productId: string,
    user: User,
  ): Promise<Review> {
    const { rating, comment } = createReviewDto;

    const review = new this.reviewModel({
      _id: new Types.ObjectId(),
      rating,
      comment,
      user: user._id.toString(),
      productId,
    });

    await this.addReview(productId, review, user._id.toString());

    return review.save();
  }

  async addReview(
    id: string,
    review: Review,
    userId: string,
  ): Promise<Product> {
    const product = await this.productModel
      .findById(id)
      .populate('reviews', 'rating');

    if (!product) {
      throw new NotFoundException(`Product id: [${id}] is not exists.`);
    }

    const history = await this.orderModel.find({
      $and: [{ user: userId }, { status: 'Delivered' }],
    });

    const itemsArray = history.map((order) => {
      return order.items;
    });

    const productsArray = itemsArray.flat();

    const proIdsArray = productsArray.map((item) => {
      return item.productId._id.toString();
    });

    const isBoughtProduct = proIdsArray.includes(id);

    if (!isBoughtProduct) {
      throw new BadRequestException('Can not review this product.');
    }

    const ids = product.reviews;
    const reviews = await this.reviewRepository.find({ _id: { $in: ids } });

    const alreadyReviewed = reviews.find((r) => r.user.toString() === userId);

    if (alreadyReviewed) {
      throw new BadRequestException('You have already rated this product.');
    }

    product.reviews.push(review);
    product.numReviews = reviews.length + 1;
    product.rating =
      (reviews.reduce((acc: number, item: Review) => item.rating + acc, 0) +
        review.rating) /
      (reviews.length + 1);

    return await product.save();
  }

  async getReviews(ids: any[]) {
    return this.reviewModel.find({ _id: { $in: ids } });
  }
}
