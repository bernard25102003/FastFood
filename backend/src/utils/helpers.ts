import { PaginatedData } from '../types/response';

/**
 * Generate a unique order number
 */
export const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
};

/**
 * Build paginated response
 */
export const paginate = <T>(
  items: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedData<T> => {
  const totalPages = Math.ceil(total / limit);
  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
};

/**
 * Calculate pagination skip offset
 */
export const getSkip = (page: number, limit: number): number => (page - 1) * limit;

/**
 * Safe integer parser with fallback
 */
export const safeInt = (value: unknown, fallback = 0): number => {
  const n = Number(value);
  return Number.isInteger(n) ? n : fallback;
};

/**
 * Validate rating value
 */
export const isValidRating = (rating: number): boolean =>
  Number.isInteger(rating) && rating >= 1 && rating <= 5;
