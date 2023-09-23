import { Module } from '@nestjs/common';
import { CartItemService } from './cart-item.service';
import { DatabaseModule } from '@app/common';
import { CartItem, CartItemSchema } from './models/cart-item.schema';
import { CartItemRepository } from './cart-item.repository';

@Module({
  imports: [
    DatabaseModule.forFeature([
      { name: CartItem.name, schema: CartItemSchema },
    ]),
  ],
  providers: [CartItemService, CartItemRepository],
  exports: [CartItemService],
})
export class CartItemModule {}
