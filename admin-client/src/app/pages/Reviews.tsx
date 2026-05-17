import { useState, useEffect } from 'react';
import { Trash2, Star } from 'lucide-react';
import { reviewsApi, type Review } from '../services/api';
import { toast } from 'sonner';

export function Reviews() {
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const loadReviews = async (p = page) => {
    try {
      const res = await reviewsApi.getAll({ page: p, limit: itemsPerPage });
      setReviewsList(res.items);
      setTotalPages(res.pagination.totalPages);
    } catch {
      toast.error('Không thể tải danh sách đánh giá');
    }
  };

  useEffect(() => { loadReviews(page); }, [page]);

  const handleDelete = async (reviewId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) return;
    try {
      await reviewsApi.delete(reviewId);
      toast.success('Đã xóa đánh giá thành công');
      loadReviews();
    } catch (err: any) {
      toast.error(err?.message ?? 'Không thể xóa đánh giá');
    }
  };

  const renderStars = (rating: number) => (
    <div className="flex gap-1">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} size={16} className={i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
      ))}
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý đánh giá</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-gray-600">Sản phẩm</th>
                <th className="text-left py-3 px-4 text-gray-600">Người đánh giá</th>
                <th className="text-left py-3 px-4 text-gray-600">Đánh giá</th>
                <th className="text-left py-3 px-4 text-gray-600">Nội dung</th>
                <th className="text-left py-3 px-4 text-gray-600">Xác nhận</th>
                <th className="text-left py-3 px-4 text-gray-600">Thời gian</th>
                <th className="text-left py-3 px-4 text-gray-600">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {reviewsList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    Chưa có đánh giá nào
                  </td>
                </tr>
              ) : (
                reviewsList.map((review) => (
                  <tr key={review.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {review.product && (
                          <>
                            {review.product.images?.[0] && (
                              <img
                                src={review.product.images?.[0]?.thumbnailUrl ?? review.product.images?.[0]?.imageUrl}
                                alt={review.product.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                            )}
                            <span className="font-medium">{review.product.name}</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">{review.user?.name ?? 'N/A'}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {renderStars(review.rating)}
                        <span className="text-sm text-gray-600">({review.rating})</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 max-w-md">
                      <p className="line-clamp-2">{review.content}</p>
                    </td>
                    <td className="py-3 px-4">
                      {review.verified ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Đã xác nhận</span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">Chưa xác nhận</span>
                      )}
                    </td>
                    <td className="py-3 px-4">{new Date(review.createdAt).toLocaleString('vi-VN')}</td>
                    <td className="py-3 px-4">
                      <button onClick={() => handleDelete(review.id)} className="text-red-600 hover:text-red-800">
                        <Trash2 size={18} />
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
                className={`px-3 py-1 rounded ${p === page ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
