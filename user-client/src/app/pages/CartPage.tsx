import React from 'react';
import { Link, useNavigate } from 'react-router';
import { Trash2, Minus, Plus, ShoppingBag, ChevronRight, Flame, Truck, Clock3 } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

export function CartPage() {
  const { items, updateQuantity, removeFromCart, totalPrice } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div>
        <style>{cartStyles}</style>
        <div className="crt-root">
          <div className="crt-empty-wrap">
            <div className="crt-empty-card">
              <div className="crt-empty-badge">Giỏ hàng</div>
              <ShoppingBag className="crt-empty-icon" />
              <h2 className="crt-empty-title">Giỏ hàng trống</h2>
              <p className="crt-empty-sub">Hãy thêm sản phẩm vào giỏ hàng để tiếp tục</p>
              <Link to="/products" className="crt-empty-btn">
                Khám phá thực đơn <ChevronRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <style>{cartStyles}</style>
      <div className="crt-root">
        <div className="crt-hero">
          <div className="crt-hero-inner">
            <div className="crt-hero-label">🛒 Ready to checkout</div>
            <h1 className="crt-hero-title">Giỏ Hàng <span>Siêu Nhanh</span></h1>
          </div>
        </div>
      <div className="crt-body">
      <div className="crt-heading-row">
        <div className="crt-heading-main">Có {items.length} món trong giỏ</div>
        <div className="crt-heading-meta">
          <span><Truck size={14} /> Giao nhanh 30 phút</span>
          <span><Clock3 size={14} /> Cập nhật theo thời gian thực</span>
        </div>
      </div>

      <div className="crt-grid">
        {/* Cart Items */}
        <div className="crt-items-col">
          {items.map(item => (
            <div key={item.productId} className="crt-item-card">
              <div className="crt-item-img-wrap">
                <img
                  src={item.image}
                  alt={item.name}
                  className="crt-item-img"
                />
                <div className="crt-item-hot"><Flame size={12} /> Hot</div>
              </div>
              <div className="crt-item-main">
                <h3 className="crt-item-name">{item.name}</h3>
                <div className="crt-item-price">
                  {item.price.toLocaleString('vi-VN')}đ
                </div>
                <div className="crt-item-qty-row">
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="crt-qty-btn"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="crt-qty-val">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="crt-qty-btn"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="crt-item-side">
                <button
                  onClick={() => removeFromCart(item.productId)}
                  className="crt-remove-btn"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <div className="crt-item-total">
                  {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div>
          <div className="crt-summary-card">
            <h3 className="crt-summary-title">Thông tin đơn hàng</h3>
            <div className="crt-summary-list">
              <div className="crt-summary-row">
                <span>Tạm tính</span>
                <span>{totalPrice.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="crt-summary-row">
                <span>Phí vận chuyển</span>
                <span className="crt-free">Miễn phí</span>
              </div>
              <div className="crt-grand">
                <div className="crt-summary-row">
                  <span className="crt-grand-label">Tổng cộng</span>
                  <span className="crt-grand-price">
                    {totalPrice.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate('/checkout')}
              className="crt-checkout-btn"
            >
              Tiến hành thanh toán <ChevronRight size={19} />
            </button>
            <Link
              to="/products"
              className="crt-continue-link"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
      </div>
      </div>
    </div>
  );
}

const cartStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Nunito:wght@400;600;700;900&display=swap');

  .crt-root { font-family: 'Nunito', sans-serif; background: #f5f0eb; min-height: 100vh; }

  .crt-hero {
    background: #fff;
    border-bottom: 1px solid #ececec;
    padding: 36px 40px 28px;
    position: relative;
    overflow: hidden;
  }
  .crt-hero::before {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      -45deg,
      transparent,
      transparent 40px,
      rgba(204,0,0,0.06) 40px,
      rgba(204,0,0,0.06) 80px
    );
  }
  .crt-hero-inner { max-width: 1280px; margin: 0 auto; position: relative; z-index: 1; }
  .crt-hero-label {
    color: #CC0000; font-size: 12px; font-weight: 800;
    letter-spacing: 3px; text-transform: uppercase; margin-bottom: 8px;
  }
  .crt-hero-title {
    margin: 0; line-height: 1;
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(46px, 6vw, 72px);
    color: #111; letter-spacing: 1px;
  }
  .crt-hero-title span { color: #CC0000; }

  .crt-body { max-width: 1280px; margin: 0 auto; padding: 34px 40px 60px; }
  .crt-heading-row {
    display: flex; align-items: flex-end; justify-content: space-between;
    margin-bottom: 20px; gap: 14px; flex-wrap: wrap;
  }
  .crt-heading-main {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 34px; color: #111; letter-spacing: .5px;
  }
  .crt-heading-meta { display: flex; gap: 14px; flex-wrap: wrap; }
  .crt-heading-meta span {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 12px; font-weight: 700; color: #666;
    background: #fff; border: 1px solid #ececec; border-radius: 999px;
    padding: 6px 12px;
  }

  .crt-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 360px;
    gap: 24px;
    align-items: start;
  }
  .crt-items-col { display: flex; flex-direction: column; gap: 14px; }

  .crt-item-card {
    background: #fff;
    border: 1.5px solid #ececec;
    border-radius: 18px;
    padding: 14px;
    display: flex;
    gap: 14px;
    align-items: stretch;
    transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease;
    animation: crt-in .35s cubic-bezier(.22,1,.36,1) both;
  }
  .crt-item-card:hover { transform: translateY(-3px); border-color: #CC0000; box-shadow: 0 12px 26px rgba(0,0,0,.08); }
  @keyframes crt-in {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .crt-item-img-wrap {
    width: 110px; height: 110px; border-radius: 14px; overflow: hidden;
    position: relative; flex-shrink: 0; background: #f5f0eb;
  }
  .crt-item-img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .crt-item-hot {
    position: absolute; top: 8px; left: 8px;
    background: #CC0000; color: #fff; border-radius: 999px;
    display: inline-flex; align-items: center; gap: 4px;
    padding: 3px 8px; font-size: 10px; font-weight: 800; letter-spacing: .4px;
    text-transform: uppercase;
  }

  .crt-item-main { flex: 1; min-width: 0; }
  .crt-item-name {
    margin: 0 0 8px;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 26px; color: #111; letter-spacing: .4px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .crt-item-price { color: #CC0000; font-size: 16px; font-weight: 800; margin-bottom: 12px; }
  .crt-item-qty-row { display: flex; align-items: center; gap: 10px; }
  .crt-qty-btn {
    width: 34px; height: 34px; border-radius: 10px;
    border: 1.5px solid #e5e5e5; background: #fff;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: #444; transition: .2s;
  }
  .crt-qty-btn:hover { border-color: #CC0000; background: #fff5f5; color: #CC0000; }
  .crt-qty-val {
    min-width: 44px; text-align: center; font-size: 16px;
    font-weight: 800; color: #111;
  }

  .crt-item-side {
    display: flex; flex-direction: column; justify-content: space-between; align-items: flex-end;
    gap: 10px;
  }
  .crt-remove-btn {
    width: 36px; height: 36px; border-radius: 10px; border: none;
    background: #fff5f5; color: #ef4444; cursor: pointer;
    display: flex; align-items: center; justify-content: center; transition: .2s;
  }
  .crt-remove-btn:hover { background: #ef4444; color: #fff; transform: scale(1.05); }
  .crt-item-total {
    color: #111; font-size: 17px; font-weight: 900;
    background: #f5f0eb; padding: 6px 10px; border-radius: 10px;
  }

  .crt-summary-card {
    background: #fff;
    border: 1.5px solid #ececec;
    border-radius: 18px;
    padding: 20px;
    position: sticky; top: 84px;
    box-shadow: 0 2px 10px rgba(0,0,0,.05);
  }
  .crt-summary-title {
    margin: 0 0 14px;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 28px; letter-spacing: .5px; color: #111;
  }
  .crt-summary-list { margin-bottom: 16px; }
  .crt-summary-row {
    display: flex; justify-content: space-between; align-items: center;
    font-size: 14px; font-weight: 700; color: #666; margin-bottom: 10px;
  }
  .crt-free { color: #16a34a; font-weight: 800; }
  .crt-grand {
    border-top: 1px dashed #e3ddd7; padding-top: 12px; margin-top: 2px;
  }
  .crt-grand-label {
    font-family: 'Bebas Neue', sans-serif; font-size: 20px; color: #111; letter-spacing: .4px;
  }
  .crt-grand-price {
    font-family: 'Bebas Neue', sans-serif; font-size: 30px; color: #CC0000; letter-spacing: .6px;
  }

  .crt-checkout-btn {
    width: 100%; border: none; border-radius: 14px; cursor: pointer;
    background: #CC0000; color: #fff;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    padding: 14px 18px;
    font-family: 'Bebas Neue', sans-serif; font-size: 24px; letter-spacing: 1px;
    transition: transform .18s, box-shadow .18s, background .18s;
    box-shadow: 0 8px 24px rgba(204,0,0,.28);
    margin-bottom: 10px;
  }
  .crt-checkout-btn:hover { transform: translateY(-2px); background: #a30000; box-shadow: 0 12px 30px rgba(204,0,0,.32); }
  .crt-continue-link {
    display: block; text-align: center; font-size: 13px;
    color: #777; font-weight: 700; text-decoration: none;
  }
  .crt-continue-link:hover { color: #CC0000; }

  .crt-empty-wrap { max-width: 1280px; margin: 0 auto; padding: 70px 40px; }
  .crt-empty-card {
    max-width: 620px; margin: 0 auto; text-align: center;
    background: #fff; border: 1.5px solid #ececec; border-radius: 24px;
    padding: 46px 28px; box-shadow: 0 2px 12px rgba(0,0,0,.05);
  }
  .crt-empty-badge {
    display: inline-block; margin-bottom: 10px;
    background: #fde8e8; color: #CC0000; border-radius: 999px;
    font-size: 11px; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase;
    padding: 6px 12px;
  }
  .crt-empty-icon { width: 84px; height: 84px; margin: 0 auto 12px; color: #CC0000; }
  .crt-empty-title {
    margin: 0 0 8px; font-family: 'Bebas Neue', sans-serif;
    font-size: 40px; color: #111; letter-spacing: .8px;
  }
  .crt-empty-sub { margin: 0 0 22px; color: #666; font-size: 15px; font-weight: 600; }
  .crt-empty-btn {
    display: inline-flex; align-items: center; gap: 7px;
    background: #CC0000; color: #fff; text-decoration: none;
    padding: 12px 20px; border-radius: 12px; font-weight: 800;
    transition: .2s;
  }
  .crt-empty-btn:hover { background: #a30000; transform: translateY(-2px); }

  @media (max-width: 980px) {
    .crt-hero { padding: 30px 20px 24px; }
    .crt-body { padding: 24px 20px 44px; }
    .crt-grid { grid-template-columns: 1fr; }
    .crt-summary-card { position: static; }
  }
`;
