import {
  Body,
  Controller,
  Get,
  Param,
  Query,
  Patch,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import {
  DataResponse,
  GetUser,
  JwtAuthGuard,
  Order,
  Role,
  Roles,
  RolesGuard,
  User,
} from '@app/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersQuery } from './input/orders-query';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  getAllOrders(
    @Query() ordersQuery: OrdersQuery,
  ): Promise<DataResponse<Order>> {
    return this.ordersService.getAllOrders(ordersQuery);
  }

  @Get('me')
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseGuards(JwtAuthGuard)
  getOrdersByUser(
    @Query() ordersQuery: OrdersQuery,
    @GetUser() user: User,
  ): Promise<DataResponse<Order>> {
    return this.ordersService.getOrdersByUser(ordersQuery, user);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  getOrderByUser(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<Order> {
    return this.ordersService.getOrderByUser(id, user);
  }

  @Post('create-cod-order')
  @UseGuards(JwtAuthGuard)
  createCodOrder(
    @Body() createOrderDto: CreateOrderDto,
    @GetUser() user: User,
  ) {
    return this.ordersService.createCodOrder(createOrderDto, user);
  }

  @Post('create-checkout-order')
  @UseGuards(JwtAuthGuard)
  createCheckout(
    @Body() createOrderDto: CreateOrderDto,
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
