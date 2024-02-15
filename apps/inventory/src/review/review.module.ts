import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import {
  AUTH_SERVICE,
  DatabaseModule,
  Order,
  OrderSchema,
  Product,
  ProductSchema,
} from '@app/common';
import { Review, ReviewSchema } from '@app/common';
import { ReviewRepository } from './review.repository';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    DatabaseModule.forFeature([
      { name: Review.name, schema: ReviewSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
    ClientsModule.registerAsync([
      {
        imports: [ConfigModule],
        name: AUTH_SERVICE,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.getOrThrow<string>('RABBITMQ_URI')],
            queue: 'auth',
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [ReviewService, ReviewRepository],
  controllers: [ReviewController],
  exports: [ReviewService, ReviewRepository],
})
export class ReviewModule {}
