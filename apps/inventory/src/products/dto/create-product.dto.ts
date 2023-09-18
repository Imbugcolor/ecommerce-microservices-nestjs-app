import {
  IsNotEmpty,
  MinLength,
  IsNumber,
  ValidateNested,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';
import { VariantType } from '../../variant/types/variant.type';
import { Type } from 'class-transformer';
import { ProductImageType } from '../types/product-image.type';

export class CreateProductDto {
  @IsNotEmpty()
  product_id: string;

  @IsNotEmpty()
  @MinLength(5)
  title: string;

  description: string;

  content: string;

  @IsNumber()
  price: number;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ProductImageType)
  images: ProductImageType[];

  @IsNotEmpty()
  category: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => VariantType)
  variants: VariantType[];
}
