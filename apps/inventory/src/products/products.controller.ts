import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  UseGuards,
  Delete,
  Query,
  Logger,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { DataResponse, Product, Role, Roles, RolesGuard } from '@app/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '@app/common';
import { ProductQuery } from './input/product-query';

@Controller('products')
export class ProductsController {
  private readonly logger = new Logger(ProductsController.name);
  constructor(private productService: ProductsService) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  async getProducts(
    @Query() productQuery: ProductQuery,
  ): Promise<DataResponse<Product>> {
    return this.productService.getProducts(productQuery);
  }

  @Get('/:id')
  async getProduct(@Param('id') id: string): Promise<Product> {
    return this.productService.getProduct(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async createProduct(
    @Body() createProductDto: CreateProductDto,
  ): Promise<Product> {
    return this.productService.createProduct(createProductDto);
  }

  @Patch('/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    return this.productService.updateProduct(id, updateProductDto);
  }

  @Delete('/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async deleteProduct(@Param('id') id: string) {
    return this.productService.deleteProduct(id);
  }
}
