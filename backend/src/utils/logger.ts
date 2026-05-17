import winston from 'winston';
import path from 'path';
import fs from 'fs';
import { env } from '../config/env';

const logDir = path.dirname(env.LOG_FILE);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const { combine, timestamp, printf, colorize, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp: ts, stack }) => {
  return `${ts} [${level}]: ${stack ?? message}`;
});

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), errors({ stack: true })),
  transports: [
    new winston.transports.Console({
      format: combine(colorize(), logFormat),
    }),
    new winston.transports.File({
      filename: env.LOG_FILE,
      format: combine(logFormat),
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: env.LOG_FILE.replace('.log', '.error.log'),
      level: 'error',
      format: combine(logFormat),
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: env.LOG_FILE.replace('.log', '.exceptions.log') }),
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: env.LOG_FILE.replace('.log', '.rejections.log') }),
  ],
});

/**
 * Emit a structured AUDIT log entry for admin / sensitive operations.
 */
export const auditLog = (
  userId: string,
  action: string,
  resource: string,
  details?: Record<string, unknown>,
): void => {
  logger.info('AUDIT', {
    type: 'AUDIT',
    userId,
    action,
    resource,
    details,
    timestamp: new Date().toISOString(),
  });
};

