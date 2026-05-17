export interface ApiResponse<T = unknown> {
  success: boolean;
  code: string;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
  timestamp: string;
}

export interface PaginatedData<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface SortQuery {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
