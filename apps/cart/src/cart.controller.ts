import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { GetUser, JwtAuthGuard, User } from '@app/common';
import { Cart } from './models/cart.schema';
import { AddCartDto } from './dto/add-cart.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  getCart(@GetUser() user: User): Promise<Cart> {
    return this.cartService.getCart(user);
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  addCart(
    @Body() addCartDto: AddCartDto,
    @GetUser() user: User,
  ): Promise<Cart> {
    return this.cartService.addCart(addCartDto, user);
  }
}
