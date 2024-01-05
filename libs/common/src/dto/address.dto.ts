import { Expose, Type } from 'class-transformer';
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
  @Expose()
  detailAddress: string;

  @IsObject()
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => AddressObject)
  @Expose()
  city: AddressObject;

  @IsObject()
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => AddressObject)
  @Expose()
  district: AddressObject;

  @IsObject()
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => AddressObject)
  @Expose()
  ward: AddressObject;
}
