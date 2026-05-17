// Re-export backend-matching types from the API service
export type {
  AuthUser as User,
  Category,
  ProductImage,
  Product,
  OrderItem,
  Order,
  Review,
  Pagination,
  PaginatedResponse,
} from './services/api';

export type { OrderStatus, PaymentMethod } from './services/api';

// ─── Cart (local/client-side only) ───────────────────────────────────────────
export interface CartItem {
  productId: string;
  name: string;
  price: number; // stored as number locally
  image: string;
  quantity: number;
}
