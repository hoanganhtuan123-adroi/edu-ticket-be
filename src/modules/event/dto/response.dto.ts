import { Expose } from 'class-transformer';
import { EventStatus } from '../../../models/enums';

export class EventResponseDto {
  @Expose()
  id: string;

  @Expose()
  organizerId: string;

  @Expose()
  categoryId: number;

  @Expose()
  title: string;

  @Expose()
  slug?: string;

  @Expose()
  description?: string;

  @Expose()
  bannerUrl?: string;

  @Expose()
  location: string;

  @Expose()
  startTime: Date;

  @Expose()
  endTime: Date;

  @Expose()
  status: EventStatus;

  @Expose()
  settings?: Record<string, any>;

  @Expose()
  createdAt?: Date;

  @Expose()
  updatedAt?: Date;
}

export class EventDetailResponseDto extends EventResponseDto {
  @Expose()
  category?: {
    id: number;
    name: string;
    description?: string;
  };

  @Expose()
  organizer?: {
    id: string;
    fullName: string;
    email: string;
  };
}
