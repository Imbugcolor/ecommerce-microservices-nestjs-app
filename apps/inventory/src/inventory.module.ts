import { Module } from '@nestjs/common';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { DatabaseModule, LoggerModule } from '@app/common';
import { ProductsModule } from './products/products.module';
import { CategoryModule } from './category/category.module';
import { VariantModule } from './variant/variant.module';
import { ReviewModule } from './review/review.module';

@Module({
  imports: [
    DatabaseModule,
    ProductsModule,
    CategoryModule,
    VariantModule,
    ReviewModule,
    LoggerModule,
  ],
  controllers: [InventoryController],
  providers: [InventoryService],
})
export class InventoryModule {}
