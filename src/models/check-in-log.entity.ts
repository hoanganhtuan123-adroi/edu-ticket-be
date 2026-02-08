import {
  Entity,
  Column,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import { EntryType, CheckInMethod } from './enums';
import { Ticket } from './ticket.entity';
import { User } from './user.entity';

@Entity({ name: 'check_in_logs' })
export class CheckInLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid' })
  ticketId: string;

  @Column({ type: 'uuid' })
  staffId: string;

  @Column({
    type: 'enum',
    enum: EntryType,
    enumName: 'entry_type',
    default: EntryType.IN,
  })
  entryType: EntryType;

  @Column({
    type: 'enum',
    enum: CheckInMethod,
    enumName: 'check_in_method',
    default: CheckInMethod.QR_SCAN,
  })
  checkInMethod: CheckInMethod;

  @Column({ type: 'varchar', length: 100, nullable: true })
  deviceId: string;

  @Column({ type: 'boolean', default: false })
  isOfflineSync: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  syncedAt: Date;

  @Column({ type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => Ticket, (ticket) => ticket.checkInLogs)  
  @JoinColumn({ name: 'ticket_id' })
  ticket: Ticket;

  @ManyToOne(() => User, (user) => user.checkInLogs)
  @JoinColumn({ name: 'staff_id' })
  staff: User;
}
