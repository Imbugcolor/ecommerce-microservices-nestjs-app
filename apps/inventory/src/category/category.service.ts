import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { CategoryRepository } from './category.repository';
import { Category, Product } from '@app/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    private categoryRepository: CategoryRepository,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}

  async getCategories(): Promise<Category[]> {
    return this.categoryRepository.find();
  }

  async createCategory(
    createCategoryDto: CreateCategoryDto,
  ): Promise<Category> {
    const { name } = createCategoryDto;

    const isExist = await this.categoryModel.findOne({ name });

    if (isExist) {
      throw new ConflictException('This category name is exists.');
    }
    const category = await this.categoryRepository.create({ name });

    return category;
  }

  async updateCategory(cateId: string, updateCategoryDto: UpdateCategoryDto) {
    const { name } = updateCategoryDto;

    const updateCategory = await this.categoryRepository.findByIdAndUpdate(
      cateId,
      { name },
    );

    return updateCategory;
  }

  async deleteCategory(cateId: string) {
    const products = await this.productModel.find({ category: cateId });

    if (products.length > 0) {
      throw new BadRequestException(
        'This category contains products and cannot be deleted.',
      );
    }

    await this.categoryRepository.findByIdAndDelete(cateId);

    return { msg: 'Delete successfully.' };
  }
}
