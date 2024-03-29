import { AbstractDocument } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User } from './user.schema';

@Schema()
export class Review extends AbstractDocument {
  @Prop({ required: true })
  rating: number;

  @Prop({ required: true })
  comment: string;

  @Prop({
    type: mongoose.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  user: User;

  @Prop({ required: true })
  productId: string;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
