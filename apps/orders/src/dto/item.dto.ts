import { IsNumber, IsString } from 'class-validator';

export class ItemDto {
  @IsString()
  productId: string;

  @IsString()
  variantId: string;

  @IsNumber()
  quantity: number;
}
