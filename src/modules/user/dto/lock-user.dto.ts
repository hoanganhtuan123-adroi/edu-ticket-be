import { IsBoolean, IsNotEmpty } from 'class-validator';

export class LockUserDto {
  @IsNotEmpty({ message: 'Trạng thái khóa không được để trống' })
  @IsBoolean({ message: 'Trạng thái khóa phải là boolean' })
  isActive: boolean;
}
