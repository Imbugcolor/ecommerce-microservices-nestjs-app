import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class PaginateArrayField {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number = 10;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number = 1;
}
