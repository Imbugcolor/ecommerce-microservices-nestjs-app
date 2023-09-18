import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import { AddressObject } from './address-object.dto';

export class AddressDto {
  @IsString()
  @IsNotEmpty()
  detailAddress: string;

  @IsObject()
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => AddressObject)
  city: AddressObject;

  @IsObject()
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => AddressObject)
  district: AddressObject;

  @IsObject()
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => AddressObject)
  ward: AddressObject;
}
