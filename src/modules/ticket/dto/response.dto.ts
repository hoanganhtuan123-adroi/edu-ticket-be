import { TicketStatus } from '../../../models/enums';
import { Expose } from 'class-transformer';
import { TicketType } from '../../../models/enums';

export class TicketResponseDto {
  @Expose()
  id: string;

  @Expose()
  eventId: string;

  @Expose()
  name: string;

  @Expose()
  type: TicketType;

  @Expose()
  price: number;

  @Expose()
  quantityLimit: number;

  @Expose()
  soldQuantity: number;

  @Expose()
  startSaleTime?: string;

  @Expose()
  endSaleTime?: string;

  @Expose()
  description?: string;

  @Expose()
  status: TicketStatus;

  @Expose()
  createdAt: string;

  @Expose()
  updatedAt: string;
}

export class TicketDetailResponseDto extends TicketResponseDto {
  // Add any additional fields for detailed view if needed
}
