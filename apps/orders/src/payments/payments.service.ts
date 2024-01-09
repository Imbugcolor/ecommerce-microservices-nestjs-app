import { User } from '@app/common';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { CreateOrderDto } from '../dto/create-order.dto';
import { InjectStripe } from 'nestjs-stripe';
import { CheckoutItem } from '../types/checkout-item.type';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly configService: ConfigService,
    @InjectStripe() private stripe: Stripe,
  ) {}

  // Create Checkout Session = Stripe to Payment
  async createCheckout(
    createOrderDto: CreateOrderDto,
    user: User,
    items: CheckoutItem[],
  ) {
    const { name, phone, address } = createOrderDto;

    const customer = await this.stripe.customers.create({
      metadata: {
        name,
        user: JSON.stringify({
          ...user,
          password: '',
          roles: [],
          avatar: '',
          rf_token: '',
        }),
        phone,
        address: JSON.stringify(address),
        items: createOrderDto.item
          ? JSON.stringify([
              {
                productId: items[0].productId,
                quantiry: items[0].quantity,
                price: items[0].price,
                variantId: items[0].variantId,
              },
            ])
          : JSON.stringify(null),
      },
    });

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: items.map((item) => {
        return {
          price_data: {
            currency: 'usd',
            product_data: {
              name: item.productId.title,
              images: [item.productId.images[0].url],
            },
            unit_amount: item.price * 100,
          },
          quantity: item.quantity,
        };
      }),
      customer: customer.id,
      success_url: `${this.configService.get('CLIENT_CART_URL')}?success=true`,
      cancel_url: `${this.configService.get('CLIENT_CART_URL')}?canceled=true`,
    });

    return { url: session.url, status: session.payment_status };
  }

  // refund payment
  async refundPayment(paymentId: string, amount: number) {
    return await this.stripe.refunds.create({
      payment_intent: paymentId,
      amount,
    });
  }
}
