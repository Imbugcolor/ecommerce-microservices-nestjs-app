import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from './users/users.module';
import { DatabaseModule, LoggerModule, MAIL_SERVICE } from '@app/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshTokenStrategy } from './strategies/jwt-refresh-token.strategy';
import { User, UserSchema } from '@app/common';
import { AddressController } from '@app/common/address/address.controller';
import { AddressService } from '@app/common/address/address.service';
import { HttpModule } from '@nestjs/axios';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { WishlistModule } from './wishlist/wishlist.module';
@Module({
  imports: [
    HttpModule,
    DatabaseModule,
    DatabaseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    UsersModule,
    LoggerModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        MONGODB_URI: Joi.string().required(),
        HTTP_PORT: Joi.number().required(),
        TCP_PORT: Joi.number().required(),
        MAIL_HOST: Joi.string().required(),
        MAIL_PORT: Joi.number().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_REFRESH_TOKEN_SECRET: Joi.string().required(),
        JWT_ACTIVE_TOKEN_SECRET: Joi.string().required(),
        BASE_URL: Joi.string().required(),
      }),
    }),
    ClientsModule.registerAsync([
      {
        name: MAIL_SERVICE,
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.getOrThrow<string>('RABBITMQ_URI')],
            queue: 'mail',
          },
          // transport: Transport.TCP,
          // options: {
          //   host: configService.get('MAIL_HOST') /*define in docker-compose */,
          //   port: configService.get('MAIL_PORT'),
          //},
        }),
        inject: [ConfigService],
      },
    ]),
    JwtModule.register({}),
    WishlistModule,
  ],
  controllers: [AuthController, AddressController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtRefreshTokenStrategy,
    AddressService,
  ],
})
export class AuthModule {}
