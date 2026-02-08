import { DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { CONFIG_KEYS, DEFAULT_VALUES } from './constants';

export const getDatabaseConfig = (
  configService: ConfigService,
): DataSourceOptions => ({
  type: 'postgres',
  host: configService.get(CONFIG_KEYS.DATABASE.HOST) || DEFAULT_VALUES.DATABASE.HOST,
  port: parseInt(configService.get(CONFIG_KEYS.DATABASE.PORT) || DEFAULT_VALUES.DATABASE.PORT),
  username: configService.get(CONFIG_KEYS.DATABASE.USERNAME) || DEFAULT_VALUES.DATABASE.USERNAME,
  password: configService.get(CONFIG_KEYS.DATABASE.PASSWORD) || DEFAULT_VALUES.DATABASE.PASSWORD,
  database: configService.get(CONFIG_KEYS.DATABASE.NAME) || DEFAULT_VALUES.DATABASE.NAME,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  // dropSchema: true,
  synchronize: true,
  logging: configService.get(CONFIG_KEYS.APP.NODE_ENV) === 'development',
});
