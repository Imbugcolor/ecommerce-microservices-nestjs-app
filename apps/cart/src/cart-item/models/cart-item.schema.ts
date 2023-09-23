import { AbstractDocument, Product, Variant } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true, versionKey: false })
export class CartItem extends AbstractDocument {
  @Prop({ type: Types.ObjectId, ref: Product.name, required: true })
  productId: Product;

  @Prop({ type: Types.ObjectId, ref: Variant.name, required: true })
  variantId: Variant;

  @Prop({
    type: Number,
    required: true,
    min: [1, 'Quantity can not be less then 1.'],
  })
  quantity: number;

  @Prop({ type: Number, required: true })
  price: number;

  @Prop({ type: Number, required: true })
  total: number;
}

export const CartItemSchema = SchemaFactory.createForClass(CartItem);
