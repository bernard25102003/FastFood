import { Link } from 'react-router';

export function NotFoundPage() {
  return (
    <div className="container mx-auto px-4 py-16 md:py-20 text-center">
      <div className="max-w-xl mx-auto bg-card border border-border rounded-2xl p-10 shadow-sm">
        <div className="text-xs uppercase tracking-[0.3em] text-primary font-bold mb-2">Oops</div>
        <div className="text-8xl mb-4 text-primary">404</div>
        <h1 className="mb-4 text-4xl">Không tìm thấy trang</h1>
        <p className="text-muted-foreground mb-8">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển
        </p>
        <Link
          to="/"
          className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90"
        >
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}
