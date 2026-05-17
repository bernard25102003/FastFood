import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, Navigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { ordersApi, type Order, type OrderStatus } from '../services/api';

const statusColors: Record<OrderStatus, string> = {
  PENDING: 'bg-secondary/20 text-secondary-foreground',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  SHIPPING: 'bg-accent/20 text-accent-foreground',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-destructive/20 text-destructive',
};

const statusLabels: Record<OrderStatus, string> = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  SHIPPING: 'Đang giao',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
};

export function OrderDetailPage() {
  const { id } = useParams();
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id || !isAuthenticated) return;
    ordersApi.getById(id)
      .then(setOrder)
      .catch(() => setNotFound(true));
  }, [id, isAuthenticated]);

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login?redirect=/orders" replace />;

  if (notFound) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-16 text-center">
        <h2 className="mb-4">Không tìm thấy đơn hàng</h2>
        <Link
          to="/orders"
          className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90"
        >
          Quay lại lịch sử đơn hàng
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">
        Đang tải...
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6">
        <Link to="/orders" className="text-primary hover:underline">
          ← Quay lại lịch sử đơn hàng
        </Link>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-sm mb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="mb-2">Đơn hàng #{order.orderNumber}</h1>
            <p className="text-muted-foreground">
              Ngày đặt: {new Date(order.createdAt).toLocaleString('vi-VN')}
            </p>
          </div>
          <span className={`px-4 py-2 rounded-full ${statusColors[order.status]}`}>
            {statusLabels[order.status]}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 pb-6 border-b border-border">
          <div>
            <h3 className="mb-3">Thông tin người nhận</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Họ tên:</strong> {order.recipientName}</p>
              <p><strong>Số điện thoại:</strong> {order.recipientPhone}</p>
              <p><strong>Địa chỉ:</strong> {order.recipientAddress}</p>
              {order.notes && <p><strong>Ghi chú:</strong> {order.notes}</p>}
            </div>
          </div>
          <div>
            <h3 className="mb-3">Phương thức thanh toán</h3>
            <div className="text-sm">
              {order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản ngân hàng'}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="mb-4">Sản phẩm</h3>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-4 items-center">
                <div className="w-20 h-20 rounded bg-muted overflow-hidden flex-shrink-0">
                  {item.productImage && (
                    <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm mb-1">{item.productName}</h4>
                  <p className="text-sm text-muted-foreground">
                    {item.quantity} x {parseFloat(item.productPrice).toLocaleString('vi-VN')}đ
                  </p>
                </div>
                <div className="font-medium">
                  {parseFloat(item.subtotal).toLocaleString('vi-VN')}đ
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-border">
          <div className="flex justify-between items-center">
            <span className="font-bold">Tổng cộng</span>
            <span className="font-bold text-primary text-2xl">
              {parseFloat(order.totalPrice).toLocaleString('vi-VN')}đ
            </span>
          </div>
        </div>

        {order.status === 'COMPLETED' && (
          <div className="mt-6">
            <Link
              to={`/orders/${order.id}/review`}
              className="inline-block bg-secondary text-secondary-foreground px-6 py-3 rounded-lg hover:bg-secondary/90"
            >
              Đánh giá đơn hàng
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

