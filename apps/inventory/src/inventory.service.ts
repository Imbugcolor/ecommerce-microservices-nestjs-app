import { Injectable } from '@nestjs/common';
import { ProductsService } from './products/products.service';
import { VariantService } from './variant/variant.service';
import { Product, Variant } from '@app/common';

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
}
