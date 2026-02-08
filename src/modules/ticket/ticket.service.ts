import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TicketType as TicketTypeEntity, TicketStatus } from '../../models/enums';
import { TicketType } from '../../models/ticket-type.entity';
import { Event } from '../../models/event.entity';
import { CreateTicketDto } from './dto/create.dto';
import { UpdateTicketDto } from './dto/update.dto';
import { TicketResponseDto, TicketDetailResponseDto } from './dto/response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(TicketType)
    private readonly ticketTypeRepo: Repository<TicketType>,
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,
  ) {}

  async createTicket(
    createTicketDto: CreateTicketDto,
    organizerId: string,
  ): Promise<{ id: string; name: string; eventId: string; status: string }> {
    try {
      // 1. Check if event exists and belongs to organizer
      const event = await this.eventRepo.findOne({
        where: { id: createTicketDto.eventId },
        relations: ['organizer'],
      });

      if (!event) {
        throw new NotFoundException('Sự kiện không tồn tại');
      }

      // Check if organizer is the owner
      if (event.organizer?.id !== organizerId) {
        throw new BadRequestException(
          'Bạn không có quyền tạo vé cho sự kiện này',
        );
      }

      // 2. Validate sale times if provided
      if (createTicketDto.startSaleTime && createTicketDto.endSaleTime) {
        const startTime = new Date(createTicketDto.startSaleTime);
        const endTime = new Date(createTicketDto.endSaleTime);

        if (startTime >= endTime) {
          throw new BadRequestException(
            'Thời gian kết thúc bán phải sau thời gian bắt đầu',
          );
        }
      }

      // 3. Create ticket type
      const ticketTypeData: Partial<TicketType> = {
        eventId: event.id,
        name: createTicketDto.name,
        type: createTicketDto.type || TicketTypeEntity.REGULAR,
        price: createTicketDto.price,
        quantityLimit: createTicketDto.quantityLimit,
        soldQuantity: 0,
        startSaleTime: createTicketDto.startSaleTime
          ? new Date(createTicketDto.startSaleTime)
          : undefined,
        endSaleTime: createTicketDto.endSaleTime
          ? new Date(createTicketDto.endSaleTime)
          : undefined,
        description: createTicketDto.description,
      };

      const savedTicketType = await this.ticketTypeRepo.save(ticketTypeData) as TicketType;

      return {
        id: savedTicketType.id,
        name: savedTicketType.name,
        eventId: savedTicketType.eventId,
        status: TicketStatus.DRAFT,
      };
    } catch (error) {
      throw error;
    }
  }

  async getTicketsByEvent(eventId: string): Promise<TicketResponseDto[]> {
    try {
      const ticketTypes = await this.ticketTypeRepo.find({
        where: { eventId },
        order: { createdAt: 'ASC' },
      });

      return plainToInstance(TicketResponseDto, ticketTypes, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      throw error;
    }
  }

  async getTicketById(id: string): Promise<TicketResponseDto> {
    try {
      const ticketType = await this.ticketTypeRepo.findOne({
        where: { id },
      });

      if (!ticketType) {
        throw new NotFoundException('Loại vé không tồn tại');
      }

      return plainToInstance(TicketResponseDto, ticketType, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      throw error;
    }
  }

  async updateTicket(
    id: string,
    updateTicketDto: UpdateTicketDto,
    organizerId: string,
  ): Promise<TicketResponseDto> {
    try {
      const ticketType = await this.ticketTypeRepo.findOne({
        where: { id },
        relations: ['event', 'event.organizer'],
      });

      if (!ticketType) {
        throw new NotFoundException('Loại vé không tồn tại');
      }

      // Check if organizer is the owner
      if (ticketType.event.organizer?.id !== organizerId) {
        throw new BadRequestException(
          'Bạn không có quyền cập nhật loại vé này',
        );
      }

      // Validate sale times if provided
      if (updateTicketDto.startSaleTime && updateTicketDto.endSaleTime) {
        const startTime = new Date(updateTicketDto.startSaleTime);
        const endTime = new Date(updateTicketDto.endSaleTime);

        if (startTime >= endTime) {
          throw new BadRequestException(
            'Thời gian kết thúc bán phải sau thời gian bắt đầu',
          );
        }
      }

      // Update ticket type
      await this.ticketTypeRepo.update(id, {
        ...updateTicketDto,
        startSaleTime: updateTicketDto.startSaleTime
          ? new Date(updateTicketDto.startSaleTime)
          : ticketType.startSaleTime,
        endSaleTime: updateTicketDto.endSaleTime
          ? new Date(updateTicketDto.endSaleTime)
          : ticketType.endSaleTime,
      });

      const updatedTicketType = await this.ticketTypeRepo.findOne({
        where: { id },
      });

      return plainToInstance(TicketResponseDto, updatedTicketType, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteTicket(id: string, organizerId: string): Promise<void> {
    try {
      const ticketType = await this.ticketTypeRepo.findOne({
        where: { id },
        relations: ['event', 'event.organizer'],
      });

      if (!ticketType) {
        throw new NotFoundException('Loại vé không tồn tại');
      }

      // Check if organizer is the owner
      if (ticketType.event.organizer?.id !== organizerId) {
        throw new BadRequestException(
          'Bạn không có quyền xóa loại vé này',
        );
      }

      // Check if there are sold tickets
      if (ticketType.soldQuantity > 0) {
        throw new BadRequestException(
          'Không thể xóa loại vé đã có vé được bán',
        );
      }

      await this.ticketTypeRepo.delete(id);
    } catch (error) {
      throw error;
    }
  }
}
