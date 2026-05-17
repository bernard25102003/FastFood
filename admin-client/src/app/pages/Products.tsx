import { useState, useRef, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, X, Upload, Loader } from 'lucide-react';
import { productsApi, categoriesApi, type Product, type Category } from '../services/api';
import { toast } from 'sonner';

export function Products() {
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const loadProducts = async (p = page) => {
    try {
      const res = await productsApi.getAll({
        page: p,
        limit: itemsPerPage,
        search: searchTerm || undefined,
        categoryId: selectedCategory || undefined,
      });
      setProductsList(res.items);
      setTotalPages(res.pagination.totalPages);
    } catch {
      toast.error('Không thể tải danh sách sản phẩm');
    }
  };

  useEffect(() => {
    categoriesApi.getAll().then(setCategoriesList).catch(() => {});
  }, []);

  // When filters change, reset to page 1 and load. Track with a ref so
  // the page-change effect below doesn't fire a duplicate request.
  const skipPageEffect = useRef(false);

  useEffect(() => {
    skipPageEffect.current = true;
    setPage(1);
    loadProducts(1);
  }, [searchTerm, selectedCategory]);

  useEffect(() => {
    if (skipPageEffect.current) {
      skipPageEffect.current = false;
      return;
    }
    loadProducts(page);
  }, [page]);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (productId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
    try {
      await productsApi.delete(productId);
      toast.success('Đã xóa sản phẩm thành công');
      loadProducts();
    } catch (err: any) {
      toast.error(err?.message ?? 'Không thể xóa sản phẩm');
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý sản phẩm</h1>
        <button
          onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={20} />
          Thêm sản phẩm
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Tất cả danh mục</option>
            {categoriesList.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-gray-600">Hình ảnh</th>
                <th className="text-left py-3 px-4 text-gray-600">Tên sản phẩm</th>
                <th className="text-left py-3 px-4 text-gray-600">Giá</th>
                <th className="text-left py-3 px-4 text-gray-600">Danh mục</th>
                <th className="text-left py-3 px-4 text-gray-600">Đã bán</th>
                <th className="text-left py-3 px-4 text-gray-600">Đánh giá</th>
                <th className="text-left py-3 px-4 text-gray-600">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {productsList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    Không tìm thấy sản phẩm nào
                  </td>
                </tr>
              ) : (
                productsList.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      {product.images?.[0] ? (
                        <img
                          src={product.images?.[0]?.thumbnailUrl ?? product.images?.[0]?.imageUrl}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                          No img
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium">{product.name}</td>
                    <td className="py-3 px-4">{parseFloat(product.price).toLocaleString('vi-VN')}đ</td>
                    <td className="py-3 px-4">
                      {product.category?.name ?? categoriesList.find(c => c.id === product.categoryId)?.name ?? '—'}
                    </td>
                    <td className="py-3 px-4">{product.soldCount}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span>{parseFloat(product.avgRating).toFixed(1)}</span>
                        <span className="text-gray-500 text-sm">({product.reviewCount})</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(product)} className="text-blue-600 hover:text-blue-800">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-800">
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

      {isModalOpen && (
        <ProductModal
          product={editingProduct}
          categories={categoriesList}
          onClose={() => setIsModalOpen(false)}
          onSave={() => {
            setIsModalOpen(false);
            loadProducts();
          }}
        />
      )}
    </div>
  );
}

interface ProductModalProps {
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onSave: () => void;
}

interface ImageFile {
  file: File;
  preview: string;
}

function ProductModal({ product, categories, onClose, onSave }: ProductModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragZoneRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    name: product?.name ?? '',
    price: product ? parseFloat(product.price) : 0,
    categoryId: product?.categoryId ?? '',
    description: product?.description ?? '',
  });

  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFiles = (files: FileList) => {
    const newImages: ImageFile[] = [];
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        newImages.push({ file, preview: URL.createObjectURL(file) });
      } else {
        toast.error(`File ${file.name} không phải là hình ảnh`);
      }
    });
    setImageFiles(prev => [...prev, ...newImages]);
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Vui lòng nhập tên sản phẩm';
    if (formData.price <= 0) errs.price = 'Giá phải lớn hơn 0';
    if (!formData.categoryId) errs.categoryId = 'Vui lòng chọn danh mục';
    if (!formData.description.trim()) errs.description = 'Vui lòng nhập mô tả';
    if (!product && imageFiles.length === 0) errs.images = 'Vui lòng thêm ít nhất một hình ảnh';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setIsSubmitting(true);
    try {
      let productId: string;
      if (product) {
        await productsApi.update(product.id, {
          name: formData.name,
          price: formData.price,
          categoryId: formData.categoryId,
          description: formData.description,
        });
        productId = product.id;
        toast.success('Đã cập nhật sản phẩm');
      } else {
        const created = await productsApi.create({
          name: formData.name,
          price: formData.price,
          categoryId: formData.categoryId,
          description: formData.description,
        });
        productId = created.id;
        toast.success('Đã thêm sản phẩm mới');
      }
      if (imageFiles.length > 0) {
        await productsApi.uploadImages(productId, imageFiles.map(img => img.file));
      }
      onSave();
    } catch (err: any) {
      toast.error(err?.message ?? 'Đã có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            {product ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên sản phẩm <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giá <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Danh mục <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Chọn danh mục</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {errors.categoryId && <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hình ảnh {!product && <span className="text-red-500">*</span>}
            </label>

            {product && product.images && product.images.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-2">Ảnh hiện có:</p>
                <div className="flex flex-wrap gap-2">
                  {product.images.map((img) => (
                    <img
                      key={img.id}
                      src={img.thumbnailUrl ?? img.imageUrl}
                      alt="product"
                      className="w-16 h-16 object-cover rounded border border-gray-200"
                    />
                  ))}
                </div>
              </div>
            )}

            <div
              ref={dragZoneRef}
              onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={(e) => { e.preventDefault(); if (e.currentTarget === dragZoneRef.current) setIsDragging(false); }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${
                isDragging ? 'border-orange-500 bg-orange-50' : 'border-gray-300 bg-gray-50 hover:border-orange-400'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => { if (e.target.files) handleFiles(e.target.files); }}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-2">
                <Upload className={isDragging ? 'text-orange-500' : 'text-gray-400'} size={32} />
                <p className="text-sm font-medium text-gray-700">
                  Kéo thả hình ảnh vào đây hoặc nhấp để chọn
                </p>
                <p className="text-xs text-gray-500">PNG, JPG, GIF tối đa 5MB</p>
              </div>
            </div>

            {errors.images && <p className="text-red-500 text-sm mt-2">{errors.images}</p>}

            {imageFiles.length > 0 && (
              <div className="mt-4 grid grid-cols-4 gap-3">
                {imageFiles.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={img.preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full aspect-square object-cover rounded border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader size={16} className="animate-spin" />}
              {isSubmitting ? 'Đang xử lý...' : product ? 'Cập nhật' : 'Thêm mới'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 text-gray-700 px-4 py-2 rounded-lg"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
