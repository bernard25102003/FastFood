import { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router';
import { Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ordersApi, reviewsApi, type Order } from '../services/api';
import { toast } from 'sonner';

export function ReviewPage() {
  const { orderId } = useParams();
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [reviews, setReviews] = useState<Record<string, { rating: number; content: string }>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!orderId || !isAuthenticated) return;
    ordersApi.getById(orderId)
      .then(o => {
        if (o.status !== 'COMPLETED') {
          navigate('/orders');
          return;
        }
        setOrder(o);
      })
      .catch(() => navigate('/orders'));
  }, [orderId, isAuthenticated, navigate]);

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login?redirect=/orders" replace />;

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">
        Đang tải...
      </div>
    );
  }

  const handleRatingChange = (productId: string, rating: number) => {
    setReviews(prev => ({
      ...prev,
      [productId]: { ...prev[productId], rating },
    }));
  };

  const handleContentChange = (productId: string, content: string) => {
    setReviews(prev => ({
      ...prev,
      [productId]: { ...prev[productId], content },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const itemsWithProduct = order.items.filter(item => item.productId);
    const hasAllRatings = itemsWithProduct.every(item => reviews[item.productId!]?.rating > 0);
    if (!hasAllRatings) {
      toast.error('Vui lòng đánh giá tất cả sản phẩm');
      return;
    }

    setSubmitting(true);
    try {
      await Promise.all(
        itemsWithProduct.map(item =>
          reviewsApi.create({
            productId: item.productId!,
            rating: reviews[item.productId!]?.rating ?? 5,
            content: reviews[item.productId!]?.content ?? '',
          })
        )
      );
      toast.success('Cảm ơn bạn đã đánh giá!');
      navigate('/orders');
    } catch (error: any) {
      toast.error(error?.message ?? 'Đã có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="mb-8 text-3xl md:text-4xl">Đánh Giá Đơn Hàng</h1>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm mb-6">
          <div className="text-sm text-muted-foreground mb-2">Đơn hàng</div>
          <div className="font-medium">#{order.orderNumber}</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {order.items.filter(item => item.productId).map((item) => {
            const review = reviews[item.productId!] ?? { rating: 0, content: '' };

            return (
              <div key={item.productId} className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <div className="flex gap-4 mb-4">
                  <div className="w-20 h-20 rounded bg-muted overflow-hidden flex-shrink-0">
                    {item.productImage && (
                      <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-base mb-1">{item.productName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {parseFloat(item.productPrice).toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block mb-2">Đánh giá *</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRatingChange(item.productId!, star)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-8 h-8 transition-colors ${
                            star <= review.rating
                              ? 'fill-secondary text-secondary'
                              : 'text-gray-300 hover:text-secondary/50'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block mb-2">Nhận xét</label>
                  <textarea
                    value={review.content}
                    onChange={(e) => handleContentChange(item.productId!, e.target.value)}
                    rows={3}
                    placeholder="Chia sẻ trải nghiệm của bạn..."
                    className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
            );
          })}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/orders')}
              className="flex-1 bg-muted text-foreground px-6 py-3 rounded-lg hover:bg-muted/80"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

