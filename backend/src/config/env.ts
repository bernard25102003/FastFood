import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

console.log('[ENV] Loading environment configuration...');
console.log('[ENV] NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('[ENV] PORT:', process.env.PORT || 'not set');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),

  // Pooled connection (PgBouncer) – used by PrismaClient at runtime
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  // Direct connection – used only by Prisma CLI (prisma migrate deploy, db push)
  // Falls back to DATABASE_URL when not set (e.g. local dev without a pooler)
  DIRECT_URL: z.string().optional(),

  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  JWT_EXPIRE: z.string().default('7d'),
  JWT_REFRESH_SECRET: z.string().min(16, 'JWT_REFRESH_SECRET must be at least 16 characters'),
  JWT_REFRESH_EXPIRE: z.string().default('30d'),

  IMAGEKIT_PUBLIC_KEY: z.string().optional(),
  IMAGEKIT_PRIVATE_KEY: z.string().optional(),
  IMAGEKIT_URL_ENDPOINT: z.string().optional(),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
  RATE_LIMIT_MAX: z.coerce.number().default(500),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().default(20),

  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_FILE: z.string().default('logs/app.log'),

  CORS_ORIGIN: z.string().default('http://localhost:5173,http://localhost:5174'),

  VNPAY_TMN_CODE: z.string().optional(),
  VNPAY_HASH_SECRET: z.string().optional(),
  VNPAY_URL: z.string().default('https://sandbox.vnpayment.vn/paymentv2/vpcpay.html'),
  VNPAY_RETURN_URL: z.string().default('http://localhost:5173/vnpay-return'),

  REDIS_URL: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('[ENV ERROR] ❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

console.log('[ENV] ✅ All environment variables loaded successfully');
console.log('[ENV] Running on port:', parsed.data.PORT);

export const env = parsed.data;
