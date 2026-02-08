import { IsOptional, IsString } from 'class-validator';
import { BasePaginationDto } from '../../../shared/dto/pagination.dto';

export class FilterCategoryDto extends BasePaginationDto {
  @IsOptional()
  @IsString()
  name?: string;
}
