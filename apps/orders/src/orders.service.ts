import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  DataListQuery,
  DataResponse,
  Order,
  OrderItem,
  OrderStatus,
  Product,
} from '@app/common';
import { Model, Types } from 'mongoose';
import { CreateOrderDto } from './dto/create-order.dto';
import {
  CART_SERVICE,
  Cart,
  INVENTORY_SERVICE,
  User,
  Variant,
} from '@app/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { OrderMethod } from '@app/common';
import Stripe from 'stripe';
import { PaymentsService } from './payments/payments.service';
import { OrdersRepository } from './orders.repository';
import { CheckoutItem } from './types/checkout-item.type';
import { OrdersQuery } from './input/orders-query';

@Injectable()
export class OrdersService {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    @InjectModel(Order.name) private readonly orderModel: Model<Order>,
    @Inject(CART_SERVICE) private readonly cartService: ClientProxy,
    @Inject(INVENTORY_SERVICE) private readonly inventoryService: ClientProxy,
    private readonly paymentsService: PaymentsService,
  ) {}

  private async getCart(user: User) {
    try {
      const res = await firstValueFrom(
        this.cartService.send<Cart>('get-cart', user),
      );
      return res;
    } catch (error) {
      throw new RpcException(error.response);
    }
  }

  private async getProduct(id: string) {
    try {
      const res = await firstValueFrom(
        this.inventoryService.send<Product>('product-validate', id),
      );
      return res;
    } catch (error) {
      throw new RpcException(error.response);
    }
  }

  private async validateItem(id: string, quantity: number) {
    try {
      const res = await firstValueFrom(
        this.inventoryService.send<Variant>('variant-validate', {
          id,
          quantity,
        }),
      );
      return res;
    } catch (error) {
      throw new RpcException(error.response);
    }
  }

  async getAllOrders(ordersQuery: OrdersQuery): Promise<DataResponse<Order>> {
    try {
      const newQuery = new DataListQuery(
        this.orderModel.find(),
        ordersQuery,
      ).filtering();

      const totalResult = await newQuery.query;

      const dataQuery = new DataListQuery(this.orderModel.find(), ordersQuery)
        .filtering()
        .sorting()
        .paginate();

      const orders = await dataQuery.query.populate();

      return {
        total: totalResult.length,
        totalPerPage: orders.length,
        data: orders,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getOrderByUser(id: string, user: User): Promise<Order> {
    return await this.ordersRepository.findOne({
      _id: id,
      user: user._id.toString(),
    });
  }

  async getOrdersByUser(
    ordersQuery: OrdersQuery,
    user: User,
  ): Promise<DataResponse<Order>> {
    try {
      const newQuery = new DataListQuery(
        this.orderModel.find({ user: user._id }),
        ordersQuery,
      ).filtering();

      const totalResult = await newQuery.query;

      const dataQuery = new DataListQuery(
        this.orderModel.find({ user: user._id }),
        ordersQuery,
      )
        .filtering()
        .sorting()
        .paginate();

      const orders = await dataQuery.query.populate();

      return {
        total: totalResult.length,
        totalPerPage: orders.length,
        data: orders,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async createCodOrder(
    createOrderDto: CreateOrderDto,
    user: User,
  ): Promise<Order> {
    const { name, phone, address } = createOrderDto;
    const { email } = user;

    let newOrder: any;

    if (createOrderDto.item) {
      const product = await this.getProduct(createOrderDto.item.productId);

      //validate variant
      const variant = await this.validateItem(
        createOrderDto.item.variantId,
        createOrderDto.item.quantity,
      );
      const items: OrderItem[] = [
        {
          price: product.price,
          quantity: createOrderDto.item.quantity,
          productId: {
            _id: product._id,
            product_id: product.product_id,
            title: product.title,
            price: product.price,
            images: product.images,
          },
          variantId: variant,
        },
      ];

      newOrder = new this.orderModel({
        _id: new Types.ObjectId(),
        user: user._id.toString(),
        name,
        email,
        phone,
        address,
        items,
        total: items.reduce((acc, curr) => {
          return acc + curr.price * curr.quantity;
        }, 0),
        method: OrderMethod.COD,
      });

      await this.inventoryCount(items, false);

      await this.soldCount(items, false);
    } else {
      //Get cart
      const cart = await this.getCart(user);

      newOrder = new this.orderModel({
        _id: new Types.ObjectId(),
        user: user._id.toString(),
        name,
        email,
        phone,
        address,
        items: cart.items,
        total: cart.items.reduce((acc, curr) => {
          return acc + curr.price * curr.quantity;
        }, 0),
        method: OrderMethod.COD,
      });

      await this.inventoryCount(cart.items, false);

      await this.clearCart(user);

      await this.soldCount(cart.items, false);
    }

    return newOrder.save();
  }

  // Create Checkout Session = Stripe to Payment
  async createCheckout(createOrderDto: CreateOrderDto, user: User) {
    let items: CheckoutItem[] = [];
    // Checkout a specified item
    if (createOrderDto.item) {
      //validate product
      const product = await this.getProduct(createOrderDto.item.productId);

      //validate variant
      const variant = await this.validateItem(
        createOrderDto.item.variantId,
        createOrderDto.item.quantity,
      );

      //
      const item: CheckoutItem = {
        price: product.price,
        quantity: createOrderDto.item.quantity,
        productId: {
          _id: product._id,
          product_id: product.product_id,
          title: product.title,
          price: product.price,
          images: product.images,
        },
        variantId: variant,
      };
      items.push(item);
    } else {
      // Checkout items in cart
      // Get cart
      const cart = await this.getCart(user);

      //validate before checkout
      await Promise.all(
        cart.items.map(async (item) => {
          await this.validateItem(item.variantId._id.toString(), item.quantity);
        }),
      );

      items = cart.items;
    }
    return this.paymentsService.createCheckout(createOrderDto, user, items);
  }

  // Create order when checkout complete
  async createOrderByCard(customer: Stripe.Customer, data: any) {
    const address = JSON.parse(customer.metadata.address);
    const user = JSON.parse(customer.metadata.user);
    const items = JSON.parse(customer.metadata.items);

    let newOrder: any;

    if (!items) {
      //Get cart
      const cart = await this.getCart(user);

      newOrder = new this.orderModel({
        _id: new Types.ObjectId(),
        user: user._id.toString(),
        name: customer.metadata.name,
        email: user.email,
        items: cart.items,
        paymentId: data.payment_intent,
        address,
        total: data.amount_total / 100,
        phone: customer.metadata.phone,
        method: OrderMethod.CARD,
        isPaid: true,
      });

      await this.inventoryCount(cart.items, false);

      await this.clearCart(user);

      await this.soldCount(cart.items, false);
    } else {
      newOrder = new this.orderModel({
        _id: new Types.ObjectId(),
        user: user._id.toString(),
        name: customer.metadata.name,
        email: user.email,
        items,
        paymentId: data.payment_intent,
        address,
        total: data.amount_total / 100,
        phone: customer.metadata.phone,
        method: OrderMethod.CARD,
        isPaid: true,
      });

      await this.inventoryCount(items, false);

      await this.soldCount(items, false);
    }

    return newOrder.save();
  }

  // cancel order
  async cancelOrder(id: string, user: User): Promise<Order> {
    const oldOrder = await this.getOrderByUser(id, user);

    if (oldOrder.status === OrderStatus.CANCELED) {
      throw new BadRequestException(`The order: ${id} is already canceled.`);
    }

    if (
      oldOrder.status === OrderStatus.SHIPPING ||
      oldOrder.status === OrderStatus.DELIVERED ||
      oldOrder.status === OrderStatus.COMPLETED
    ) {
      throw new BadRequestException(`The order: ${id} could not canceled.`);
    }

    const newOrder = await this.orderModel.findByIdAndUpdate(
      id,
      { status: OrderStatus.CANCELED },
      { new: true },
    );

    await this.inventoryCount(oldOrder.items, true);
    await this.soldCount(oldOrder.items, true);

    return newOrder;
  }

  async soldCount(items: OrderItem[], resold: boolean) {
    return this.inventoryService.emit('sold-count', { items, resold });
  }

  async inventoryCount(items: OrderItem[], resold: boolean) {
    try {
      await firstValueFrom(
        this.inventoryService.send('inventory-count', { items, resold }),
      );
    } catch (error) {
      throw new RpcException(error.response);
    }
  }

  async clearCart(user: User) {
    try {
      await firstValueFrom(this.cartService.send('empty-cart', user));
    } catch (error) {
      throw new RpcException(error.response);
    }
  }
}
