// Base API client that communicates with the backend
// Token is stored in localStorage under 'accessToken' and 'refreshToken'

const BASE_URL = (import.meta as any).env?.VITE_API_URL ?? 'http://localhost:3000/api';

// ─── Token helpers ────────────────────────────────────────────────────────────

export function getAccessToken(): string | null {
  return localStorage.getItem('accessToken');
}

export function getRefreshToken(): string | null {
  return localStorage.getItem('refreshToken');
}

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
}

export function clearTokens() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

// ─── Core request ─────────────────────────────────────────────────────────────

interface RequestOptions {
  method?: string;
  body?: unknown;
  auth?: boolean; // default true
  isFormData?: boolean;
}

async function request<T>(
  path: string,
  { method = 'GET', body, auth = true, isFormData = false }: RequestOptions = {}
): Promise<T> {
  const headers: Record<string, string> = {};

  if (auth) {
    const token = getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  if (body !== undefined && !isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: isFormData ? (body as FormData) : body !== undefined ? JSON.stringify(body) : undefined,
  });

  // 204 No Content
  if (res.status === 204) {
    return undefined as unknown as T;
  }

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json?.message ?? `Request failed: ${res.status}`);
  }

  return json.data as T;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  role: 'USER' | 'ADMIN';
  status: 'ACTIVE' | 'LOCKED';
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', { method: 'POST', body: { email, password }, auth: false }),

  register: (data: { email: string; password: string; name: string; phone?: string; address?: string }) =>
    request<AuthResponse>('/auth/register', { method: 'POST', body: data, auth: false }),

  logout: () =>
    request<void>('/auth/logout', { method: 'POST' }),

  refresh: (refreshToken: string) =>
    request<{ accessToken: string; refreshToken: string }>('/auth/refresh', {
      method: 'POST',
      body: { refreshToken },
      auth: false,
    }),
};

// ─── Users ────────────────────────────────────────────────────────────────────

export const usersApi = {
  getProfile: () => request<AuthUser>('/users/profile'),

  updateProfile: (data: { name?: string; phone?: string; address?: string }) =>
    request<AuthUser>('/users/profile', { method: 'PUT', body: data }),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    request<void>('/users/change-password', { method: 'PUT', body: data }),
};

// ─── Categories ───────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
  _count?: { products: number };
}

export const categoriesApi = {
  getAll: () => request<Category[]>('/categories', { auth: false }),
  getById: (id: string) => request<Category>(`/categories/${id}`, { auth: false }),
};

// ─── Products ─────────────────────────────────────────────────────────────────

export interface ProductImage {
  id: string;
  productId: string;
  imageUrl: string;
  thumbnailUrl?: string;
  fileId?: string;
  displayOrder: number;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: string; // Decimal serialized as string
  categoryId: string;
  soldCount: number;
  avgRating: string; // Decimal as string
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  images: ProductImage[];
}

export interface ProductsQuery {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  sortBy?: 'createdAt' | 'price' | 'soldCount' | 'avgRating';
  sortOrder?: 'asc' | 'desc';
  minPrice?: number;
  maxPrice?: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: Pagination;
}

export const productsApi = {
  getAll: (query: ProductsQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== '') params.set(k, String(v));
    });
    const qs = params.toString();
    return request<PaginatedResponse<Product>>(`/products${qs ? `?${qs}` : ''}`, { auth: false });
  },

  getById: (id: string) =>
    request<Product>(`/products/${id}`, { auth: false }),
};

// ─── Orders ───────────────────────────────────────────────────────────────────

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED';
export type PaymentMethod = 'COD' | 'BANK_TRANSFER';

export interface OrderItem {
  id: string;
  orderId: string;
  productId?: string;
  productName: string;
  productPrice: string;
  productImage?: string;
  quantity: number;
  subtotal: string;
}

export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  status: OrderStatus;
  totalPrice: string;
  paymentMethod: PaymentMethod;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  shippingAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  items: OrderItem[];
  user?: AuthUser;
}

export interface CreateOrderData {
  items: { productId: string; quantity: number }[];
  paymentMethod: PaymentMethod;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  notes?: string;
}

export interface CreateVnpayPaymentResponse {
  order: Order;
  paymentUrl: string;
}

export interface VerifyVnpayReturnResponse {
  orderId?: string;
  success: boolean;
  message: string;
}

export const ordersApi = {
  create: (data: CreateOrderData) =>
    request<Order>('/orders', { method: 'POST', body: data }),

  createVnpayPayment: (data: CreateOrderData) =>
    request<CreateVnpayPaymentResponse>('/orders/vnpay/create-payment-url', { method: 'POST', body: data }),

  verifyVnpayReturn: (queryString: string) =>
    request<VerifyVnpayReturnResponse>(`/orders/vnpay/verify-return${queryString ? `?${queryString}` : ''}`, { auth: false }),

  getMyOrders: (query: { page?: number; limit?: number; status?: OrderStatus } = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined) params.set(k, String(v));
    });
    const qs = params.toString();
    return request<PaginatedResponse<Order>>(`/orders${qs ? `?${qs}` : ''}`);
  },

  getById: (id: string) =>
    request<Order>(`/orders/${id}`),

  cancel: (id: string) =>
    request<Order>(`/orders/${id}/cancel`, { method: 'PATCH' }),
};

// ─── Reviews ──────────────────────────────────────────────────────────────────

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title?: string;
  content: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
  product?: Product;
  user?: AuthUser;
}

export const reviewsApi = {
  getByProduct: (productId: string, query: { page?: number; limit?: number; rating?: number } = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined) params.set(k, String(v));
    });
    const qs = params.toString();
    return request<PaginatedResponse<Review>>(`/reviews/product/${productId}${qs ? `?${qs}` : ''}`, { auth: false });
  },

  create: (data: { productId: string; rating: number; title?: string; content: string }) =>
    request<Review>('/reviews', { method: 'POST', body: data }),

  update: (id: string, data: { rating?: number; title?: string; content?: string }) =>
    request<Review>(`/reviews/${id}`, { method: 'PUT', body: data }),

  delete: (id: string) =>
    request<void>(`/reviews/${id}`, { method: 'DELETE' }),

  getMyReviews: (query: { page?: number; limit?: number } = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined) params.set(k, String(v));
    });
    const qs = params.toString();
    return request<PaginatedResponse<Review>>(`/reviews/my${qs ? `?${qs}` : ''}`);
  },
};
