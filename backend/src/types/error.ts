export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(statusCode: number, message: string, code: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  CONFLICT = 'CONFLICT',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',
  RATE_LIMIT = 'RATE_LIMIT',
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
}

export const createNotFoundError = (resource: string) =>
  new ApiError(404, `${resource} not found`, ErrorCode.NOT_FOUND);

export const createUnauthorizedError = (message = 'Unauthorized') =>
  new ApiError(401, message, ErrorCode.UNAUTHORIZED);

export const createForbiddenError = (message = 'Forbidden') =>
  new ApiError(403, message, ErrorCode.FORBIDDEN);

export const createConflictError = (message: string) =>
  new ApiError(409, message, ErrorCode.CONFLICT);

export const createValidationError = (message: string) =>
  new ApiError(400, message, ErrorCode.VALIDATION_ERROR);

export const createBusinessError = (message: string) =>
  new ApiError(422, message, ErrorCode.BUSINESS_RULE_VIOLATION);
