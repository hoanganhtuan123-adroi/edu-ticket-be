import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  Index,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { TicketStatus } from './enums';
import { Booking } from './booking.entity';
import { TicketType } from './ticket-type.entity';
import { CheckInLog } from './check-in-log.entity';

@Entity({ name: 'tickets' })
@Index(['ticketCode'], { unique: true })
@Index(['qrCodeHash'], { unique: true })
export class Ticket extends BaseEntity {
  @Column({ type: 'varchar', length: 50 })
  ticketCode: string;

  @Column({ type: 'text' })
  qrCodeHash: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  holderName: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: TicketStatus.DRAFT,
  })
  status: TicketStatus;

  // Relations
  @ManyToOne(() => Booking, (booking) => booking.tickets)
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @ManyToOne(() => TicketType, (ticketType) => ticketType.tickets)
  @JoinColumn({ name: 'ticket_type_id' })
  ticketType: TicketType;


  @OneToMany(() => CheckInLog, (checkInLog) => checkInLog.ticket)
  checkInLogs: CheckInLog[];
}
