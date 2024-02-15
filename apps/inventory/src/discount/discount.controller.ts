import { Body, Controller, Patch, Post } from '@nestjs/common';
import { DiscountService } from './discount.service';
import { CreateDiscountProductsDto } from './dto/create-discount-products.dto';
import { CancelDiscountProductsDto } from './dto/cancel-discount-products.dto';

@Controller('discount')
export class DiscountController {
  constructor(private discountService: DiscountService) {}

  @Post()
  async createDiscountProducts(
    @Body() createDiscountProductsDto: CreateDiscountProductsDto,
  ) {
    return this.discountService.createDiscountProducts(
      createDiscountProductsDto,
    );
  }

  @Patch()
  async cancelDiscountProducts(
    @Body()
    cancelDiscountProductsDto: CancelDiscountProductsDto,
  ) {
    return this.discountService.cancelDiscountProducts(
      cancelDiscountProductsDto,
    );
  }
}
