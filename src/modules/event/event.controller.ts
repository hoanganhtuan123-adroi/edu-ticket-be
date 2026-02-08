import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Request,
  BadRequestException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { extname } from 'path';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create.dto';
import { UpdateEventDto } from './dto/update.dto';
import { EventResponseDto, EventDetailResponseDto } from './dto/response.dto';
import { FilterEventDto } from './dto/filter-event.dto';
import { ApiResponse } from 'src/common/responses/api-response';
import { Roles } from '../auth/decorator/auth.decorator';
import { EventStatus } from '../../models/enums';
import { SystemRole } from '../../models/enums';
import { PaginationResponseDto } from '../../shared/dto/pagination-response.dto';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Roles(SystemRole.ORGANIZER)
  @Post('/create')
  @UseInterceptors(
    FileInterceptor('banner', {
      storage: memoryStorage(), // Store file in memory instead of disk
      fileFilter: (req, file, cb) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              'Chỉ chấp nhận file ảnh (jpg, png, gif, webp)',
            ),
            false,
          );
        }
      },
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    }),
  )
  async createEvent(
    @UploadedFile() file: Express.Multer.File,
    @Body() createEventDto: CreateEventDto,
    @Request() req: any,
  ) {
    try {
      let settings = createEventDto.settings;
      if (typeof settings === 'string') {
        try {
          settings = JSON.parse(settings);
        } catch (e) {
          throw new BadRequestException('Format settings không hợp lệ');
        }
      }

      const eventData = {
        ...createEventDto,
        settings,
      };

      const result = await this.eventService.createEvent(
        eventData,
        req.user.userId,
        file, // Pass file to service for upload handling
      );
      return ApiResponse.success(result, 'Tạo sự kiện thành công');
    } catch (error) {
      throw error; // Để Global Exception Filter xử lý hoặc return ApiResponse.error
    }
  }

  @Roles(SystemRole.ORGANIZER)
  @Get()
  async getAllEventsForOrganizer(
    @Query() filter: FilterEventDto,
  ): Promise<ApiResponse<PaginationResponseDto<EventResponseDto>>> {
    try {
      const result = await this.eventService.getAllEvents({
        limit: filter.limit || 10,
        offset: filter.offset || 0,
        title: filter.title,
        location: filter.location,
        status: filter.status,
        categoryId: filter.categoryId,
      });
      return ApiResponse.success(result, 'Lấy danh sách sự kiện thành công');
    } catch (error) {
      return ApiResponse.error(
        error.message || 'Lấy danh sách sự kiện thất bại',
      );
    }
  }

  @Roles(SystemRole.ORGANIZER)
  @Get('/my-events')
  async getMyEvents(
    @Query() filter: FilterEventDto,
    @Request() req: any,
  ): Promise<ApiResponse<PaginationResponseDto<EventResponseDto>>> {
    try {
      const organizerId = req.user.userId;
      const result = await this.eventService.getEventsByOrganizer({
        limit: filter.limit || 10,
        offset: filter.offset || 0,
        title: filter.title,
        location: filter.location,
        status: filter.status,
        categoryId: filter.categoryId,
        organizerId: organizerId,
      });
      return ApiResponse.success(result, 'Lấy danh sách sự kiện của bạn thành công');
    } catch (error) {
      return ApiResponse.error(
        error.message || 'Lấy danh sách sự kiện của bạn thất bại',
      );
    }
  }

  @Get('/:id')
  async getEventById(
    @Param('id') id: string,
  ): Promise<ApiResponse<EventDetailResponseDto>> {
    try {
      const result = await this.eventService.getEventById(id);
      return ApiResponse.success(result, 'Lấy chi tiết sự kiện thành công');
    } catch (error) {
      return ApiResponse.error(
        error.message || 'Lấy chi tiết sự kiện thất bại',
      );
    }
  }

  @Roles(SystemRole.ORGANIZER)
  @Patch('/:id/submit-for-approval')
  async submitEventForApproval(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<ApiResponse<{ id: string; title: string; status: string }>> {
    try {
      const organizerId = req.user.userId;
      const result = await this.eventService.updateEventStatus(
        id,
        EventStatus.PENDING_APPROVAL,
        organizerId,
      );
      return ApiResponse.success(result, 'Nộp sự kiện để duyệt thành công');
    } catch (error) {
      return ApiResponse.error(
        error.message || 'Nộp sự kiện để duyệt thất bại',
      );
    }
  }

  @Roles(SystemRole.ADMIN)
  @Patch('/:id/approve')
  async approveEvent(
    @Param('id') id: string,
  ): Promise<ApiResponse<{ id: string; title: string; status: string }>> {
    try {
      const result = await this.eventService.approveEvent(id);
      return ApiResponse.success(result, 'Duyệt sự kiện thành công');
    } catch (error) {
      return ApiResponse.error(error.message || 'Duyệt sự kiện thất bại');
    }
  }

  @Roles(SystemRole.ORGANIZER)
  @Patch('/:id')
  async updateEvent(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @Request() req: any,
  ): Promise<ApiResponse<EventResponseDto>> {
    try {
      const organizerId = req.user.userId;
      const result = await this.eventService.updateEvent(
        id,
        updateEventDto,
        organizerId,
      );
      return ApiResponse.success(result, 'Cập nhật sự kiện thành công');
    } catch (error) {
      return ApiResponse.error(error.message || 'Cập nhật sự kiện thất bại');
    }
  }

  @Roles(SystemRole.ORGANIZER)
  @Delete('/:id')
  async deleteEvent(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<ApiResponse<null>> {
    try {
      const organizerId = req.user.userId;
      await this.eventService.deleteEvent(id, organizerId);
      return ApiResponse.success(null, 'Xóa sự kiện thành công');
    } catch (error) {
      return ApiResponse.error(error.message || 'Xóa sự kiện thất bại');
    }
  }
}
