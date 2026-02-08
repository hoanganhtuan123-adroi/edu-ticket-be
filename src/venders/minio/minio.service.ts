import { Injectable, OnModuleInit, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { extname } from 'path';
import {
  MinioConfig,
  MINIO_CONFIG_KEY,
  MINIO_DEFAULTS,
} from '../../config/minio.config';

@Injectable()
export class MinioService implements OnModuleInit {
  private client: Minio.Client;
  private bucket: string;
  private readonly logger = new Logger(MinioService.name);
  private isMinioAvailable = false;

  constructor(
    @Inject(MINIO_CONFIG_KEY) private readonly minioConfig: MinioConfig,
  ) {
    // Debug: Log configuration values
    this.logger.debug('🔧 MinIO Configuration:');
    this.logger.debug(`   - endPoint: ${this.minioConfig.endPoint}`);
    this.logger.debug(`   - port: ${this.minioConfig.port}`);
    this.logger.debug(`   - useSSL: ${this.minioConfig.useSSL}`);
    this.logger.debug(
      `   - accessKey: ${this.minioConfig.accessKey ? '***' : 'undefined'}`,
    );
    this.logger.debug(
      `   - secretKey: ${this.minioConfig.secretKey ? '***' : 'undefined'}`,
    );
    this.logger.debug(`   - bucket: ${this.minioConfig.bucket}`);

    // Validate required environment variables
    this.validateConfig();

    this.bucket = this.minioConfig.bucket;
    this.client = new Minio.Client({
      endPoint: this.minioConfig.endPoint,
      port: this.minioConfig.port,
      useSSL: this.minioConfig.useSSL,
      accessKey: this.minioConfig.accessKey,
      secretKey: this.minioConfig.secretKey,
    });
  }

  private validateConfig(): void {
    // Check if we have either environment variables or default Docker credentials
    const hasCredentials =
      this.minioConfig.accessKey && this.minioConfig.secretKey;
    const isDefaultDocker =
      this.minioConfig.accessKey === 'minioadmin' &&
      this.minioConfig.secretKey === 'minioadmin123';

    if (!hasCredentials) {
      this.logger.warn(
        '⚠️  MinIO credentials not found. MinIO service will be disabled.',
      );
      this.isMinioAvailable = false;
      return;
    }

    // Set as available when credentials are found
    this.isMinioAvailable = true;

    if (isDefaultDocker) {
      this.logger.log(
        'ℹ️  Using default MinIO Docker credentials for development',
      );
    } else {
      this.logger.log('✅ MinIO credentials found');
    }
  }

  async onModuleInit() {
    // Skip initialization if MinIO is not available
    if (!this.isMinioAvailable) {
      this.logger.warn(
        '⚠️  MinIO service is disabled. Skipping initialization.',
      );
      return;
    }

    try {
      this.logger.log('🔍 Checking MinIO connection...');

      // Test connection by checking bucket existence
      const exists = await this.client.bucketExists(this.bucket);

      if (!exists) {
        await this.client.makeBucket(this.bucket, MINIO_DEFAULTS.REGION);
        this.logger.log(`✅ MinIO bucket "${this.bucket}" created`);
      } else {
        this.logger.log(`✅ MinIO bucket "${this.bucket}" already exists`);
      }

      this.isMinioAvailable = true;
      this.logger.log('✅ MinIO service initialized successfully');
    } catch (error) {
      this.logger.error('❌ Failed to initialize MinIO service:', error);
      this.logger.warn(
        '⚠️  MinIO service will be disabled. File uploads will fail.',
      );
      this.isMinioAvailable = false;
      // Don't throw error to prevent app from crashing
    }
  }

  async uploadFile(file: Express.Multer.File, filename?: string): Promise<string> {
    if (!this.isMinioAvailable) {
      throw new Error('MinIO service is not available. Check configuration and connection.');
    }

    try {
      // Use custom filename if provided, otherwise generate with timestamp
      const objectName = filename 
        ? `${filename}${extname(file.originalname)}` 
        : `${Date.now()}-${file.originalname}`;

      await this.client.putObject(
        this.bucket,
        objectName,
        file.buffer,
        file.size,
        {
          'Content-Type': file.mimetype,
        },
      );

      const fileUrl = `${this.minioConfig.useSSL ? 'https' : 'http'}://${
        this.minioConfig.endPoint
      }:${this.minioConfig.port}/${this.bucket}/${objectName}`;
      
      this.logger.log(` File uploaded successfully: ${objectName}`);
      return fileUrl;
    } catch (error) {
      this.logger.error(' Failed to upload file to MinIO:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  // Helper method to check if MinIO is available
  isAvailable(): boolean {
    return this.isMinioAvailable;
  }
}
