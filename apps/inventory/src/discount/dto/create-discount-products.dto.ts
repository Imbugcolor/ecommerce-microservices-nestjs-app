import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsDate,
  IsNumber,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateDiscountProductsDto {
  @IsArray()
  @IsString({ each: true })
  @ArrayNotEmpty()
  products: string[];

  @IsNumber()
  @Min(1)
  @Max(100)
  discount_value: number;

  @IsDate()
  @Type(() => Date)
  valid_until: Date;
}
