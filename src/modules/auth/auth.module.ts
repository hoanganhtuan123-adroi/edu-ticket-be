import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CONFIG_KEYS, DEFAULT_VALUES } from '../../config/constants';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlacklistedToken } from 'src/models/blacklisted-token.entity';

@Module({
  imports: [
    UserModule,
    PassportModule,
    TypeOrmModule.forFeature([BlacklistedToken]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        global: true,
        secret: configService.get(CONFIG_KEYS.JWT.SECRET) || DEFAULT_VALUES.JWT.SECRET,
        signOptions: { expiresIn: configService.get(CONFIG_KEYS.JWT.EXPIRES_IN) || DEFAULT_VALUES.JWT.EXPIRES_IN },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
