import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Star, Minus, Plus, ShoppingCart, Flame, ChevronLeft, CheckCircle2, Award } from 'lucide-react';
import { productsApi, reviewsApi, type Product, type Review } from '../services/api';
import { useCart } from '../contexts/CartContext';

export function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [addedAnim, setAddedAnim] = useState(false);

  useEffect(() => {
    if (!id) return;
    productsApi.getById(id)
      .then(setProduct)
      .catch(() => setNotFound(true));
    reviewsApi.getByProduct(id, { limit: 20 })
      .then(res => setReviews(res?.items ?? []))
      .catch(() => {});
  }, [id]);

  if (notFound) {
    return (
      <div>
        <style>{pdStyles}</style>
        <div className="pd-root">
          <div className="pd-notfound">
            <span className="pd-notfound-emoji">😢</span>
            <div className="pd-notfound-title">Không Tìm Thấy Món Này</div>
            <p className="pd-notfound-sub">Món ăn bạn tìm có thể đã hết hoặc không tồn tại</p>
            <button className="pd-back-btn" onClick={() => navigate('/products')}>
              <ChevronLeft size={18} /> Quay lại thực đơn
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div>
        <style>{pdStyles}</style>
        <div className="pd-root">
          <div className="pd-loading">
            <div className="pd-spinner" />
            <span>Đang tải món ăn...</span>
          </div>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(
      {
        productId: product.id,
        name: product.name,
        price: parseFloat(product.price),
        image: product.images?.[0]?.imageUrl ?? '',
      },
      quantity
    );
    setAddedAnim(true);
    setTimeout(() => setAddedAnim(false), 1800);
  };

  const avgRating = parseFloat(product.avgRating);

  return (
    <div>
      <style>{pdStyles}</style>
      <div className="pd-root">

        {/* ── BREADCRUMB ── */}
        <div className="pd-breadcrumb">
          <div className="pd-breadcrumb-inner">
            <button className="pd-crumb-back" onClick={() => navigate('/products')}>
              <ChevronLeft size={16} /> Thực đơn
            </button>
            <span className="pd-crumb-sep">/</span>
            <span className="pd-crumb-current">{product.name}</span>
          </div>
        </div>

        {/* ── MAIN ── */}
        <div className="pd-main">

          {/* GALLERY */}
          <div className="pd-gallery">
            <div className="pd-main-img-wrap">
              <img
                src={product.images?.[selectedImage]?.imageUrl}
                alt={product.name}
                className="pd-main-img"
                key={selectedImage}
              />
              <div className="pd-img-badge">
                <Flame size={12} /> Bán chạy
              </div>
              <div className="pd-img-sold-chip">
                🏆 {product.soldCount} đã bán
              </div>
            </div>

            {(product.images?.length ?? 0) > 1 && (
              <div className="pd-thumbs">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`pd-thumb ${selectedImage === idx ? 'active' : ''}`}
                  >
                    <img
                      src={img.thumbnailUrl ?? img.imageUrl}
                      alt=""
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* INFO */}
          <div className="pd-info">

            <div className="pd-info-top-badges">
              <span className="pd-tag red"><Flame size={11} /> Hot item</span>
              <span className="pd-tag yellow"><Award size={11} /> Top rated</span>
            </div>

            <h1 className="pd-product-title">{product.name}</h1>

            {/* Stars */}
            <div className="pd-rating-row">
              <div className="pd-stars-wrap">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    size={20}
                    fill={star <= avgRating ? '#f59e0b' : 'none'}
                    color={star <= avgRating ? '#f59e0b' : '#d1d5db'}
                  />
                ))}
              </div>
              <span className="pd-rating-num">{avgRating.toFixed(1)}</span>
              <span className="pd-rating-count">({product.reviewCount} đánh giá)</span>
            </div>

            {/* Price */}
            <div className="pd-price-row">
              <span className="pd-price">
                {parseFloat(product.price).toLocaleString('vi-VN')}đ
              </span>
            </div>

            {/* Description */}
            <p className="pd-desc">{product.description}</p>

            {/* Divider */}
            <div className="pd-divider" />

            {/* Quantity */}
            <div className="pd-qty-section">
              <div className="pd-qty-label">Số lượng</div>
              <div className="pd-qty-row">
                <button
                  className="pd-qty-btn"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  aria-label="Giảm"
                >
                  <Minus size={16} />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="pd-qty-input"
                />
                <button
                  className="pd-qty-btn"
                  onClick={() => setQuantity(quantity + 1)}
                  aria-label="Tăng"
                >
                  <Plus size={16} />
                </button>

                <div className="pd-total-preview">
                  = <strong>{(parseFloat(product.price) * quantity).toLocaleString('vi-VN')}đ</strong>
                </div>
              </div>
            </div>

            {/* Add to cart */}
            <button
              className={`pd-cart-btn ${addedAnim ? 'added' : ''}`}
              onClick={handleAddToCart}
            >
              {addedAnim
                ? <><CheckCircle2 size={20} /> Đã thêm vào giỏ!</>
                : <><ShoppingCart size={20} /> Thêm vào giỏ hàng</>
              }
            </button>

          </div>
        </div>

        {/* ── REVIEWS ── */}
        <div className="pd-reviews-section">
          <div className="pd-reviews-inner">
            <div className="pd-reviews-header">
              <div className="pd-section-label">Khách hàng nói gì</div>
              <div className="pd-section-title">Đánh Giá Sản Phẩm</div>
              {reviews.length > 0 && (
                <div className="pd-avg-score">
                  <span className="pd-avg-num">{avgRating.toFixed(1)}</span>
                  <div>
                    <div className="pd-avg-stars">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} size={16}
                          fill={s <= avgRating ? '#f59e0b' : 'none'}
                          color={s <= avgRating ? '#f59e0b' : '#d1d5db'}
                        />
                      ))}
                    </div>
                    <div className="pd-avg-label">{product.reviewCount} đánh giá</div>
                  </div>
                </div>
              )}
            </div>

            {reviews.length === 0 ? (
              <div className="pd-no-reviews">
                <span style={{ fontSize: 48 }}>💬</span>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, color: '#111', marginTop: 12 }}>Chưa Có Đánh Giá</div>
                <p style={{ color: '#888', fontSize: 14, fontWeight: 600 }}>Hãy là người đầu tiên đánh giá món này!</p>
              </div>
            ) : (
              <div className="pd-reviews-grid">
                {reviews.map((review) => (
                  <div key={review.id} className="pd-review-card">
                    <div className="pd-review-top">
                      <div className="pd-review-avatar">
                        {(review.user?.name ?? 'K')[0].toUpperCase()}
                      </div>
                      <div className="pd-review-meta">
                        <div className="pd-reviewer-name">{review.user?.name ?? 'Khách hàng'}</div>
                        <div className="pd-review-stars">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} size={13}
                              fill={s <= review.rating ? '#f59e0b' : 'none'}
                              color={s <= review.rating ? '#f59e0b' : '#d1d5db'}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="pd-review-date">
                        {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                    </div>

                    {review.title && (
                      <div className="pd-review-title">{review.title}</div>
                    )}
                    <p className="pd-review-content">{review.content}</p>

                    {review.verified && (
                      <span className="pd-verified">
                        <CheckCircle2 size={12} /> Đã mua hàng
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

const pdStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Nunito:wght@400;600;700;900&display=swap');

  .pd-root { font-family: 'Nunito', sans-serif; background: #f5f0eb; min-height: 100vh; }

  /* Breadcrumb */
  .pd-breadcrumb {
    background: #fff;
    border-bottom: 1px solid #ececec;
    padding: 0;
  }
  .pd-breadcrumb-inner {
    max-width: 1280px;
    margin: 0 auto;
    padding: 14px 40px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .pd-crumb-back {
    display: flex;
    align-items: center;
    gap: 4px;
    background: none;
    border: none;
    color: #666;
    font-family: 'Nunito', sans-serif;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: color 0.15s;
    padding: 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .pd-crumb-back:hover { color: #CC0000; }
  .pd-crumb-sep { color: #aaa; font-size: 13px; }
  .pd-crumb-current {
    color: #111;
    font-size: 13px;
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 300px;
  }

  /* Main layout */
  .pd-main {
    max-width: 1280px;
    margin: 0 auto;
    padding: 48px 40px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
    align-items: start;
  }

  /* Gallery */
  .pd-gallery {}
  .pd-main-img-wrap {
    position: relative;
    border-radius: 24px;
    overflow: hidden;
    background: #fff;
    aspect-ratio: 1;
    box-shadow: 0 8px 40px rgba(0,0,0,0.12);
    margin-bottom: 14px;
  }
  .pd-main-img {
    width: 100%; height: 100%;
    object-fit: cover;
    display: block;
    animation: pd-imgfade 0.4s ease;
  }
  @keyframes pd-imgfade {
    from { opacity: 0; transform: scale(1.03); }
    to { opacity: 1; transform: scale(1); }
  }
  .pd-img-badge {
    position: absolute;
    top: 16px; left: 16px;
    background: #CC0000;
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    padding: 5px 12px;
    border-radius: 7px;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .pd-img-sold-chip {
    position: absolute;
    bottom: 16px; right: 16px;
    background: rgba(0,0,0,0.65);
    backdrop-filter: blur(6px);
    color: #fff;
    font-size: 12px;
    font-weight: 700;
    padding: 6px 14px;
    border-radius: 999px;
    font-family: 'Nunito', sans-serif;
  }
  .pd-thumbs {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }
  .pd-thumb {
    width: 72px; height: 72px;
    border-radius: 12px;
    overflow: hidden;
    border: 2.5px solid transparent;
    cursor: pointer;
    transition: border-color 0.18s, transform 0.18s;
    padding: 0;
    background: #fff;
    flex-shrink: 0;
  }
  .pd-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .pd-thumb:hover { transform: scale(1.06); }
  .pd-thumb.active { border-color: #CC0000; }

  /* Info panel */
  .pd-info {
    padding-top: 8px;
  }
  .pd-info-top-badges {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
  }
  .pd-tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    padding: 4px 10px;
    border-radius: 6px;
  }
  .pd-tag.red { background: #fde8e8; color: #CC0000; }
  .pd-tag.yellow { background: #fff7e0; color: #b45309; }

  .pd-product-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(36px, 4vw, 56px);
    color: #111;
    line-height: 1.05;
    margin: 0 0 18px;
    letter-spacing: 0.5px;
  }

  .pd-rating-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 20px;
  }
  .pd-stars-wrap { display: flex; gap: 2px; }
  .pd-rating-num {
    font-size: 16px;
    font-weight: 900;
    color: #111;
  }
  .pd-rating-count { font-size: 13px; color: #999; font-weight: 600; }

  .pd-price-row { margin-bottom: 18px; }
  .pd-price {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 44px;
    color: #CC0000;
    letter-spacing: 0.5px;
  }

  .pd-desc {
    font-size: 15px;
    color: #555;
    line-height: 1.75;
    margin: 0 0 24px;
    font-weight: 500;
  }

  .pd-divider {
    height: 1.5px;
    background: #e8e2da;
    margin-bottom: 24px;
    border-radius: 999px;
  }

  .pd-qty-section { margin-bottom: 28px; }
  .pd-qty-label {
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #888;
    margin-bottom: 10px;
  }
  .pd-qty-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .pd-qty-btn {
    width: 42px; height: 42px;
    border-radius: 10px;
    border: 2px solid #e8e2da;
    background: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #333;
    transition: border-color 0.18s, background 0.18s, transform 0.15s;
    flex-shrink: 0;
  }
  .pd-qty-btn:hover {
    border-color: #CC0000;
    background: #fde8e8;
    transform: scale(1.08);
  }
  .pd-qty-input {
    width: 60px;
    text-align: center;
    padding: 10px 4px;
    border: 2px solid #e8e2da;
    border-radius: 10px;
    font-family: 'Nunito', sans-serif;
    font-size: 16px;
    font-weight: 700;
    color: #111;
    background: #fff;
    outline: none;
    transition: border-color 0.18s;
  }
  .pd-qty-input:focus { border-color: #CC0000; }
  .pd-qty-input::-webkit-inner-spin-button { -webkit-appearance: none; }
  .pd-total-preview {
    font-size: 15px;
    color: #888;
    font-weight: 600;
    margin-left: 8px;
  }
  .pd-total-preview strong { color: #CC0000; font-family: 'Bebas Neue', sans-serif; font-size: 20px; }

  .pd-cart-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    background: #CC0000;
    color: #fff;
    border: none;
    border-radius: 14px;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 22px;
    letter-spacing: 1px;
    padding: 18px 32px;
    cursor: pointer;
    transition: transform 0.2s cubic-bezier(.22,1,.36,1), background 0.2s, box-shadow 0.2s;
    box-shadow: 0 6px 24px rgba(204,0,0,0.3);
  }
  .pd-cart-btn:hover {
    transform: translateY(-3px) scale(1.01);
    box-shadow: 0 12px 32px rgba(204,0,0,0.38);
    background: #a30000;
  }
  .pd-cart-btn:active { transform: scale(0.98); }
  .pd-cart-btn.added {
    background: #16a34a;
    box-shadow: 0 6px 24px rgba(22,163,74,0.3);
  }

  /* Reviews section */
  .pd-reviews-section {
    background: #fff;
    padding: 72px 40px;
  }
  .pd-reviews-inner {
    max-width: 1280px;
    margin: 0 auto;
  }
  .pd-reviews-header { margin-bottom: 40px; }
  .pd-section-label {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: #CC0000;
    margin-bottom: 8px;
  }
  .pd-section-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(32px, 4vw, 52px);
    color: #111;
    margin: 0 0 20px;
    letter-spacing: 1px;
    line-height: 1;
  }
  .pd-avg-score {
    display: inline-flex;
    align-items: center;
    gap: 16px;
    background: #fff7e0;
    border: 1.5px solid #f5d08a;
    padding: 14px 24px;
    border-radius: 14px;
  }
  .pd-avg-num {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 48px;
    color: #b45309;
    line-height: 1;
  }
  .pd-avg-stars { display: flex; gap: 2px; margin-bottom: 4px; }
  .pd-avg-label { font-size: 12px; color: #7c5b24; font-weight: 700; }

  .pd-reviews-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
  }
  .pd-review-card {
    background: #fff;
    border: 1.5px solid #ececec;
    border-radius: 16px;
    padding: 22px;
    transition: border-color 0.2s, transform 0.2s;
    animation: pd-cardin 0.45s cubic-bezier(.22,1,.36,1) both;
  }
  @keyframes pd-cardin {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .pd-review-card:hover { border-color: #CC0000; transform: translateY(-3px); }
  .pd-review-top {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 12px;
  }
  .pd-review-avatar {
    width: 40px; height: 40px;
    border-radius: 50%;
    background: #CC0000;
    color: #fff;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .pd-review-meta { flex: 1; }
  .pd-reviewer-name {
    font-size: 14px;
    font-weight: 700;
    color: #111;
    margin-bottom: 4px;
  }
  .pd-review-stars { display: flex; gap: 2px; }
  .pd-review-date { font-size: 12px; color: #666; font-weight: 600; white-space: nowrap; }
  .pd-review-title {
    font-size: 14px;
    font-weight: 700;
    color: #111;
    margin-bottom: 6px;
  }
  .pd-review-content {
    font-size: 14px;
    color: #555;
    line-height: 1.65;
    margin: 0 0 10px;
    font-weight: 500;
  }
  .pd-verified {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    font-weight: 700;
    color: #22c55e;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .pd-no-reviews {
    text-align: center;
    padding: 60px 20px;
    color: #666;
  }

  /* Loading */
  .pd-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    gap: 16px;
    color: #888;
    font-weight: 700;
    font-size: 15px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .pd-spinner {
    width: 44px; height: 44px;
    border: 3px solid #e8e2da;
    border-top-color: #CC0000;
    border-radius: 50%;
    animation: pd-spin 0.7s linear infinite;
  }
  @keyframes pd-spin { to { transform: rotate(360deg); } }

  /* Not found */
  .pd-notfound {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    padding: 40px;
    text-align: center;
  }
  .pd-notfound-emoji { font-size: 80px; display: block; margin-bottom: 20px; }
  .pd-notfound-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 40px;
    color: #111;
    margin-bottom: 8px;
    letter-spacing: 1px;
  }
  .pd-notfound-sub { font-size: 15px; color: #888; font-weight: 600; margin-bottom: 28px; }
  .pd-back-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #CC0000;
    color: #fff;
    border: none;
    border-radius: 10px;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 18px;
    letter-spacing: 1px;
    padding: 14px 28px;
    cursor: pointer;
    transition: transform 0.18s, background 0.18s;
  }
  .pd-back-btn:hover { transform: translateY(-2px); background: #a30000; }

  @media (max-width: 900px) {
    .pd-main { grid-template-columns: 1fr; gap: 32px; padding: 32px 20px; }
    .pd-reviews-section { padding: 48px 20px; }
    .pd-breadcrumb-inner { padding: 14px 20px; }
  }
`;