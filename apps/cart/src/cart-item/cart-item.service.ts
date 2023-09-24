import { Injectable } from '@nestjs/common';
import { CartItem } from './models/cart-item.schema';
import { CartItemRepository } from './cart-item.repository';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

@Injectable()
export class CartItemService {
  constructor(
    private readonly cartItemRepository: CartItemRepository,
    @InjectModel(CartItem.name) private readonly cartItemModel: Model<CartItem>,
  ) {}

  async createItem(createCartItemDto: CreateCartItemDto): Promise<CartItem> {
    // return this.cartItemRepository.create(createCartItemDto);
    const item = new this.cartItemModel({
      ...createCartItemDto,
      _id: new Types.ObjectId(),
    });
    return item.save();
  }

  async updateItem(id: string, item: any): Promise<CartItem> {
    return this.cartItemRepository.findByIdAndUpdate(id, item);
  }

  async deleteItem(id: string): Promise<CartItem> {
    return this.cartItemRepository.findByIdAndDelete(id);
  }

  async deleteArrayItems(ids: CartItem[]): Promise<any> {
    return this.cartItemRepository.deleteMany({ _id: { $in: ids } });
  }
}
