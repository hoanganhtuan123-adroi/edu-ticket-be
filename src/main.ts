import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { corsConfig } from './config/cors.config';
import helmet from 'helmet';
import { helmetConfig } from './config/helmet.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      validationError: { target: false },
      exceptionFactory: (errors) => {
        const result = errors.map((error: any) => ({
          property: error.property,
          message: error.constraints[Object.keys(error.constraints)[0]],
        }));
        return new BadRequestException(result);
      },
    }),
  );
  app.enableCors(corsConfig);
  app.use(helmet(helmetConfig));
  app.setGlobalPrefix("api/v1")
  await app.listen(process.env.APP_PORT ?? 8080);
}
bootstrap();
