import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E-Commerce API',
      version: '1.0.0',
      description:
        'RESTful API for the E-Commerce Platform. Supports authentication, product catalogue, order management, and reviews.',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token',
        },
      },
      schemas: {
        // ─── Generic Wrappers ──────────────────────────────────────────────
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            code: { type: 'string' },
            message: { type: 'string' },
            data: { type: 'object' },
            timestamp: { type: 'string', format: 'date-time' },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer' },
            limit: { type: 'integer' },
            total: { type: 'integer' },
            totalPages: { type: 'integer' },
            hasNext: { type: 'boolean' },
            hasPrev: { type: 'boolean' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            code: { type: 'string', example: 'NOT_FOUND' },
            message: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' },
          },
        },
        // ─── User ──────────────────────────────────────────────────────────
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            phone: { type: 'string', nullable: true },
            address: { type: 'string', nullable: true },
            role: { type: 'string', enum: ['USER', 'ADMIN'] },
            status: { type: 'string', enum: ['ACTIVE', 'LOCKED'] },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        // ─── Auth ──────────────────────────────────────────────────────────
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password', 'name'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 8 },
            name: { type: 'string', minLength: 2 },
            phone: { type: 'string' },
            address: { type: 'string' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
          },
        },
        AuthTokens: {
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
            user: { $ref: '#/components/schemas/User' },
          },
        },
        // ─── Category ─────────────────────────────────────────────────────
        Category: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string', nullable: true },
            icon: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateCategoryRequest: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string', minLength: 2 },
            description: { type: 'string' },
            icon: { type: 'string', format: 'uri' },
          },
        },
        // ─── Product ──────────────────────────────────────────────────────
        Product: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number', format: 'decimal' },
            categoryId: { type: 'string' },
            soldCount: { type: 'integer' },
            avgRating: { type: 'number', format: 'decimal' },
            reviewCount: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateProductRequest: {
          type: 'object',
          required: ['name', 'description', 'price', 'categoryId'],
          properties: {
            name: { type: 'string', minLength: 3 },
            description: { type: 'string', minLength: 10 },
            price: { type: 'number', minimum: 0 },
            categoryId: { type: 'string' },
          },
        },
        // ─── Order ────────────────────────────────────────────────────────
        Order: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            orderNumber: { type: 'string' },
            status: {
              type: 'string',
              enum: ['PENDING', 'CONFIRMED', 'SHIPPING', 'COMPLETED', 'CANCELLED'],
            },
            totalPrice: { type: 'number' },
            paymentMethod: { type: 'string', enum: ['COD', 'BANK_TRANSFER'] },
            recipientName: { type: 'string' },
            recipientPhone: { type: 'string' },
            recipientAddress: { type: 'string' },
            notes: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateOrderRequest: {
          type: 'object',
          required: ['items', 'paymentMethod', 'recipientName', 'recipientPhone', 'recipientAddress'],
          properties: {
            items: {
              type: 'array',
              items: {
                type: 'object',
                required: ['productId', 'quantity'],
                properties: {
                  productId: { type: 'string' },
                  quantity: { type: 'integer', minimum: 1 },
                },
              },
            },
            paymentMethod: { type: 'string', enum: ['COD', 'BANK_TRANSFER'] },
            recipientName: { type: 'string' },
            recipientPhone: { type: 'string' },
            recipientAddress: { type: 'string' },
            notes: { type: 'string' },
          },
        },
        // ─── Review ───────────────────────────────────────────────────────
        Review: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            productId: { type: 'string' },
            userId: { type: 'string' },
            rating: { type: 'integer', minimum: 1, maximum: 5 },
            title: { type: 'string', nullable: true },
            content: { type: 'string' },
            verified: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
              },
            },
          },
        },
        CreateReviewRequest: {
          type: 'object',
          required: ['productId', 'rating', 'content'],
          properties: {
            productId: { type: 'string' },
            rating: { type: 'integer', minimum: 1, maximum: 5 },
            title: { type: 'string', maxLength: 200 },
            content: { type: 'string', minLength: 10, maxLength: 2000 },
          },
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Users', description: 'User profile and management' },
      { name: 'Categories', description: 'Product categories' },
      { name: 'Products', description: 'Product catalogue' },
      { name: 'Orders', description: 'Order management' },
      { name: 'Reviews', description: 'Product reviews' },
    ],
  },
  apis: ['./src/modules/**/*.routes.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
