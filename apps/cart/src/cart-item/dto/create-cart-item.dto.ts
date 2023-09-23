import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateCartItemDto {
  @IsString()
  @IsNotEmpty()
  productId: string;
  variantId: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;
  price: number;
  total: number;
}
