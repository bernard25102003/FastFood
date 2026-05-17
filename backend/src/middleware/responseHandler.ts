import { Request, Response } from 'express';
import { ApiResponse } from '../types/response';

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200,
): void => {
  const response: ApiResponse<T> = {
    success: true,
    code: 'SUCCESS',
    message,
    data,
    timestamp: new Date().toISOString(),
  };
  res.status(statusCode).json(response);
};

export const sendCreated = <T>(res: Response, data: T, message = 'Created successfully'): void => {
  sendSuccess(res, data, message, 201);
};

export const sendNoContent = (res: Response): void => {
  res.status(204).send();
};

// Unused req parameter needed for Express middleware signature
export const attachResponseHelpers = (_req: Request, _res: Response, next: () => void): void => {
  next();
};
