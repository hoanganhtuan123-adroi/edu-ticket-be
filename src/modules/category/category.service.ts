import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { Category } from '../../models/category.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCategoryDto } from './dto/create.dto';
import { UpdateCategoryDto } from './dto/update.dto';
import { CategoryResponseDto } from './dto/response.dto';
import { plainToInstance } from 'class-transformer';
import { PaginationResponseDto } from '../../shared/dto/pagination-response.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  async createCategory(createCategoryDto: CreateCategoryDto): Promise<CategoryResponseDto> {
    try {
      // Check if category name already exists
      const existingCategory = await this.categoryRepo.findOne({
        where: { name: createCategoryDto.name },
      });

      if (existingCategory) {
        throw new ConflictException('Tên danh mục đã tồn tại');
      }

      const newCategory = await this.categoryRepo.save(createCategoryDto);

      return plainToInstance(CategoryResponseDto, newCategory, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      throw error;
    }
  }

  async getAllCategories(query: {
    limit: number;
    offset: number;
    name?: string;
  }): Promise<PaginationResponseDto<CategoryResponseDto>> {
    try {
      const whereConditions: any = {};

      if (query.name) {
        whereConditions.name = query.name;
      }

      const [categories, total] = await this.categoryRepo.findAndCount({
        where:
          Object.keys(whereConditions).length > 0 ? whereConditions : undefined,
        skip: query.offset,
        take: query.limit,
        order: { id: 'DESC' },
      });

      const categoryDtos = plainToInstance(CategoryResponseDto, categories, {
        excludeExtraneousValues: true,
      });

      return PaginationResponseDto.create(
        categoryDtos,
        total,
        query.limit,
        query.offset,
      );
    } catch (error) {
      throw error;
    }
  }

  async getCategoryById(id: number): Promise<CategoryResponseDto> {
    try {
      const category = await this.categoryRepo.findOne({
        where: { id },
      });

      if (!category) {
        throw new NotFoundException('Danh mục không tồn tại');
      }

      return plainToInstance(CategoryResponseDto, category, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      throw error;
    }
  }

  async updateCategory(id: number, updateCategoryDto: UpdateCategoryDto): Promise<CategoryResponseDto> {
    try {
      const category = await this.categoryRepo.findOne({
        where: { id },
      });

      if (!category) {
        throw new NotFoundException('Danh mục không tồn tại');
      }

      // Check if name already exists (if name is being updated)
      if (updateCategoryDto.name) {
        const existingCategory = await this.categoryRepo.findOne({
          where: { name: updateCategoryDto.name },
        });

        if (existingCategory && existingCategory.id !== id) {
          throw new ConflictException('Tên danh mục đã tồn tại');
        }
      }

      const updatedCategory = this.categoryRepo.merge(category, updateCategoryDto);
      const savedCategory = await this.categoryRepo.save(updatedCategory);

      return plainToInstance(CategoryResponseDto, savedCategory, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteCategory(id: number): Promise<void> {
    try {
      const category = await this.categoryRepo.findOne({
        where: { id },
      });

      if (!category) {
        throw new NotFoundException('Danh mục không tồn tại');
      }

      await this.categoryRepo.delete(id);
    } catch (error) {
      throw error;
    }
  }
}
