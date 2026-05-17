import { User, Category, Product, Order, OrderItem, Review } from '@prisma/client';
import { randomUUID } from 'crypto';

export const mockUser = (overrides: Partial<User> = {}): User => ({
  id: randomUUID(),
  email: 'test@example.com',
  password: '$2a$12$hashed_password',
  name: 'Test User',
  phone: '0901234567',
  address: '123 Test Street',
  role: 'USER',
  status: 'ACTIVE',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const mockAdmin = (overrides: Partial<User> = {}): User =>
  mockUser({ role: 'ADMIN', email: 'admin@example.com', ...overrides });

export const mockCategory = (overrides: Partial<Category> = {}): Category => ({
  id: randomUUID(),
  name: 'Test Category',
  description: 'A test category',
  icon: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const mockProduct = (overrides: Partial<Product> = {}): Product => ({
  id: randomUUID(),
  name: 'Test Product',
  description: 'A test product description',
  price: new (require('@prisma/client').Prisma.Decimal)(99.99),
  categoryId: randomUUID(),
  soldCount: 0,
  avgRating: new (require('@prisma/client').Prisma.Decimal)(0),
  reviewCount: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const mockOrder = (overrides: Partial<Order> = {}): Order => ({
  id: randomUUID(),
  userId: randomUUID(),
  orderNumber: `ORD-TEST-${Date.now()}`,
  status: 'PENDING',
  totalPrice: new (require('@prisma/client').Prisma.Decimal)(199.98),
  paymentMethod: 'COD',
  recipientName: 'Test Recipient',
  recipientPhone: '0901234567',
  recipientAddress: '123 Test Street, Test City',
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  confirmedAt: null,
  shippingAt: null,
  completedAt: null,
  cancelledAt: null,
  ...overrides,
});

export const mockOrderItem = (overrides: Partial<OrderItem> = {}): OrderItem => ({
  id: randomUUID(),
  orderId: randomUUID(),
  productId: randomUUID(),
  productName: 'Test Product',
  productPrice: new (require('@prisma/client').Prisma.Decimal)(99.99),
  productImage: null,
  quantity: 2,
  subtotal: new (require('@prisma/client').Prisma.Decimal)(199.98),
  ...overrides,
});

export const mockReview = (overrides: Partial<Review> = {}): Review => ({
  id: randomUUID(),
  productId: randomUUID(),
  userId: randomUUID(),
  rating: 5,
  title: 'Great product',
  content: 'This is a detailed review of the product.',
  verified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});
