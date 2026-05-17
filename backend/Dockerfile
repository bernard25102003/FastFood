# ─── Build stage ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++

COPY package*.json ./
# Install ALL deps (including devDeps: prisma CLI + typescript needed for build)
RUN npm install --legacy-peer-deps

COPY tsconfig.json ./
COPY prisma ./prisma/
COPY src ./src/

# Generate Prisma client using local prisma@6.x (not latest via npx)
RUN ./node_modules/.bin/prisma generate
RUN npm run build

# ─── Production stage ─────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Install runtime dependencies: dumb-init for proper signal handling & OpenSSL for Prisma
RUN apk add --no-cache dumb-init openssl libc6-compat

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY package*.json ./
# Keep prisma CLI for migrations - don't use --omit=dev
RUN npm install --legacy-peer-deps && npm cache clean --force

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Create logs directory
RUN mkdir -p logs && chown -R appuser:appgroup /app

USER appuser

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
