import React, { useState, useEffect, useCallback } from 'react';
import { Search, Eye, RefreshCw, ChevronLeft, ChevronRight, Package, Clock, CheckCircle, Truck, XCircle, TrendingUp } from 'lucide-react';

// Dùng relative URL để đi qua Vite proxy (tránh CORS)
const API_BASE = '/api/orders';
const token = () => localStorage.getItem('token');
const authHeader = () => ({ Authorization: `Bearer ${token()}` });

const STATUS_CONFIG = {
  pending:    { label: 'Chờ xác nhận', color: '#F59E0B', bg: '#FEF3C7', Icon: Clock },
  confirmed:  { label: 'Đã xác nhận',  color: '#3B82F6', bg: '#DBEAFE', Icon: CheckCircle },
  delivering: { label: 'Đang giao',    color: '#8B5CF6', bg: '#EDE9FE', Icon: Truck },
  completed:  { label: 'Hoàn thành',   color: '#10B981', bg: '#D1FAE5', Icon: CheckCircle },
  cancelled:  { label: 'Đã hủy',       color: '#EF4444', bg: '#FEE2E2', Icon: XCircle },
};

const formatVND = v => new Intl.NumberFormat('vi-VN').format(Math.round(v || 0)) + 'đ';
const formatDate = d => d ? new Date(d).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

