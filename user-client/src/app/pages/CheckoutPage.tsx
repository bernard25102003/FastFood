import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { ordersApi, type PaymentMethod, type Order } from '../services/api';
import { toast } from 'sonner';
import { User, Phone, MapPin, CreditCard, Banknote, ShoppingBag, ChevronRight, Flame, Lock, QrCode, CheckCircle2, Copy, Loader2, Sparkles } from 'lucide-react';

export function CheckoutPage() {
  const { items, totalPrice, createOrder } = useCart();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    recipientName: user?.name ?? '',
    recipientPhone: user?.phone ?? '',
    recipientAddress: user?.address ?? '',
    paymentMethod: 'COD' as PaymentMethod,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  // Polling tự động kiểm tra SePay Webhook đã xác nhận đơn chưa
  useEffect(() => {
    if (!showQrModal || !createdOrder || isPaid) return;

    const interval = setInterval(async () => {
      try {
        const latest = await ordersApi.getById(createdOrder.id);
        if (latest.status === 'CONFIRMED' || (latest as any).paymentStatus === 'PAID') {
          setIsPaid(true);
          clearInterval(interval);
          toast.success('🎉 SePay đã nhận tiền thành công! Đơn hàng đã được xác nhận tự động.');
          setTimeout(() => {
            navigate(`/order-success/${createdOrder.id}`);
          }, 1800);
        }
      } catch {
        // bỏ qua lỗi tạm thời khi polling
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [showQrModal, createdOrder, isPaid, navigate]);

  if (authLoading) return null;
  if (items.length === 0 && !showQrModal) return <Navigate to="/cart" replace />;
  if (!isAuthenticated) return <Navigate to="/login?redirect=/checkout" replace />;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.recipientName.trim()) newErrors.recipientName = 'Vui lòng nhập họ tên';
    if (!formData.recipientPhone.trim()) {
      newErrors.recipientPhone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10}$/.test(formData.recipientPhone.replace(/\s/g, ''))) {
      newErrors.recipientPhone = 'Số điện thoại không hợp lệ';
    }
    if (!formData.recipientAddress.trim()) newErrors.recipientAddress = 'Vui lòng nhập địa chỉ giao hàng';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) { toast.error('Vui lòng kiểm tra lại thông tin'); return; }
    setLoading(true);
    try {
      const order = await createOrder(formData);
      
      // Nếu là chuyển khoản ngân hàng -> Mở modal VietQR SePay
      if (formData.paymentMethod === 'BANK_TRANSFER') {
        setCreatedOrder(order);
        setShowQrModal(true);
        return;
      }

      toast.success('Đặt hàng thành công!');
      navigate(`/order-success/${order.id}`);
    } catch (error: any) {
      toast.error(error?.message ?? 'Đã có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <style>{ckStyles}</style>
      <div className="ck-root">

        {/* ── PAGE HERO ── */}
        <div className="ck-hero">
          <div className="ck-hero-inner">
            <div className="ck-hero-label">🛒 Xác nhận đơn hàng</div>
            <h1 className="ck-hero-title">Thanh <span>Toán</span></h1>
          </div>
        </div>

        <div className="ck-body">
          <div className="ck-grid">

            {/* ── LEFT: FORM ── */}
            <form onSubmit={handleSubmit} className="ck-form-col">

              {/* Delivery info */}
              <div className="ck-card">
                <div className="ck-card-header">
                  <div className="ck-card-icon"><MapPin size={18} /></div>
                  <div>
                    <div className="ck-card-title">Thông tin giao hàng</div>
                    <div className="ck-card-sub">Điền đầy đủ để giao hàng chính xác</div>
                  </div>
                </div>

                <div className="ck-fields">
                  {/* Name */}
                  <div className="ck-field">
                    <label className="ck-label">
                      <User size={13} /> Họ tên <span className="ck-req">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.recipientName}
                      onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                      placeholder="Nguyễn Văn A"
                      className={`ck-input ${errors.recipientName ? 'error' : ''}`}
                    />
                    {errors.recipientName && <div className="ck-error">{errors.recipientName}</div>}
                  </div>

                  {/* Phone */}
                  <div className="ck-field">
                    <label className="ck-label">
                      <Phone size={13} /> Số điện thoại <span className="ck-req">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.recipientPhone}
                      onChange={(e) => setFormData({ ...formData, recipientPhone: e.target.value })}
                      placeholder="0912 345 678"
                      className={`ck-input ${errors.recipientPhone ? 'error' : ''}`}
                    />
                    {errors.recipientPhone && <div className="ck-error">{errors.recipientPhone}</div>}
                  </div>

                  {/* Address */}
                  <div className="ck-field">
                    <label className="ck-label">
                      <MapPin size={13} /> Địa chỉ giao hàng <span className="ck-req">*</span>
                    </label>
                    <textarea
                      value={formData.recipientAddress}
                      onChange={(e) => setFormData({ ...formData, recipientAddress: e.target.value })}
                      rows={3}
                      placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                      className={`ck-input ck-textarea ${errors.recipientAddress ? 'error' : ''}`}
                    />
                    {errors.recipientAddress && <div className="ck-error">{errors.recipientAddress}</div>}
                  </div>
                </div>
              </div>

              {/* Payment method */}
              <div className="ck-card">
                <div className="ck-card-header">
                  <div className="ck-card-icon"><CreditCard size={18} /></div>
                  <div>
                    <div className="ck-card-title">Phương thức thanh toán</div>
                    <div className="ck-card-sub">Chọn hình thức phù hợp với bạn</div>
                  </div>
                </div>

                <div className="ck-payment-options">
                  <label className={`ck-pay-opt ${formData.paymentMethod === 'COD' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={formData.paymentMethod === 'COD'}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
                      className="ck-radio-hidden"
                    />
                    <div className="ck-pay-icon cod"><Banknote size={22} /></div>
                    <div className="ck-pay-text">
                      <div className="ck-pay-name">Tiền mặt (COD)</div>
                      <div className="ck-pay-desc">Thanh toán khi nhận hàng</div>
                    </div>
                    <div className="ck-pay-check" aria-hidden="true" />
                  </label>

                  <label className={`ck-pay-opt ${formData.paymentMethod === 'BANK_TRANSFER' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="BANK_TRANSFER"
                      checked={formData.paymentMethod === 'BANK_TRANSFER'}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
                      className="ck-radio-hidden"
                    />
                    <div className="ck-pay-icon vnpay">
                      <QrCode size={22} className="text-primary" />
                    </div>
                    <div className="ck-pay-text">
                      <div className="ck-pay-name">Chuyển khoản VietQR (SePay)</div>
                      <div className="ck-pay-desc">Quét mã QR tự động xác nhận sau 3 giây</div>
                    </div>
                    <div className="ck-pay-check" aria-hidden="true" />
                  </label>
                </div>

                {formData.paymentMethod === 'BANK_TRANSFER' && (
                  <div className="ck-vnpay-notice">
                    <Sparkles size={14} className="text-yellow-600" />
                    Hệ thống sẽ tạo mã VietQR tự động. Sau khi chuyển tiền, hệ thống SePay sẽ tự động duyệt đơn ngay lập tức!
                  </div>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className={`ck-submit-btn ${loading ? 'loading' : ''}`}
              >
                {loading ? (
                  <><span className="ck-spinner" /> Đang xử lý...</>
                ) : formData.paymentMethod === 'BANK_TRANSFER' ? (
                  <><QrCode size={20} /> Lấy mã VietQR thanh toán <ChevronRight size={20} /></>
                ) : (
                  <><Flame size={20} /> Đặt hàng ngay <ChevronRight size={20} /></>
                )}
              </button>
            </form>

            {/* ── RIGHT: ORDER SUMMARY ── */}
            <div className="ck-summary-col">
              <div className="ck-summary-card">
                <div className="ck-summary-header">
                  <ShoppingBag size={18} />
                  <span>Đơn hàng của bạn</span>
                  <span className="ck-summary-count">{items.length} món</span>
                </div>

                <div className="ck-items-list">
                  {items.map(item => (
                    <div key={item.productId} className="ck-order-item">
                      <div className="ck-item-img">
                        <img src={item.image} alt={item.name} />
                        <span className="ck-item-qty">{item.quantity}</span>
                      </div>
                      <div className="ck-item-info">
                        <div className="ck-item-name">{item.name}</div>
                        <div className="ck-item-unit">{item.price.toLocaleString('vi-VN')}đ / món</div>
                      </div>
                      <div className="ck-item-total">
                        {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                      </div>
                    </div>
                  ))}
                </div>

                <div className="ck-summary-totals">
                  <div className="ck-total-row">
                    <span>Tạm tính</span>
                    <span>{totalPrice.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="ck-total-row">
                    <span>Phí vận chuyển</span>
                    <span className="ck-free">🎉 Miễn phí</span>
                  </div>
                  <div className="ck-grand-total">
                    <span>Tổng cộng</span>
                    <span className="ck-grand-price">{totalPrice.toLocaleString('vi-VN')}đ</span>
                  </div>
                </div>

                <div className="ck-guarantee">
                  <div className="ck-guarantee-item">🔒 Thanh toán bảo mật</div>
                  <div className="ck-guarantee-item">🚀 Giao hàng 30 phút</div>
                  <div className="ck-guarantee-item">✅ Đảm bảo chất lượng</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── SEPAY VIETQR PAYMENT MODAL ── */}
      {showQrModal && createdOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl text-center relative border border-border">
            {isPaid ? (
              <div className="py-8">
                <CheckCircle2 size={64} className="text-green-500 mx-auto mb-4 animate-bounce" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Thanh toán thành công!</h2>
                <p className="text-sm text-gray-600 mb-6">
                  SePay đã xác nhận giao dịch của bạn. Đang chuyển tới trang chi tiết đơn hàng...
                </p>
                <div className="flex items-center justify-center gap-2 text-primary text-sm font-semibold">
                  <Loader2 size={18} className="animate-spin" /> Đang chuyển hướng...
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
                  <div className="flex items-center gap-2 text-left">
                    <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-sm">
                      QR
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider text-gray-400 font-bold">VietQR SePay</div>
                      <div className="text-sm font-bold text-gray-900">Quét mã để thanh toán</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowQrModal(false);
                      navigate(`/orders/${createdOrder.id}`);
                    }}
                    className="text-gray-400 hover:text-gray-600 text-xs px-2 py-1 rounded bg-gray-50"
                  >
                    Đóng
                  </button>
                </div>

                {/* QR Image */}
                <div className="bg-gradient-to-b from-gray-50 to-white p-4 rounded-2xl border border-gray-200 inline-block mb-4 shadow-inner">
                  {createdOrder.vietQrUrl ? (
                    <img
                      src={createdOrder.vietQrUrl}
                      alt="VietQR Payment"
                      className="w-56 h-56 object-contain mx-auto rounded-xl"
                    />
                  ) : (
                    <div className="w-56 h-56 flex items-center justify-center text-sm text-gray-400">
                      Đang tạo mã VietQR...
                    </div>
                  )}
                </div>

                {/* Thông tin chuyển khoản */}
                <div className="bg-red-50/70 rounded-xl p-3 mb-4 text-left space-y-2 border border-red-100 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Số tiền:</span>
                    <span className="font-extrabold text-red-600 text-sm">
                      {createdOrder.totalPrice.toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Nội dung CK:</span>
                    <div className="flex items-center gap-1.5 font-mono font-bold text-gray-900 bg-white px-2 py-0.5 rounded border border-red-200">
                      <span>{createdOrder.paymentCode || `FF${createdOrder.id.slice(-5)}`}</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(createdOrder.paymentCode || '');
                          toast.success('Đã sao chép nội dung chuyển khoản!');
                        }}
                        className="text-red-500 hover:text-red-700"
                        title="Sao chép"
                      >
                        <Copy size={12} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Polling live feedback */}
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mb-4 bg-gray-50 py-2 rounded-lg">
                  <Loader2 size={14} className="animate-spin text-red-500" />
                  <span>Đang chờ chuyển khoản (Tự động duyệt qua SePay...)</span>
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={async () => {
                      const latest = await ordersApi.getById(createdOrder.id);
                      if (latest.status === 'CONFIRMED' || (latest as any).paymentStatus === 'PAID') {
                        setIsPaid(true);
                        toast.success('Đã xác nhận thanh toán!');
                        navigate(`/order-success/${createdOrder.id}`);
                      } else {
                        toast.info('Hệ thống chưa nhận được tiền. Nếu đã chuyển, vui lòng đợi 5-10 giây để SePay đồng bộ.');
                      }
                    }}
                    className="w-full bg-primary text-primary-foreground py-2.5 rounded-xl font-bold text-xs hover:bg-primary/90 transition-colors"
                  >
                    Tôi đã chuyển khoản xong
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/orders/${createdOrder.id}`)}
                    className="w-full text-xs text-gray-400 hover:text-gray-600 py-1"
                  >
                    Xem đơn hàng và thanh toán sau
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const ckStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Nunito:wght@400;600;700;900&display=swap');

  .ck-root { font-family: 'Nunito', sans-serif; background: #f5f0eb; min-height: 100vh; }

  /* Hero */
  .ck-hero {
    background: #fff;
    border-bottom: 1px solid #ececec;
    position: relative;
    overflow: hidden;
    padding: 40px 40px 32px;
  }
  .ck-hero::before {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      -45deg, transparent, transparent 40px,
      rgba(204,0,0,0.07) 40px, rgba(204,0,0,0.07) 80px
    );
    pointer-events: none;
  }
  .ck-hero-inner { max-width: 1280px; margin: 0 auto; position: relative; z-index: 1; }
  .ck-hero-label {
    font-size: 12px; font-weight: 700; letter-spacing: 3px;
    text-transform: uppercase; color: #CC0000; margin-bottom: 8px;
  }
  .ck-hero-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(44px, 6vw, 72px);
    color: #111; line-height: 1; margin: 0; letter-spacing: 1px;
  }
  .ck-hero-title span { color: #CC0000; }

  /* Body */
  .ck-body { max-width: 1280px; margin: 0 auto; padding: 40px 40px 60px; }
  .ck-grid {
    display: grid;
    grid-template-columns: 1fr 380px;
    gap: 28px;
    align-items: start;
  }
  .ck-form-col { display: flex; flex-direction: column; gap: 20px; }

  /* Cards */
  .ck-card {
    background: #fff;
    border-radius: 20px;
    padding: 28px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.06);
    animation: ck-in 0.4s cubic-bezier(.22,1,.36,1) both;
  }
  @keyframes ck-in {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .ck-card-header {
    display: flex; align-items: center; gap: 14px;
    margin-bottom: 24px;
    padding-bottom: 18px;
    border-bottom: 2px solid #f5f0eb;
  }
  .ck-card-icon {
    width: 42px; height: 42px;
    background: #fde8e8;
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    color: #CC0000;
    flex-shrink: 0;
  }
  .ck-card-title { font-family: 'Bebas Neue', sans-serif; font-size: 22px; color: #111; letter-spacing: 0.5px; }
  .ck-card-sub { font-size: 12px; color: #999; font-weight: 600; margin-top: 2px; }

  /* Fields */
  .ck-fields { display: flex; flex-direction: column; gap: 18px; }
  .ck-field {}
  .ck-label {
    display: flex; align-items: center; gap: 5px;
    font-size: 12px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.8px; color: #666; margin-bottom: 8px;
  }
  .ck-req { color: #CC0000; }
  .ck-input {
    width: 100%;
    padding: 12px 16px;
    background: #f9f6f2;
    border: 2px solid transparent;
    border-radius: 12px;
    font-family: 'Nunito', sans-serif;
    font-size: 15px;
    font-weight: 600;
    color: #111;
    outline: none;
    transition: border-color 0.2s, background 0.2s;
    box-sizing: border-box;
  }
  .ck-input::placeholder { color: #bbb; font-weight: 500; }
  .ck-input:focus { border-color: #CC0000; background: #fff; }
  .ck-input.error { border-color: #ef4444; background: #fff8f8; }
  .ck-textarea { resize: none; }
  .ck-error {
    font-size: 12px; color: #ef4444; font-weight: 700;
    margin-top: 5px; display: flex; align-items: center; gap: 4px;
  }
  .ck-error::before { content: '⚠'; }

  /* Payment options */
  .ck-payment-options { display: flex; flex-direction: column; gap: 12px; }
  .ck-pay-opt {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 16px 18px;
    border: 2px solid #e8e2da;
    border-radius: 14px;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s, transform 0.15s;
    position: relative;
  }
  .ck-pay-opt:hover { border-color: #CC0000; background: #fff8f8; transform: translateX(3px); }
  .ck-pay-opt.active { border-color: #CC0000; background: #fff3f3; }
  .ck-radio-hidden { position: absolute; opacity: 0; width: 0; height: 0; }
  .ck-pay-icon {
    width: 44px; height: 44px;
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px;
    flex-shrink: 0;
  }
  .ck-pay-icon.cod { background: #ecfdf5; color: #16a34a; }
  .ck-pay-icon.vnpay { background: #eff6ff; }
  .ck-pay-text { flex: 1; }
  .ck-pay-name { font-size: 15px; font-weight: 700; color: #111; margin-bottom: 2px; }
  .ck-pay-desc { font-size: 12px; color: #888; font-weight: 600; }
  .ck-pay-check {
    width: 20px; height: 20px;
    border-radius: 50%;
    border: 2px solid #ddd;
    flex-shrink: 0;
    transition: border-color 0.15s, background 0.15s;
  }
  .ck-pay-opt.active .ck-pay-check {
    border-color: #CC0000;
    background: #CC0000;
    box-shadow: inset 0 0 0 4px #fff;
  }
  .ck-vnpay-notice {
    margin-top: 14px;
    display: flex; align-items: flex-start; gap: 8px;
    background: #eff6ff;
    border: 1.5px solid #bfdbfe;
    border-radius: 10px;
    padding: 12px 14px;
    font-size: 13px;
    color: #1d4ed8;
    font-weight: 600;
    line-height: 1.5;
  }
  .ck-vnpay-notice svg { flex-shrink: 0; margin-top: 1px; }

  /* Submit */
  .ck-submit-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
    background: #CC0000;
    color: #fff;
    border: none;
    border-radius: 16px;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 24px;
    letter-spacing: 1.5px;
    padding: 20px 32px;
    cursor: pointer;
    transition: transform 0.2s cubic-bezier(.22,1,.36,1), background 0.2s, box-shadow 0.2s;
    box-shadow: 0 6px 24px rgba(204,0,0,0.3);
  }
  .ck-submit-btn:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 12px 32px rgba(204,0,0,0.38);
    background: #a30000;
  }
  .ck-submit-btn:active:not(:disabled) { transform: scale(0.98); }
  .ck-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .ck-spinner {
    width: 20px; height: 20px;
    border: 2.5px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: ck-spin 0.65s linear infinite;
    flex-shrink: 0;
  }
  @keyframes ck-spin { to { transform: rotate(360deg); } }

  /* Summary card */
  .ck-summary-col {}
  .ck-summary-card {
    background: #fff;
    border: 1.5px solid #ececec;
    box-shadow: 0 2px 12px rgba(0,0,0,0.06);
    border-radius: 20px;
    overflow: hidden;
    position: sticky;
    top: 88px;
    animation: ck-in 0.5s cubic-bezier(.22,1,.36,1) both;
    animation-delay: 0.1s;
  }
  .ck-summary-header {
    display: flex; align-items: center; gap: 10px;
    padding: 20px 22px 16px;
    border-bottom: 1.5px solid #f0f0f0;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 20px;
    color: #111;
    letter-spacing: 0.5px;
  }
  .ck-summary-header svg { color: #CC0000; }
  .ck-summary-count {
    margin-left: auto;
    background: #CC0000;
    color: #fff;
    font-size: 11px;
    font-family: 'Nunito', sans-serif;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 999px;
  }

  .ck-items-list {
    padding: 14px 22px;
    display: flex; flex-direction: column; gap: 12px;
    max-height: 320px;
    overflow-y: auto;
  }
  .ck-items-list::-webkit-scrollbar { width: 4px; }
  .ck-items-list::-webkit-scrollbar-track { background: #f2f2f2; }
  .ck-items-list::-webkit-scrollbar-thumb { background: #ccc; border-radius: 4px; }

  .ck-order-item {
    display: flex; align-items: center; gap: 12px;
  }
  .ck-item-img {
    width: 52px; height: 52px;
    border-radius: 10px;
    overflow: hidden;
    position: relative;
    flex-shrink: 0;
    background: #f5f0eb;
  }
  .ck-item-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .ck-item-qty {
    position: absolute;
    top: -5px; right: -5px;
    width: 18px; height: 18px;
    background: #CC0000;
    color: #fff;
    font-size: 10px;
    font-weight: 900;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Nunito', sans-serif;
  }
  .ck-item-info { flex: 1; min-width: 0; }
  .ck-item-name {
    font-size: 13px; font-weight: 700; color: #111;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    margin-bottom: 3px;
  }
  .ck-item-unit { font-size: 11px; color: #888; font-weight: 600; }
  .ck-item-total { font-size: 13px; font-weight: 700; color: #CC0000; flex-shrink: 0; white-space: nowrap; }

  .ck-summary-totals {
    padding: 16px 22px;
    border-top: 1.5px solid #f0f0f0;
  }
  .ck-total-row {
    display: flex; justify-content: space-between; align-items: center;
    font-size: 13px; font-weight: 600; color: #666;
    margin-bottom: 8px;
  }
  .ck-free { color: #22c55e; font-weight: 700; }
  .ck-grand-total {
    display: flex; justify-content: space-between; align-items: center;
    padding-top: 12px;
    border-top: 1.5px solid #f0f0f0;
    margin-top: 6px;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 18px;
    color: #111;
    letter-spacing: 0.5px;
  }
  .ck-grand-price {
    font-size: 28px;
    color: #CC0000;
    letter-spacing: 0.5px;
  }

  .ck-guarantee {
    padding: 14px 22px 18px;
    display: flex; flex-direction: column; gap: 7px;
    border-top: 1.5px solid #f0f0f0;
  }
  .ck-guarantee-item {
    font-size: 12px; font-weight: 700; color: #666;
    text-transform: uppercase; letter-spacing: 0.5px;
  }

  @media (max-width: 900px) {
    .ck-hero { padding: 32px 20px 24px; }
    .ck-body { padding: 28px 20px 48px; }
    .ck-grid { grid-template-columns: 1fr; }
    .ck-summary-card { position: static; }
  }
`;