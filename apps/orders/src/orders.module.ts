import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
  forwardRef,
} from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import {
  AUTH_SERVICE,
  CART_SERVICE,
  DatabaseModule,
  INVENTORY_SERVICE,
  LoggerModule,
  User,
  UserSchema,
} from '@app/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { Order, OrderSchema } from '@app/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PaymentsModule } from './payments/payments.module';
import { StripeWebhookModule } from './stripe-webhook/stripe-webhook.module';
import { StripeModule } from 'nestjs-stripe';
import { JsonBodyMiddleware, RawBodyMiddleware } from '@app/common';
import { OrdersRepository } from './orders.repository';

@Module({
  imports: [
    DatabaseModule,
    DatabaseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: User.name, schema: UserSchema },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        MONGODB_URI: Joi.string().required(),
        HTTP_PORT: Joi.number().required(),
        AUTH_HOST: Joi.string().required(),
        AUTH_PORT: Joi.number().required(),
        CART_HOST: Joi.string().required(),
        CART_PORT: Joi.number().required(),
        INVENTORY_HOST: Joi.string().required(),
        INVENTORY_PORT: Joi.number().required(),
        STRIPE_SECRET_KEY: Joi.string().required(),
        CLIENT_CART_URL: Joi.string().required(),
        WEB_HOOK_SECRET: Joi.string().required(),
      }),
    }),
    LoggerModule,
    ClientsModule.registerAsync([
      {
        name: AUTH_SERVICE,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.getOrThrow<string>('RABBITMQ_URI')],
            queue: 'auth',
          },
        }),
        inject: [ConfigService],
      },
      {
        name: CART_SERVICE,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.getOrThrow<string>('RABBITMQ_URI')],
            queue: 'cart',
          },
        }),
        inject: [ConfigService],
      },
      {
        name: INVENTORY_SERVICE,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.getOrThrow<string>('RABBITMQ_URI')],
            queue: 'inventory',
          },
        }),
        inject: [ConfigService],
      },
    ]),
    StripeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        apiKey: configService.get('STRIPE_SECRET_KEY'),
        apiVersion: '2023-08-16',
      }),
    }),
    PaymentsModule,
    forwardRef(() => StripeWebhookModule),
  ],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersRepository],
  exports: [OrdersService, OrdersRepository],
})
export class OrdersModule implements NestModule {
  public configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(RawBodyMiddleware)
      .forRoutes({
        path: '/webhook',
        method: RequestMethod.POST,
      })
      .apply(JsonBodyMiddleware)
      .forRoutes('*');
  }
}
