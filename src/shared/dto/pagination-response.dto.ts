export interface PaginationMeta {
  limit: number;
  offset: number;
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export class PaginationResponseDto<T> implements PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;

  constructor(data: T[], total: number, limit: number, offset: number) {
    this.data = data;
    this.pagination = {
      limit,
      offset,
      total,
      hasNext: offset + limit < total,
      hasPrev: offset > 0,
    };
  }

  static create<T>(
    data: T[],
    total: number,
    limit: number,
    offset: number,
  ): PaginationResponseDto<T> {
    return new PaginationResponseDto(data, total, limit, offset);
  }

  // Helper method for page-based pagination (backward compatibility)
  static createFromPage<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
  ): PaginationResponseDto<T> {
    const offset = (page - 1) * limit;
    return new PaginationResponseDto(data, total, limit, offset);
  }
}
