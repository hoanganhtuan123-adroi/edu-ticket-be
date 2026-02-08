import { IsNotEmpty, IsString, IsNumber, IsOptional, IsDateString, MaxLength, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { TicketType } from '../../../models/enums';

export class TicketTypeDto {
  @IsNotEmpty({ message: 'Tên loại vé không được để trống' })
  @IsString({ message: 'Tên loại vé phải là chuỗi ký tự' })
  @MaxLength(100, { message: 'Tên loại vé không được vượt quá 100 ký tự' })
  name: string;

  @IsOptional()
  @IsEnum(TicketType, { message: 'Loại vé không hợp lệ' })
  type?: TicketType;

  @IsNotEmpty({ message: 'Giá vé không được để trống' })
  @IsNumber({}, { message: 'Giá vé phải là số' })
  @Transform(({ value }) => {
    const numValue = Number(value);
    return isNaN(numValue) ? value : numValue;
  })
  price: number;

  @IsNotEmpty({ message: 'Số lượng giới hạn không được để trống' })
  @IsNumber({}, { message: 'Số lượng giới hạn phải là số' })
  @Transform(({ value }) => {
    const numValue = Number(value);
    return isNaN(numValue) ? value : numValue;
  })
  quantityLimit: number;

  @IsOptional()
  @IsDateString({}, { message: 'Thời gian bắt đầu bán không hợp lệ' })
  startSaleTime?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Thời gian kết thúc bán không hợp lệ' })
  endSaleTime?: string;

  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi ký tự' })
  description?: string;
}

export class CreateTicketDto {
  @IsNotEmpty({ message: 'ID sự kiện không được để trống' })
  @IsString({ message: 'ID sự kiện phải là chuỗi ký tự' })
  eventId: string;

  @IsNotEmpty({ message: 'Tên loại vé không được để trống' })
  @IsString({ message: 'Tên loại vé phải là chuỗi ký tự' })
  @MaxLength(100, { message: 'Tên loại vé không được vượt quá 100 ký tự' })
  name: string;

  @IsOptional()
  @IsEnum(TicketType, { message: 'Loại vé không hợp lệ' })
  type?: TicketType;

  @IsNotEmpty({ message: 'Giá vé không được để trống' })
  @IsNumber({}, { message: 'Giá vé phải là số' })
  @Transform(({ value }) => {
    const numValue = Number(value);
    return isNaN(numValue) ? value : numValue;
  })
  price: number;

  @IsNotEmpty({ message: 'Số lượng giới hạn không được để trống' })
  @IsNumber({}, { message: 'Số lượng giới hạn phải là số' })
  @Transform(({ value }) => {
    const numValue = Number(value);
    return isNaN(numValue) ? value : numValue;
  })
  quantityLimit: number;

  @IsOptional()
  @IsDateString({}, { message: 'Thời gian bắt đầu bán không hợp lệ' })
  startSaleTime?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Thời gian kết thúc bán không hợp lệ' })
  endSaleTime?: string;

  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi ký tự' })
  description?: string;
}
