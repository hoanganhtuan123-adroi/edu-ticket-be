import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface PaginationOptions {
  limit: number;
  page: number;
  offset: number;
  skip: number;
}

export const Pagination = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): PaginationOptions => {
    const request = ctx.switchToHttp().getRequest();
    const query = request.query;

    const limit = Math.min(Math.max(parseInt(query.limit) || 10, 1), 100);
    const page = Math.max(parseInt(query.page) || 1, 1);
    const offset = (page - 1) * limit;

    return {
      limit,
      page,
      offset,
      skip: offset,
    };
  },
);
