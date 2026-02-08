import {
  Entity,
  Column,
  OneToMany,
  Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { SystemRole } from './enums';
import { Booking } from './booking.entity';
import { EventStaff } from './event-staff.entity';
import { CheckInLog } from './check-in-log.entity';
import { AuditLog } from './audit-log.entity';
import { Event } from './event.entity';

@Entity({ name: 'users' })
@Index(['email'], { unique: true })
@Index(['studentCode'], { unique: true })
export class User extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'varchar', length: 100 })
  fullName: string;

  @Column({ type: 'varchar', length: 20 })
  phoneNumber: string;

  @Column({
    type: 'enum',
    enum: SystemRole,
    enumName: 'system_role',
    default: SystemRole.USER,
  })
  systemRole: SystemRole;

  @Column({ type: 'varchar', length: 50, nullable: true })
  faculty: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  studentCode: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  // ===== RELATIONS =====
  @OneToMany(() => Event, (event) => event.organizer)
  events: Event[];

  @OneToMany(() => Booking, (booking) => booking.user)
  bookings: Booking[];

  @OneToMany(() => EventStaff, (eventStaff) => eventStaff.user)
  eventStaffs: EventStaff[];

  @OneToMany(() => CheckInLog, (checkInLog) => checkInLog.staff)
  checkInLogs: CheckInLog[];

  @OneToMany(() => AuditLog, (auditLog) => auditLog.performer)
  auditLogs: AuditLog[];
}
