import { createContext, useContext, useState, ReactNode } from 'react';
import { CartItem } from '../types';
import { ordersApi, type Order, type PaymentMethod } from '../services/api';
import { toast } from 'sonner';

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  totalPrice: number;
  createOrder: (data: { recipientName: string; recipientPhone: string; recipientAddress: string; paymentMethod: PaymentMethod; notes?: string }) => Promise<Order>;
  createVnpayPayment: (data: { recipientName: string; recipientPhone: string; recipientAddress: string; notes?: string }) => Promise<{ order: Order; paymentUrl: string }>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (item: Omit<CartItem, 'quantity'>, quantity: number) => {
    setItems(prev => {
      const existing = prev.find(i => i.productId === item.productId);
      if (existing) {
        return prev.map(i =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { ...item, quantity }];
    });
    toast.success('Đã thêm vào giỏ hàng');
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems(prev =>
      prev.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setItems(prev => prev.filter(item => item.productId !== productId));
    toast.success('Đã xóa khỏi giỏ hàng');
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const createOrder = async (data: {
    recipientName: string;
    recipientPhone: string;
    recipientAddress: string;
    paymentMethod: PaymentMethod;
    notes?: string;
  }): Promise<Order> => {
    const order = await ordersApi.create({
      items: items.map(item => ({ productId: item.productId, quantity: item.quantity })),
      paymentMethod: data.paymentMethod,
      recipientName: data.recipientName,
      recipientPhone: data.recipientPhone,
      recipientAddress: data.recipientAddress,
      notes: data.notes,
    });
    clearCart();
    return order;
  };

  const createVnpayPayment = async (data: {
    recipientName: string;
    recipientPhone: string;
    recipientAddress: string;
    notes?: string;
  }) => {
    const result = await ordersApi.createVnpayPayment({
      items: items.map(item => ({ productId: item.productId, quantity: item.quantity })),
      paymentMethod: 'BANK_TRANSFER',
      recipientName: data.recipientName,
      recipientPhone: data.recipientPhone,
      recipientAddress: data.recipientAddress,
      notes: data.notes,
    });
    clearCart();
    return result;
  };

  return (
    <CartContext.Provider value={{ items, addToCart, updateQuantity, removeFromCart, clearCart, totalPrice, createOrder, createVnpayPayment }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}

