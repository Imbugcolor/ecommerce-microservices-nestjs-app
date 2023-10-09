import { Product, Variant } from '@app/common';

export class OrderItem {
  productId: Pick<Product, 'title' | '_id' | 'images' | 'product_id' | 'price'>;
  variantId: Variant;
  quantity: number;
  price: number;
}
