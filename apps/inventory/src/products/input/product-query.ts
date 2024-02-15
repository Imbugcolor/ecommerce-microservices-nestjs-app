import { PaginateOptions } from '@app/common';
import { IsOptional } from 'class-validator';

export class ProductQuery extends PaginateOptions {
  @IsOptional()
  product_id: string;

  @IsOptional()
  title: string;

  @IsOptional()
  description: string;

  @IsOptional()
  sizes: string;

  @IsOptional()
  price: string;

  @IsOptional()
  isDiscount: string;
}
