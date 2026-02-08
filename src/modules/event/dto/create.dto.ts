import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsISO8601,
  MaxLength,
  IsNumber,
  ValidateNested,
  ArrayMinSize,
  IsArray,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { CreateTicketDto } from '../../ticket/dto/create.dto';

export class CreateEventDto {
  @IsNotEmpty({ message: 'ID danh mục không được để trống' })
  @Transform(({ value }) => {
    const numValue = Number(value);
    return isNaN(numValue) ? value : numValue; 
  })
  categoryId: number;

  @IsNotEmpty({ message: 'Tiêu đề sự kiện không được để trống' })
  @IsString({ message: 'Tiêu đề sự kiện phải là chuỗi ký tự' })
  @MaxLength(255, { message: 'Tiêu đề sự kiện không được vượt quá 255 ký tự' })
  title: string;

  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi ký tự' })
  description?: string;

  @IsNotEmpty({ message: 'Địa điểm không được để trống' })
  @IsString()
  @MaxLength(255)
  location: string;

  @IsNotEmpty({ message: 'Thời gian bắt đầu không được để trống' })
  @IsISO8601({}, { message: 'Thời gian bắt đầu phải là định dạng ngày hợp lệ' })
  startTime: string;

  @IsNotEmpty({ message: 'Thời gian kết thúc không được để trống' })
  @IsISO8601(
    {},
    { message: 'Thời gian kết thúc phải là định dạng ngày hợp lệ' },
  )
  endTime: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateTicketDto)
  @IsArray()
  @ArrayMinSize(1, { message: 'Phải có ít nhất một loại vé' })
  ticketTypes?: CreateTicketDto[];

  @IsOptional()
  settings?: string | Record<string, any>;
}