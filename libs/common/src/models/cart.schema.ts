import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { CartItem } from './cart-item.schema';
import { AbstractDocument } from '../database';
import { User } from './user.schema';

@Schema({ timestamps: true, versionKey: false })
export class Cart extends AbstractDocument {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  user: User;

  @Prop({ type: [{ type: Types.ObjectId, ref: CartItem.name }] })
  items: CartItem[];

  @Prop({ type: Number, default: 0 })
  subTotal: number;
}

export const CartSchema = SchemaFactory.createForClass(Cart);
