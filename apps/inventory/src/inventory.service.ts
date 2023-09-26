import { Injectable } from '@nestjs/common';
import { ProductsService } from './products/products.service';
import { VariantService } from './variant/variant.service';
import { CartItem, Product, Variant } from '@app/common';

@Injectable()
export class InventoryService {
  constructor(
    private readonly productService: ProductsService,
    private readonly variantService: VariantService,
  ) {}

  async productValidate(id: string): Promise<Product> {
    return this.productService.validate(id);
  }

  async variantValidate(id: string): Promise<Variant> {
    return this.variantService.validate(id);
  }

  async inventoryCount(data: { items: CartItem[]; resold: boolean }) {
    return this.variantService.inventoryCount(data);
  }

  async soldCount(data: { items: CartItem[]; resold: boolean }) {
    return this.productService.soldCount(data);
  }
}
