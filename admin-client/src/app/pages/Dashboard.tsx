import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, ShoppingCart, DollarSign, Package, Users, Star } from 'lucide-react';
import { dashboardApi, type DashboardStats, type Product } from '../services/api';

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [ordersByStatus, setOrdersByStatus] = useState<{ status: string; count: number }[]>([]);
  const [topProducts, setTopProducts] = useState<Product[]>([]);

  useEffect(() => {
    dashboardApi.getStats().then(data => {
      if (data) {
        setStats(data);
        setTopProducts(data.topProducts || []);
      }
    }).catch(() => setStats(null));

    dashboardApi.getOrdersByStatus().then((data) => {
      const statusLabels: Record<string, string> = {
        PENDING: 'Chờ xác nhận',
        CONFIRMED: 'Đã xác nhận',
        SHIPPING: 'Đang giao',
        COMPLETED: 'Hoàn thành',
        CANCELLED: 'Đã hủy',
      };
      setOrdersByStatus((data || []).map((d: any) => ({
        status: statusLabels[d.status] ?? d.status,
        count: d._count,
      })));
    }).catch(() => setOrdersByStatus([]));
  }, []);

  return (
    <div>
      <style>{dbStyles}</style>
      <div className="db-root">

        {/* ── PAGE HEADER ── */}
        <div className="db-page-header">
          <div>
            <div className="db-page-label">Admin Panel</div>
            <h1 className="db-page-title">Tổng <span>Quan</span></h1>
          </div>
          <div className="db-header-badge">
            <TrendingUp size={15} /> Báo cáo hôm nay
          </div>
        </div>

        {/* ── STAT CARDS ── */}
        <div className="db-stats-grid">
          <StatCard
            icon={ShoppingCart}
            label="Tổng đơn hàng"
            value={stats ? stats.totalOrders.toString() : '—'}
            accent="#CC0000"
            emoji="🛒"
          />
          <StatCard
            icon={DollarSign}
            label="Tổng doanh thu"
            value={stats ? `${parseFloat(String(stats.totalRevenue)).toLocaleString('vi-VN')}đ` : '—'}
            accent="#16a34a"
            emoji="💰"
          />
          <StatCard
            icon={Package}
            label="Tổng sản phẩm"
            value={stats ? stats.totalProducts.toString() : '—'}
            accent="#7c3aed"
            emoji="📦"
          />
          <StatCard
            icon={Users}
            label="Tổng người dùng"
            value={stats ? stats.totalUsers.toString() : '—'}
            accent="#ea580c"
            emoji="👥"
          />
        </div>

        {/* ── CHARTS ── */}
        <div className="db-charts-grid">
          <div className="db-card">
            <div className="db-card-header">
              <div className="db-card-dot" style={{ background: '#CC0000' }} />
              <h2 className="db-card-title">Đơn hàng theo trạng thái</h2>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={ordersByStatus} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe4" />
                <XAxis
                  dataKey="status"
                  tick={{ fontFamily: 'Nunito', fontSize: 12, fontWeight: 600, fill: '#888' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontFamily: 'Nunito', fontSize: 12, fill: '#aaa' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    fontFamily: 'Nunito', fontSize: 13, borderRadius: 10,
                    border: '1.5px solid #f0ebe4',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  }}
                  cursor={{ fill: 'rgba(204,0,0,0.05)' }}
                />
                <Bar dataKey="count" fill="#CC0000" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="db-card">
            <div className="db-card-header">
              <div className="db-card-dot" style={{ background: '#7c3aed' }} />
              <h2 className="db-card-title">Top sản phẩm bán chạy</h2>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={(topProducts || []).map(p => ({
                  name: p.name.length > 14 ? p.name.slice(0, 14) + '…' : p.name,
                  sold: p.soldCount,
                }))}
                barSize={32}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe4" />
                <XAxis
                  dataKey="name"
                  tick={{ fontFamily: 'Nunito', fontSize: 11, fontWeight: 600, fill: '#888' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontFamily: 'Nunito', fontSize: 12, fill: '#aaa' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    fontFamily: 'Nunito', fontSize: 13, borderRadius: 10,
                    border: '1.5px solid #f0ebe4',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  }}
                  cursor={{ fill: 'rgba(124,58,237,0.05)' }}
                />
                <Bar dataKey="sold" fill="#7c3aed" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── TOP PRODUCTS TABLE ── */}
        <div className="db-card db-table-card">
          <div className="db-card-header">
            <div className="db-card-dot" style={{ background: '#ea580c' }} />
            <h2 className="db-card-title">Top 5 sản phẩm bán chạy</h2>
          </div>

          <div className="db-table-wrap">
            <table className="db-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Hình ảnh</th>
                  <th>Tên sản phẩm</th>
                  <th>Đã bán</th>
                  <th>Đánh giá</th>
                  <th>Giá</th>
                </tr>
              </thead>
              <tbody>
                {(topProducts || []).map((product, idx) => (
                  <tr key={product.id} className="db-tr">
                    <td>
                      <span className="db-rank">{idx + 1}</span>
                    </td>
                    <td>
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0].thumbnailUrl ?? product.images[0].imageUrl}
                          alt={product.name}
                          className="db-product-img"
                        />
                      ) : (
                        <div className="db-product-img db-img-placeholder">🍔</div>
                      )}
                    </td>
                    <td>
                      <span className="db-product-name">{product.name}</span>
                    </td>
                    <td>
                      <span className="db-sold-badge">{product.soldCount}</span>
                    </td>
                    <td>
                      <div className="db-rating">
                        <Star size={13} fill="#f59e0b" color="#f59e0b" />
                        <span className="db-rating-num">{parseFloat(product.avgRating).toFixed(1)}</span>
                        <span className="db-rating-count">({product.reviewCount})</span>
                      </div>
                    </td>
                    <td>
                      <span className="db-price">{parseFloat(product.price).toLocaleString('vi-VN')}đ</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  value: string;
  accent: string;
  emoji: string;
}

