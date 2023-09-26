import { Module } from '@nestjs/common';
import { CartItemService } from './cart-item.service';
import { DatabaseModule, Variant, VariantSchema } from '@app/common';
import { CartItem, CartItemSchema } from '@app/common';
import { CartItemRepository } from './cart-item.repository';

@Module({
  imports: [
    DatabaseModule.forFeature([
      { name: CartItem.name, schema: CartItemSchema },
      { name: Variant.name, schema: VariantSchema },
    ]),
  ],
  providers: [CartItemService, CartItemRepository],
  exports: [CartItemService],
})
export class CartItemModule {}
