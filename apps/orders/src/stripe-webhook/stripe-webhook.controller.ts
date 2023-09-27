import {
  Controller,
  Post,
  Req,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { StripeWebhookService } from './stripe-webhook.service';
import { Request } from 'express';

@Controller('webhook')
export class StripeWebhookController {
  constructor(private readonly stripeWebhookService: StripeWebhookService) {}

  @Post()
  webhook(@Headers('stripe-signature') signature: string, @Req() req: Request) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }
    return this.stripeWebhookService.createWebhook(signature, req);
  }
}
