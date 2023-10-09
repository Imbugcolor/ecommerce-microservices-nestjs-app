import { AbstractDocument, AddressDto } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { User } from './user.schema';
import { OrderMethod } from '../enums/order-method.enum';
import { OrderStatus } from '../enums/order-status.enum';
import { OrderItem } from '../dto/order-item.dto';

@Schema({ timestamps: true, versionKey: false })
export class Order extends AbstractDocument {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  user: User;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  email: string;

  @Prop({ type: String })
  paymentId: string;

  @Prop()
  address: AddressDto;

  @Prop({ type: String, required: true })
  phone: string;

  @Prop({ type: Number, required: true })
  total: number;

  @Prop({ type: String, default: OrderMethod.COD })
  method: OrderMethod;

  @Prop({ type: Boolean, default: false })
  isPaid: boolean;

  @Prop({ type: Array, required: true })
  items: OrderItem[];

  @Prop({ type: String, default: OrderStatus.PENDING })
  status: OrderStatus;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
