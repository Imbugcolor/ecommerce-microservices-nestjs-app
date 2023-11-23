import { IsDefined, IsNotEmptyObject, ValidateNested } from 'class-validator';
import { CardDto } from './card.dto';
import { CreateOrderDto } from './create-order.dto';
import { Type } from 'class-transformer';

export class CreateOrderByCardDto extends CreateOrderDto {
  @IsDefined()
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => CardDto)
  card: CardDto;
}