export default function OrdersManager() {
  const [orders, setOrders]     = useState([]);
  const [stats,  setStats]      = useState({});
  const [total,  setTotal]      = useState(0);
  const [page,   setPage]       = useState(1);
  const [search, setSearch]     = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [selected, setSelected] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const LIMIT = 15;

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/stats`, { headers: authHeader() });
      if (res.ok) setStats(await res.json());
      else setError(`Stats error: ${res.status}`);
    } catch (e) { setError('Network error: ' + e.message); }
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams({ page, limit: LIMIT });
      if (search)       params.set('search', search);
      if (filterStatus) params.set('status', filterStatus);
      const res = await fetch(`${API_BASE}?${params}`, { headers: authHeader() });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setError(`Lỗi ${res.status}: ${errData.msg || 'Không lấy được đơn hàng'}`);
        setOrders([]); setTotal(0);
      } else {
        const data = await res.json();
        setOrders(data.orders || []);
        setTotal(data.total || 0);
      }
    } catch (e) { setError('Lỗi mạng: ' + e.message); setOrders([]); }
    finally { setLoading(false); }
  }, [page, search, filterStatus]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await fetch(`${API_BASE}/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchOrders(); fetchStats();
      if (selected?.id === orderId) setSelected(s => ({ ...s, status: newStatus }));
    } finally { setUpdatingId(null); }
  };

  const StatusBadge = ({ status }) => {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    return (
      <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, color: cfg.color, background: cfg.bg, whiteSpace: 'nowrap' }}>
        {cfg.label}
      </span>
    );
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div style={{ padding: '24px', fontFamily: "'Inter', sans-serif" }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>Quản lý đơn đặt báo</h1>
          <p style={{ color: '#6B7280', fontSize: 14, margin: '4px 0 0' }}>Danh sách tất cả đơn hàng từ khách hàng</p>
        </div>
        <button onClick={() => { fetchOrders(); fetchStats(); }}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', border: '1px solid #D1D5DB', borderRadius: 6, background: '#fff', cursor: 'pointer', fontSize: 14, color: '#374151' }}>
          <RefreshCw size={15} /> Làm mới
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: 6, padding: '10px 16px', marginBottom: 16, color: '#991B1B', fontSize: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>⚠️ {error}</span>
          <button onClick={() => setError('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#991B1B', fontWeight: 700 }}>✕</button>
        </div>
      )}

      {/* ── Stat cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14, marginBottom: 24 }}>
        {[
          { key: 'total',     label: 'Tổng đơn',      icon: Package,      color: '#3B82F6', val: stats.total || 0 },
          { key: 'pending',   label: 'Chờ xác nhận',  icon: Clock,        color: '#F59E0B', val: stats.pending || 0 },
          { key: 'confirmed', label: 'Đã xác nhận',   icon: CheckCircle,  color: '#3B82F6', val: stats.confirmed || 0 },
          { key: 'delivering',label: 'Đang giao',      icon: Truck,        color: '#8B5CF6', val: stats.delivering || 0 },
          { key: 'completed', label: 'Hoàn thành',    icon: CheckCircle,  color: '#10B981', val: stats.completed || 0 },
          { key: 'revenue',   label: 'Doanh thu',      icon: TrendingUp,   color: '#10B981', val: null, revenue: stats.revenue || 0 },
        ].map(({ key, label, icon: Icon, color, val, revenue }) => (
          <div key={key} style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, padding: '14px 16px', cursor: val !== null ? 'pointer' : 'default', transition: 'box-shadow .15s' }}
            onClick={() => val !== null && setFilterStatus(key === 'total' ? '' : key)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={16} color={color} />
              </div>
              <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 500 }}>{label}</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>
              {revenue !== undefined ? formatVND(revenue) : val}
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter bar ── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Tìm theo tên, điện thoại, email..."
            style={{ width: '100%', paddingLeft: 34, padding: '9px 12px 9px 34px', border: '1.5px solid #D1D5DB', borderRadius: 6, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
          style={{ padding: '9px 12px', border: '1.5px solid #D1D5DB', borderRadius: 6, fontSize: 14, background: '#fff', cursor: 'pointer' }}>
          <option value="">Tất cả trạng thái</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      {/* ── Table ── */}
      <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              {['#', 'Khách hàng', 'Điện thoại', 'Tỉnh/TP', 'Tổng tiền', 'Thanh toán', 'Trạng thái', 'Ngày đặt', ''].map(h => (
                <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap', fontSize: 13 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40, color: '#9CA3AF' }}>Đang tải...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40, color: '#9CA3AF' }}>Không có đơn hàng nào</td></tr>
            ) : orders.map((o, i) => (
              <tr key={o.id} style={{ borderBottom: '1px solid #F3F4F6', transition: 'background .1s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                onMouseLeave={e => e.currentTarget.style.background = ''}>
                <td style={{ padding: '12px 14px', color: '#6B7280', fontWeight: 500 }}>#{o.id}</td>
                <td style={{ padding: '12px 14px', fontWeight: 600, color: '#111827', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.full_name}</td>
                <td style={{ padding: '12px 14px', color: '#374151' }}>{o.phone}</td>
                <td style={{ padding: '12px 14px', color: '#6B7280', fontSize: 13 }}>{o.province || '—'}</td>
                <td style={{ padding: '12px 14px', fontWeight: 700, color: '#10B981' }}>{formatVND(o.total_amount)}</td>
                <td style={{ padding: '12px 14px', color: '#6B7280', fontSize: 12, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.payment_method || '—'}</td>
                <td style={{ padding: '12px 14px' }}>
                  <select
                    value={o.status}
                    disabled={updatingId === o.id}
                    onChange={e => handleStatusChange(o.id, e.target.value)}
                    style={{ border: 'none', background: 'transparent', fontWeight: 600, fontSize: 12, cursor: 'pointer',
                      color: STATUS_CONFIG[o.status]?.color || '#374151' }}
                  >
                    {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </td>
                <td style={{ padding: '12px 14px', color: '#9CA3AF', fontSize: 12, whiteSpace: 'nowrap' }}>{formatDate(o.created_at)}</td>
                <td style={{ padding: '12px 14px' }}>
                  <button onClick={() => setSelected(o)}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', border: '1px solid #D1D5DB', borderRadius: 6, background: '#fff', cursor: 'pointer', fontSize: 12, color: '#374151', whiteSpace: 'nowrap' }}>
                    <Eye size={13} /> Chi tiết
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 16 }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            style={{ padding: '6px 12px', border: '1px solid #D1D5DB', borderRadius: 6, background: '#fff', cursor: page > 1 ? 'pointer' : 'not-allowed', opacity: page === 1 ? .4 : 1 }}>
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontSize: 14, color: '#374151' }}>Trang {page}/{totalPages} ({total} đơn)</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            style={{ padding: '6px 12px', border: '1px solid #D1D5DB', borderRadius: 6, background: '#fff', cursor: page < totalPages ? 'pointer' : 'not-allowed', opacity: page === totalPages ? .4 : 1 }}>
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* ── Detail Modal ── */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={() => setSelected(null)}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 28, width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Chi tiết đơn #{selected.id}</h2>
              <button onClick={() => setSelected(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 20, color: '#9CA3AF' }}>✕</button>
            </div>

            {/* Info grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 20px', marginBottom: 20 }}>
              {[
                ['Họ tên', selected.full_name],
                ['Điện thoại', selected.phone],
                ['Email', selected.email || '—'],
                ['Tỉnh/TP', selected.province || '—'],
                ['Địa chỉ', selected.address || '—'],
                ['Thanh toán', selected.payment_method || '—'],
                ['Hóa đơn', selected.invoice ? 'Có' : 'Không'],
                ['Ngày đặt', formatDate(selected.created_at)],
              ].map(([label, val]) => (
                <div key={label}>
                  <div style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 500 }}>{label}</div>
                  <div style={{ fontSize: 14, color: '#111827', fontWeight: 500, marginTop: 2 }}>{val}</div>
                </div>
              ))}
            </div>

            {/* Items */}
            <div style={{ background: '#F9FAFB', borderRadius: 8, padding: '14px 16px', marginBottom: 16 }}>
              <div style={{ fontWeight: 700, marginBottom: 10, color: '#111827' }}>Chi tiết ấn phẩm</div>
              {(() => {
                try {
                  const items = typeof selected.items === 'string' ? JSON.parse(selected.items) : selected.items;
                  return items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #E5E7EB', fontSize: 14 }}>
                      <div>
                        <strong>{item.name}</strong>
                        <span style={{ color: '#6B7280', fontSize: 12, marginLeft: 8 }}>
                          {item.qty > 1 ? `x${item.qty}` : ''} {item.ky ? `(${item.ky} kỳ)` : ''}
                        </span>
                      </div>
                      <strong>{formatVND(item.subtotal)}</strong>
                    </div>
                  ));
                } catch { return <div style={{ color: '#9CA3AF' }}>Không đọc được chi tiết</div>; }
              })()}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontWeight: 700, color: '#10B981', fontSize: 16 }}>
                <span>Tổng thanh toán</span>
                <span>{formatVND(selected.total_amount)}</span>
              </div>
            </div>

            {/* Status update */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>Cập nhật trạng thái:</span>
              <select
                value={selected.status}
                onChange={e => handleStatusChange(selected.id, e.target.value)}
                style={{ padding: '8px 12px', border: '1.5px solid #D1D5DB', borderRadius: 6, fontSize: 14, fontWeight: 600,
                  color: STATUS_CONFIG[selected.status]?.color || '#374151', cursor: 'pointer' }}
              >
                {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
