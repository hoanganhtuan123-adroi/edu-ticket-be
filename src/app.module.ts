import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { InitiationModule } from './modules/initiation/initiation.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './modules/auth/jwt/jwt.auth.guard';
import { RolesGuard } from './modules/auth/jwt/role.guard';
import { UserModule } from './modules/user/user.module';
import { EventModule } from './modules/event/event.module';
import { CategoryModule } from './modules/category/category.module';
// import { MinioModule } from './venders/minio/minio.module';
import { TicketModule } from './modules/ticket/ticket.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.dev',
    }),
    // MinioModule,
    DatabaseModule,
    AuthModule,
    UserModule,
    InitiationModule,
    EventModule,
    CategoryModule,
    TicketModule,
  ],
  controllers: [AppController],
  providers: [AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard
    }
  ],
})
export class AppModule {}
