import { Link, useParams } from 'react-router';
import { CheckCircle, Package } from 'lucide-react';

export function OrderSuccessPage() {
  const { orderId } = useParams();

  return (
    <div className="container mx-auto px-4 py-16 md:py-20">
      <div className="max-w-md mx-auto text-center">
        <div className="text-xs uppercase tracking-[0.3em] text-primary font-bold mb-2">Order Confirmed</div>
        <CheckCircle className="w-24 h-24 text-secondary mx-auto mb-6" />
        <h1 className="mb-4 text-4xl">Đặt hàng thành công!</h1>
        <p className="text-muted-foreground mb-8">
          Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đang được xử lý.
        </p>

        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm mb-8">
          <div className="text-sm text-muted-foreground mb-2">Mã đơn hàng</div>
          <div className="text-2xl font-bold text-primary mb-4">#{orderId}</div>
          <p className="text-sm text-muted-foreground">
            Chúng tôi sẽ liên hệ với bạn để xác nhận đơn hàng trong thời gian sớm nhất.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            to="/orders"
            className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <Package className="w-5 h-5" />
            Xem đơn hàng
          </Link>
          <Link
            to="/"
            className="block text-center text-muted-foreground hover:text-foreground"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
