import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MinioService } from './minio.service';
import minioConfig, { MINIO_CONFIG_KEY } from '../../config/minio.config';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: MINIO_CONFIG_KEY,
      useFactory: minioConfig,
      inject: [],
    },
    MinioService,
  ],
  exports: [MinioService],
})
export class MinioModule {}
