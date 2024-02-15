import { NestFactory } from '@nestjs/core';
import { MailModule } from './mail.module';
import { ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';
import { RpcExceptionFilter } from '@app/common';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(MailModule);
  const configService = app.get(ConfigService);
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [configService.getOrThrow('RABBITMQ_URI')],
      queue: 'mail',
    },
  });
  app.useLogger(app.get(Logger));
  app.useGlobalFilters(new RpcExceptionFilter());
  await app.startAllMicroservices();
  await app.listen(configService.get('HTTP_PORT'));
}
bootstrap();
