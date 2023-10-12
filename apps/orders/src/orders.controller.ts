import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { GetUser, JwtAuthGuard, Order, User } from '@app/common';
import { CreateOrderFromCartDto } from './dto/create-order-from-cart.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  // @UseGuards(JwtAuthGuard)
  getOrders() {
    return 'Checkout complete!';
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  getOrder(@Param('id') id: string, @GetUser() user: User): Promise<Order> {
    return this.ordersService.getUserOrder(id, user);
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

  @Patch('/cancel/:id')
  @UseGuards(JwtAuthGuard)
  cancelOrder(@Param('id') id: string, @GetUser() user: User): Promise<Order> {
    return this.ordersService.cancelOrder(id, user);
  }
}
