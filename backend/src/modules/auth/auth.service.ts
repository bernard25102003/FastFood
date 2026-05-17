import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import prisma from '../../config/prisma';
import { env } from '../../config/env';
import {
  createConflictError,
  createUnauthorizedError,
  createForbiddenError,
} from '../../types/error';
import { JwtPayload } from '../../types/auth';

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
  phone?: string;
  address?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

const USER_SELECT = {
  id: true,
  email: true,
  name: true,
  phone: true,
  address: true,
  role: true,
  status: true,
  createdAt: true,
} as const;

export class AuthService {
  async register(dto: RegisterDto) {
    const existing = await prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw createConflictError('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const user = await prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        phone: dto.phone,
        address: dto.address,
      },
      select: USER_SELECT,
    });

    const tokens = this.generateTokens(user.id, user.email, user.role);
    return { user, ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) {
      // Use same message for both cases to prevent user enumeration
      throw createUnauthorizedError('Invalid email or password');
    }

    if (user.status === 'LOCKED') {
      throw createForbiddenError('Account is locked');
    }

    const isValid = await bcrypt.compare(dto.password, user.password);
    if (!isValid) {
      throw createUnauthorizedError('Invalid email or password');
    }

    const tokens = this.generateTokens(user.id, user.email, user.role);
    const { password: _pw, ...safeUser } = user;
    return { user: safeUser, ...tokens };
  }

  async refreshToken(token: string): Promise<TokenPair> {
    let payload: JwtPayload;
    try {
      payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
    } catch {
      throw createUnauthorizedError('Invalid or expired refresh token');
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

    return this.generateTokens(user.id, user.email, user.role);
  }

  private generateTokens(userId: string, email: string, role: UserRole): TokenPair {
    const payload: Omit<JwtPayload, 'iat' | 'exp'> = { sub: userId, email, role };

    const accessToken = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRE,
    } as jwt.SignOptions);

    const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRE,
    } as jwt.SignOptions);

    return { accessToken, refreshToken };
  }
}
