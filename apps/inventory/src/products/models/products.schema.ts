import { AbstractDocument } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Category } from '../../category/models/category.schema';
import { Variant } from '../../variant/models/variant.schema';
import { ProductImageType } from '../types/product-image.type';
import { Review } from '../../review/models/review.schema';

@Schema({ versionKey: false, timestamps: true })
export class Product extends AbstractDocument {
  @Prop({ required: true, trim: true, unique: true })
  product_id: string;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop()
  description: string;

  @Prop()
  content: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  images: ProductImageType[];

  @Prop({
    type: mongoose.Types.ObjectId,
    ref: Category.name,
    required: true,
  })
  category: Category;

  @Prop({
    type: [
      { type: mongoose.Types.ObjectId, ref: Variant.name, required: true },
    ],
  })
  variants: Variant[];

  @Prop({ default: 0 })
  sold: number;

  @Prop({
    type: [{ type: mongoose.Types.ObjectId, ref: Review.name }],
    default: [],
  })
  reviews: Review[];

  @Prop({ default: 0 })
  rating: number;

  @Prop({ default: 0 })
  numReviews: number;

  @Prop({ default: false })
  isPublished: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
