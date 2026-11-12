import { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { ordersApi, type Order, type OrderStatus } from '../services/api';
import { toast } from 'sonner';
import {
  CheckCircle2,
  Copy,
  Check,
  QrCode,
  Loader2,
  ArrowLeft,
  AlertTriangle,
  RefreshCw,
  Building2,
  User,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';

const statusColors: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200',
  SHIPPING: 'bg-purple-100 text-purple-800 border-purple-200',
  COMPLETED: 'bg-green-100 text-green-800 border-green-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200',
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
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerifyPayment = async () => {
    if (!id) return;
    setIsVerifying(true);
    try {
      const res = await ordersApi.verifyPayment(id);
      if (res.paid) {
        toast.success('🎉 Xác nhận thanh toán thành công! Đơn hàng của bạn đã được duyệt.');
        fetchOrderDetail();
      } else {
        toast.info(
          res.message ||
            'Hệ thống chưa nhận được biến động số dư. Nếu bạn vừa chuyển khoản, vui lòng đợi 5-10 giây để ngân hàng xử lý.'
        );
      }
    } catch {
      toast.error('Không thể kiểm tra trạng thái thanh toán lúc này');
    } finally {
      setIsVerifying(false);
    }
  };

  const fetchOrderDetail = async (isManual = false) => {
    if (!id) return;
    if (isManual) setIsRefreshing(true);
    try {
      const data = await ordersApi.getById(id);
      setOrder(data);
      if (isManual) {
        toast.info('Đã làm mới thông tin đơn hàng');
      }
    } catch {
      if (isManual) {
        toast.error('Không thể làm mới trạng thái đơn');
      } else {
        setNotFound(true);
      }
    } finally {
      if (isManual) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!id || !isAuthenticated) return;
    fetchOrderDetail();
  }, [id, isAuthenticated]);

  // Polling tự động kiểm tra trạng thái thanh toán VietQR khi đơn chưa thanh toán
  useEffect(() => {
    if (!order || order.paymentMethod !== 'BANK_TRANSFER') return;
    const isUnpaid = order.paymentStatus !== 'PAID' && order.status === 'PENDING';
    if (!isUnpaid) return;

    const interval = setInterval(async () => {
      try {
        const latest = await ordersApi.getById(order.id);
        if (latest.status === 'CONFIRMED' || latest.paymentStatus === 'PAID') {
          setOrder(latest);
          clearInterval(interval);
          toast.success('🎉 Thanh toán VietQR thành công! Đơn hàng của bạn đã được xác nhận.');
        }
      } catch {
        // bỏ qua lỗi polling
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [order?.id, order?.paymentMethod, order?.paymentStatus, order?.status]);

  if (authLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login?redirect=/orders" replace />;

  if (notFound) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Không tìm thấy đơn hàng</h2>
        <Link
          to="/orders"
          className="inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 font-semibold transition"
        >
          <ArrowLeft size={18} /> Quay lại lịch sử đơn hàng
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-orange-600" />
        Đang tải chi tiết đơn hàng...
      </div>
    );
  }

  const isBankTransfer = order.paymentMethod === 'BANK_TRANSFER';
  const isPaid = order.paymentStatus === 'PAID' || order.status !== 'PENDING';
  const qrUrl =
    order.vietQrUrl ||
    (order.paymentCode
      ? `https://qr.sepay.vn/img?bank=MBBank&acc=0000000001&template=compact&amount=${Math.round(
          Number(order.totalPrice || 0)
        )}&des=${encodeURIComponent(order.paymentCode)}`
      : null);

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`Đã sao chép ${fieldName}`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/orders"
          className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold"
        >
          <ArrowLeft size={18} /> Quay lại danh sách đơn hàng
        </Link>
        <button
          onClick={() => fetchOrderDetail(true)}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 transition"
        >
          <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
          Làm mới
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm mb-6">
        {/* Header thông tin đơn */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">
                Đơn hàng #{order.orderNumber || order.id}
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                  statusColors[order.status] || 'bg-gray-100 text-gray-700'
                }`}
              >
                {statusLabels[order.status] || order.status}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              Thời gian đặt: {new Date(order.createdAt).toLocaleString('vi-VN')}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-gray-500 block">Tổng thanh toán</span>
            <span className="text-2xl font-black text-orange-600">
              {Number(order.totalPrice || 0).toLocaleString('vi-VN')} đ
            </span>
          </div>
        </div>

        {/* ================= KHỐI THANH TOÁN VIETQR SEPAY ================= */}
        {isBankTransfer && !isPaid && (
          <div className="my-6 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-orange-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold">
                <QrCode size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Thanh Toán Chuyển Khoản VietQR (Tự Động)
                </h3>
                <p className="text-xs text-orange-800 font-medium">
                  Hệ thống tự động duyệt đơn sau 2-5 giây khi nhận được tiền qua SePay
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Hình ảnh QR */}
              <div className="md:col-span-5 flex flex-col items-center justify-center bg-white p-4 rounded-xl border border-orange-100 shadow-sm">
                {qrUrl ? (
                  <div className="text-center">
                    <img
                      src={qrUrl}
                      alt="VietQR Payment Code"
                      className="w-56 h-auto mx-auto rounded-lg shadow-inner border border-gray-100"
                    />
                    <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-emerald-700 font-semibold">
                      <ShieldCheck size={14} /> Mã VietQR Chuẩn Napas 24/7
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-gray-400 text-sm">Đang tạo mã QR...</div>
                )}
              </div>

              {/* Thông tin chuyển khoản chi tiết */}
              <div className="md:col-span-7 space-y-3">
                <div className="bg-white p-3.5 rounded-xl border border-orange-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-500 block">Ngân hàng</span>
                    <strong className="text-sm text-gray-800">MBBank (Ngân Hàng Quân Đội)</strong>
                  </div>
                  <Building2 className="text-gray-400" size={18} />
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-orange-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-500 block">Số tài khoản</span>
                    <strong className="text-base text-gray-900 font-mono tracking-wide">
                      0000000001
                    </strong>
                  </div>
                  <button
                    onClick={() => handleCopy('0000000001', 'Số tài khoản')}
                    className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition"
                    title="Sao chép số tài khoản"
                  >
                    {copiedField === 'Số tài khoản' ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-orange-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-500 block">Chủ tài khoản</span>
                    <strong className="text-sm text-gray-800 uppercase">PHAT PHUT VI EN</strong>
                  </div>
                  <User className="text-gray-400" size={18} />
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-orange-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-500 block">Số tiền thanh toán</span>
                    <strong className="text-lg text-orange-600 font-bold">
                      {Number(order.totalPrice || 0).toLocaleString('vi-VN')} đ
                    </strong>
                  </div>
                  <button
                    onClick={() =>
                      handleCopy(String(Math.round(Number(order.totalPrice || 0))), 'Số tiền')
                    }
                    className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition"
                    title="Sao chép số tiền"
                  >
                    {copiedField === 'Số tiền' ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>

                {order.paymentCode && (
                  <div className="bg-orange-100/70 p-3.5 rounded-xl border-2 border-orange-300 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-orange-900 font-semibold block">
                        Nội dung chuyển khoản (Bắt buộc)
                      </span>
                      <strong className="text-lg text-orange-700 font-mono tracking-wider">
                        {order.paymentCode}
                      </strong>
                    </div>
                    <button
                      onClick={() => handleCopy(order.paymentCode!, 'Nội dung chuyển khoản')}
                      className="px-3 py-1.5 bg-orange-600 text-white hover:bg-orange-700 rounded-lg font-semibold text-xs flex items-center gap-1.5 shadow-sm transition"
                    >
                      {copiedField === 'Nội dung chuyển khoản' ? (
                        <>
                          <Check size={14} /> Đã sao chép
                        </>
                      ) : (
                        <>
                          <Copy size={14} /> Sao chép
                        </>
                      )}
                    </button>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    onClick={handleVerifyPayment}
                    disabled={isVerifying}
                    className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 disabled:bg-orange-400 text-white rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transition"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Đang đối soát với ngân hàng...
                      </>
                    ) : (
                      <>
                        <RefreshCw size={16} /> Tôi đã chuyển khoản — Kiểm tra ngay
                      </>
                    )}
                  </button>
                </div>

                <div className="pt-1 flex items-center gap-2 text-xs text-orange-900">
                  <Loader2 size={14} className="animate-spin text-orange-600 flex-shrink-0" />
                  <span>
                    Đang tự động lắng nghe giao dịch... Nếu bạn đã chuyển khoản xong, vui lòng chờ vài
                    giây hoặc bấm nút Kiểm tra ngay bên trên.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Đã thanh toán thành công qua VietQR */}
        {isBankTransfer && isPaid && (
          <div className="my-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="font-bold text-sm">Đã thanh toán thành công qua VietQR</p>
              <p className="text-xs text-emerald-700 mt-0.5">
                Mã giao dịch SePay: <strong>{order.paymentCode || 'N/A'}</strong> — Đơn hàng đã được xác
                nhận và chuyển tới nhà bếp.
              </p>
            </div>
          </div>
        )}

        {/* Thông tin người nhận & thanh toán */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6 pb-6 border-b border-gray-100">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">
              Thông tin người nhận
            </h3>
            <div className="space-y-1.5 text-sm text-gray-800">
              <p>
                <strong className="text-gray-600">Họ tên:</strong> {order.recipientName || (order as any).name}
              </p>
              <p>
                <strong className="text-gray-600">Số điện thoại:</strong>{' '}
                {order.recipientPhone || (order as any).phone}
              </p>
              <p>
                <strong className="text-gray-600">Địa chỉ giao hàng:</strong>{' '}
                {order.recipientAddress || (order as any).address}
              </p>
              {order.notes && (
                <p>
                  <strong className="text-gray-600">Ghi chú:</strong> {order.notes}
                </p>
              )}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">
              Phương thức thanh toán
            </h3>
            <div className="space-y-2 text-sm text-gray-800">
              <div className="flex items-center gap-2">
                <CreditCard size={18} className="text-orange-600" />
                <span className="font-semibold">
                  {order.paymentMethod === 'COD'
                    ? 'Thanh toán tiền mặt khi nhận hàng (COD)'
                    : 'Chuyển khoản ngân hàng (VietQR / SePay)'}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-500 mr-2">Trạng thái thanh toán:</span>
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    order.paymentStatus === 'PAID'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {order.paymentStatus === 'PAID' ? 'ĐÃ THANH TOÁN' : 'CHƯA THANH TOÁN'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Danh sách món ăn */}
        <div className="mb-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">
            Món ăn đã đặt ({order.items?.length || 0})
          </h3>
          <div className="space-y-3">
            {(order.items || []).map((item) => {
              const itemName = item.productName || (item as any).name || 'Món ăn';
              const itemImg = item.productImage || (item as any).image;
              const itemPrice = item.productPrice ?? (item as any).price ?? 0;
              const itemSubtotal = item.subtotal ?? Number(itemPrice) * item.quantity;
              return (
                <div
                  key={item.id}
                  className="flex gap-4 items-center p-3 rounded-xl hover:bg-gray-50 transition"
                >
                  <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-100">
                    {itemImg ? (
                      <img src={itemImg} alt={itemName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl">🍔</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-gray-900 truncate mb-1">{itemName}</h4>
                    <p className="text-xs text-gray-500">
                      {item.quantity} x {Number(itemPrice).toLocaleString('vi-VN')} đ
                    </p>
                  </div>
                  <div className="font-bold text-gray-900 text-right">
                    {Number(itemSubtotal).toLocaleString('vi-VN')} đ
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tổng tiền & Đánh giá */}
        <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-500">
            Cảm ơn bạn đã lựa chọn món ăn tại FastFood!
          </div>
          <div className="flex items-center gap-4">
            <span className="text-base font-bold text-gray-700">Tổng cộng:</span>
            <span className="text-3xl font-black text-orange-600">
              {Number(order.totalPrice || 0).toLocaleString('vi-VN')} đ
            </span>
          </div>
        </div>

        {order.status === 'COMPLETED' && (
          <div className="mt-8 pt-6 border-t border-gray-100">
            <Link
              to={`/orders/${order.id}/review`}
              className="inline-block bg-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-700 transition shadow-sm"
            >
              ⭐ Đánh giá món ăn
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
