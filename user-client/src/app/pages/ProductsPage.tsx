import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router';
import {
  Search,
  Star,
  SlidersHorizontal,
  Flame,
  ChevronRight,
  LayoutGrid,
  List,
} from 'lucide-react';

import {
  productsApi,
  categoriesApi,
  type Product,
  type Category,
} from '../services/api';

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('category') || ''
  );

  const [sortBy, setSortBy] = useState<
    'price-asc' | 'price-desc' | 'sold' | 'rating'
  >('sold');

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  // LOAD CATEGORIES
  useEffect(() => {
    categoriesApi.getAll().then(setCategories).catch(() => {});
  }, []);

  // LOAD PRODUCTS
  useEffect(() => {
    const sortMap: Record<
      string,
      {
        sortBy: 'price' | 'soldCount' | 'avgRating' | 'createdAt';
        sortOrder: 'asc' | 'desc';
      }
    > = {
      'price-asc': {
        sortBy: 'price',
        sortOrder: 'asc',
      },

      'price-desc': {
        sortBy: 'price',
        sortOrder: 'desc',
      },

      sold: {
        sortBy: 'soldCount',
        sortOrder: 'desc',
      },

      rating: {
        sortBy: 'avgRating',
        sortOrder: 'desc',
      },
    };

    const { sortBy: sb, sortOrder: so } = sortMap[sortBy];

    productsApi
      .getAll({
        search: searchQuery || undefined,
        categoryId: selectedCategory || undefined,
        sortBy: sb,
        sortOrder: so,
        limit: ITEMS_PER_PAGE,
        page: currentPage,
      })
      .then((res) => {
        setProducts(res?.items ?? []);
        setTotal(res?.pagination?.total ?? 0);
      })
      .catch(() => {});
  }, [searchQuery, selectedCategory, sortBy, currentPage]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);

    // reset page
    setCurrentPage(1);

    if (categoryId) {
      setSearchParams({ category: categoryId });
    } else {
      setSearchParams({});
    }
  };

  const categoryEmoji = (idx: number) => {
    const emojis = ['🍔', '🍕', '🍗', '🍝', '🥤', '🍰'];
    return emojis[idx % emojis.length];
  };

  return (
    <div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Nunito:wght@400;600;700;900&display=swap');

        .pp-root {
          font-family: 'Nunito', sans-serif;
          background: #f5f0eb;
          min-height: 100vh;
        }

        /* HERO */
        .pp-hero {
          background: #fff;
          border-bottom: 1px solid #f0f0f0;
          padding: 40px 40px 0;
          position: relative;
          overflow: hidden;
        }

        .pp-hero::before {
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

        .pp-hero-inner {
          max-width: 1280px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .pp-hero-label {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #CC0000;
          margin-bottom: 8px;
        }

        .pp-hero-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(48px, 6vw, 80px);
          color: #111;
          margin: 0;
          line-height: 1;
        }

        .pp-hero-title span {
          color: #CC0000;
        }

        /* CATEGORY */
        .pp-cats-wrap {
          background: #fff;
          padding: 0 40px 20px;
        }

        .pp-cats-inner {
          max-width: 1280px;
          margin: 0 auto;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          padding-top: 20px;
        }

        .pp-cat-pill {
          padding: 8px 18px;
          border-radius: 999px;
          border: 1.5px solid #e5e5e5;
          background: transparent;
          color: #444;
          cursor: pointer;
          font-size: 13px;
          font-weight: 700;
          transition: 0.2s;
        }

        .pp-cat-pill.active {
          background: #CC0000;
          color: white;
          border-color: #CC0000;
        }

        .pp-cat-pill:hover {
          border-color: #CC0000;
          color: #CC0000;
          background: #fff5f5;
        }

        /* FILTER BAR */
        .pp-filterbar {
          background: white;
          position: sticky;
          top: 0;
          z-index: 30;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }

        .pp-filterbar-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 16px 40px;
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          align-items: center;
        }

        .pp-search-wrap {
          position: relative;
          flex: 1;
          min-width: 220px;
        }

        .pp-search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #888;
        }

        .pp-search-input {
          width: 100%;
          padding: 11px 14px 11px 42px;
          border-radius: 10px;
          border: 2px solid transparent;
          background: #f5f0eb;
          outline: none;
          font-weight: 600;
          box-sizing: border-box;
        }

        .pp-search-input:focus {
          border-color: #CC0000;
          background: white;
        }

        .pp-select-wrap {
          position: relative;
          min-width: 180px;
        }

        .pp-select-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #888;
        }

        .pp-select {
          width: 100%;
          padding: 11px 36px 11px 38px;
          border-radius: 10px;
          border: 2px solid transparent;
          background: #f5f0eb;
          outline: none;
          font-weight: 600;
          appearance: none;
        }

        .pp-select:focus {
          border-color: #CC0000;
          background: white;
        }

        .pp-select-arrow {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 10px;
          color: #888;
        }

        /* VIEW MODE */
        .pp-view-toggle {
          display: flex;
          gap: 4px;
          background: #f5f0eb;
          padding: 4px;
          border-radius: 10px;
        }

        .pp-view-btn {
          width: 36px;
          height: 36px;
          border: none;
          border-radius: 8px;
          background: transparent;
          cursor: pointer;
          color: #888;
        }

        .pp-view-btn.active {
          background: #CC0000;
          color: white;
        }

        /* BODY */
        .pp-body {
          max-width: 1280px;
          margin: 0 auto;
          padding: 32px 40px 60px;
        }

        .pp-result-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .pp-result-text {
          font-size: 14px;
          font-weight: 700;
          color: #666;
        }

        .pp-result-text span {
          color: #CC0000;
          font-size: 24px;
        }

        /* GRID */
        .pp-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 20px;
        }

        .pp-grid.list-mode {
          grid-template-columns: 1fr;
        }

        /* CARD */
        .pp-card {
          background: white;
          border-radius: 18px;
          overflow: hidden;
          text-decoration: none;
          box-shadow: 0 2px 10px rgba(0,0,0,0.06);
          transition: 0.3s;
        }

        .pp-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.15);
        }

        .pp-card-img {
          aspect-ratio: 1;
          overflow: hidden;
          position: relative;
        }

        .pp-card-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: 0.4s;
        }

        .pp-card:hover img {
          transform: scale(1.08);
        }

        .pp-card-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          background: #CC0000;
          color: white;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 11px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .pp-card-body {
          padding: 16px;
        }

        .pp-card-name {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 22px;
          color: #111;
          margin-bottom: 10px;
        }

        .pp-card-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }

        .pp-stars {
          background: #fff7e0;
          padding: 4px 8px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .pp-review-count {
          font-size: 12px;
          color: #999;
        }

        .pp-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid #eee;
          padding-top: 10px;
        }

        .pp-price {
          color: #CC0000;
          font-size: 24px;
          font-family: 'Bebas Neue', sans-serif;
        }

        .pp-sold {
          font-size: 11px;
          color: #999;
          font-weight: 700;
        }

        .pp-arrow-btn {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          background: #CC0000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* LIST MODE */
        .pp-grid.list-mode .pp-card {
          display: flex;
        }

        .pp-grid.list-mode .pp-card-img {
          width: 140px;
          min-width: 140px;
          height: 140px;
          aspect-ratio: unset;
        }

        .pp-grid.list-mode .pp-card-body {
          flex: 1;
        }

        /* EMPTY */
        .pp-empty {
          text-align: center;
          padding: 80px 20px;
        }

        /* PAGINATION */
        .pp-pagination {
          margin-top: 40px;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .pp-page-btn {
          min-width: 42px;
          height: 42px;
          border: none;
          border-radius: 10px;
          background: white;
          cursor: pointer;
          font-weight: 700;
          transition: 0.2s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .pp-page-btn:hover {
          background: #CC0000;
          color: white;
        }

        .pp-page-btn.active {
          background: #CC0000;
          color: white;
        }

        .pp-page-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .pp-body,
          .pp-filterbar-inner,
          .pp-hero,
          .pp-cats-wrap {
            padding-left: 20px;
            padding-right: 20px;
          }

          .pp-grid {
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          }
        }
      `}</style>

      <div className="pp-root">

        {/* HERO */}
        <div className="pp-hero">
          <div className="pp-hero-inner">
            <div className="pp-hero-label">🍔 Thực đơn</div>

            <h1 className="pp-hero-title">
              Tất Cả <span>Món Ngon</span>
            </h1>
          </div>
        </div>

        {/* CATEGORY */}
        <div className="pp-cats-wrap">
          <div className="pp-cats-inner">
            <button
              className={`pp-cat-pill ${
                selectedCategory === '' ? 'active' : ''
              }`}
              onClick={() => handleCategoryChange('')}
            >
              🌟 Tất cả
            </button>

            {categories.map((cat, idx) => (
              <button
                key={cat.id}
                className={`pp-cat-pill ${
                  selectedCategory === cat.id ? 'active' : ''
                }`}
                onClick={() => handleCategoryChange(cat.id)}
              >
                {cat.icon || categoryEmoji(idx)} {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* FILTER */}
        <div className="pp-filterbar">
          <div className="pp-filterbar-inner">

            {/* SEARCH */}
            <div className="pp-search-wrap">
              <Search className="pp-search-icon" size={16} />

              <input
                type="text"
                placeholder="Tìm kiếm món ăn..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pp-search-input"
              />
            </div>

            {/* CATEGORY SELECT */}
            <div className="pp-select-wrap">
              <SlidersHorizontal className="pp-select-icon" size={15} />

              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="pp-select"
              >
                <option value="">Tất cả danh mục</option>

                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <span className="pp-select-arrow">▼</span>
            </div>

            {/* SORT */}
            <div className="pp-select-wrap">
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="pp-select"
                style={{ paddingLeft: '14px' }}
              >
                <option value="sold">🔥 Bán chạy nhất</option>
                <option value="rating">⭐ Đánh giá cao nhất</option>
                <option value="price-asc">💰 Giá tăng dần</option>
                <option value="price-desc">💎 Giá giảm dần</option>
              </select>

              <span className="pp-select-arrow">▼</span>
            </div>

            {/* VIEW MODE */}
            <div className="pp-view-toggle">
              <button
                className={`pp-view-btn ${
                  viewMode === 'grid' ? 'active' : ''
                }`}
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid size={16} />
              </button>

              <button
                className={`pp-view-btn ${
                  viewMode === 'list' ? 'active' : ''
                }`}
                onClick={() => setViewMode('list')}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className="pp-body">

          {products.length === 0 ? (
            <div className="pp-empty">
              <h2>😔 Không tìm thấy sản phẩm</h2>
            </div>
          ) : (
            <>
              <div className="pp-result-bar">
                <div className="pp-result-text">
                  Tìm thấy <span>{total}</span> sản phẩm
                </div>
              </div>

              {/* PRODUCTS */}
              <div
                className={`pp-grid ${
                  viewMode === 'list' ? 'list-mode' : ''
                }`}
              >
                {products.map((product) => (
                  <Link
                    key={product.id}
                    to={`/products/${product.id}`}
                    className="pp-card"
                  >
                    <div className="pp-card-img">
                      <img
                        src={
                          product.images?.[0]?.imageUrl ||
                          '/placeholder.jpg'
                        }
                        alt={product.name}
                      />

                      <div className="pp-card-badge">
                        <Flame size={10} /> Hot
                      </div>
                    </div>

                    <div className="pp-card-body">
                      <div className="pp-card-name">
                        {product.name}
                      </div>

                      <div className="pp-card-meta">
                        <div className="pp-stars">
                          <Star
                            size={11}
                            fill="currentColor"
                            style={{ color: '#f59e0b' }}
                          />

                          {parseFloat(product.avgRating).toFixed(1)}
                        </div>

                        <span className="pp-review-count">
                          ({product.reviewCount})
                        </span>
                      </div>

                      <div className="pp-card-footer">
                        <div>
                          <div className="pp-price">
                            {parseFloat(product.price).toLocaleString(
                              'vi-VN'
                            )}
                            ₫
                          </div>

                          <div className="pp-sold">
                            Đã bán {product.soldCount}
                          </div>
                        </div>

                        <div className="pp-arrow-btn">
                          <ChevronRight size={17} color="#fff" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* PAGINATION */}
              <div className="pp-pagination">

                <button
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((prev) => prev - 1)
                  }
                  className="pp-page-btn"
                >
                  ←
                </button>

                {Array.from(
                  { length: totalPages },
                  (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`pp-page-btn ${
                        currentPage === i + 1 ? 'active' : ''
                      }`}
                    >
                      {i + 1}
                    </button>
                  )
                )}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((prev) => prev + 1)
                  }
                  className="pp-page-btn"
                >
                  →
                </button>

              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}