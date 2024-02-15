import { ArrayMinSize, IsArray, IsString } from 'class-validator';

export class CancelDiscountProductsDto {
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  products: string[];
}
