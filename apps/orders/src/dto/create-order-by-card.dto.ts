import { IsDefined, IsNotEmptyObject, ValidateNested } from 'class-validator';
import { CardDto } from './card.dto';
import { CreateOrderFromCartDto } from './create-order-from-cart.dto';
import { Type } from 'class-transformer';

export class CreateOrderByCardDto extends CreateOrderFromCartDto {
  @IsDefined()
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => CardDto)
  card: CardDto;
}
