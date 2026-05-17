import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Vui lòng nhập họ tên';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Vui lòng nhập địa chỉ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      await register(formData);
      toast.success('Đăng ký thành công!');
      navigate('/');
    } catch (error) {
      toast.error((error as Error).message || 'Đã có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 md:py-20">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="text-xs uppercase tracking-[0.3em] text-primary font-bold mb-2">Create Account</div>
          <h1 className="mb-2 text-4xl">Đăng Ký</h1>
          <p className="text-muted-foreground">
            Tạo tài khoản mới để bắt đầu
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-2">Họ tên *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-4 py-2 bg-input-background border ${
                  errors.name ? 'border-destructive' : 'border-border'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-ring`}
              />
              {errors.name && (
                <p className="text-destructive text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block mb-2">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full px-4 py-2 bg-input-background border ${
                  errors.email ? 'border-destructive' : 'border-border'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-ring`}
              />
              {errors.email && (
                <p className="text-destructive text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block mb-2">Số điện thoại *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={`w-full px-4 py-2 bg-input-background border ${
                  errors.phone ? 'border-destructive' : 'border-border'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-ring`}
              />
              {errors.phone && (
                <p className="text-destructive text-sm mt-1">{errors.phone}</p>
              )}
            </div>

            <div>
              <label className="block mb-2">Địa chỉ *</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className={`w-full px-4 py-2 bg-input-background border ${
                  errors.address ? 'border-destructive' : 'border-border'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-ring`}
              />
              {errors.address && (
                <p className="text-destructive text-sm mt-1">{errors.address}</p>
              )}
            </div>

            <div>
              <label className="block mb-2">Mật khẩu *</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`w-full px-4 py-2 bg-input-background border ${
                  errors.password ? 'border-destructive' : 'border-border'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-ring`}
              />
              {errors.password && (
                <p className="text-destructive text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block mb-2">Xác nhận mật khẩu *</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className={`w-full px-4 py-2 bg-input-background border ${
                  errors.confirmPassword ? 'border-destructive' : 'border-border'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-ring`}
              />
              {errors.confirmPassword && (
                <p className="text-destructive text-sm mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Đang xử lý...' : 'Đăng ký'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Đã có tài khoản? </span>
            <Link to="/login" className="text-primary hover:underline">
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
