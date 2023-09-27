import { Module, forwardRef } from '@nestjs/common';
import { StripeWebhookController } from './stripe-webhook.controller';
import { StripeWebhookService } from './stripe-webhook.service';
import { OrdersModule } from '../orders.module';

@Module({
  imports: [forwardRef(() => OrdersModule)],
  controllers: [StripeWebhookController],
  providers: [StripeWebhookService],
})
export class StripeWebhookModule {}
