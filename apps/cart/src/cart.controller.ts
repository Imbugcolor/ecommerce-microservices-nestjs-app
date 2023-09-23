import { Controller, Get, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { GetUser, JwtAuthGuard, User } from '@app/common';
import { Cart } from './models/cart.schema';

@Controller()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  getCart(@GetUser() user: User): Promise<Cart> {
    return this.cartService.getCart(user);
  }
}
