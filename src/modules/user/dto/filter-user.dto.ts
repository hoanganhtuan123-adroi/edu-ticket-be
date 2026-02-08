import { IsOptional, IsString, IsEnum } from 'class-validator';
import { BasePaginationDto } from '../../../shared/dto/pagination.dto';
import { SystemRole } from '../../../models/enums';

export class FilterUserDto extends BasePaginationDto {
  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  studentCode?: string;

  @IsOptional()
  @IsEnum(SystemRole)
  role?: SystemRole;

  @IsOptional()
  @IsString()
  faculty?: string;
}
