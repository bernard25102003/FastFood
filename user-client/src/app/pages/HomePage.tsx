import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { Star, TrendingUp, ChevronRight, Flame, Clock, MapPin } from 'lucide-react';
import { categoriesApi, productsApi, type Category, type Product } from '../services/api';

export function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set());
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    categoriesApi.getAll().then(data => setCategories(data || [])).catch(() => {});
    productsApi
      .getAll({ sortBy: 'soldCount', sortOrder: 'desc', limit: 6 })
      .then(res => setFeaturedProducts(res?.items || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = cardRefs.current.indexOf(entry.target as HTMLAnchorElement);
            if (idx !== -1) {
              setTimeout(() => {
                setVisibleCards(prev => new Set([...prev, idx]));
              }, idx * 100);
            }
          }
        });
      },
      { threshold: 0.15 }
    );
    cardRefs.current.forEach(ref => ref && observer.observe(ref));
    return () => observer.disconnect();
  }, [featuredProducts]);

  const categoryEmoji = (idx: number) => {
    const emojis = ['🍔', '🍕', '🍗', '🍝', '🥤', '🍰'];
    return emojis[idx % emojis.length];
  };

  return (
    <div style={{ fontFamily: "'Bebas Neue', 'Anton', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Anton&family=Nunito:wght@400;600;700;900&display=swap');

        .hfb-root { font-family: 'Nunito', sans-serif; }

        /* Hero */
        .hfb-hero {
          position: relative;
          overflow: hidden;
          background: #CC0000;
          min-height: 92vh;
          display: flex;
          align-items: center;
        }
        .hfb-hero-bg {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse at 20% 50%, #FF6B00 0%, transparent 50%),
            radial-gradient(ellipse at 80% 20%, #FF0000 0%, transparent 45%),
            #CC0000;
          z-index: 0;
        }
        .hfb-hero-stripes {
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 40px,
            rgba(0,0,0,0.04) 40px,
            rgba(0,0,0,0.04) 80px
          );
          z-index: 1;
        }
        .hfb-hero-content {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          padding: 60px 40px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }
        .hfb-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.15);
          border: 1.5px solid rgba(255,255,255,0.35);
          color: #fff;
          font-family: 'Nunito', sans-serif;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          padding: 8px 18px;
          border-radius: 999px;
          margin-bottom: 24px;
          animation: hfb-fadein 0.6s ease both;
        }
        .hfb-hero-title {
          font-family: 'Bebas Neue', 'Anton', sans-serif;
          font-size: clamp(52px, 7vw, 96px);
          line-height: 0.95;
          color: #fff;
          margin: 0 0 16px;
          letter-spacing: 1px;
          animation: hfb-slidein 0.7s cubic-bezier(.22,1,.36,1) both;
          animation-delay: 0.1s;
        }
        .hfb-hero-title span {
          color: #FFDE00;
          display: block;
        }
        .hfb-hero-subtitle {
          font-family: 'Nunito', sans-serif;
          font-size: 18px;
          font-weight: 600;
          color: rgba(255,255,255,0.85);
          margin: 0 0 36px;
          line-height: 1.6;
          animation: hfb-fadein 0.8s ease both;
          animation-delay: 0.2s;
        }
        .hfb-hero-cta {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: #FFDE00;
          color: #111;
          font-family: 'Bebas Neue', 'Anton', sans-serif;
          font-size: 22px;
          letter-spacing: 1.5px;
          padding: 18px 40px;
          border-radius: 8px;
          text-decoration: none;
          transition: transform 0.18s, box-shadow 0.18s;
          box-shadow: 0 8px 24px rgba(0,0,0,0.25);
          animation: hfb-fadein 0.9s ease both;
          animation-delay: 0.3s;
        }
        .hfb-hero-cta:hover {
          transform: translateY(-3px) scale(1.03);
          box-shadow: 0 14px 32px rgba(0,0,0,0.32);
        }
        .hfb-hero-info {
          display: flex;
          gap: 28px;
          margin-top: 32px;
          animation: hfb-fadein 1s ease both;
          animation-delay: 0.4s;
        }
        .hfb-hero-info-item {
          display: flex;
          align-items: center;
          gap: 8px;
          color: rgba(255,255,255,0.8);
          font-family: 'Nunito', sans-serif;
          font-size: 14px;
          font-weight: 600;
        }
        .hfb-hero-visual {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: hfb-float 3s ease-in-out infinite;
        }
        .hfb-hero-circle {
          width: 420px;
          height: 420px;
          border-radius: 50%;
          background: rgba(255,255,255,0.08);
          border: 2px solid rgba(255,255,255,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 180px;
          position: relative;
        }
        .hfb-hero-circle::before {
          content: '';
          position: absolute;
          inset: -20px;
          border-radius: 50%;
          border: 2px dashed rgba(255,255,255,0.2);
          animation: hfb-spin 20s linear infinite;
        }
        .hfb-hero-chip {
          position: absolute;
          background: #fff;
          border-radius: 12px;
          padding: 10px 16px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.2);
          font-family: 'Nunito', sans-serif;
          font-size: 13px;
          font-weight: 700;
          color: #111;
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
          animation: hfb-pulse 2s ease-in-out infinite;
        }
        .hfb-hero-chip.top { top: 40px; right: -20px; animation-delay: 0s; }
        .hfb-hero-chip.mid { bottom: 80px; left: -30px; animation-delay: 0.8s; }
        .hfb-hero-chip.bot { top: 130px; left: -10px; animation-delay: 1.4s; }
        .hfb-hero-chip .dot {
          width: 8px; height: 8px; border-radius: 50%;
        }
        .hfb-hero-chip .dot.red { background: #CC0000; }
        .hfb-hero-chip .dot.yellow { background: #FFDE00; }
        .hfb-hero-chip .dot.green { background: #22C55E; }

        /* Ticker */
        .hfb-ticker {
          background: #FFDE00;
          overflow: hidden;
          padding: 12px 0;
        }
        .hfb-ticker-inner {
          display: flex;
          gap: 0;
          animation: hfb-ticker 30s linear infinite;
          width: max-content;
        }
        .hfb-ticker-item {
          font-family: 'Bebas Neue', 'Anton', sans-serif;
          font-size: 17px;
          letter-spacing: 2px;
          color: #111;
          padding: 0 40px;
          white-space: nowrap;
        }
        .hfb-ticker-dot {
          color: #CC0000;
          font-size: 20px;
        }

        /* Categories */
        .hfb-cats {
          padding: 80px 40px;
          background: #fff;
          max-width: 1280px;
          margin: 0 auto;
        }
        .hfb-section-label {
          font-family: 'Nunito', sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #CC0000;
          margin-bottom: 10px;
        }
        .hfb-section-title {
          font-family: 'Bebas Neue', 'Anton', sans-serif;
          font-size: clamp(36px, 5vw, 60px);
          color: #111;
          margin: 0 0 48px;
          line-height: 1;
          letter-spacing: 1px;
        }
        .hfb-cats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 16px;
        }
        .hfb-cat-card {
          background: #fff;
          border: 1.5px solid #ececec;
          border-radius: 16px;
          padding: 28px 16px 22px;
          text-align: center;
          text-decoration: none;
          display: block;
          transition: transform 0.22s cubic-bezier(.22,1,.36,1), border-color 0.22s, background 0.22s;
          position: relative;
          overflow: hidden;
        }
        .hfb-cat-card::before {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 3px;
          background: #CC0000;
          transform: scaleX(0);
          transition: transform 0.25s ease;
          transform-origin: left;
        }
        .hfb-cat-card:hover {
          transform: translateY(-6px);
          border-color: #CC0000;
          background: #fff5f5;
        }
        .hfb-cat-card:hover::before { transform: scaleX(1); }
        .hfb-cat-emoji { font-size: 40px; display: block; margin-bottom: 12px; }
        .hfb-cat-name {
          font-family: 'Nunito', sans-serif;
          font-size: 13px;
          font-weight: 700;
          color: #111;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* Products */
        .hfb-products-section {
          background: #f5f0eb;
          padding: 80px 40px;
        }
        .hfb-products-inner {
          max-width: 1280px;
          margin: 0 auto;
        }
        .hfb-products-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 48px;
        }
        .hfb-products-section .hfb-section-label { color: #CC0000; }
        .hfb-products-section .hfb-section-title { color: #111; }
        .hfb-view-all {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: 'Nunito', sans-serif;
          font-size: 14px;
          font-weight: 700;
          color: #CC0000;
          text-decoration: none;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          transition: gap 0.2s;
        }
        .hfb-view-all:hover { gap: 12px; }

        .hfb-products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 24px;
        }
        .hfb-product-card {
          background: #fff;
          border-radius: 20px;
          overflow: hidden;
          text-decoration: none;
          display: block;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
          transition: transform 0.35s cubic-bezier(.22,1,.36,1), box-shadow 0.35s;
          opacity: 0;
          transform: translateY(32px);
        }
        .hfb-product-card.visible {
          opacity: 1;
          transform: translateY(0);
          transition: opacity 0.55s cubic-bezier(.22,1,.36,1), transform 0.55s cubic-bezier(.22,1,.36,1), box-shadow 0.3s;
        }
        .hfb-product-card:hover {
          transform: translateY(-8px) scale(1.01);
          box-shadow: 0 20px 48px rgba(0,0,0,0.15);
        }
        .hfb-product-img-wrap {
          position: relative;
          aspect-ratio: 4/3;
          overflow: hidden;
          background: #f5f0eb;
        }
        .hfb-product-img-wrap img {
          width: 100%; height: 100%;
          object-fit: cover;
          transition: transform 0.5s cubic-bezier(.22,1,.36,1);
          display: block;
        }
        .hfb-product-card:hover .hfb-product-img-wrap img {
          transform: scale(1.08);
        }
        .hfb-product-badge {
          position: absolute;
          top: 14px; left: 14px;
          background: #CC0000;
          color: #fff;
          font-family: 'Nunito', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .hfb-product-body {
          padding: 20px 22px 22px;
        }
        .hfb-product-name {
          font-family: 'Bebas Neue', 'Anton', sans-serif;
          font-size: 22px;
          color: #111;
          margin: 0 0 8px;
          letter-spacing: 0.5px;
          line-height: 1.2;
        }
        .hfb-product-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 14px;
        }
        .hfb-stars {
          display: flex;
          align-items: center;
          gap: 3px;
          background: #fff7e0;
          padding: 4px 10px;
          border-radius: 999px;
          font-family: 'Nunito', sans-serif;
          font-size: 13px;
          font-weight: 700;
          color: #b45309;
        }
        .hfb-review-count {
          font-family: 'Nunito', sans-serif;
          font-size: 12px;
          color: #888;
          font-weight: 600;
        }
        .hfb-product-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1.5px solid #f5f0eb;
          padding-top: 14px;
        }
        .hfb-price {
          font-family: 'Bebas Neue', 'Anton', sans-serif;
          font-size: 26px;
          color: #CC0000;
          letter-spacing: 0.5px;
        }
        .hfb-sold {
          font-family: 'Nunito', sans-serif;
          font-size: 12px;
          font-weight: 700;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .hfb-order-btn {
          width: 40px;
          height: 40px;
          background: #CC0000;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s, background 0.2s;
          flex-shrink: 0;
        }
        .hfb-product-card:hover .hfb-order-btn {
          transform: scale(1.12) rotate(-5deg);
          background: #a30000;
        }

        /* Banner strip */
        .hfb-strip {
          background: #CC0000;
          padding: 60px 40px;
          text-align: center;
        }
        .hfb-strip h2 {
          font-family: 'Bebas Neue', 'Anton', sans-serif;
          font-size: clamp(32px, 5vw, 56px);
          color: #fff;
          margin: 0 0 12px;
          letter-spacing: 1px;
        }
        .hfb-strip p {
          font-family: 'Nunito', sans-serif;
          font-size: 16px;
          color: rgba(255,255,255,0.8);
          margin: 0 0 32px;
          font-weight: 600;
        }
        .hfb-strip a {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #FFDE00;
          color: #111;
          font-family: 'Bebas Neue', 'Anton', sans-serif;
          font-size: 20px;
          letter-spacing: 1px;
          padding: 16px 36px;
          border-radius: 8px;
          text-decoration: none;
          transition: transform 0.18s, box-shadow 0.18s;
          box-shadow: 0 6px 20px rgba(0,0,0,0.2);
        }
        .hfb-strip a:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(0,0,0,0.28);
        }

        /* Keyframes */
        @keyframes hfb-fadein {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes hfb-slidein {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes hfb-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-14px); }
        }
        @keyframes hfb-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes hfb-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes hfb-ticker {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        @media (max-width: 768px) {
          .hfb-hero-content { grid-template-columns: 1fr; gap: 32px; padding: 48px 20px; }
          .hfb-hero-visual { display: none; }
          .hfb-cats, .hfb-products-section { padding: 60px 20px; }
          .hfb-products-header { flex-direction: column; align-items: flex-start; gap: 12px; }
        }
      `}</style>

      <div className="hfb-root">

        {/* ── HERO ── */}
        <section className="hfb-hero">
          <div className="hfb-hero-bg" />
          <div className="hfb-hero-stripes" />
          <div className="hfb-hero-content">
            <div>
              <div className="hfb-hero-badge">
                <Flame size={14} />
                Giao hàng trong 30 phút
              </div>
              <h1 className="hfb-hero-title">
                Đồ Ăn Nhanh
                <span>Ngon Miệng</span>
              </h1>
              <p className="hfb-hero-subtitle">
                Nóng hổi, tươi ngon — giao tận nơi<br />chỉ trong 30 phút mỗi ngày
              </p>
              <Link to="/products" className="hfb-hero-cta">
                Đặt hàng ngay <ChevronRight size={20} />
              </Link>
              <div className="hfb-hero-info">
                <div className="hfb-hero-info-item">
                  <Clock size={16} />
                  30 phút giao hàng
                </div>
                <div className="hfb-hero-info-item">
                  <MapPin size={16} />
                  Toàn thành phố
                </div>
                <div className="hfb-hero-info-item">
                  <Star size={16} fill="currentColor" />
                  4.9 / 5
                </div>
              </div>
            </div>

            <div className="hfb-hero-visual">
              <div className="hfb-hero-circle">
                🍗
                <div className="hfb-hero-chip top">
                  <span className="dot green" />
                  Đang mở cửa
                </div>
                <div className="hfb-hero-chip mid">
                  <span className="dot yellow" />
                  ⭐ Bán chạy #1
                </div>
                <div className="hfb-hero-chip bot">
                  <span className="dot red" />
                  🔥 Hôm nay giảm 20%
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── TICKER ── */}
        <div className="hfb-ticker">
          <div className="hfb-ticker-inner" aria-hidden="true">
            {[...Array(2)].flatMap(() => [
              'Gà Rán Giòn',
              '🔥',
              'Burger Bò Wagyu',
              '⭐',
              'Giao Nhanh 30 Phút',
              '🍔',
              'Combo Siêu Tiết Kiệm',
              '🍕',
              'Khai Trương – Giảm 20%',
              '🥤',
              'Topping Tự Chọn',
              '🍗',
            ].map((t, i) => (
              <span key={i} className="hfb-ticker-item">{t}</span>
            )))}
          </div>
        </div>

        {/* ── CATEGORIES ── */}
        <div style={{ background: '#fff' }}>
          <div className="hfb-cats">
            <div className="hfb-section-label">Khám phá</div>
            <div className="hfb-section-title">Danh Mục Sản Phẩm</div>
            <div className="hfb-cats-grid">
              {categories.map((category, idx) => (
                <Link
                  key={category.id}
                  to={`/products?category=${category.id}`}
                  className="hfb-cat-card"
                >
                  <span className="hfb-cat-emoji">
                    {category.icon || categoryEmoji(idx)}
                  </span>
                  <span className="hfb-cat-name">{category.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── FEATURED PRODUCTS ── */}
        <section className="hfb-products-section">
          <div className="hfb-products-inner">
            <div className="hfb-products-header">
              <div>
                <div className="hfb-section-label">
                  <TrendingUp size={12} style={{ display: 'inline', marginRight: 4 }} />
                  Bán chạy nhất
                </div>
                <div className="hfb-section-title" style={{ marginBottom: 0 }}>
                  Sản Phẩm Nổi Bật
                </div>
              </div>
              <Link to="/products" className="hfb-view-all">
                Xem tất cả <ChevronRight size={16} />
              </Link>
            </div>

            <div className="hfb-products-grid">
              {featuredProducts.map((product, idx) => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className={`hfb-product-card ${visibleCards.has(idx) ? 'visible' : ''}`}
                  ref={el => { cardRefs.current[idx] = el; }}
                >
                  <div className="hfb-product-img-wrap">
                    <img
                      src={product.images?.[0]?.imageUrl || '/placeholder.jpg'}
                      alt={product.name}
                    />
                    <div className="hfb-product-badge">
                      <Flame size={11} />
                      Hot
                    </div>
                  </div>
                  <div className="hfb-product-body">
                    <div className="hfb-product-name">{product.name}</div>
                    <div className="hfb-product-meta">
                      <div className="hfb-stars">
                        <Star size={12} fill="currentColor" style={{ color: '#f59e0b' }} />
                        {parseFloat(product.avgRating).toFixed(1)}
                      </div>
                      <span className="hfb-review-count">
                        {product.reviewCount} đánh giá
                      </span>
                    </div>
                    <div className="hfb-product-footer">
                      <div>
                        <div className="hfb-price">
                          {parseFloat(product.price).toLocaleString('vi-VN')}đ
                        </div>
                        <div className="hfb-sold">Đã bán {product.soldCount}</div>
                      </div>
                      <div className="hfb-order-btn" aria-hidden="true">
                        <ChevronRight size={20} color="#fff" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA STRIP ── */}
        <div className="hfb-strip">
          <h2>Đói Rồi? Đặt Ngay Thôi!</h2>
          <p>Hàng trăm món ngon đang chờ bạn — giao nhanh, tươi ngon, giá hợp lý</p>
          <Link to="/products">
            Xem Toàn Bộ Thực Đơn <ChevronRight size={20} />
          </Link>
        </div>

      </div>
    </div>
  );
}