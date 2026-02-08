import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Request,
  Query,
} from '@nestjs/common';
import { TicketService } from './ticket.service';
import { CreateTicketDto } from './dto/create.dto';
import { UpdateTicketDto } from './dto/update.dto';
import { TicketResponseDto } from './dto/response.dto';
import { ApiResponse } from 'src/common/responses/api-response';
import { Roles } from '../auth/decorator/auth.decorator';
import { SystemRole } from '../../models/enums';

@Controller('tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Roles(SystemRole.ORGANIZER)
  @Post('/create')
  async createTicket(
    @Body() createTicketDto: CreateTicketDto,
    @Request() req: any,
  ): Promise<ApiResponse<{ id: string; name: string; eventId: string; status: string }>> {
    try {
      const organizerId = req.user.userId;
      const result = await this.ticketService.createTicket(
        createTicketDto,
        organizerId,
      );
      return ApiResponse.success(result, 'Tạo vé thành công');
    } catch (error) {
      return ApiResponse.error(error.message || 'Tạo vé thất bại');
    }
  }

  @Get('/event/:eventId')
  async getTicketsByEvent(
    @Param('eventId') eventId: string,
  ): Promise<ApiResponse<TicketResponseDto[]>> {
    try {
      const result = await this.ticketService.getTicketsByEvent(eventId);
      return ApiResponse.success(result, 'Lấy danh sách vé thành công');
    } catch (error) {
      return ApiResponse.error(error.message || 'Lấy danh sách vé thất bại');
    }
  }

  @Get('/:id')
  async getTicketById(
    @Param('id') id: string,
  ): Promise<ApiResponse<TicketResponseDto>> {
    try {
      const result = await this.ticketService.getTicketById(id);
      return ApiResponse.success(result, 'Lấy chi tiết vé thành công');
    } catch (error) {
      return ApiResponse.error(error.message || 'Lấy chi tiết vé thất bại');
    }
  }

  @Roles(SystemRole.ORGANIZER)
  @Patch('/:id')
  async updateTicket(
    @Param('id') id: string,
    @Body() updateTicketDto: UpdateTicketDto,
    @Request() req: any,
  ): Promise<ApiResponse<TicketResponseDto>> {
    try {
      const organizerId = req.user.userId;
      const result = await this.ticketService.updateTicket(
        id,
        updateTicketDto,
        organizerId,
      );
      return ApiResponse.success(result, 'Cập nhật vé thành công');
    } catch (error) {
      return ApiResponse.error(error.message || 'Cập nhật vé thất bại');
    }
  }

  @Roles(SystemRole.ORGANIZER)
  @Delete('/:id')
  async deleteTicket(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<ApiResponse<null>> {
    try {
      const organizerId = req.user.userId;
      await this.ticketService.deleteTicket(id, organizerId);
      return ApiResponse.success(null, 'Xóa vé thành công');
    } catch (error) {
      return ApiResponse.error(error.message || 'Xóa vé thất bại');
    }
  }
}
