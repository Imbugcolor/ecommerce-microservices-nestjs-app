import { Product, Variant } from '@app/common';

export class OrderItem {
  product: Pick<Product, 'title' | '_id' | 'images' | 'product_id' | 'price'>;
  variant: Variant;
  quantity: number;
  price: number;
}
