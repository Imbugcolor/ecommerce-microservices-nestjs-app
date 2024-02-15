import { Injectable, NotFoundException } from '@nestjs/common';
import { PATHS } from '../constants/address';
import { HttpService } from '@nestjs/axios';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class AddressService {
  constructor(private readonly httpService: HttpService) {}

  getCities() {
    return this.httpService
      .get(PATHS.CITIES)
      .pipe(map((response) => response.data));
  }

  getDistricts(cityId: number) {
    return this.httpService.get(`${PATHS.DISTRICTS}/${cityId}.json`).pipe(
      map((res) => res.data),
      catchError(() => {
        throw new NotFoundException();
      }),
    );
  }

  getWards(districtId: number) {
    return this.httpService.get(`${PATHS.WARDS}/${districtId}.json`).pipe(
      map((res) => res.data),
      catchError(() => {
        throw new NotFoundException();
      }),
    );
  }
}
