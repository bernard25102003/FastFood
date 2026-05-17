import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { categoriesApi, type Category } from '../services/api';
import { toast } from 'sonner';

export function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const load = () => {
    categoriesApi.getAll().then(setCategories).catch(() => toast.error('KhĂ´ng thá»ƒ táº£i danh má»¥c'));
  };

  useEffect(() => { load(); }, []);

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleDelete = async (categoryId: string) => {
    if (!window.confirm('Báº¡n cĂ³ cháº¯c cháº¯n muá»‘n xĂ³a danh má»¥c nĂ y?')) return;
    try {
      await categoriesApi.delete(categoryId);
      toast.success('ÄĂ£ xĂ³a danh má»¥c thĂ nh cĂ´ng');
      load();
    } catch (err: any) {
      toast.error(err?.message ?? 'KhĂ´ng thá»ƒ xĂ³a danh má»¥c');
    }
  };

  const handleAddNew = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý danh mục</h1>
        <button
          onClick={handleAddNew}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={20} />
          Thêm danh mục
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-gray-600">ID</th>
                <th className="text-left py-3 px-4 text-gray-600">Tên danh mục</th>
                <th className="text-left py-3 px-4 text-gray-600">Mô tả</th>
                <th className="text-left py-3 px-4 text-gray-600">Số SP</th>
                <th className="text-left py-3 px-4 text-gray-600">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">
                    Chưa có danh mục nào
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-xs text-gray-400">{category.id.slice(0, 8)}…</td>
                    <td className="py-3 px-4 font-medium">
                      {category.icon && <span className="mr-2">{category.icon}</span>}
                      {category.name}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">{category.description ?? '—'}</td>
                    <td className="py-3 px-4">{category._count?.products ?? '—'}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <CategoryModal
          category={editingCategory}
          onClose={() => setIsModalOpen(false)}
          onSave={() => {
            setIsModalOpen(false);
            load();
          }}
        />
      )}
    </div>
  );
}

interface CategoryModalProps {
  category: Category | null;
  onClose: () => void;
  onSave: () => void;
}

function CategoryModal({ category, onClose, onSave }: CategoryModalProps) {
  const [name, setName] = useState(category?.name ?? '');
  const [description, setDescription] = useState(category?.description ?? '');
  const [icon, setIcon] = useState(category?.icon ?? '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Vui lòng nhập tên danh mục');
      return;
    }

    setLoading(true);
    try {
      if (category) {
        await categoriesApi.update(category.id, { name, description: description || undefined, icon: icon || undefined });
        toast.success('Đã cập nhật danh mục');
      } else {
        await categoriesApi.create({ name, description: description || undefined, icon: icon || undefined });
        toast.success('Đã thêm danh mục mới');
      }
      onSave();
    } catch (err: any) {
      setError(err?.message ?? 'Đã có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            {category ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên danh mục <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Nhập tên danh mục"
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Nhập mô tả (tùy chọn)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Icon (emoji)
            </label>
            <input
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Ví dụ: 🛍️"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg"
            >
              {loading ? 'Đang xử lý...' : (category ? 'Cập nhật' : 'Thêm mới')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


