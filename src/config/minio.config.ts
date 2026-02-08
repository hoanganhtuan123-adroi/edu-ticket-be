import { registerAs } from '@nestjs/config';

export const MINIO_CONFIG_KEY = 'minio';

export const MINIO_DEFAULTS = {
  ENDPOINT: 'localhost',
  PORT: 9000,
  BUCKET: 'event',
  REGION: 'us-east-1',
  ACCESS_KEY: 'minioadmin',
  SECRET_KEY: 'minioadmin123',
} as const;

export interface MinioConfig {
  endPoint: string;
  port: number;
  useSSL: boolean;
  accessKey: string;
  secretKey: string;
  bucket: string;
}

export default registerAs(MINIO_CONFIG_KEY, (): MinioConfig => {
  const accessKey = process.env.MINIO_ACCESS_KEY || MINIO_DEFAULTS.ACCESS_KEY;
  const secretKey = process.env.MINIO_SECRET_KEY || MINIO_DEFAULTS.SECRET_KEY;
  
  if (!process.env.MINIO_ACCESS_KEY || !process.env.MINIO_SECRET_KEY) {
    console.log('ℹ️  Using default MinIO Docker credentials for development:');
    console.log('   - MINIO_ACCESS_KEY:', accessKey);
    console.log('   - MINIO_SECRET_KEY:', secretKey);
    console.log('   - MINIO_ENDPOINT:', process.env.MINIO_ENDPOINT || MINIO_DEFAULTS.ENDPOINT);
    console.log('   - MINIO_PORT:', process.env.MINIO_PORT || MINIO_DEFAULTS.PORT);
    console.log('   To override, set these environment variables.');
  }

  return {
    endPoint: process.env.MINIO_ENDPOINT || MINIO_DEFAULTS.ENDPOINT,
    port: Number(process.env.MINIO_PORT) || MINIO_DEFAULTS.PORT,
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: accessKey,
    secretKey: secretKey,
    bucket: process.env.MINIO_BUCKET || MINIO_DEFAULTS.BUCKET,
  };
});
