import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  Index,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Event } from './event.entity';
import { Ticket } from './ticket.entity';
import { TicketType as TicketTypeEnum } from './enums';

@Entity({ name: 'ticket_types' })
@Index(['eventId', 'startSaleTime'])
export class TicketType extends BaseEntity {
  @Column({ type: 'uuid' })
  eventId: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({
    type: 'enum',
    enum: TicketTypeEnum,
    default: TicketTypeEnum.REGULAR,
  })
  type: TicketTypeEnum;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  price: number;

  @Column({ type: 'int' })
  quantityLimit: number;

  @Column({ type: 'int', default: 0 })
  soldQuantity: number;

  @Column({ type: 'timestamptz', nullable: true })
  startSaleTime: Date;

  @Column({ type: 'timestamptz', nullable: true })
  endSaleTime: Date;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Relations
  @ManyToOne(() => Event, (event) => event.ticketTypes)
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @OneToMany(() => Ticket, (ticket) => ticket.ticketType)
  tickets: Ticket[];
}
