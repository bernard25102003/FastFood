import { PrismaClient } from '@prisma/client';
import { env } from './env';

console.log('[PRISMA] Initializing PrismaClient...');
console.log('[PRISMA] DATABASE_URL is', process.env.DATABASE_URL ? 'set' : 'NOT SET');
console.log('[PRISMA] DIRECT_URL is', process.env.DIRECT_URL ? 'set' : 'not set (CLI migrations use DATABASE_URL)');

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Append ?pgbouncer=true so Prisma disables prepared statements when
 * connecting through PgBouncer (Render, Supabase, etc.) in transaction mode.
 * Safe to add even for direct connections – it is a no-op for plain Postgres.
 */
const buildDatasourceUrl = (): string => {
  const url = process.env.DATABASE_URL ?? '';
  if (!url || url.includes('pgbouncer=true')) return url;
  return `${url}${url.includes('?') ? '&' : '?'}pgbouncer=true`;
};

let prismaInstance: PrismaClient;

try {
  prismaInstance =
    globalForPrisma.prisma ??
    new PrismaClient({
      datasourceUrl: buildDatasourceUrl(),
      log:
        env.NODE_ENV === 'development'
          ? ['query', 'info', 'warn', 'error']
          : ['warn', 'error'],
    });

  if (env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prismaInstance;
  }
  
  console.log('[PRISMA] ✅ PrismaClient created successfully');
} catch (err) {
  console.error('[PRISMA] ❌ Failed to create PrismaClient:', err);
  throw err;
}

export const prisma = prismaInstance;
export default prisma;
