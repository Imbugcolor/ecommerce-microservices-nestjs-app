import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CartItem } from '../cart-item/models/cart-item.schema';
import { User } from '@app/common';
import { Type } from 'class-transformer';

export class CreateCartDto {
  @IsString()
  @IsNotEmpty()
  user: User;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CartItem)
  items: CartItem[];

  @IsNumber()
  @IsNotEmpty()
  subTotal: number;
}
