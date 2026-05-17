// Admin API client — mirrors user-client/services/api.ts but includes admin-only endpoints

const BASE_URL = (import.meta as any).env?.VITE_API_URL ?? 'http://localhost:3000/api';

// ─── Token helpers ────────────────────────────────────────────────────────────

export function getAccessToken(): string | null {
  return localStorage.getItem('admin_accessToken');
}

export function getRefreshToken(): string | null {
  return localStorage.getItem('admin_refreshToken');
}

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem('admin_accessToken', accessToken);
  localStorage.setItem('admin_refreshToken', refreshToken);
}

export function clearTokens() {
  localStorage.removeItem('admin_accessToken');
  localStorage.removeItem('admin_refreshToken');
}

// ─── Core request ─────────────────────────────────────────────────────────────

interface RequestOptions {
  method?: string;
  body?: unknown;
  auth?: boolean;
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

  if (res.status === 204) {
    return undefined as unknown as T;
  }

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json?.message ?? `Request failed: ${res.status}`);
  }

  return json.data as T;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdminUser {
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
  user: AdminUser;
  accessToken: string;
  refreshToken: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
  _count?: { products: number };
}

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
  price: string;
  categoryId: string;
  soldCount: number;
  avgRating: string;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  images: ProductImage[];
}

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
  user?: AdminUser;
}

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
  user?: AdminUser;
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

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', { method: 'POST', body: { email, password }, auth: false }),

  logout: () =>
    request<void>('/auth/logout', { method: 'POST' }),

  getProfile: () =>
    request<AdminUser>('/users/profile'),
};

// ─── Users (Admin) ────────────────────────────────────────────────────────────

export const usersApi = {
  getAll: (query: { page?: number; limit?: number; role?: string; status?: string } = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== '') params.set(k, String(v));
    });
    const qs = params.toString();
    return request<PaginatedResponse<AdminUser>>(`/users/admin${qs ? `?${qs}` : ''}`);
  },

  getById: (id: string) =>
    request<AdminUser>(`/users/admin/${id}`),

  lock: (id: string) =>
    request<AdminUser>(`/users/admin/${id}/lock`, { method: 'PATCH' }),

  unlock: (id: string) =>
    request<AdminUser>(`/users/admin/${id}/unlock`, { method: 'PATCH' }),

  delete: (id: string) =>
    request<void>(`/users/admin/${id}`, { method: 'DELETE' }),
};

// ─── Categories ───────────────────────────────────────────────────────────────

export const categoriesApi = {
  getAll: () => request<Category[]>('/categories', { auth: false }),
  getById: (id: string) => request<Category>(`/categories/${id}`, { auth: false }),

  create: (data: { name: string; description?: string; icon?: string }) =>
    request<Category>('/categories', { method: 'POST', body: data }),

  update: (id: string, data: { name?: string; description?: string; icon?: string }) =>
    request<Category>(`/categories/${id}`, { method: 'PUT', body: data }),

  delete: (id: string) =>
    request<void>(`/categories/${id}`, { method: 'DELETE' }),
};

// ─── Products ─────────────────────────────────────────────────────────────────

export const productsApi = {
  getAll: (query: {
    page?: number; limit?: number; search?: string; categoryId?: string;
    sortBy?: string; sortOrder?: string;
  } = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== '') params.set(k, String(v));
    });
    const qs = params.toString();
    return request<PaginatedResponse<Product>>(`/products${qs ? `?${qs}` : ''}`, { auth: false });
  },

  getById: (id: string) =>
    request<Product>(`/products/${id}`, { auth: false }),

  create: (data: { name: string; description: string; price: number; categoryId: string }) =>
    request<Product>('/products', { method: 'POST', body: data }),

  update: (id: string, data: { name?: string; description?: string; price?: number; categoryId?: string }) =>
    request<Product>(`/products/${id}`, { method: 'PUT', body: data }),

  delete: (id: string) =>
    request<void>(`/products/${id}`, { method: 'DELETE' }),

  uploadImages: (productId: string, files: File[]) => {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    return request<{ images: ProductImage[] }>(`/products/${productId}/images`, {
      method: 'POST',
      body: formData,
      isFormData: true,
    });
  },

  deleteImage: (productId: string, imageId: string) =>
    request<void>(`/products/${productId}/images/${imageId}`, { method: 'DELETE' }),

  reorderImages: (productId: string, imageIds: string[]) =>
    request<void>(`/products/${productId}/images/reorder`, { method: 'PATCH', body: { imageIds } }),
};

// ─── Orders (Admin) ───────────────────────────────────────────────────────────

export const ordersApi = {
  getAll: (query: { page?: number; limit?: number; status?: OrderStatus; userId?: string } = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== '') params.set(k, String(v));
    });
    const qs = params.toString();
    return request<PaginatedResponse<Order>>(`/orders/admin/all${qs ? `?${qs}` : ''}`);
  },

  getById: (id: string) =>
    request<Order>(`/orders/admin/${id}`),

  updateStatus: (id: string, status: OrderStatus) =>
    request<Order>(`/orders/admin/${id}/status`, { method: 'PATCH', body: { status } }),
};

// ─── Reviews (Admin) ──────────────────────────────────────────────────────────

export const reviewsApi = {
  getAll: (query: { page?: number; limit?: number; rating?: number; productId?: string } = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== '') params.set(k, String(v));
    });
    const qs = params.toString();
    return request<PaginatedResponse<Review>>(`/reviews/admin${qs ? `?${qs}` : ''}`);
  },

  delete: (id: string) =>
    request<void>(`/reviews/${id}`, { method: 'DELETE' }),
};

// ─── Dashboard stats (computed from orders + products) ────────────────────────

export interface DashboardStats {
  totalOrders: number;
  totalProducts: number;
  totalRevenue: number;
  totalUsers: number;
}

export const dashboardApi = {
  // Combines stats + topProducts in one Promise.all (3 requests instead of 4)
  getStats: async (): Promise<DashboardStats & { topProducts: Product[] }> => {
    const [ordersRes, productsRes, usersRes] = await Promise.all([
      ordersApi.getAll({ limit: 1 }),
      productsApi.getAll({ sortBy: 'soldCount', sortOrder: 'desc', limit: 5 }),
      usersApi.getAll({ limit: 1 }),
    ]);
    return {
      totalOrders: ordersRes.pagination.total,
      totalProducts: productsRes.pagination.total,
      totalRevenue: 0, // backend has no revenue endpoint
      totalUsers: usersRes.pagination.total,
      topProducts: productsRes.items,
    };
  },

  getOrdersByStatus: async () => {
    const statuses: OrderStatus[] = ['PENDING', 'CONFIRMED', 'SHIPPING', 'COMPLETED', 'CANCELLED'];
    const results = await Promise.all(
      statuses.map(s => ordersApi.getAll({ status: s, limit: 1 }))
    );
    return statuses.map((s, i) => ({ status: s, _count: results[i].pagination.total }));
  },

  getTopProducts: () =>
    productsApi.getAll({ sortBy: 'soldCount', sortOrder: 'desc', limit: 5 }).then(r => r.items),
};
