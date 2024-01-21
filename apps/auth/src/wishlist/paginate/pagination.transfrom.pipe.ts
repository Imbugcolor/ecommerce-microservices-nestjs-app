import { ArgumentMetadata, PipeTransform } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { PaginateArrayField } from './paginate-array-field';

export class PaginationTransformPipe implements PipeTransform {
  async transform(dto: PaginateArrayField, { metatype }: ArgumentMetadata) {
    if (!metatype) {
      return dto;
    }

    return plainToInstance(metatype, dto);
  }
}
