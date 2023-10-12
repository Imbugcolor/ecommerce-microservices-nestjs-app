import { Controller } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { OrderItem } from '@app/common';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @MessagePattern('product-validate')
  async productValidate(@Payload() data: string) {
    return this.inventoryService.productValidate(data);
  }

  @MessagePattern('variant-validate')
  async variantValidate(@Payload() data: { id: string; quantity: number }) {
    return this.inventoryService.variantValidate(data.id, data.quantity);
  }

  @MessagePattern('inventory-count')
  async inventoryCount(
    @Payload() data: { items: OrderItem[]; resold: boolean },
  ) {
    return this.inventoryService.inventoryCount(data);
  }

  @EventPattern('sold-count')
  async soldCount(@Payload() data: { items: OrderItem[]; resold: boolean }) {
    return this.inventoryService.soldCount(data);
  }
}
