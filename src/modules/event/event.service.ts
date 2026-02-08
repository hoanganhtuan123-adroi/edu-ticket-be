import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { Event } from '../../models/event.entity';
import { Category } from '../../models/category.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateEventDto } from './dto/create.dto';
import { UpdateEventDto } from './dto/update.dto';
import { EventResponseDto, EventDetailResponseDto } from './dto/response.dto';
import { plainToInstance } from 'class-transformer';
import { PaginationResponseDto } from '../../shared/dto/pagination-response.dto';
import { EventStatus } from '../../models/enums';
import { SlugUtil } from '../../common/utils/slug.util';
import { UserService } from '../user/user.service';
import { MinioService } from '../../venders/minio/minio.service';
import { TicketService } from '../ticket/ticket.service';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    private readonly userService: UserService,
    private readonly minioService: MinioService,
    private readonly ticketService: TicketService,
  ) {}

  async createEvent(
    createEventDto: CreateEventDto,
    organizerId: string,
    file?: Express.Multer.File,
  ): Promise<{ id: string; title: string; categoryId: number }> {
    let bannerUrl: string | undefined;

    try {
      const organizer = await this.userService.validateOrganizer(organizerId);

      const slug = SlugUtil.generateSlug(createEventDto.title);

      if (file) {
        if (!this.minioService.isAvailable()) {
          throw new BadRequestException(
            'MinIO service is not available. File upload is currently disabled.',
          );
        }

        bannerUrl = await this.minioService.uploadFile(file, slug);
      }

      const category = await this.categoryRepo.findOne({
        where: { id: createEventDto.categoryId },
      });

      if (!category) {
        throw new BadRequestException('Danh mục không tồn tại');
      }

      const startTime = new Date(createEventDto.startTime);
      const endTime = new Date(createEventDto.endTime);

      if (startTime >= endTime) {
        throw new BadRequestException(
          'Thời gian kết thúc phải sau thời gian bắt đầu',
        );
      }

      const existingEvent = await this.eventRepo.findOne({
        where: { slug },
      });

      if (existingEvent) {
        throw new ConflictException('Tiêu đề sự kiện đã tồn tại');
      }

      const newEvent = await this.eventRepo.save({
        ...createEventDto,
        bannerUrl,
        category: category,
        organizer: organizer,
        slug,
        startTime,
        endTime,
        status: EventStatus.DRAFT,
        settings:
          typeof createEventDto.settings === 'string'
            ? JSON.parse(createEventDto.settings)
            : createEventDto.settings || {},
      });

      // Create ticket types if provided
      if (createEventDto.ticketTypes && createEventDto.ticketTypes.length > 0) {
        try {
          for (const ticketType of createEventDto.ticketTypes) {
            await this.ticketService.createTicketFromEvent(
              ticketType,
              newEvent.id,
            );
          }
        } catch (ticketError) {
          // If ticket creation fails, we should rollback the event creation
          // For now, we'll log the error and continue
          console.error('Failed to create ticket types:', ticketError);
          // In production, you might want to delete the event and throw an error
        }
      }

      return {
        id: newEvent.id,
        title: newEvent.title,
        categoryId: newEvent.categoryId,
      };
    } catch (error) {
      if (bannerUrl && file) {
      }
      throw error;
    }
  }

  async getAllEvents(query: {
    limit: number;
    offset: number;
    title?: string;
    location?: string;
    status?: EventStatus;
    categoryId?: string;
  }): Promise<PaginationResponseDto<EventResponseDto>> {
    try {
      const whereConditions: any = {};

      if (query.title) {
        whereConditions.title = query.title;
      }

      if (query.location) {
        whereConditions.location = query.location;
      }

      if (query.status) {
        whereConditions.status = query.status;
      }

      if (query.categoryId) {
        whereConditions.categoryId = parseInt(query.categoryId);
      }

      const [events, total] = await this.eventRepo.findAndCount({
        where:
          Object.keys(whereConditions).length > 0 ? whereConditions : undefined,
        skip: query.offset,
        take: query.limit,
        order: { createdAt: 'DESC' },
        relations: ['category', 'organizer'],
      });

      const eventDtos = plainToInstance(EventResponseDto, events, {
        excludeExtraneousValues: true,
      });

      return PaginationResponseDto.create(
        eventDtos,
        total,
        query.limit,
        query.offset,
      );
    } catch (error) {
      throw error;
    }
  }

  async getEventsByOrganizer(query: {
    limit: number;
    offset: number;
    title?: string;
    location?: string;
    status?: EventStatus;
    categoryId?: string;
    organizerId: string;
  }): Promise<PaginationResponseDto<EventResponseDto>> {
    try {
      const whereConditions: any = {
        organizer: { id: query.organizerId }
      };

      if (query.title) {
        whereConditions.title = query.title;
      }

      if (query.location) {
        whereConditions.location = query.location;
      }

      if (query.status) {
        whereConditions.status = query.status;
      }

      if (query.categoryId) {
        whereConditions.categoryId = parseInt(query.categoryId);
      }

      const [events, total] = await this.eventRepo.findAndCount({
        where: whereConditions,
        skip: query.offset,
        take: query.limit,
        order: { createdAt: 'DESC' },
        relations: ['category', 'organizer'],
      });

      const eventDtos = plainToInstance(EventResponseDto, events, {
        excludeExtraneousValues: true,
      });

      return PaginationResponseDto.create(
        eventDtos,
        total,
        query.limit,
        query.offset,
      );
    } catch (error) {
      throw error;
    }
  }

  async getEventById(id: string): Promise<EventDetailResponseDto> {
    try {
      const event = await this.eventRepo.findOne({
        where: { id },
        relations: ['category', 'organizer'],
      });

      if (!event) {
        throw new NotFoundException('Sự kiện không tồn tại');
      }

      return plainToInstance(EventDetailResponseDto, event, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      throw error;
    }
  }

  async updateEvent(
    id: string,
    updateEventDto: UpdateEventDto,
    organizerId: string,
  ): Promise<EventResponseDto> {
    try {
      const event = await this.eventRepo.findOne({
        where: { id },
      });

      if (!event) {
        throw new NotFoundException('Sự kiện không tồn tại');
      }

      // Check if organizer is the owner
      if (event.organizer.id !== organizerId) {
        throw new BadRequestException(
          'Bạn không có quyền cập nhật sự kiện này',
        );
      }

      // Validate thời gian nếu có cập nhật
      if (updateEventDto.startTime || updateEventDto.endTime) {
        const startTime = updateEventDto.startTime
          ? new Date(updateEventDto.startTime)
          : event.startTime;
        const endTime = updateEventDto.endTime
          ? new Date(updateEventDto.endTime)
          : event.endTime;

        if (startTime >= endTime) {
          throw new BadRequestException(
            'Thời gian kết thúc phải sau thời gian bắt đầu',
          );
        }

        updateEventDto.startTime = startTime as any;
        updateEventDto.endTime = endTime as any;
      }

      // Update slug if title changed
      if (updateEventDto.title && updateEventDto.title !== event.title) {
        const slug = SlugUtil.generateSlug(updateEventDto.title);
        const existingEvent = await this.eventRepo.findOne({
          where: { slug },
        });

        if (existingEvent && existingEvent.id !== id) {
          throw new ConflictException('Tiêu đề sự kiện đã tồn tại');
        }

        // Update event directly with slug
        const updateData = { ...updateEventDto, slug };
        const updatedEvent = this.eventRepo.merge(event, updateData);
        const savedEvent = await this.eventRepo.save(updatedEvent);

        return plainToInstance(EventResponseDto, savedEvent, {
          excludeExtraneousValues: true,
        });
      }

      const updatedEvent = this.eventRepo.merge(event, updateEventDto);
      const savedEvent = await this.eventRepo.save(updatedEvent);

      return plainToInstance(EventResponseDto, savedEvent, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteEvent(id: string, organizerId: string): Promise<void> {
    try {
      const event = await this.eventRepo.findOne({
        where: { id },
      });

      if (!event) {
        throw new NotFoundException('Sự kiện không tồn tại');
      }

      // Check if organizer is the owner
      if (event.organizer.id !== organizerId) {
        throw new BadRequestException('Bạn không có quyền xóa sự kiện này');
      }

      // Soft delete
      await this.eventRepo.update(id, { deletedAt: new Date() });
    } catch (error) {
      throw error;
    }
  }

  async updateEventStatus(
    id: string,
    status: EventStatus,
    organizerId: string,
  ): Promise<{ id: string; title: string; status: string }> {
    try {
      const event = await this.eventRepo.findOne({
        where: { id },
        relations: ['organizer'],
      });

      if (!event) {
        throw new NotFoundException('Sự kiện không tồn tại');
      }

      // Check if organizer is the owner
      if (event.organizer?.id !== organizerId) {
        console.log('Organizer ID:', organizerId);
        console.log('Event organizer ID:', event.organizer?.id);
        throw new BadRequestException(
          'Bạn không có quyền cập nhật trạng thái sự kiện này',
        );
      }

      // Update status
      await this.eventRepo.update(id, { status });

      return {
        id: event.id,
        title: event.title,
        status: status,
      };
    } catch (error) {
      console.log('Update event status error:', error);
      throw error;
    }
  }

  async approveEvent(
    id: string,
  ): Promise<{ id: string; title: string; status: string }> {
    try {
      const event = await this.eventRepo.findOne({
        where: { id },
      });

      if (!event) {
        throw new NotFoundException('Sự kiện không tồn tại');
      }

      // Check if event is in PENDING_APPROVAL status
      if (event.status !== EventStatus.PENDING_APPROVAL) {
        throw new BadRequestException(
          'Chỉ có thể duyệt sự kiện đang ở trạng thái chờ duyệt',
        );
      }

      // Update status to APPROVED
      await this.eventRepo.update(id, { status: EventStatus.APPROVED });

      return {
        id: event.id,
        title: event.title,
        status: EventStatus.APPROVED,
      };
    } catch (error) {
      throw error;
    }
  }
}
