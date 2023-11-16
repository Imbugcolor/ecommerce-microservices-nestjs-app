import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '../database';

@Schema({ versionKey: false, timestamps: true })
export class Discount extends AbstractDocument {
  @Prop({ type: [{ type: String }], required: true })
  products: string[];

  @Prop()
  discount_value: number;

  @Prop()
  valid_from: Date;

  @Prop()
  valid_until: Date;
}

export const DiscountSchema = SchemaFactory.createForClass(Discount);
