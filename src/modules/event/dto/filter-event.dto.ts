import { IsOptional, IsString, IsEnum } from 'class-validator';
import { BasePaginationDto } from '../../../shared/dto/pagination.dto';
import { EventStatus } from '../../../models/enums';

export class FilterEventDto extends BasePaginationDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @IsOptional()
  @IsString()
  categoryId?: string;
}
