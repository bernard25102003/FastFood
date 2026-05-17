import { useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Email không hợp lệ');
      return;
    }

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    setSent(true);
    toast.success('Email đặt lại mật khẩu đã được gửi');
  };

  if (sent) {
    return (
      <div className="container mx-auto px-4 py-16 md:py-20">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
            <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">📧</span>
            </div>
            <h2 className="mb-4">Kiểm tra email của bạn</h2>
            <p className="text-muted-foreground mb-6">
              Chúng tôi đã gửi link đặt lại mật khẩu đến email <strong>{email}</strong>
            </p>
            <Link
              to="/login"
              className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90"
            >
              Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 md:py-20">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="text-xs uppercase tracking-[0.3em] text-primary font-bold mb-2">Account Recovery</div>
          <h1 className="mb-2 text-4xl">Quên Mật Khẩu</h1>
          <p className="text-muted-foreground">
            Nhập email để nhận link đặt lại mật khẩu
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-2">Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="example@email.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Đang gửi...' : 'Gửi link đặt lại mật khẩu'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <Link to="/login" className="text-primary hover:underline">
              Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
