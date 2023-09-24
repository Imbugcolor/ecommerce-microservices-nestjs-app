import { Controller } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @MessagePattern('product-validate')
  async productValidate(@Payload() data: string) {
    return this.inventoryService.productValidate(data);
  }

  @MessagePattern('variant-validate')
  async variantValidate(@Payload() data: string) {
    return this.inventoryService.variantValidate(data);
  }
}
