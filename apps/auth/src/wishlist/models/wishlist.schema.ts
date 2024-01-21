import { AbstractDocument, Product, User } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true, versionKey: false })
export class Wishlist extends AbstractDocument {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  user: User;

  @Prop({
    type: [
      { type: Types.ObjectId, ref: Product.name, required: true, default: [] },
    ],
  })
  products: Product[];
}

export const WishlistSchema = SchemaFactory.createForClass(Wishlist);
