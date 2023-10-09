import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { GetUser, JwtAuthGuard, Review, User } from '@app/common';
import { ReviewService } from './review.service';

@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post(':id')
  @UseGuards(JwtAuthGuard)
  async createReview(
    @Body() createReviewDto: CreateReviewDto,
    @Param('id') productId: string,
    @GetUser() user: User,
  ): Promise<Review> {
    return this.reviewService.createReview(createReviewDto, productId, user);
  }
}
