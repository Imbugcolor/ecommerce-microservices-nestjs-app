import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { GetUser, JwtAuthGuard, User } from '@app/common';
import { Cart } from '@app/common';
import { AddCartDto } from './dto/add-cart.dto';
import { UpdateCartAction } from './enums/update-cart-action.enum';
import { UpdateCartDto } from './dto/update-cart.dto';
import { DeleteCartItemDto } from './dto/delete-cart-item.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';

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

  @Patch('increment')
  @UseGuards(JwtAuthGuard)
  increment(@Body() updateCartDto: UpdateCartDto): Promise<Cart> {
    return this.cartService.updateCart(
      updateCartDto,
      UpdateCartAction.INCREMENT,
    );
  }

  @Patch('decrement')
  @UseGuards(JwtAuthGuard)
  decrement(@Body() updateCartDto: UpdateCartDto): Promise<Cart> {
    return this.cartService.updateCart(
      updateCartDto,
      UpdateCartAction.DECREMENT,
    );
  }

  @Patch('delete-item')
  @UseGuards(JwtAuthGuard)
  deleteItem(@Body() deleteCartItemDto: DeleteCartItemDto): Promise<Cart> {
    return this.cartService.deleteCartItem(deleteCartItemDto);
  }

  @Patch('empty-cart')
  @UseGuards(JwtAuthGuard)
  emptyCart(@GetUser() user: User): Promise<Cart> {
    return this.cartService.emptyCart(user._id.toString());
  }

  @MessagePattern('get-cart')
  async productValidate(@Payload() user: User) {
    return this.cartService.getCartFromService(user._id.toString());
  }

  @MessagePattern('empty-cart')
  async emptyCartFromService(@Payload() user: User) {
    return this.cartService.emptyCartFromService(user._id.toString());
  }

  @MessagePattern('update-price')
  async updatePrice(@Payload() data: { productId: string; price: number }) {
    return this.cartService.updatePriceCartItem(data.productId, data.price);
  }
}
