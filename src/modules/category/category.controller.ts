import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create.dto';
import { UpdateCategoryDto } from './dto/update.dto';
import { CategoryResponseDto } from './dto/response.dto';
import { FilterCategoryDto } from './dto/filter-category.dto';
import { ApiResponse } from 'src/common/responses/api-response';
import { Roles } from '../auth/decorator/auth.decorator';
import { SystemRole } from '../../models/enums';
import { PaginationResponseDto } from '../../shared/dto/pagination-response.dto';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) { }

  @Roles(SystemRole.ORGANIZER, SystemRole.ADMIN)
  @Post('/create')
  async createCategory(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<ApiResponse<any>> {
    try {
      await this.categoryService.createCategory(createCategoryDto);
      return ApiResponse.success(null,'Tạo danh mục thành công');
    } catch (error) {
      return ApiResponse.error(error.message || 'Tạo danh mục thất bại');
    }
  }

  @Get()
  async getAllCategories(
    @Query() filter: FilterCategoryDto,
  ): Promise<ApiResponse<PaginationResponseDto<CategoryResponseDto>>> {
    try {
      const result = await this.categoryService.getAllCategories({
        limit: filter.limit || 10,
        offset: filter.offset || 0,
        name: filter.name
      });
      return ApiResponse.success(result, 'Lấy danh sách danh mục thành công');
    } catch (error) {
      return ApiResponse.error(error.message || 'Lấy danh sách danh mục thất bại');
    }
  }

  @Get('/:id')
  async getCategoryById(
    @Param('id') id: number,
  ): Promise<ApiResponse<CategoryResponseDto>> {
    try {
      const result = await this.categoryService.getCategoryById(id);
      return ApiResponse.success(result, 'Lấy chi tiết danh mục thành công');
    } catch (error) {
      return ApiResponse.error(error.message || 'Lấy chi tiết danh mục thất bại');
    }
  }

  @Roles(SystemRole.ORGANIZER, SystemRole.ADMIN)
  @Patch('/:id')
  async updateCategory(
    @Param('id') id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<ApiResponse<CategoryResponseDto>> {
    try {
      const result = await this.categoryService.updateCategory(id, updateCategoryDto);
      return ApiResponse.success(result, 'Cập nhật danh mục thành công');
    } catch (error) {
      return ApiResponse.error(error.message || 'Cập nhật danh mục thất bại');
    }
  }

  @Roles(SystemRole.ORGANIZER, SystemRole.ADMIN)
  @Delete('/:id')
  async deleteCategory(
    @Param('id') id: number,
  ): Promise<ApiResponse<null>> {
    try {
      await this.categoryService.deleteCategory(id);
      return ApiResponse.success(null, 'Xóa danh mục thành công');
    } catch (error) {
      return ApiResponse.error(error.message || 'Xóa danh mục thất bại');
    }
  }
}
