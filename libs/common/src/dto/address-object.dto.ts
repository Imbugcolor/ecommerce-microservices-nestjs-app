import { IsNumber, IsString } from 'class-validator';

export class AddressObject {
  @IsNumber()
  value: number;

  @IsString()
  label: string;
}
