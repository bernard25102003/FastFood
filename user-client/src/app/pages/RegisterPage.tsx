import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../services/api';
import { toast } from 'sonner';
import { Mail, ShieldCheck, KeyRound, ArrowRight } from 'lucide-react';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    otp: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendOtp = async () => {
    const email = formData.email.trim();
    if (!email) {
      setErrors((prev) => ({ ...prev, email: 'Vui lòng nhập email trước khi gửi OTP' }));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors((prev) => ({ ...prev, email: 'Email không đúng định dạng' }));
      return;
    }

    setSendingOtp(true);
    setErrors((prev) => ({ ...prev, email: '', otp: '' }));
    try {
      await authApi.sendRegisterOtp(email);
      toast.success('Mã xác thực OTP đã được gửi về email của bạn (qua Brevo)!');
      setOtpSent(true);
      setCountdown(60);
    } catch (error: any) {
      toast.error(error?.message || 'Không thể gửi mã OTP, vui lòng thử lại');
    } finally {
      setSendingOtp(false);
    }
  };

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
    if (!formData.otp.trim()) {
      newErrors.otp = 'Vui lòng nhập mã xác thực OTP nhận từ email';
    } else if (formData.otp.trim().length !== 6) {
      newErrors.otp = 'Mã OTP bao gồm 6 chữ số';
    }
    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ (cần 10 số)';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Vui lòng nhập địa chỉ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otpSent) {
      toast.error('Vui lòng nhấn "Gửi mã OTP" để nhận mã xác thực qua Email');
      return;
    }

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        address: formData.address,
        otp: formData.otp,
      });
      toast.success('Đăng ký tài khoản thành công!');
      navigate('/');
    } catch (error: any) {
      toast.error(error?.message || 'Đã có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            <ShieldCheck size={14} /> Xác thực bảo mật Brevo OTP
          </div>
          <h1 className="mb-2 text-3xl font-extrabold text-foreground">Đăng Ký Tài Khoản</h1>
          <p className="text-muted-foreground text-sm">
            Tạo tài khoản thành viên để đặt món ăn nhanh và nhận ưu đãi
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Họ và tên *</label>
              <input
                type="text"
                placeholder="Nguyễn Văn A"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-4 py-2.5 bg-background border ${
                  errors.name ? 'border-destructive' : 'border-border'
                } rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20`}
              />
              {errors.name && (
                <p className="text-destructive text-xs mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Địa chỉ Email *</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`flex-1 px-4 py-2.5 bg-background border ${
                    errors.email ? 'border-destructive' : 'border-border'
                  } rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20`}
                />
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={sendingOtp || countdown > 0}
                  className="px-4 py-2.5 bg-primary/10 text-primary hover:bg-primary/20 font-medium text-xs rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Mail size={14} />
                  {sendingOtp ? 'Đang gửi...' : countdown > 0 ? `${countdown}s` : 'Gửi mã OTP'}
                </button>
              </div>
              {errors.email && (
                <p className="text-destructive text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Ô nhập mã OTP khi đã nhấn gửi */}
            <div>
              <label className="block text-sm font-medium mb-1.5 flex items-center justify-between">
                <span>Mã xác thực OTP (6 chữ số) *</span>
                {otpSent && (
                  <span className="text-xs text-green-600 font-normal">Đã gửi mã đến email</span>
                )}
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Ví dụ: 123456"
                  value={formData.otp}
                  onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '') })}
                  className={`w-full px-4 py-2.5 pl-10 bg-background border ${
                    errors.otp ? 'border-destructive' : 'border-border'
                  } rounded-lg text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/20`}
                />
                <KeyRound size={16} className="absolute left-3 top-3 text-muted-foreground" />
              </div>
              {errors.otp && (
                <p className="text-destructive text-xs mt-1">{errors.otp}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Số điện thoại *</label>
                <input
                  type="tel"
                  placeholder="0901234567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full px-4 py-2.5 bg-background border ${
                    errors.phone ? 'border-destructive' : 'border-border'
                  } rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20`}
                />
                {errors.phone && (
                  <p className="text-destructive text-xs mt-1">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Địa chỉ giao hàng *</label>
                <input
                  type="text"
                  placeholder="123 Đường ABC, Quận 1"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className={`w-full px-4 py-2.5 bg-background border ${
                    errors.address ? 'border-destructive' : 'border-border'
                  } rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20`}
                />
                {errors.address && (
                  <p className="text-destructive text-xs mt-1">{errors.address}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Mật khẩu *</label>
                <input
                  type="password"
                  placeholder="Tối thiểu 6 ký tự"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full px-4 py-2.5 bg-background border ${
                    errors.password ? 'border-destructive' : 'border-border'
                  } rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20`}
                />
                {errors.password && (
                  <p className="text-destructive text-xs mt-1">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Nhập lại mật khẩu *</label>
                <input
                  type="password"
                  placeholder="Khớp với mật khẩu trên"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={`w-full px-4 py-2.5 bg-background border ${
                    errors.confirmPassword ? 'border-destructive' : 'border-border'
                  } rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20`}
                />
                {errors.confirmPassword && (
                  <p className="text-destructive text-xs mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Đang tạo tài khoản...' : 'Hoàn tất Đăng Ký'}
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Đã có tài khoản? </span>
            <Link to="/login" className="text-primary font-medium hover:underline">
              Đăng nhập ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
