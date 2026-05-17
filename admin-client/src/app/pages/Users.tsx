import { useState, useEffect } from 'react';
import { Lock, Unlock, Trash2 } from 'lucide-react';
import { usersApi, type AdminUser } from '../services/api';
import { toast } from 'sonner';

export function Users() {
  const [usersList, setUsersList] = useState<AdminUser[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const loadUsers = async (p = page) => {
    try {
      const res = await usersApi.getAll({ page: p, limit: itemsPerPage });
      setUsersList(res.items);
      setTotalPages(res.pagination.totalPages);
    } catch {
      toast.error('Không thể tải danh sách người dùng');
    }
  };

  useEffect(() => { loadUsers(page); }, [page]);

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const isLocked = currentStatus === 'LOCKED';
    const action = isLocked ? 'mở khóa' : 'khóa';
    if (!window.confirm(`Bạn có chắc chắn muốn ${action} tài khoản này?`)) return;
    try {
      if (isLocked) {
        await usersApi.unlock(userId);
      } else {
        await usersApi.lock(userId);
      }
      toast.success(`Đã ${action} tài khoản thành công`);
      loadUsers();
    } catch (err: any) {
      toast.error(err?.message ?? `Không thể ${action} tài khoản`);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tài khoản này? Hành động này không thể hoàn tác!')) return;
    try {
      await usersApi.delete(userId);
      toast.success('Đã xóa tài khoản thành công');
      loadUsers();
    } catch (err: any) {
      toast.error(err?.message ?? 'Không thể xóa tài khoản');
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý người dùng</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-gray-600">Tên</th>
                <th className="text-left py-3 px-4 text-gray-600">Email</th>
                <th className="text-left py-3 px-4 text-gray-600">Vai trò</th>
                <th className="text-left py-3 px-4 text-gray-600">Trạng thái</th>
                <th className="text-left py-3 px-4 text-gray-600">Ngày tham gia</th>
                <th className="text-left py-3 px-4 text-gray-600">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {usersList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    Chưa có người dùng nào
                  </td>
                </tr>
              ) : (
                usersList.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{user.name}</td>
                    <td className="py-3 px-4">{user.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {user.role === 'ADMIN' ? 'Quản trị' : 'Người dùng'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {user.status === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa'}
                      </span>
                    </td>
                    <td className="py-3 px-4">{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggleStatus(user.id, user.status)}
                          className={user.status === 'LOCKED' ? 'text-green-600 hover:text-green-800' : 'text-orange-600 hover:text-orange-800'}
                          title={user.status === 'LOCKED' ? 'Mở khóa' : 'Khóa tài khoản'}
                        >
                          {user.status === 'LOCKED' ? <Unlock size={18} /> : <Lock size={18} />}
                        </button>
                        {user.role !== 'ADMIN' && (
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Xóa tài khoản"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
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
