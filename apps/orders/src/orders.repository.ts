import { AbstractRepository, Order } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class OrdersRepository extends AbstractRepository<Order> {
  protected readonly logger = new Logger(OrdersRepository.name);

  constructor(@InjectModel(Order.name) ordersModel: Model<Order>) {
    super(ordersModel);
  }
}
