import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CartItem } from '../cart-item/models/cart-item.schema';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';

export class CreateCartDto {
  @IsString()
  @IsNotEmpty()
  user: Types.ObjectId;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CartItem)
  items: CartItem[];

  @IsNumber()
  @IsNotEmpty()
  subTotal: number;
}
