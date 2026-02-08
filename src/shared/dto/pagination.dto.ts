import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class BasePaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;
}

export class PaginationDto extends BasePaginationDto {
  // Helper methods for backward compatibility
  get page(): number {
    return Math.floor((this.offset || 0) / (this.limit || 10)) + 1;
  }

  get skip(): number {
    return this.offset || 0;
  }
}
