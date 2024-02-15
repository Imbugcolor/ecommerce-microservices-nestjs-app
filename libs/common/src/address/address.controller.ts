import { Controller, Get, Param } from '@nestjs/common';
import { AddressService } from './address.service';

@Controller('address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Get('cities')
  getCities() {
    return this.addressService.getCities();
  }

  @Get('districts/:cityId')
  getDistricts(@Param('cityId') cityId: number) {
    return this.addressService.getDistricts(cityId);
  }

  @Get('wards/:districtId')
  getWards(@Param('districtId') districtId: number) {
    return this.addressService.getWards(districtId);
  }
}
