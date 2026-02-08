import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { Event } from '../../models/event.entity';
import { Category } from '../../models/category.entity';
import { User } from '../../models/user.entity';
import { UserModule } from '../user/user.module';
import { MinioModule } from '../../venders/minio/minio.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event, Category, User]),
    UserModule,
    MinioModule,
  ],
  controllers: [EventController],
  providers: [EventService],
  exports: [EventService],
})
export class EventModule {}
