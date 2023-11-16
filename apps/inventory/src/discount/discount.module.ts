import { Module } from '@nestjs/common';
import { DiscountController } from './discount.controller';
import { DiscountService } from './discount.service';
import {
  DatabaseModule,
  Discount,
  DiscountSchema,
  Product,
  ProductSchema,
} from '@app/common';
import { DiscountRepository } from './discount.repository';

@Module({
  imports: [
    DatabaseModule.forFeature([
      { name: Discount.name, schema: DiscountSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  controllers: [DiscountController],
  providers: [DiscountService, DiscountRepository],
})
export class DiscountModule {}
