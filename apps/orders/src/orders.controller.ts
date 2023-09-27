import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { GetUser, JwtAuthGuard, User } from '@app/common';
import { CreateOrderFromCartDto } from './dto/create-order-from-cart.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  // @UseGuards(JwtAuthGuard)
  getOrders() {
    return 'Checkout complete!';
  }

  @Post('create-cod-order')
  @UseGuards(JwtAuthGuard)
  createCodOrder(
    @Body() createOrderFromCartDto: CreateOrderFromCartDto,
    @GetUser() user: User,
  ) {
    return this.ordersService.createCodOrderFromCart(
      createOrderFromCartDto,
      user,
    );
  }

  @Post('create-checkout-order')
  @UseGuards(JwtAuthGuard)
  createCheckout(
    @Body() createOrderDto: CreateOrderFromCartDto,
    @GetUser() user: User,
  ) {
    return this.ordersService.createCheckout(createOrderDto, user);
  }
}
