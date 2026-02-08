import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { BookingStatus } from './enums';
import { User } from './user.entity';
import { Event } from './event.entity';
import { Ticket } from './ticket.entity';

@Entity({ name: 'bookings' })
export class Booking extends BaseEntity {
  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  eventId: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalAmount: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: BookingStatus.PENDING,
  })
  status: BookingStatus;

  @Column({ type: 'varchar', length: 50, nullable: true })
  paymentMethod: string;

  @Column({ type: 'varchar', length: 100, nullable: true, unique: true })
  transactionId: string;

  @Column({ type: 'timestamptz', nullable: true })
  expiresAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.bookings)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Event, (event) => event.bookings)
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @OneToMany(() => Ticket, (ticket) => ticket.booking)
  tickets: Ticket[];
}
