import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { ApiError, ErrorCode } from '../types/error';
import { logger } from '../utils/logger';
import { ApiResponse } from '../types/response';
import { env } from '../config/env';

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // Zod validation error
  if (err instanceof ZodError) {
    const errors: Record<string, string[]> = {};
    err.errors.forEach((e) => {
      const key = e.path.join('.') || 'root';
      errors[key] = errors[key] ? [...errors[key], e.message] : [e.message];
    });

    const response: ApiResponse = {
      success: false,
      code: ErrorCode.VALIDATION_ERROR,
      message: 'Validation failed',
      errors,
      timestamp: new Date().toISOString(),
    };
    res.status(400).json(response);
    return;
  }

  // Operational API error
  if (err instanceof ApiError) {
    if (!err.isOperational) {
      logger.error('Non-operational ApiError:', { err, path: req.path, method: req.method });
    }

    const response: ApiResponse = {
      success: false,
      code: err.code,
      message: err.message,
      timestamp: new Date().toISOString(),
    };
    res.status(err.statusCode).json(response);
    return;
  }

  // Prisma known errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    let statusCode = 400;
    let code = ErrorCode.BAD_REQUEST;
    let message = 'Database operation failed';

    if (err.code === 'P2002') {
      statusCode = 409;
      code = ErrorCode.CONFLICT;
      const fields = (err.meta?.target as string[])?.join(', ') ?? 'field';
      message = `${fields} already exists`;
    } else if (err.code === 'P2025') {
      statusCode = 404;
      code = ErrorCode.NOT_FOUND;
      message = 'Record not found';
    } else if (err.code === 'P2003') {
      statusCode = 400;
      code = ErrorCode.BAD_REQUEST;
      message = 'Related record not found';
    }

    const response: ApiResponse = {
      success: false,
      code,
      message,
      timestamp: new Date().toISOString(),
    };
    res.status(statusCode).json(response);
    return;
  }

  // Unknown / unexpected error
  logger.error('Unhandled error:', { err, path: req.path, method: req.method });

  const response: ApiResponse = {
    success: false,
    code: ErrorCode.INTERNAL_ERROR,
    message: env.NODE_ENV === 'production' ? 'Internal server error' : String(err),
    timestamp: new Date().toISOString(),
  };
  res.status(500).json(response);
};

export const notFoundHandler = (req: Request, res: Response): void => {
  const response: ApiResponse = {
    success: false,
    code: ErrorCode.NOT_FOUND,
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString(),
  };
  res.status(404).json(response);
};
