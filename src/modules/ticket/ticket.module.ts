import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { TicketType } from '../../models/ticket-type.entity';
import { Event } from '../../models/event.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TicketType, Event]),
  ],
  controllers: [TicketController],
  providers: [TicketService],
  exports: [TicketService],
})
export class TicketModule {}
