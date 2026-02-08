import { Expose } from 'class-transformer';
import { SystemRole } from '../../../models/enums';

export class AccountResponseDto {
  @Expose()
  id: number;

  @Expose()
  email: string;

  @Expose()
  systemRole: SystemRole;

  @Expose()
  fullName: string;

  @Expose()
  phoneNumber: string;

  @Expose()
  isActive: boolean;
}

export class AccountDetailResponseDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  systemRole: SystemRole;

  @Expose()
  fullName: string;

  @Expose()
  phoneNumber: string;

  @Expose()
  isActive: boolean;

  @Expose()
  studentCode?: string;

  @Expose()
  faculty?: string;

  @Expose()
  createdAt?: Date;

  @Expose()
  updatedAt?: Date;
}
