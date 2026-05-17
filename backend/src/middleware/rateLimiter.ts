import rateLimit from 'express-rate-limit';
import { env } from '../config/env';
import { ErrorCode } from '../types/error';
import { ApiResponse } from '../types/response';

export const globalRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    const response: ApiResponse = {
      success: false,
      code: ErrorCode.RATE_LIMIT,
      message: 'Too many requests, please try again later',
      timestamp: new Date().toISOString(),
    };
    res.status(429).json(response);
  },
});

export const authRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    const response: ApiResponse = {
      success: false,
      code: ErrorCode.RATE_LIMIT,
      message: 'Too many authentication attempts, please try again later',
      timestamp: new Date().toISOString(),
    };
    res.status(429).json(response);
  },
});
