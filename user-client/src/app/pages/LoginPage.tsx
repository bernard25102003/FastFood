import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export function LoginPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
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
      await login(formData.email, formData.password);
      toast.success('Đăng nhập thành công!');
      const redirect = searchParams.get('redirect') || '/';
      navigate(redirect);
    } catch (error) {
      toast.error('Email hoặc mật khẩu không đúng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 md:py-20">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="text-xs uppercase tracking-[0.3em] text-primary font-bold mb-2">Welcome Back</div>
          <h1 className="mb-2 text-4xl">Đăng Nhập</h1>
          <p className="text-muted-foreground">
            Chào mừng bạn quay trở lại!
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-2">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full px-4 py-2 bg-input-background border ${
                  errors.email ? 'border-destructive' : 'border-border'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-ring`}
                placeholder="example@email.com"
              />
              {errors.email && (
                <p className="text-destructive text-sm mt-1">{errors.email}</p>
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
                placeholder="Nhập mật khẩu"
              />
              {errors.password && (
                <p className="text-destructive text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4" />
                <span className="text-sm">Ghi nhớ đăng nhập</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                Quên mật khẩu?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Đang xử lý...' : 'Đăng nhập'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Chưa có tài khoản? </span>
            <Link to="/register" className="text-primary hover:underline">
              Đăng ký ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
