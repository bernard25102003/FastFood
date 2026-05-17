import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { ShoppingCart, User, LogOut, Package, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

export function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartBump, setCartBump] = useState(false);

  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // bump animation when cart count changes
  const prevCount = typeof window !== 'undefined'
    ? (window as any).__hdrCartCount ?? 0
    : 0;
  useEffect(() => {
    if (cartItemCount !== prevCount && cartItemCount > 0) {
      (window as any).__hdrCartCount = cartItemCount;
      setCartBump(true);
      setTimeout(() => setCartBump(false), 500);
    }
  }, [cartItemCount]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Nunito:wght@400;600;700;900&display=swap');

        .hdr-root {
          position: sticky;
          top: 0;
          z-index: 100;
          font-family: 'Nunito', sans-serif;
          transition: background 0.3s, box-shadow 0.3s;
          background: #CC0000;
        }
        .hdr-root.scrolled {
          background: #a30000;
          box-shadow: 0 4px 32px rgba(0,0,0,0.28);
        }

        /* top accent stripe */
        .hdr-stripe {
          height: 3px;
          background: repeating-linear-gradient(
            90deg,
            #FFDE00 0px, #FFDE00 32px,
            #CC0000 32px, #CC0000 40px
          );
        }

        .hdr-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 40px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }

        /* Logo */
        .hdr-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          flex-shrink: 0;
        }
        .hdr-logo-icon {
          width: 42px; height: 42px;
          background: #FFDE00;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          transition: transform 0.25s cubic-bezier(.22,1,.36,1);
          flex-shrink: 0;
        }
        .hdr-logo:hover .hdr-logo-icon { transform: rotate(-8deg) scale(1.1); }
        .hdr-logo-name {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 26px;
          color: #fff;
          letter-spacing: 1px;
          line-height: 1;
        }
        .hdr-logo-name span { color: #FFDE00; }

        /* Nav */
        .hdr-nav {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .hdr-nav-link {
          position: relative;
          padding: 7px 16px;
          border-radius: 8px;
          text-decoration: none;
          font-size: 14px;
          font-weight: 700;
          color: rgba(255,255,255,0.8);
          text-transform: uppercase;
          letter-spacing: 0.8px;
          transition: color 0.15s, background 0.15s;
          white-space: nowrap;
        }
        .hdr-nav-link::after {
          content: '';
          position: absolute;
          bottom: 2px; left: 16px; right: 16px;
          height: 2px;
          background: #FFDE00;
          border-radius: 999px;
          transform: scaleX(0);
          transition: transform 0.2s cubic-bezier(.22,1,.36,1);
          transform-origin: left;
        }
        .hdr-nav-link:hover { color: #fff; background: rgba(255,255,255,0.1); }
        .hdr-nav-link:hover::after { transform: scaleX(1); }
        .hdr-nav-link.active { color: #FFDE00; }
        .hdr-nav-link.active::after { transform: scaleX(1); }

        /* Actions */
        .hdr-actions {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }

        .hdr-icon-btn {
          position: relative;
          width: 40px; height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255,255,255,0.85);
          text-decoration: none;
          background: rgba(255,255,255,0.1);
          border: none;
          cursor: pointer;
          transition: background 0.15s, color 0.15s, transform 0.15s;
          flex-shrink: 0;
        }
        .hdr-icon-btn:hover {
          background: rgba(255,255,255,0.2);
          color: #fff;
          transform: translateY(-1px);
        }
        .hdr-icon-btn.logout:hover { background: rgba(0,0,0,0.2); }

        .hdr-cart-badge {
          position: absolute;
          top: -4px; right: -4px;
          background: #FFDE00;
          color: #111;
          font-size: 10px;
          font-weight: 900;
          width: 18px; height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
        }
        .hdr-cart-badge.bump {
          animation: hdr-bump 0.45s cubic-bezier(.22,1,.36,1);
        }
        @keyframes hdr-bump {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.6); }
          70%  { transform: scale(0.9); }
          100% { transform: scale(1); }
        }

        /* User chip */
        .hdr-user-chip {
          display: flex;
          align-items: center;
          gap: 7px;
          background: rgba(255,255,255,0.12);
          border-radius: 999px;
          padding: 5px 14px 5px 8px;
          color: #fff;
          font-size: 13px;
          font-weight: 700;
        }
        .hdr-user-avatar {
          width: 26px; height: 26px;
          border-radius: 50%;
          background: #FFDE00;
          color: #111;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .hdr-user-name {
          max-width: 100px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* Login btn */
        .hdr-login-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #FFDE00;
          color: #111;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 17px;
          letter-spacing: 1px;
          padding: 9px 20px;
          border-radius: 10px;
          text-decoration: none;
          transition: transform 0.18s, box-shadow 0.18s, background 0.18s;
          box-shadow: 0 3px 12px rgba(0,0,0,0.18);
          white-space: nowrap;
        }
        .hdr-login-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.24);
          background: #ffe833;
        }

        /* Divider */
        .hdr-divider {
          width: 1px;
          height: 24px;
          background: rgba(255,255,255,0.2);
          flex-shrink: 0;
        }

        /* Mobile menu btn */
        .hdr-mobile-btn {
          display: none;
          width: 40px; height: 40px;
          border-radius: 10px;
          border: none;
          background: rgba(255,255,255,0.1);
          color: #fff;
          cursor: pointer;
          align-items: center;
          justify-content: center;
          transition: background 0.15s;
        }
        .hdr-mobile-btn:hover { background: rgba(255,255,255,0.2); }

        /* Mobile drawer */
        .hdr-mobile-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          z-index: 99;
          animation: hdr-fadein 0.2s ease;
        }
        @keyframes hdr-fadein { from { opacity: 0; } to { opacity: 1; } }
        .hdr-mobile-drawer {
          position: fixed;
          top: 0; right: 0; bottom: 0;
          width: 280px;
          background: #111;
          z-index: 100;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          animation: hdr-slidein 0.28s cubic-bezier(.22,1,.36,1);
        }
        @keyframes hdr-slidein {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .hdr-drawer-close {
          align-self: flex-end;
          width: 36px; height: 36px;
          border-radius: 8px;
          border: 1.5px solid #333;
          background: none;
          color: #aaa;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 8px;
          transition: border-color 0.15s, color 0.15s;
        }
        .hdr-drawer-close:hover { border-color: #CC0000; color: #fff; }
        .hdr-drawer-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 13px 16px;
          border-radius: 10px;
          text-decoration: none;
          font-size: 15px;
          font-weight: 700;
          color: #aaa;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          transition: background 0.15s, color 0.15s;
          border: none;
          background: none;
          cursor: pointer;
          width: 100%;
          text-align: left;
        }
        .hdr-drawer-link:hover, .hdr-drawer-link.active { background: #1f1f1f; color: #fff; }
        .hdr-drawer-link.active { color: #FFDE00; }
        .hdr-drawer-divider { height: 1px; background: #222; margin: 6px 0; }

        @media (max-width: 768px) {
          .hdr-inner { padding: 0 20px; }
          .hdr-nav { display: none; }
          .hdr-user-name { display: none; }
          .hdr-mobile-btn { display: flex; }
          .hdr-mobile-open .hdr-mobile-overlay { display: block; }
          .hdr-login-btn { font-size: 14px; padding: 8px 14px; }
        }
      `}</style>

      <header className={`hdr-root ${scrolled ? 'scrolled' : ''} ${mobileOpen ? 'hdr-mobile-open' : ''}`}>
        <div className="hdr-stripe" aria-hidden="true" />
        <div className="hdr-inner">

          {/* Logo */}
          <Link to="/" className="hdr-logo">
            <div className="hdr-logo-icon">🍔</div>
            <span className="hdr-logo-name">Fast<span>Food</span></span>
          </Link>

          {/* Nav */}
          <nav className="hdr-nav" aria-label="Main navigation">
            <Link to="/" className={`hdr-nav-link ${isActive('/') ? 'active' : ''}`}>
              Trang chủ
            </Link>
            <Link to="/products" className={`hdr-nav-link ${isActive('/products') ? 'active' : ''}`}>
              Thực đơn
            </Link>
          </nav>

          {/* Actions */}
          <div className="hdr-actions">

            {/* Cart */}
            <Link to="/cart" className="hdr-icon-btn" aria-label="Giỏ hàng">
              <ShoppingCart size={20} />
              {cartItemCount > 0 && (
                <span className={`hdr-cart-badge ${cartBump ? 'bump' : ''}`}>
                  {cartItemCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <>
                <div className="hdr-divider" aria-hidden="true" />

                <Link to="/orders" className="hdr-icon-btn" aria-label="Đơn hàng">
                  <Package size={20} />
                </Link>

                <div className="hdr-user-chip">
                  <div className="hdr-user-avatar">
                    {(user?.name ?? 'U')[0].toUpperCase()}
                  </div>
                  <span className="hdr-user-name">{user?.name}</span>
                </div>

                <button
                  onClick={handleLogout}
                  className="hdr-icon-btn logout"
                  aria-label="Đăng xuất"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <Link to="/login" className="hdr-login-btn">
                Đăng nhập
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              className="hdr-mobile-btn"
              onClick={() => setMobileOpen(true)}
              aria-label="Mở menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="hdr-mobile-overlay"
            style={{ display: 'block' }}
            onClick={() => setMobileOpen(false)}
          />
          <div className="hdr-mobile-drawer" role="dialog" aria-modal="true">
            <button
              className="hdr-drawer-close"
              onClick={() => setMobileOpen(false)}
              aria-label="Đóng menu"
            >
              <X size={18} />
            </button>

            <Link
              to="/"
              className={`hdr-drawer-link ${isActive('/') ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              🏠 Trang chủ
            </Link>
            <Link
              to="/products"
              className={`hdr-drawer-link ${isActive('/products') ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              🍔 Thực đơn
            </Link>
            <Link
              to="/cart"
              className="hdr-drawer-link"
              onClick={() => setMobileOpen(false)}
            >
              🛒 Giỏ hàng {cartItemCount > 0 && `(${cartItemCount})`}
            </Link>

            {isAuthenticated && (
              <Link
                to="/orders"
                className="hdr-drawer-link"
                onClick={() => setMobileOpen(false)}
              >
                📦 Đơn hàng của tôi
              </Link>
            )}

            <div className="hdr-drawer-divider" />

            {isAuthenticated ? (
              <button
                className="hdr-drawer-link"
                onClick={() => { setMobileOpen(false); handleLogout(); }}
              >
                🚪 Đăng xuất ({user?.name})
              </button>
            ) : (
              <Link
                to="/login"
                className="hdr-drawer-link active"
                onClick={() => setMobileOpen(false)}
              >
                👤 Đăng nhập
              </Link>
            )}
          </div>
        </>
      )}
    </>
  );
}