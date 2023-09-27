import {
  BadRequestException,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import Stripe from 'stripe';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { InjectStripe } from 'nestjs-stripe';
import { OrdersService } from '../orders.service';

@Injectable()
export class StripeWebhookService {
  constructor(
    private configService: ConfigService,
    @InjectStripe() private stripe: Stripe,
    @Inject(forwardRef(() => OrdersService))
    private ordersService: OrdersService,
  ) {}

  createWebhook(signature: string, req: Request) {
    let data: any;
    let eventType: string;

    let event: Stripe.Event;

    const endpointSecret = this.configService.get('WEB_HOOK_SECRET');

    try {
      const body = req.body;
      event = this.stripe.webhooks.constructEvent(
        body,
        signature,
        endpointSecret,
      );
      data = event.data.object;
      eventType = event.type;
      console.log('Webhook verified.');
    } catch (err: any) {
      console.log(`Webhook Error: ${err.message}`);
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    if (eventType === 'checkout.session.completed') {
      this.stripe.customers
        .retrieve(data.customer)
        .then((customer) => {
          this.ordersService.createOrderByCard(
            customer as Stripe.Customer,
            data,
          );
        })
        .catch((err: any) => console.log(err.message));
    }
    // Return a res to acknowledge receipt of the event
  }
}
