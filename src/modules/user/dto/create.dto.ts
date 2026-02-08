import { IsEmail, IsNotEmpty, IsString, IsEnum, ValidateIf, IsOptional } from 'class-validator';
import { SystemRole } from '../../../models/enums';

export class CreateAccountDto {
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @IsString({ message: 'Mật khẩu phải là chuỗi ký tự' })
  password: string;

  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không đúng định dạng' }) 
  email: string;

  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  @IsString({ message: 'Họ tên phải là chuỗi ký tự' })
  fullName: string;

  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  @IsString({ message: 'Số điện thoại phải là chuỗi ký tự' })
  phoneNumber: string;

  @IsNotEmpty({ message: 'Vai trò (Role) không được để trống' })
  @IsEnum(SystemRole, { message: 'Vai trò không hợp lệ' }) 
  role: SystemRole;

  @ValidateIf(o => o.role === SystemRole.ORGANIZER)
  @IsNotEmpty({ message: 'Khoa không được để trống đối với Ban tổ chức' })
  @IsString({ message: 'Khoa phải là chuỗi ký tự' })
  faculty?: string;

  @ValidateIf(o => o.role === SystemRole.USER)
  @IsNotEmpty({ message: 'Mã sinh viên không được để trống đối với Người dùng' })
  @IsString({ message: 'Mã sinh viên phải là chuỗi ký tự' })
  studentCode?: string;
}
