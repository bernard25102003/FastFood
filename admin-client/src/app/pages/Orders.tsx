import { useState, useEffect } from 'react';
import { Eye, X } from 'lucide-react';
import { ordersApi, type Order, type OrderStatus } from '../services/api';
import { toast } from 'sonner';

const statusColors: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  SHIPPING: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const statusLabels: Record<OrderStatus, string> = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  SHIPPING: 'Đang giao',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
};

export function Orders() {
  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | ''>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const loadOrders = async (p = page) => {
    try {
      const res = await ordersApi.getAll({
        page: p,
        limit: itemsPerPage,
        status: selectedStatus || undefined,
      });
      setOrdersList(res.items);
      setTotalPages(res.pagination.totalPages);
    } catch {
      toast.error('Không thể tải danh sách đơn hàng');
    }
  };

  useEffect(() => {
    setPage(1);
    loadOrders(1);
  }, [selectedStatus]);

  useEffect(() => {
    loadOrders(page);
  }, [page]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý đơn hàng</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Lọc theo trạng thái</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as OrderStatus | '')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Tất cả</option>
            <option value="PENDING">Chờ xác nhận</option>
            <option value="CONFIRMED">Đã xác nhận</option>
            <option value="SHIPPING">Đang giao</option>
            <option value="COMPLETED">Hoàn thành</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-gray-600">Mã đơn</th>
                <th className="text-left py-3 px-4 text-gray-600">Khách hàng</th>
                <th className="text-left py-3 px-4 text-gray-600">Tổng tiền</th>
                <th className="text-left py-3 px-4 text-gray-600">Trạng thái</th>
                <th className="text-left py-3 px-4 text-gray-600">Thanh toán</th>
                <th className="text-left py-3 px-4 text-gray-600">Thời gian</th>
                <th className="text-left py-3 px-4 text-gray-600">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {ordersList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    Không có đơn hàng nào
                  </td>
                </tr>
              ) : (
                ordersList.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{order.orderNumber}</td>
                    <td className="py-3 px-4">{order.recipientName}</td>
                    <td className="py-3 px-4">{parseFloat(order.totalPrice).toLocaleString('vi-VN')}đ</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                        {statusLabels[order.status]}
                      </span>
                    </td>
                    <td className="py-3 px-4">{order.paymentMethod === 'COD' ? 'COD' : 'Chuyển khoản'}</td>
                    <td className="py-3 px-4">{new Date(order.createdAt).toLocaleString('vi-VN')}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-3 py-1 rounded ${
                  page === p ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusUpdated={() => loadOrders()}
        />
      )}
    </div>
  );
}

interface OrderDetailsModalProps {
  order: Order;
  onClose: () => void;
  onStatusUpdated: () => void;
}

function OrderDetailsModal({ order, onClose, onStatusUpdated }: OrderDetailsModalProps) {
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(order.status);

  const getNextStatuses = (status: OrderStatus): OrderStatus[] => {
    switch (status) {
      case 'PENDING': return ['CONFIRMED', 'CANCELLED'];
      case 'CONFIRMED': return ['SHIPPING', 'CANCELLED'];
      case 'SHIPPING': return ['COMPLETED', 'CANCELLED'];
      default: return [];
    }
  };

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!window.confirm(`Bạn có chắc chắn muốn chuyển trạng thái sang "${statusLabels[newStatus]}"?`)) return;
    try {
      await ordersApi.updateStatus(order.id, newStatus);
      setCurrentStatus(newStatus);
      toast.success('Đã cập nhật trạng thái đơn hàng');
      onStatusUpdated();
    } catch (err: any) {
      toast.error(err?.message ?? 'Không thể cập nhật trạng thái');
    }
  };

  const nextStatuses = getNextStatuses(currentStatus);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Chi tiết đơn hàng #{order.orderNumber}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Thông tin khách hàng</h3>
              <div className="space-y-1 text-sm">
                <p><span className="text-gray-600">Tên:</span> {order.recipientName}</p>
                <p><span className="text-gray-600">SĐT:</span> {order.recipientPhone}</p>
                <p><span className="text-gray-600">Địa chỉ:</span> {order.recipientAddress}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Thông tin đơn hàng</h3>
              <div className="space-y-1 text-sm">
                <p><span className="text-gray-600">Mã đơn:</span> {order.orderNumber}</p>
                <p><span className="text-gray-600">Tổng tiền:</span> {parseFloat(order.totalPrice).toLocaleString('vi-VN')}đ</p>
                <p>
                  <span className="text-gray-600">Trạng thái:</span>{' '}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[currentStatus]}`}>
                    {statusLabels[currentStatus]}
                  </span>
                </p>
                <p><span className="text-gray-600">Thanh toán:</span> {order.paymentMethod === 'COD' ? 'COD' : 'Chuyển khoản'}</p>
                <p><span className="text-gray-600">Thời gian:</span> {new Date(order.createdAt).toLocaleString('vi-VN')}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Sản phẩm</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-2 px-4 text-sm text-gray-600">Hình ảnh</th>
                    <th className="text-left py-2 px-4 text-sm text-gray-600">Tên sản phẩm</th>
                    <th className="text-left py-2 px-4 text-sm text-gray-600">Đơn giá</th>
                    <th className="text-left py-2 px-4 text-sm text-gray-600">Số lượng</th>
                    <th className="text-left py-2 px-4 text-sm text-gray-600">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((item, index) => (
                    <tr key={index} className="border-t">
                      <td className="py-2 px-4">
                        {item.productImage ? (
                          <img src={item.productImage} alt={item.productName} className="w-12 h-12 object-cover rounded" />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded" />
                        )}
                      </td>
                      <td className="py-2 px-4">{item.productName}</td>
                      <td className="py-2 px-4">{parseFloat(item.productPrice).toLocaleString('vi-VN')}đ</td>
                      <td className="py-2 px-4">{item.quantity}</td>
                      <td className="py-2 px-4">{parseFloat(item.subtotal).toLocaleString('vi-VN')}đ</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {nextStatuses.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Cập nhật trạng thái</h3>
              <div className="flex gap-2">
                {nextStatuses.map(status => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      status === 'CANCELLED'
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-orange-500 hover:bg-orange-600 text-white'
                    }`}
                  >
                    {statusLabels[status]}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

