import { ConflictException, Injectable } from '@nestjs/common';
import { CategoryRepository } from './category.repository';
import { Category } from '@app/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class CategoryService {
  constructor(
    private categoryRepository: CategoryRepository,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
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
}
