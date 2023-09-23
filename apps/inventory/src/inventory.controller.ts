import { Controller, Get } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProductsService } from './products/products.service';
import { VariantService } from './variant/variant.service';

@Controller('inventory')
export class InventoryController {
  constructor(
    private readonly inventoryService: InventoryService,
    private readonly productService: ProductsService,
    private readonly variantService: VariantService,
  ) {}

  @Get()
  getHello(): string {
    return this.inventoryService.getHello();
  }

  @MessagePattern('product-validate')
  async productValidate(@Payload() data: string) {
    return this.productService.validate(data);
  }

  @MessagePattern('product-validate')
  async variantValidate(@Payload() data: string) {
    return this.variantService.validate(data);
  }
}
