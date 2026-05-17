export type UserRole = 'user' | 'admin';
export type UserStatus = 'active' | 'locked';
export type OrderStatus = 'pending' | 'confirmed' | 'shipping' | 'completed' | 'cancelled';
export type PaymentMethod = 'COD' | 'BANK_TRANSFER';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: UserRole;
  status: UserStatus;
}

export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category_id: string;
  description: string;
  sold_count: number;
  avg_rating: number;
  review_count: number;
  images: string[];
}

export interface OrderItem {
  product_id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface Order {
  id: string;
  user_id: string;
  total_price: number;
  status: OrderStatus;
  payment_method: PaymentMethod;
  name: string;
  phone: string;
  address: string;
  created_at: string;
  items: OrderItem[];
}

export interface Review {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

export let categories: Category[] = [
  { id: '1', name: 'Burger' },
  { id: '2', name: 'Pizza' },
  { id: '3', name: 'Gà rán' },
  { id: '4', name: 'Đồ uống' },
  { id: '5', name: 'Món phụ' },
];

export let products: Product[] = [
  {
    id: '1',
    name: 'Burger Bò Phô Mai',
    price: 65000,
    category_id: '1',
    description: 'Burger bò thượng hạng với phô mai tan chảy',
    sold_count: 245,
    avg_rating: 4.8,
    review_count: 89,
    images: ['https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400'],
  },
  {
    id: '2',
    name: 'Pizza Hải Sản',
    price: 120000,
    category_id: '2',
    description: 'Pizza với tôm, mực, nghêu tươi ngon',
    sold_count: 178,
    avg_rating: 4.6,
    review_count: 67,
    images: ['https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400'],
  },
  {
    id: '3',
    name: 'Gà Rán Giòn',
    price: 75000,
    category_id: '3',
    description: 'Gà rán giòn tan với 11 loại gia vị bí mật',
    sold_count: 312,
    avg_rating: 4.9,
    review_count: 145,
    images: ['https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400'],
  },
  {
    id: '4',
    name: 'Coca Cola',
    price: 15000,
    category_id: '4',
    description: 'Nước ngọt có gas',
    sold_count: 567,
    avg_rating: 4.5,
    review_count: 203,
    images: ['https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400'],
  },
  {
    id: '5',
    name: 'Khoai Tây Chiên',
    price: 25000,
    category_id: '5',
    description: 'Khoai tây chiên giòn rụm',
    sold_count: 445,
    avg_rating: 4.7,
    review_count: 156,
    images: ['https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400'],
  },
];

export let users: User[] = [
  {
    id: '1',
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@gmail.com',
    phone: '0901234567',
    address: '123 Đường Lê Lợi, Q1, TP.HCM',
    role: 'user',
    status: 'active',
  },
  {
    id: '2',
    name: 'Trần Thị B',
    email: 'tranthib@gmail.com',
    phone: '0912345678',
    address: '456 Đường Nguyễn Huệ, Q1, TP.HCM',
    role: 'user',
    status: 'active',
  },
  {
    id: '3',
    name: 'Admin User',
    email: 'admin@fastfood.vn',
    phone: '0923456789',
    address: 'Văn phòng chính',
    role: 'admin',
    status: 'active',
  },
];

export let orders: Order[] = [
  {
    id: 'ORD001',
    user_id: '1',
    total_price: 105000,
    status: 'confirmed',
    payment_method: 'COD',
    name: 'Nguyễn Văn A',
    phone: '0901234567',
    address: '123 Đường Lê Lợi, Q1, TP.HCM',
    created_at: '2026-05-06T10:30:00',
    items: [
      {
        product_id: '1',
        name: 'Burger Bò Phô Mai',
        price: 65000,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
        quantity: 1,
      },
      {
        product_id: '5',
        name: 'Khoai Tây Chiên',
        price: 25000,
        image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400',
        quantity: 1,
      },
      {
        product_id: '4',
        name: 'Coca Cola',
        price: 15000,
        image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400',
        quantity: 1,
      },
    ],
  },
  {
    id: 'ORD002',
    user_id: '2',
    total_price: 240000,
    status: 'shipping',
    payment_method: 'BANK_TRANSFER',
    name: 'Trần Thị B',
    phone: '0912345678',
    address: '456 Đường Nguyễn Huệ, Q1, TP.HCM',
    created_at: '2026-05-06T11:15:00',
    items: [
      {
        product_id: '2',
        name: 'Pizza Hải Sản',
        price: 120000,
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
        quantity: 2,
      },
    ],
  },
  {
    id: 'ORD003',
    user_id: '1',
    total_price: 150000,
    status: 'pending',
    payment_method: 'COD',
    name: 'Nguyễn Văn A',
    phone: '0901234567',
    address: '123 Đường Lê Lợi, Q1, TP.HCM',
    created_at: '2026-05-06T14:20:00',
    items: [
      {
        product_id: '3',
        name: 'Gà Rán Giòn',
        price: 75000,
        image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400',
        quantity: 2,
      },
    ],
  },
  {
    id: 'ORD004',
    user_id: '2',
    total_price: 195000,
    status: 'completed',
    payment_method: 'BANK_TRANSFER',
    name: 'Trần Thị B',
    phone: '0912345678',
    address: '456 Đường Nguyễn Huệ, Q1, TP.HCM',
    created_at: '2026-05-05T09:00:00',
    items: [
      {
        product_id: '1',
        name: 'Burger Bò Phô Mai',
        price: 65000,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
        quantity: 2,
      },
      {
        product_id: '1',
        name: 'Burger Bò Phô Mai',
        price: 65000,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
        quantity: 1,
      },
    ],
  },
];

export let reviews: Review[] = [
  {
    id: '1',
    user_id: '1',
    product_id: '1',
    rating: 5,
    comment: 'Burger rất ngon, bò tươi và phô mai tan chảy trong miệng!',
    created_at: '2026-05-05T15:30:00',
  },
  {
    id: '2',
    user_id: '2',
    product_id: '2',
    rating: 4,
    comment: 'Pizza hải sản tươi ngon, nhưng hơi mỏng',
    created_at: '2026-05-04T20:15:00',
  },
  {
    id: '3',
    user_id: '1',
    product_id: '3',
    rating: 5,
    comment: 'Gà rán giòn tan, gia vị đậm đà. Sẽ quay lại!',
    created_at: '2026-05-03T18:45:00',
  },
  {
    id: '4',
    user_id: '2',
    product_id: '5',
    rating: 5,
    comment: 'Khoai tây giòn, không bị ngấm dầu',
    created_at: '2026-05-02T12:20:00',
  },
];
