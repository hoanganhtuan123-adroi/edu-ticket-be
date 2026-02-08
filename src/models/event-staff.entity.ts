import {
  Entity,
  Column,
  ManyToOne,
  PrimaryColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import { StaffRole } from './enums';
import { User } from './user.entity';
import { Event } from './event.entity';

@Entity({ name: 'event_staffs' })
@Index(['eventId', 'userId'])
export class EventStaff {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ type: 'uuid' })
  eventId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({
    type: 'enum',
    enum: StaffRole,
    enumName: 'staff_role',
    default: StaffRole.CHECKER,
  })
  staffRole: StaffRole;

  @Column({ type: 'uuid' })
  assignedBy: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => Event, (event) => event.eventStaffs)
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @ManyToOne(() => User, (user) => user.eventStaffs)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'assigned_by' })
  assigner: User;
}
