import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Order } from './models/order.schema';
import { Model, Types } from 'mongoose';
import { CreateOrderFromCartDto } from './dto/create-order-from-cart.dto';
import {
  CART_SERVICE,
  Cart,
  CartItem,
  INVENTORY_SERVICE,
  User,
  Variant,
} from '@app/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { OrderMethod } from './enums/order-method.enum';
import Stripe from 'stripe';
import { PaymentsService } from './payments/payments.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<Order>,
    @Inject(CART_SERVICE) private readonly cartService: ClientProxy,
    @Inject(INVENTORY_SERVICE) private readonly inventoryService: ClientProxy,
    private readonly paymentsService: PaymentsService,
  ) {}

  async getCart(user: User) {
    try {
      const res = await firstValueFrom(
        this.cartService.send<Cart>('get-cart', user),
      );
      return res;
    } catch (error) {
      throw new RpcException(error.response);
    }
  }

  async validateItem(id: string, quantity: number) {
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

  async createCodOrderFromCart(
    createOrderDto: CreateOrderFromCartDto,
    user: User,
  ): Promise<Order> {
    const { name, phone, address } = createOrderDto;
    const { email } = user;

    //Get cart
    const cart = await this.getCart(user);

    const newOrder = new this.orderModel({
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

    return newOrder.save();
  }

  // Create Checkout Session = Stripe to Payment
  async createCheckout(createOrderDto: CreateOrderFromCartDto, user: User) {
    //Get cart
    const cart = await this.getCart(user);

    //validate before checkout
    await Promise.all(
      cart.items.map(async (item) => {
        await this.validateItem(item.variantId._id.toString(), item.quantity);
      }),
    );

    return this.paymentsService.createCheckout(createOrderDto, user, cart);
  }

  // Create order when checkout complete
  async createOrderByCard(customer: Stripe.Customer, data: any) {
    const address = JSON.parse(customer.metadata.address);
    const user = JSON.parse(customer.metadata.user);
    //Get cart
    const cart = await this.getCart(user);

    const newOrder = new this.orderModel({
      _id: new Types.ObjectId(),
      user: user._id.toString(),
      name: customer.metadata.name,
      email: user.email,
      items: cart.items,
      paymentID: data.payment_intent,
      address,
      total: data.amount_total / 100,
      phone: customer.metadata.phone,
      method: OrderMethod.CARD,
      isPaid: true,
    });

    await this.inventoryCount(cart.items, false);

    await this.clearCart(user);

    await this.soldCount(cart.items, false);

    return newOrder.save();
  }

  async soldCount(items: CartItem[], resold: boolean) {
    return this.inventoryService.emit('sold-count', { items, resold });
  }

  async inventoryCount(items: CartItem[], resold: boolean) {
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
