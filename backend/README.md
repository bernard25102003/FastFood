# E-Commerce Backend API

Node.js/Express/TypeScript/PostgreSQL/Prisma backend for the e-commerce platform.

## Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Language:** TypeScript 5
- **Database:** PostgreSQL 16
- **ORM:** Prisma 5
- **Auth:** JWT + bcrypt
- **Validation:** Zod
- **File Upload:** ImageKit
- **Logging:** Winston
- **Testing:** Jest + Supertest

## Prerequisites

- Node.js >= 18
- pnpm or npm
- Docker & Docker Compose (for local DB)

## Local Setup

### 1. Clone & install dependencies

```bash
cd backend
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your values
```

### 3. Start PostgreSQL via Docker

```bash
docker-compose up -d postgres
```

### 4. Run database migrations

```bash
npm run db:migrate
```

### 5. Seed initial data

```bash
npm run db:seed
```

### 6. Start development server

```bash
npm run dev
```

Server starts at `http://localhost:3000`

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with hot-reload |
| `npm run build` | Compile TypeScript |
| `npm run start` | Start production server |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed database |
| `npm run db:studio` | Open Prisma Studio |
| `npm run test` | Run all tests |
| `npm run test:coverage` | Run tests with coverage |
| `npm run lint` | Lint source files |

## API Documentation

Swagger UI available at `http://localhost:3000/api-docs` after starting the server.

## Project Structure

```
backend/
├── src/
│   ├── config/          # App configuration & env parsing
│   ├── middleware/      # Express middleware (auth, error, rate-limit)
│   ├── modules/         # Feature modules (auth, users, products, ...)
│   │   └── <module>/
│   │       ├── <module>.controller.ts
│   │       ├── <module>.service.ts
│   │       ├── <module>.routes.ts
│   │       └── <module>.schema.ts
│   ├── utils/           # Logger, validators, helpers
│   ├── types/           # Shared TypeScript types
│   └── main.ts          # Application entry point
├── prisma/
│   ├── schema.prisma    # Database schema
│   ├── migrations/      # Migration history
│   └── seed.ts          # Seed script
├── tests/
│   ├── unit/
│   ├── integration/
│   └── helpers/
├── docker-compose.yml
├── .env.example
└── package.json
```

## Database

PgAdmin available at `http://localhost:5050`  
- Email: `admin@admin.com`  
- Password: `admin`
