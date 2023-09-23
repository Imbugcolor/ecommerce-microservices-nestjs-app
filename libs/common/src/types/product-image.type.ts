import { IsNotEmpty, IsString } from 'class-validator';

export class ProductImageType {
  @IsNotEmpty()
  @IsString()
  url: string;

  @IsNotEmpty()
  @IsString()
  public_id: string;
}
