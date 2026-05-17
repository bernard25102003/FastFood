import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Wraps an async route handler so unhandled promise rejections
 * are forwarded to Express's next(err) error pipeline.
 */
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