function StatCard({ icon: Icon, label, value, accent, emoji }: StatCardProps) {
  return (
    <div className="db-stat-card" style={{ '--accent': accent } as React.CSSProperties}>
      <div className="db-stat-top">
        <div>
          <div className="db-stat-label">{label}</div>
          <div className="db-stat-value">{value}</div>
        </div>
        <div className="db-stat-icon-wrap">
          <Icon size={22} />
        </div>
      </div>
      <div className="db-stat-emoji">{emoji}</div>
      <div className="db-stat-bar" />
    </div>
  );
}

const dbStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Nunito:wght@400;600;700;900&display=swap');

  .db-root {
    font-family: 'Nunito', sans-serif;
    background: #faf8f5;
    min-height: 100vh;
    padding: 32px 36px 60px;
  }

  /* Page header */
  .db-page-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 32px;
    flex-wrap: wrap;
    gap: 12px;
  }
  .db-page-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: #CC0000;
    margin-bottom: 6px;
  }
  .db-page-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(36px, 4vw, 52px);
    color: #1a1a1a;
    line-height: 1;
    margin: 0;
    letter-spacing: 1px;
  }
  .db-page-title span { color: #CC0000; }
  .db-header-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #fff;
    border: 1.5px solid #e8e2da;
    border-radius: 999px;
    padding: 8px 16px;
    font-size: 13px;
    font-weight: 700;
    color: #555;
  }
  .db-header-badge svg { color: #CC0000; }

  /* Stat cards */
  .db-stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }
  .db-stat-card {
    background: #fff;
    border-radius: 18px;
    padding: 22px 20px 0;
    border: 1.5px solid #f0ebe4;
    box-shadow: 0 2px 10px rgba(0,0,0,0.04);
    position: relative;
    overflow: hidden;
    transition: transform 0.25s cubic-bezier(.22,1,.36,1), box-shadow 0.25s;
    animation: db-in 0.45s cubic-bezier(.22,1,.36,1) both;
  }
  .db-stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 28px rgba(0,0,0,0.09);
  }
  @keyframes db-in {
    from { opacity: 0; transform: translateY(14px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .db-stat-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 6px;
  }
  .db-stat-label {
    font-size: 12px;
    font-weight: 700;
    color: #999;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    margin-bottom: 8px;
  }
  .db-stat-value {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 32px;
    color: #1a1a1a;
    line-height: 1;
    letter-spacing: 0.5px;
  }
  .db-stat-icon-wrap {
    width: 44px; height: 44px;
    border-radius: 12px;
    background: color-mix(in srgb, var(--accent) 12%, white);
    color: var(--accent);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .db-stat-emoji {
    font-size: 52px;
    position: absolute;
    bottom: -4px; right: 10px;
    opacity: 0.07;
    pointer-events: none;
    line-height: 1;
  }
  .db-stat-bar {
    height: 3px;
    background: var(--accent);
    margin: 16px -20px 0;
    opacity: 0.55;
  }

  /* Charts */
  .db-charts-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 24px;
  }

  /* Card */
  .db-card {
    background: #fff;
    border-radius: 18px;
    padding: 24px;
    border: 1.5px solid #f0ebe4;
    box-shadow: 0 2px 10px rgba(0,0,0,0.04);
    animation: db-in 0.5s cubic-bezier(.22,1,.36,1) both;
  }
  .db-card-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
  }
  .db-card-dot {
    width: 10px; height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .db-card-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 20px;
    color: #1a1a1a;
    letter-spacing: 0.5px;
    margin: 0;
  }

  /* Table */
  .db-table-wrap { overflow-x: auto; }
  .db-table {
    width: 100%;
    border-collapse: collapse;
  }
  .db-table thead tr { border-bottom: 2px solid #f5f0eb; }
  .db-table th {
    text-align: left;
    padding: 10px 14px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #bbb;
    white-space: nowrap;
  }
  .db-tr {
    border-bottom: 1.5px solid #faf8f5;
    transition: background 0.15s;
  }
  .db-tr:last-child { border-bottom: none; }
  .db-tr:hover { background: #faf8f5; }
  .db-table td { padding: 12px 14px; vertical-align: middle; }

  .db-rank {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 26px; height: 26px;
    border-radius: 8px;
    background: #f5f0eb;
    font-size: 12px;
    font-weight: 900;
    color: #999;
  }
  .db-tr:nth-child(1) .db-rank { background: #fff7e0; color: #b45309; }
  .db-tr:nth-child(2) .db-rank { background: #f0f0f0; color: #555; }
  .db-tr:nth-child(3) .db-rank { background: #fde8e0; color: #c2410c; }

  .db-product-img {
    width: 52px; height: 52px;
    border-radius: 10px;
    object-fit: cover;
    display: block;
    border: 1.5px solid #f0ebe4;
  }
  .db-img-placeholder {
    background: #f5f0eb;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
  }
  .db-product-name {
    font-size: 14px;
    font-weight: 700;
    color: #1a1a1a;
  }
  .db-sold-badge {
    display: inline-block;
    background: #fde8e8;
    color: #CC0000;
    font-size: 12px;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 999px;
  }
  .db-rating {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .db-rating-num { font-size: 13px; font-weight: 700; color: #1a1a1a; }
  .db-rating-count { font-size: 12px; color: #bbb; font-weight: 600; }
  .db-price {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 17px;
    color: #CC0000;
    letter-spacing: 0.3px;
  }

  @media (max-width: 900px) {
    .db-root { padding: 20px 16px 48px; }
    .db-charts-grid { grid-template-columns: 1fr; }
    .db-stats-grid { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 500px) {
    .db-stats-grid { grid-template-columns: 1fr; }
  }
`;