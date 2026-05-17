import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { usersApi } from '../services/api';
import { toast } from 'sonner';

export function ChangePasswordPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (authLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
    }
    if (!formData.newPassword) {
      newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Mật khẩu phải có ít nhất 8 ký tự';
    }
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
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
      await usersApi.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      toast.success('Đổi mật khẩu thành công!');
      navigate('/');
    } catch (error: any) {
      toast.error(error?.message ?? 'Đổi mật khẩu thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 md:py-20">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="text-xs uppercase tracking-[0.3em] text-primary font-bold mb-2">Security</div>
          <h1 className="mb-2 text-4xl">Đổi Mật Khẩu</h1>
          <p className="text-muted-foreground">
            Cập nhật mật khẩu của bạn
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-2">Mật khẩu hiện tại *</label>
              <input
                type="password"
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                className={`w-full px-4 py-2 bg-input-background border ${
                  errors.currentPassword ? 'border-destructive' : 'border-border'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-ring`}
              />
              {errors.currentPassword && (
                <p className="text-destructive text-sm mt-1">{errors.currentPassword}</p>
              )}
            </div>

            <div>
              <label className="block mb-2">Mật khẩu mới *</label>
              <input
                type="password"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                className={`w-full px-4 py-2 bg-input-background border ${
                  errors.newPassword ? 'border-destructive' : 'border-border'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-ring`}
              />
              {errors.newPassword && (
                <p className="text-destructive text-sm mt-1">{errors.newPassword}</p>
              )}
            </div>

            <div>
              <label className="block mb-2">Xác nhận mật khẩu mới *</label>
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
              {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
