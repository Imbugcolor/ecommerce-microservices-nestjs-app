import { Expose } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export class AddressObject {
  @IsNumber()
  @Expose()
  value: number;

  @IsString()
  @Expose()
  label: string;
}
