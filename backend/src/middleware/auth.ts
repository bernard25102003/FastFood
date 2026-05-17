import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { JwtPayload } from '../types/auth';
import { createUnauthorizedError, createForbiddenError } from '../types/error';
import prisma from '../config/prisma';
import { UserRole } from '@prisma/client';

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw createUnauthorizedError('No token provided');
    }

    const token = authHeader.split(' ')[1];
    let payload: JwtPayload;

    try {
      payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    } catch {
      throw createUnauthorizedError('Invalid or expired token');
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true, status: true },
    });

    if (!user) {
      throw createUnauthorizedError('User not found');
    }

    if (user.status === 'LOCKED') {
      throw createForbiddenError('Account is locked');
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

export const requireAdmin = (req: Request, _res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== UserRole.ADMIN) {
    next(createForbiddenError('Admin access required'));
    return;
  }
  next();
};

export const requireRole = (...roles: UserRole[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      next(createForbiddenError('Insufficient permissions'));
      return;
    }
    next();
  };
