import { AbstractRepository } from '@app/common';
import { Review } from '../../../../libs/common/src/models/review.schema';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ReviewRepository extends AbstractRepository<Review> {
  protected readonly logger = new Logger(ReviewRepository.name);

  constructor(@InjectModel(Review.name) reviewModel: Model<Review>) {
    super(reviewModel);
  }
}
