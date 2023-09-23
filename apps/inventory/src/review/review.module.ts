import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { DatabaseModule } from '@app/common';
import { Review, ReviewSchema } from '../../../../libs/common/src/models/review.schema';
import { ReviewRepository } from './review.repository';

@Module({
  imports: [
    DatabaseModule.forFeature([{ name: Review.name, schema: ReviewSchema }]),
  ],
  providers: [ReviewService, ReviewRepository],
  controllers: [ReviewController],
  exports: [ReviewService, ReviewRepository],
})
export class ReviewModule {}
