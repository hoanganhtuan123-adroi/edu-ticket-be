import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { User } from '../../models/user.entity';
import { SystemRole } from '../../models/enums';
import { Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { hashPassword } from 'src/common/utils/hash.utils';
import { CreateAccountDto } from './dto/create.dto';
import { UpdateAccountDto } from './dto/update.dto';
import { AccountResponseDto, AccountDetailResponseDto } from './dto/response.dto';
import { plainToInstance } from 'class-transformer';
import { PaginationResponseDto } from '../../shared/dto/pagination-response.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { id } });
  }

  async validateOrganizer(userId: string): Promise<User> {
    const user = await this.findById(userId);
    
    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }
    
    if (!user.isActive) {
      throw new BadRequestException('Tài khoản đã bị khóa, không thể tạo sự kiện');
    }
    
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email } });
  }

  async createUser(
    createAccountDto: CreateAccountDto,
  ): Promise<AccountResponseDto> {
    try {
      const user = await this.userRepo.findOne({
        where: [
          { studentCode: createAccountDto.username },
          { email: createAccountDto.email },
        ],
      });

      if (user) {
        throw new Error('Mã sinh viên hoặc email đã tồn tại');
      }

      const hashedPassword = await hashPassword(createAccountDto.password);
      const newUser = await this.userRepo.save({
        ...createAccountDto,
        password: hashedPassword,
        email: createAccountDto.email,
        fullName: createAccountDto.fullName,
        studentCode: createAccountDto.studentCode || createAccountDto.username,
        systemRole: createAccountDto.role,
        faculty: createAccountDto.faculty,
      });

      return plainToInstance(AccountResponseDto, newUser, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      throw error;
    }
  }

  async updateUser(
    updateDto: UpdateAccountDto,
    userId: number,
  ): Promise<User | null> {
    try {
      const user = await this.userRepo.findOne({
        where: { id: userId.toString() },
      });
      if (!user) {
        throw new NotFoundException('Người dùng không tồn tại');
      }

      if (updateDto.email && updateDto.email !== user.email) {
        const emailExist = await this.userRepo.findOne({
          where: {
            email: updateDto.email,
            id: Not(userId.toString()),
          },
        });

        if (emailExist) {
          throw new ConflictException(
            'Email đã được sử dụng bởi tài khoản khác',
          );
        }
      }

      if (updateDto.password) {
        updateDto.password = await hashPassword(updateDto.password);
      }

      const updatedUser = this.userRepo.merge(user, updateDto);

      return await this.userRepo.save(updatedUser);
    } catch (error) {
      throw error;
    }
  }

  async getAllUsers(query: {
    limit: number;
    offset: number;
    email?: string;
    studentCode?: string;
    role?: SystemRole;
    faculty?: string;
  }): Promise<PaginationResponseDto<AccountResponseDto>> {
    try {
      const whereConditions: any = {};

      if (query.email) {
        whereConditions.email = query.email;
      }

      if (query.studentCode) {
        whereConditions.studentCode = query.studentCode;
      }

      if (query.role) {
        whereConditions.systemRole = query.role;
      }

      if (query.faculty) {
        whereConditions.faculty = query.faculty;
      }

      const [users, total] = await this.userRepo.findAndCount({
        where:
          Object.keys(whereConditions).length > 0 ? whereConditions : undefined,
        skip: query.offset,
        take: query.limit,
        order: { createdAt: 'DESC' },
      });

      const userDtos = plainToInstance(AccountResponseDto, users, {
        excludeExtraneousValues: true,
      });

      return PaginationResponseDto.create(
        userDtos,
        total,
        query.limit,
        query.offset,
      );
    } catch (error) {
      throw error;
    }
  }

  async getDetailUserById(id: string): Promise<AccountDetailResponseDto> {
    try {
      const user = await this.userRepo.findOne({
        where: { id: id },
      });
      if (!user) {
        throw new NotFoundException('Người dùng không tồn tại');
      }

      return plainToInstance(AccountDetailResponseDto, user, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteUserById(id: string): Promise<void> {
    try {
      const user = await this.userRepo.findOne({
        where: { id: id },
      });
      if (!user) {
        throw new NotFoundException('Người dùng không tồn tại');
      }

      if (user.isActive) {
        throw new BadRequestException('Chỉ có thể xóa tài khoản đã bị khóa. Vui lòng khóa tài khoản trước khi xóa.');
      }

      await this.userRepo.delete(id);
    } catch (error) {
      throw error;
    }
  }

  async lockUnlockUser(id: string, isActive: boolean): Promise<AccountResponseDto> {
    try {
      const user = await this.userRepo.findOne({
        where: { id: id },
      });
      if (!user) {
        throw new NotFoundException('Người dùng không tồn tại');
      }

      user.isActive = isActive;
      const updatedUser = await this.userRepo.save(user);

      return plainToInstance(AccountResponseDto, updatedUser, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      throw error;
    }
  }

  // Tạo tài khoản admin mặc định
  async createDefaultAccount(data: {
    password: string;
    email: string;
    fullname: string;
    role: SystemRole;
  }): Promise<void> {
    if (!data.email || !data.password) {
      console.warn(`Thiếu email hoặc password cho role ${data.role}.`);
      return;
    }

    const existingUser = await this.userRepo.findOne({
      where: { email: data.email },
    });

    if (existingUser) {
      return;
    }

    const hashedPassword = await hashPassword(data.password);
    await this.userRepo.save({
      email: data.email,
      password: hashedPassword,
      fullName: data.fullname,
      phoneNumber: '0355352525', // Default phone for admin
      systemRole: data.role,
      isActive: true,
      // Admin doesn't need studentCode or faculty
      ...(data.role !== SystemRole.ADMIN && {
        studentCode: 'USER' + Date.now(),
      }),
    });
  }
}
