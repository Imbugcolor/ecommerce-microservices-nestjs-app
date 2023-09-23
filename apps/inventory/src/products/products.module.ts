import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ProductRepository } from './products.repository';
import { AUTH_SERVICE, DatabaseModule } from '@app/common';
import { Product, ProductSchema } from '@app/common';
import { Category, CategorySchema } from '@app/common';
import { CategoryModule } from '../category/category.module';
import { Variant, VariantSchema } from '@app/common';
import { Review, ReviewSchema } from '@app/common';
import { VariantModule } from '../variant/variant.module';
import { ReviewModule } from '../review/review.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';

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
    ClientsModule.registerAsync([
      {
        imports: [ConfigModule],
        name: AUTH_SERVICE,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get('AUTH_HOST') /*define in docker-compose */,
            port: configService.get('AUTH_PORT'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [ProductsService, ProductRepository],
  controllers: [ProductsController, ProductsService, ProductRepository],
  exports: [ProductsService, ProductRepository],
})
export class ProductsModule {}
