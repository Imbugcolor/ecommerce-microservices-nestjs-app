import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ProductRepository } from './products.repository';
import { DatabaseModule } from '@app/common';
import { Product, ProductSchema } from './models/products.schema';
import { Category, CategorySchema } from '../category/models/category.schema';
import { CategoryModule } from '../category/category.module';
import { Variant, VariantSchema } from '../variant/models/variant.schema';
import { Review, ReviewSchema } from '../review/models/review.schema';
import { VariantModule } from '../variant/variant.module';
import { ReviewModule } from '../review/review.module';

@Module({
  imports: [
    DatabaseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Variant.name, schema: VariantSchema },
      { name: Review.name, schema: ReviewSchema },
    ]),
    CategoryModule,
    VariantModule,
    ReviewModule,
  ],
  providers: [ProductsService, ProductRepository],
  controllers: [ProductsController],
})
export class ProductsModule {}
