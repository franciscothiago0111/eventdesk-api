import { Injectable } from '@nestjs/common';

export interface PaginatedPayload<T> {
  data: T[];
  total: number;
  currentPage: number;
  perPage: number;
  limit: number;
}

@Injectable()
export class ApiResponseService {
  success<T>(message: string, payload: T) {
    return { success: true, message, payload };
  }

  paginated<T>(
    message: string,
    data: T[],
    total: number,
    currentPage: number,
    perPage: number,
  ) {
    return this.success<PaginatedPayload<T>>(message, {
      data,
      total,
      currentPage,
      perPage,
      limit: perPage,
    });
  }
}
