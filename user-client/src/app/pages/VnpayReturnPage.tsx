import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { ordersApi } from '../services/api';

export function VnpayReturnPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [message, setMessage] = useState('Đang xác thực kết quả thanh toán...');
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const verify = async () => {
      try {
        const query = new URLSearchParams(location.search);
        const result = await ordersApi.verifyVnpayReturn(query.toString());
        setOrderId(result.orderId ?? null);
        setStatus(result.success ? 'success' : 'failed');
        setMessage(result.message);

        if (result.success && result.orderId) {
          setTimeout(() => navigate(`/order-success/${result.orderId}`), 1000);
        }
      } catch (error: any) {
        setStatus('failed');
        setMessage(error?.message ?? 'Không thể xác thực kết quả thanh toán VNPAY');
      }
    };

    verify();
  }, [location.search, navigate]);

  return (
    <div className="container mx-auto px-4 py-16 md:py-20">
      <div className="max-w-lg mx-auto text-center bg-card border border-border rounded-2xl shadow-sm p-8">
        <div className="text-xs uppercase tracking-[0.3em] text-primary font-bold mb-2">VNPAY</div>
        {status === 'loading' && <h2 className="mb-4 text-3xl">Đang xử lý thanh toán...</h2>}
        {status === 'success' && <h2 className="mb-4 text-3xl text-secondary">Thanh toán thành công!</h2>}
        {status === 'failed' && <h2 className="mb-4 text-3xl text-destructive">Thanh toán thất bại</h2>}

        <p className="text-muted-foreground mb-6">{message}</p>

        {orderId && (
          <p className="text-sm mb-6">
            Mã đơn hàng: <strong>{orderId}</strong>
          </p>
        )}

        {status !== 'loading' && (
          <div className="space-y-2">
            <Link
              to={orderId ? `/orders/${orderId}` : '/orders'}
              className="inline-block w-full bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90"
            >
              Xem đơn hàng
            </Link>
            <Link to="/" className="inline-block w-full text-muted-foreground hover:text-foreground">
              Về trang chủ
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
