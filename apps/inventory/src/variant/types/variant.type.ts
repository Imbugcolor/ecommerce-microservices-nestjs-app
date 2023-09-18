import { IsNotEmpty, IsNumber } from 'class-validator';
import { Types } from 'mongoose';

export class VariantType {
  _id?: Types.ObjectId;

  @IsNotEmpty()
  size: string;

  @IsNotEmpty()
  color: string;

  @IsNotEmpty()
  @IsNumber()
  inventory: number;

  productId?: Types.ObjectId;
}
