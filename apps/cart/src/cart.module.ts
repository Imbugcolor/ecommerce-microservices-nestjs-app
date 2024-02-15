import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import {
  AUTH_SERVICE,
  DatabaseModule,
  INVENTORY_SERVICE,
  LoggerModule,
  Product,
  ProductSchema,
  User,
  UserSchema,
} from '@app/common';
import { CartItemModule } from './cart-item/cart-item.module';
import { Cart, CartSchema, CartItem, CartItemSchema } from '@app/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CartRepository } from './cart.repository';

@Module({
  imports: [
    DatabaseModule,
    DatabaseModule.forFeature([
      { name: Cart.name, schema: CartSchema },
      { name: User.name, schema: UserSchema },
      { name: Product.name, schema: ProductSchema },
      { name: CartItem.name, schema: CartItemSchema },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        MONGODB_URI: Joi.string().required(),
        HTTP_PORT: Joi.number().required(),
        TCP_PORT: Joi.number().required(),
        AUTH_HOST: Joi.string().required(),
        AUTH_PORT: Joi.number().required(),
        INVENTORY_HOST: Joi.string().required(),
        INVENTORY_PORT: Joi.number().required(),
      }),
    }),
    LoggerModule,
    CartItemModule,
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
  ],
  controllers: [CartController],
  providers: [CartService, CartRepository],
})
export class CartModule {}
