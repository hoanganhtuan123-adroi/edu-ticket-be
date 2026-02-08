import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  Index,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { EventStatus } from './enums';
import { User } from './user.entity';
import { Category } from './category.entity';
import { TicketType } from './ticket-type.entity';
import { Booking } from './booking.entity';
import { Ticket } from './ticket.entity';
import { EventStaff } from './event-staff.entity';

@Entity({ name: 'events' })
@Index(['slug'], { unique: true })
export class Event extends BaseEntity {
  // ===== BASIC INFO =====
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  bannerUrl: string;

  @Column({ type: 'varchar', length: 255 })
  location: string;

  // ===== TIME =====
  @Column({ type: 'timestamptz' })
  startTime: Date;

  @Column({ type: 'timestamptz' })
  endTime: Date;

  // ===== STATUS =====
  @Column({
    type: 'varchar',
    length: 20,
    default: EventStatus.DRAFT,
  })
  status: EventStatus;

  @Column({ type: 'jsonb', default: '{}' })
  settings: Record<string, any>;

  // ===== RELATIONS =====
  @ManyToOne(() => User, (user) => user.events, { nullable: false })
  @JoinColumn({ name: 'organizer_id' })
  organizer: User;

  @ManyToOne(() => Category, (category) => category.events, { nullable: false })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @OneToMany(() => TicketType, (ticketType) => ticketType.event)
  ticketTypes: TicketType[];

  @OneToMany(() => Booking, (booking) => booking.event)
  bookings: Booking[];


  @OneToMany(() => EventStaff, (eventStaff) => eventStaff.event)
  eventStaffs: EventStaff[];

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date;
}
