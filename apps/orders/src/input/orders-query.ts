import { OrderMethod } from '@app/common';
import { IsEnum, IsOptional } from 'class-validator';

export class OrdersQuery {
  @IsOptional()
  name: string;

  @IsOptional()
  email: string;

  @IsOptional()
  paymentId: string;

  @IsOptional()
  phone: string;

  @IsOptional()
  total: string;

  @IsOptional()
  @IsEnum(() => OrderMethod)
  method: OrderMethod;

  @IsOptional()
  isPaid: boolean;
}
