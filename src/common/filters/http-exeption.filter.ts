import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';
import { ApiResponse } from '../responses/api-response';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = 500;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus(); 
      const exResponse = exception.getResponse(); 
      message =
        typeof exResponse === 'string'
          ? exResponse 
          : (exResponse as any).message || message; 
    } else if (exception instanceof BadRequestException) {
      status = 400;
      message = 'Validation failed'; 
      const exResponse = exception.getResponse() as any; 
      if (Array.isArray(exResponse)) {
        message = exResponse
          .map((err: any) => `${err.field}: ${err.errors.join(', ')}`)
          .join('; ');
      }
    } else if (exception instanceof QueryFailedError) {
      message = (exception as any).message || 'Database error'; 
    }

    const apiResponse = ApiResponse.error<any>(message);

    response.status(status).json(apiResponse);
  }
}
