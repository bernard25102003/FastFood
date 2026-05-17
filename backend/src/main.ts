import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import { swaggerSpec } from './config/swagger';
import { cacheService } from './config/cache';
import { prisma } from './config/prisma';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { globalRateLimiter } from './middleware/rateLimiter';
import { requestLogger } from './middleware/requestLogger';
import { logger } from './utils/logger';
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/users.routes';
import categoryRoutes from './modules/categories/categories.routes';
import productRoutes from './modules/products/products.routes';
import orderRoutes from './modules/orders/orders.routes';
import reviewRoutes from './modules/reviews/reviews.routes';

export const createApp = (): Express => {
  const app = express();

  // ─── Security middleware ──────────────────────────────────────────────────
  // Trust the first proxy hop so req.ip is the real client IP (needed on Render/Railway)
  app.set('trust proxy', 1);
  app.use(helmet());

  const allowedOrigins = env.CORS_ORIGIN.split(',').map((o) => o.trim());

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow server-to-server requests (no origin header)
        if (!origin) return callback(null, true);
        // Exact match against configured origins
        if (allowedOrigins.includes(origin)) return callback(null, true);
        // Allow any Vercel deployment/preview URL (*.vercel.app)
        if (origin.endsWith('.vercel.app')) return callback(null, true);
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  );

  // ─── Rate limiting ────────────────────────────────────────────────────────
  app.use(globalRateLimiter);

  // ─── Body parsing ─────────────────────────────────────────────────────────
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // ─── Logging ──────────────────────────────────────────────────────────────
  if (env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  }
  app.use(requestLogger);

  // ─── API documentation ─────────────────────────────────────────────────────
  if (env.NODE_ENV !== 'production') {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    app.get('/api-docs.json', (_req, res) => res.json(swaggerSpec));
  }

  // ─── Health check ─────────────────────────────────────────────────────────
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
      cache: cacheService.isConnected() ? 'connected' : 'disabled',
    });
  });

  // ─── API routes ───────────────────────────────────────────────────────────
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/reviews', reviewRoutes);

  // ─── 404 & error handlers ─────────────────────────────────────────────────
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

// Bootstrap function
const bootstrap = async (): Promise<void> => {
  const port = env.PORT || 3000;
  console.log(`[STARTUP] Starting bootstrap on port ${port}...`);
  logger.info(`Starting bootstrap on port ${port}...`);

  const app = createApp();

  // ── Bind to port FIRST so Render/platform can detect an open port ──────────
  const server = await new Promise<ReturnType<Express['listen']>>((resolve, reject) => {
    const s = app.listen(port, '0.0.0.0', () => {
      const msg = `🚀 Server running on port ${port} [${env.NODE_ENV}]`;
      console.log(`[STARTUP] ${msg}`);
      logger.info(msg);
      if (env.NODE_ENV !== 'production') {
        console.log(`[STARTUP] 📚 API docs: http://localhost:${port}/api-docs`);
        logger.info(`📚 API docs: http://localhost:${port}/api-docs`);
      }
      resolve(s);
    });
    s.on('error', (err: NodeJS.ErrnoException) => {
      console.error(`[ERROR] Server listen error:`, err);
      logger.error('Server listen error:', err);
      reject(err);
    });
  });

  // ── Graceful shutdown (registered after server is up) ─────────────────────
  const shutdown = async (signal: string) => {
    console.log(`[SHUTDOWN] ${signal} received. Shutting down gracefully...`);
    logger.info(`${signal} received. Shutting down gracefully...`);
    await cacheService.disconnect();
    await prisma.$disconnect();
    server.close(() => {
      console.log('[SHUTDOWN] Server closed');
      logger.info('Server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('uncaughtException', (err) => {
    console.error('[ERROR] Uncaught exception:', err);
    logger.error('Uncaught exception:', err);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason) => {
    console.error('[ERROR] Unhandled rejection:', reason);
    logger.error('Unhandled rejection:', reason);
    process.exit(1);
  });

  // ── Connect to Redis AFTER port is bound (non-fatal) ──────────────────────
  if (env.REDIS_URL) {
    console.log('[STARTUP] Connecting to Redis...');
    logger.info('Connecting to Redis...');
    try {
      await cacheService.connect(env.REDIS_URL);
      console.log('[STARTUP] ✅ Redis connected');
      logger.info('✅ Redis connected');
    } catch (err) {
      console.warn('[STARTUP] ⚠️  Redis connection failed – caching disabled:', err);
      logger.warn('Redis connection failed – caching disabled');
    }
  } else {
    console.log('[STARTUP] REDIS_URL not configured – caching disabled');
    logger.info('REDIS_URL not configured – caching disabled');
  }

  // ── Verify database connection AFTER port is bound ────────────────────────
  console.log('[STARTUP] Verifying database connection...');
  logger.info('Verifying database connection...');
  try {
    const DB_CONNECT_TIMEOUT_MS = 30_000;
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('DB connection timeout after 30s')), DB_CONNECT_TIMEOUT_MS),
      ),
    ]);
    console.log('[STARTUP] ✅ Database connected');
    logger.info('✅ Database connected');
  } catch (err) {
    console.error('[STARTUP] ❌ Database connection failed – server is up but DB is unavailable:', err);
    logger.error('Database connection failed – server is up but DB is unavailable');
    // Do NOT exit – let the server handle individual request errors gracefully
  }
};

// Start the server
console.log('[STARTUP] Initializing application...');
bootstrap().catch((err) => {
  console.error('[FATAL] Fatal error during bootstrap:', err);
  logger.error('Fatal error during bootstrap:', err);
  process.exit(1);
});
