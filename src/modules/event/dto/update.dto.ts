import { IsOptional, IsString, IsDateString, MaxLength } from 'class-validator';

export class UpdateEventDto {
  @IsOptional()
  @IsString({ message: 'Tiêu đề sự kiện phải là chuỗi ký tự' })
  @MaxLength(255, { message: 'Tiêu đề sự kiện không được vượt quá 255 ký tự' })
  title?: string;

  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi ký tự' })
  description?: string;

  @IsOptional()
  @IsString({ message: 'URL banner phải là chuỗi ký tự' })
  @MaxLength(500, { message: 'URL banner không được vượt quá 500 ký tự' })
  bannerUrl?: string;

  @IsOptional()
  @IsString({ message: 'Địa điểm phải là chuỗi ký tự' })
  @MaxLength(255, { message: 'Địa điểm không được vượt quá 255 ký tự' })
  location?: string;

  @IsOptional()
  @IsDateString()
  startTime?: string;

  @IsOptional()
  @IsDateString()
  endTime?: string;

  @IsOptional()
  settings?: Record<string, any>;
}
