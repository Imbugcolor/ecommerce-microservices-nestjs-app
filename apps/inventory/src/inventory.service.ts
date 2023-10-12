import { Injectable } from '@nestjs/common';
import { ProductsService } from './products/products.service';
import { VariantService } from './variant/variant.service';
import { OrderItem, Product, Variant } from '@app/common';

@Injectable()
export class InventoryService {
  constructor(
    private readonly productService: ProductsService,
    private readonly variantService: VariantService,
  ) {}

  async productValidate(id: string): Promise<Product> {
    return this.productService.validate(id);
  }

  async variantValidate(id: string, quantity: number): Promise<Variant> {
    return this.variantService.validate(id, quantity);
  }

  async inventoryCount(data: { items: OrderItem[]; resold: boolean }) {
    return this.variantService.inventoryCount(data);
  }

  async soldCount(data: { items: OrderItem[]; resold: boolean }) {
    return this.productService.soldCount(data);
  }
}
