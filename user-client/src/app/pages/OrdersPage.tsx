import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router';
import { Package, ChevronRight, Clock3, Truck, Flame } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ordersApi, type Order, type OrderStatus } from '../services/api';

const statusColors: Record<OrderStatus, string> = {
  PENDING: 'od-status od-status-pending',
  CONFIRMED: 'od-status od-status-confirmed',
  SHIPPING: 'od-status od-status-shipping',
  COMPLETED: 'od-status od-status-completed',
  CANCELLED: 'od-status od-status-cancelled',
};

const statusLabels: Record<OrderStatus, string> = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  SHIPPING: 'Đang giao',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
};

export function OrdersPage() {
  const { isAuthenticated, loading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!isAuthenticated) return;
    ordersApi.getMyOrders({ limit: 50 })
      .then(res => setOrders(res?.items ?? []))
      .catch(() => {});
  }, [isAuthenticated]);

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login?redirect=/orders" replace />;

  return (
    <div>
      <style>{ordersStyles}</style>
      <div className="od-root">
        <div className="od-hero">
          <div className="od-hero-inner">
            <div className="od-hero-label">📦 Order Tracking</div>
            <h1 className="od-hero-title">Lịch Sử <span>Đơn Hàng</span></h1>
          </div>
        </div>

        <div className="od-body">
          <div className="od-head-row">
            <div className="od-head-main">Bạn có {orders.length} đơn hàng gần đây</div>
            <div className="od-head-meta">
              <span><Truck size={14} /> Theo dõi giao hàng dễ dàng</span>
              <span><Clock3 size={14} /> Cập nhật trạng thái liên tục</span>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="od-empty-card">
              <div className="od-empty-badge">No orders yet</div>
              <Package className="od-empty-icon" />
              <h2 className="od-empty-title">Chưa có đơn hàng nào</h2>
              <p className="od-empty-sub">Bắt đầu chọn món để đơn hàng đầu tiên xuất hiện tại đây.</p>
              <Link to="/products" className="od-empty-btn">
                Đi tới thực đơn <ChevronRight size={18} />
              </Link>
            </div>
          ) : (
            <div className="od-list">
              {orders.map(order => (
                <Link
                  key={order.id}
                  to={`/orders/${order.id}`}
                  className="od-card"
                >
                  <div className="od-card-top">
                    <div>
                      <div className="od-order-no">Đơn hàng #{order.orderNumber}</div>
                      <div className="od-order-time">
                        <Clock3 size={13} />
                        {new Date(order.createdAt).toLocaleString('vi-VN')}
                      </div>
                    </div>
                    <span className={statusColors[order.status]}>
                      {statusLabels[order.status]}
                    </span>
                  </div>

                  <div className="od-items">
                    {order.items.map((item) => (
                      <div key={item.id} className="od-item-row">
                        <div className="od-item-thumb">
                          {item.productImage && (
                            <img src={item.productImage} alt={item.productName} className="od-item-thumb-img" />
                          )}
                        </div>
                        <div className="od-item-main">
                          <div className="od-item-name">{item.productName}</div>
                          <div className="od-item-meta">
                            {item.quantity} x {parseFloat(item.productPrice).toLocaleString('vi-VN')}đ
                          </div>
                        </div>
                        <div className="od-item-hot"><Flame size={12} /> Món ngon</div>
                      </div>
                    ))}
                  </div>

                  <div className="od-total-row">
                    <span className="od-total-label">Tổng cộng</span>
                    <span className="od-total-price">
                      {parseFloat(order.totalPrice).toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const ordersStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Nunito:wght@400;600;700;900&display=swap');

  .od-root { font-family: 'Nunito', sans-serif; background: #f5f0eb; min-height: 100vh; }

  .od-hero {
    background: #fff;
    border-bottom: 1px solid #ececec;
    padding: 36px 40px 28px;
    position: relative;
    overflow: hidden;
  }
  .od-hero::before {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      -45deg,
      transparent,
      transparent 40px,
      rgba(204,0,0,0.06) 40px,
      rgba(204,0,0,0.06) 80px
    );
  }
  .od-hero-inner { max-width: 1280px; margin: 0 auto; position: relative; z-index: 1; }
  .od-hero-label {
    color: #CC0000;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 3px;
    text-transform: uppercase;
    margin-bottom: 8px;
  }
  .od-hero-title {
    margin: 0;
    line-height: 1;
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(46px, 6vw, 74px);
    color: #111;
    letter-spacing: 1px;
  }
  .od-hero-title span { color: #CC0000; }

  .od-body { max-width: 1280px; margin: 0 auto; padding: 34px 40px 60px; }
  .od-head-row {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 20px;
  }
  .od-head-main {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 34px;
    color: #111;
    letter-spacing: .5px;
  }
  .od-head-meta { display: flex; gap: 12px; flex-wrap: wrap; }
  .od-head-meta span {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    font-weight: 700;
    color: #666;
    background: #fff;
    border: 1px solid #ececec;
    border-radius: 999px;
    padding: 6px 12px;
  }

  .od-empty-card {
    max-width: 640px;
    margin: 20px auto 0;
    text-align: center;
    background: #fff;
    border: 1.5px solid #ececec;
    border-radius: 24px;
    padding: 46px 28px;
    box-shadow: 0 2px 12px rgba(0,0,0,.05);
  }
  .od-empty-badge {
    display: inline-block;
    margin-bottom: 10px;
    background: #fde8e8;
    color: #CC0000;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    padding: 6px 12px;
  }
  .od-empty-icon { width: 84px; height: 84px; margin: 0 auto 12px; color: #CC0000; }
  .od-empty-title {
    margin: 0 0 8px;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 40px;
    color: #111;
    letter-spacing: .8px;
  }
  .od-empty-sub { margin: 0 0 22px; color: #666; font-size: 15px; font-weight: 600; }
  .od-empty-btn {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    background: #CC0000;
    color: #fff;
    text-decoration: none;
    padding: 12px 20px;
    border-radius: 12px;
    font-weight: 800;
    transition: .2s;
  }
  .od-empty-btn:hover { background: #a30000; transform: translateY(-2px); }

  .od-list { display: flex; flex-direction: column; gap: 14px; }
  .od-card {
    display: block;
    text-decoration: none;
    background: #fff;
    border: 1.5px solid #ececec;
    border-radius: 18px;
    padding: 16px;
    transition: transform .22s ease, box-shadow .22s ease, border-color .22s ease;
    animation: od-in .35s cubic-bezier(.22,1,.36,1) both;
  }
  .od-card:hover {
    transform: translateY(-3px);
    border-color: #CC0000;
    box-shadow: 0 12px 28px rgba(0,0,0,.08);
  }
  @keyframes od-in {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .od-card-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;
  }
  .od-order-no {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 28px;
    color: #111;
    letter-spacing: .5px;
    line-height: 1;
    margin-bottom: 4px;
  }
  .od-order-time {
    color: #777;
    font-size: 12px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }

  .od-status {
    display: inline-flex;
    align-items: center;
    border-radius: 999px;
    padding: 6px 11px;
    font-size: 12px;
    font-weight: 800;
    line-height: 1;
  }
  .od-status-pending { background: #fff7e0; color: #b45309; }
  .od-status-confirmed { background: #dbeafe; color: #1d4ed8; }
  .od-status-shipping { background: #ede9fe; color: #6d28d9; }
  .od-status-completed { background: #dcfce7; color: #15803d; }
  .od-status-cancelled { background: #fee2e2; color: #dc2626; }

  .od-items {
    border-top: 1px solid #f0ece7;
    border-bottom: 1px solid #f0ece7;
    padding: 10px 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .od-item-row {
    display: flex;
    align-items: center;
    gap: 10px;
    background: #fffaf5;
    border: 1px solid #f3e9dc;
    border-radius: 12px;
    padding: 8px;
  }
  .od-item-thumb {
    width: 48px;
    height: 48px;
    border-radius: 10px;
    overflow: hidden;
    flex-shrink: 0;
    background: #f5f0eb;
  }
  .od-item-thumb-img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .od-item-main { flex: 1; min-width: 0; }
  .od-item-name {
    color: #111;
    font-size: 13px;
    font-weight: 800;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 2px;
  }
  .od-item-meta { color: #777; font-size: 12px; font-weight: 700; }
  .od-item-hot {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: 10px;
    color: #CC0000;
    background: #fde8e8;
    border-radius: 999px;
    padding: 4px 7px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: .4px;
    flex-shrink: 0;
  }

  .od-total-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 12px;
  }
  .od-total-label {
    color: #666;
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .5px;
  }
  .od-total-price {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 34px;
    color: #CC0000;
    letter-spacing: .6px;
    line-height: 1;
  }

  @media (max-width: 900px) {
    .od-hero { padding: 30px 20px 24px; }
    .od-body { padding: 24px 20px 44px; }
    .od-card-top { flex-direction: column; align-items: flex-start; }
  }
`;

