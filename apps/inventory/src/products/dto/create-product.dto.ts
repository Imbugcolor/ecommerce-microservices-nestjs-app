import {
  IsNotEmpty,
  MinLength,
  IsNumber,
  ValidateNested,
  IsArray,
  ArrayNotEmpty,
  IsDate,
} from 'class-validator';
import { VariantType } from '../../variant/types/variant.type';
import { Type } from 'class-transformer';
import { ProductImageType } from '../../../../../libs/common/src/types/product-image.type';

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

  @IsNumber()
  discount: number;

  @IsDate()
  @Type(() => Date)
  discount_start_date: Date;

  @IsDate()
  @Type(() => Date)
  discount_end_date: Date;

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
