import { PickType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto';

export class UpdateCategoryDto extends PickType(CreateCategoryDto, ['name']) {}
