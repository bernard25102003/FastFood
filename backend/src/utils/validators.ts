import { z } from 'zod';

// ─── Auth ───────────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: z
    .string()
    .regex(/^[0-9]{10,11}$/, 'Phone must be 10-11 digits')
    .optional(),
  address: z.string().max(500).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// ─── User ────────────────────────────────────────────────────────────────────

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z
    .string()
    .regex(/^[0-9]{10,11}$/, 'Phone must be 10-11 digits')
    .optional()
    .nullable(),
  address: z.string().max(500).optional().nullable(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

// ─── Category ────────────────────────────────────────────────────────────────

export const createCategorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  description: z.string().max(500).optional(),
  icon: z.string().url('Icon must be a valid URL').optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

// ─── Product ─────────────────────────────────────────────────────────────────

export const createProductSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().positive('Price must be positive').max(999999999),
  categoryId: z.string().cuid('Invalid category ID'),
});

export const updateProductSchema = createProductSchema.partial();

// ─── Order ────────────────────────────────────────────────────────────────────

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().cuid('Invalid product ID'),
        quantity: z.number().int().positive('Quantity must be at least 1'),
      }),
    )
    .min(1, 'Order must have at least one item'),
  paymentMethod: z.enum(['COD', 'BANK_TRANSFER']),
  recipientName: z.string().min(2, 'Recipient name is required').max(100),
  recipientPhone: z
    .string()
    .regex(/^[0-9]{10,11}$/, 'Phone must be 10-11 digits'),
  recipientAddress: z.string().min(5, 'Address is required').max(500),
  notes: z.string().max(500).optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['CONFIRMED', 'SHIPPING', 'COMPLETED', 'CANCELLED']),
});

// ─── Review ──────────────────────────────────────────────────────────────────

export const createReviewSchema = z.object({
  productId: z.string().cuid('Invalid product ID'),
  rating: z.number().int().min(1, 'Rating min 1').max(5, 'Rating max 5'),
  title: z.string().max(200).optional(),
  content: z.string().min(10, 'Review content must be at least 10 characters').max(2000),
});

export const updateReviewSchema = z.object({
  rating: z.number().int().min(1, 'Rating min 1').max(5, 'Rating max 5').optional(),
  title: z.string().max(200).optional().nullable(),
  content: z.string().min(10, 'Review content must be at least 10 characters').max(2000).optional(),
});

export const reorderImagesSchema = z.object({
  imageIds: z
    .array(z.string().cuid('Invalid image ID'))
    .min(1, 'At least one image ID required'),
});

// ─── Pagination ───────────────────────────────────────────────────────────────

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export const productQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
  categoryId: z.string().cuid().optional(),
  sortBy: z.enum(['price', 'soldCount', 'avgRating', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
});

export const orderQuerySchema = paginationSchema.extend({
  status: z.enum(['PENDING', 'CONFIRMED', 'SHIPPING', 'COMPLETED', 'CANCELLED']).optional(),
});
