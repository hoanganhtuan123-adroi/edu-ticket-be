import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { CreateAccountDto } from './dto/create.dto';
import { UpdateAccountDto } from './dto/update.dto';
import { FilterUserDto } from './dto/filter-user.dto';
import { AccountDetailResponseDto } from './dto/response.dto';
import { LockUserDto } from './dto/lock-user.dto';
import { ApiResponse } from 'src/common/responses/api-response';
import { Roles } from '../auth/decorator/auth.decorator';
import { SystemRole } from '../../models/enums';
import { UserService } from './user.service';
import { PaginationResponseDto } from '../../shared/dto/pagination-response.dto';
import { IsUUID } from 'class-validator';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Roles(SystemRole.ADMIN)
  @Post('/create')
  async createUser(
    @Body() createAccountDto: CreateAccountDto,
  ): Promise<ApiResponse<object>> {
    const result = await this.userService.createUser(createAccountDto);
    if (!result) {
      return ApiResponse.error('Tạo người dùng thất bại');
    }
    return ApiResponse.success(result, 'Tạo người dùng thành công');
  }

  @Roles(SystemRole.ADMIN)
  @Patch('/update/:id')
  async updateUser(
    @Body() updateAccountDto: UpdateAccountDto,
    @Param('id') id: number,
  ): Promise<ApiResponse<object>> {
    const result = await this.userService.updateUser(
      updateAccountDto,
      id,
    );
    if (!result) {
      return ApiResponse.error('Cập nhật người dùng thất bại');
    }
    return ApiResponse.success(result, 'Cập nhật người dùng thành công');
  }

  @Roles(SystemRole.ADMIN)
  @Get("list-users")
  async getAllUsers(
    @Query() filter: FilterUserDto,
  ): Promise<ApiResponse<PaginationResponseDto<object>>> {
    const result = await this.userService.getAllUsers({
      limit: filter.limit || 10,
      offset: filter.offset || 0,
      email: filter.email,
      studentCode: filter.studentCode,
      role: filter.role,
      faculty: filter.faculty
    });
    return ApiResponse.success(result, 'Lấy danh sách người dùng thành công');
  }

  @Roles(SystemRole.ADMIN)
  @Get('/:id/detail')
  async getDetailUser(
    @Param('id') id: string,
  ): Promise<ApiResponse<AccountDetailResponseDto>> {
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new BadRequestException('ID phải là định dạng UUID hợp lệ');
    }
    
    const result = await this.userService.getDetailUserById(id);
    return ApiResponse.success(result, 'Lấy chi tiết người dùng thành công');
  }

  @Roles(SystemRole.ADMIN)
  @Delete('/delete/:id')
  async deleteUser(
    @Param('id') id: string,
  ): Promise<ApiResponse<object | null>> {
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new BadRequestException('ID phải là định dạng UUID hợp lệ');
    }
    
    await this.userService.deleteUserById(id);
    return ApiResponse.success(null, 'Xóa người dùng thành công');
  }

  @Roles(SystemRole.ADMIN)
  @Patch('/:id/lock')
  async lockUnlockUser(
    @Param('id') id: string,
    @Body() lockUserDto: LockUserDto,
  ): Promise<ApiResponse<object>> {
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new BadRequestException('ID phải là định dạng UUID hợp lệ');
    }
    
    const result = await this.userService.lockUnlockUser(id, lockUserDto.isActive);
    const message = lockUserDto.isActive ? 'Mở khóa tài khoản thành công' : 'Khóa tài khoản thành công';
    return ApiResponse.success(result, message);
  }
}
