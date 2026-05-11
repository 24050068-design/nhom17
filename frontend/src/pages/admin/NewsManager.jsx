import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, Copy, Pencil, Eye, Trash2, Loader2,
  CalendarDays, ChevronLeft, ChevronRight, AlertTriangle, X, RefreshCw,
  HelpCircle, CheckSquare, EyeOff, RotateCcw, Filter
} from 'lucide-react';
import {
  adminGetAllPosts, adminDeletePost, adminClonePost,
  adminBulkUpdateStatus, adminBulkDelete, fetchCategories
} from '../../services/api';
import './Admin.css';
import './NewsManager.css';

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px' }}>
        <div className="modal-header">
          <h3 className="modal-title" style={{ color: '#DC2626' }}>
            <AlertTriangle size={18} /> Xác nhận
          </h3>
          <button className="modal-close" onClick={onCancel}><X size={18} /></button>
        </div>
        <div className="modal-body" style={{ padding: '20px 24px' }}>
          <p style={{ fontSize: '14px', color: '#374151' }}>{message}</p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onCancel}>Hủy</button>
          <button className="btn btn-danger" onClick={onConfirm}>Xác nhận</button>
        </div>
      </div>
    </div>
  );
}

function HelpModal({ onClose }) {
  const tips = [
    { icon: <Plus size={16}/>, color: '#38A169', title: 'Thêm tin tức', desc: 'Nhấn nút "+ Add" để tạo bài viết mới với đầy đủ thông tin, hình ảnh và SEO.' },
    { icon: <CheckSquare size={16}/>, color: '#3B82F6', title: 'Chọn nhiều bài', desc: 'Tick checkbox để chọn nhiều bài cùng lúc, sau đó dùng các nút Ẩn / Hiện / Nhân bản / Xóa phía trên bảng.' },
    { icon: <EyeOff size={16}/>, color: '#718096', title: 'Ẩn / Hiện bài viết', desc: '"Ẩn" chuyển bài sang chế độ nháp (ẩn khỏi người đọc). "Hiện" xuất bản lại bài đã ẩn.' },
    { icon: <Copy size={16}/>, color: '#38A169', title: 'Nhân bản', desc: 'Sao chép toàn bộ nội dung bài viết sang bản mới (trạng thái Nháp) để chỉnh sửa.' },
    { icon: <Filter size={16}/>, color: '#DD6B20', title: 'Bộ lọc tìm kiếm', desc: 'Lọc theo chuyên mục, khoảng ngày đăng hoặc tìm theo ID / tiêu đề / tác giả. Nhấn Enter hoặc Search để áp dụng.' },
    { icon: <RotateCcw size={16}/>, color: '#6366F1', title: 'Làm mới', desc: 'Nhấn nút ↺ bên cạnh Search để xóa tất cả bộ lọc và tải lại danh sách.' },
    { icon: <Eye size={16}/>, color: '#718096', title: 'Xem trước', desc: 'Nhấn icon mắt 👁 ở cột Action để mở bài viết trên website trong tab mới.' },
  ];
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <h3 className="modal-title"><HelpCircle size={18} color="#3B82F6"/> Hướng dẫn sử dụng</h3>
          <button className="modal-close" onClick={onClose}><X size={18}/></button>
        </div>
        <div className="modal-body" style={{ padding: '4px 24px 20px' }}>
          <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '16px', marginTop: '12px' }}>
            Trang <b>Quản lý Tin tức</b> giúp bạn tạo, chỉnh sửa và quản lý toàn bộ bài viết.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {tips.map((t, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  background: t.color + '1A', color: t.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>{t.icon}</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B', marginBottom: 2 }}>{t.title}</div>
                  <div style={{ fontSize: '12.5px', color: '#64748B', lineHeight: 1.5 }}>{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>Đã hiểu</button>
        </div>
      </div>
    </div>
  );
}

const PAGE_SIZE = 10;

export default function NewsManager() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast] = useState('');
  const [page, setPage] = useState(1);
  const [showHelp, setShowHelp] = useState(false);

  // Filters
  const [filterCat, setFilterCat] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [searchBy, setSearchBy] = useState('title');
  const [keyword, setKeyword] = useState('');
  const [appliedFilters, setAppliedFilters] = useState({});

  const showToast = (msg, isErr = false) => {
    setToast({ msg, isErr });
    setTimeout(() => setToast(''), 3200);
  };

  const loadData = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const [postsData, catsData] = await Promise.all([
        adminGetAllPosts(filters),
        fetchCategories()
      ]);
      setPosts(Array.isArray(postsData) ? postsData : []);
      setCategories(Array.isArray(catsData) ? catsData : []);
      setSelected([]);
      setPage(1);
    } catch (err) {
      console.error(err);
      showToast('Tải dữ liệu thất bại', true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSearch = () => {
    const f = {};
    if (filterCat) f.category_id = filterCat;
    if (filterFrom) f.from_date = filterFrom;
    if (filterTo) f.to_date = filterTo;
    if (keyword.trim()) { f.search = keyword.trim(); f.search_by = searchBy; }
    setAppliedFilters(f);
    loadData(f);
  };

  // Client-side filtering for fast UX
  const filtered = posts.filter(p => {
    if (appliedFilters.category_id && String(p.category_id) !== String(appliedFilters.category_id)) return false;
    if (appliedFilters.search) {
      const kw = appliedFilters.search.toLowerCase();
      if (appliedFilters.search_by === 'id') return String(p.id) === appliedFilters.search;
      if (appliedFilters.search_by === 'title') return p.title?.toLowerCase().includes(kw);
      if (appliedFilters.search_by === 'author') return p.author_name?.toLowerCase().includes(kw);
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Selection
  const allChecked = pageData.length > 0 && pageData.every(p => selected.includes(p.id));
  const toggleAll = () => {
    if (allChecked) setSelected(s => s.filter(id => !pageData.find(p => p.id === id)));
    else setSelected(s => [...new Set([...s, ...pageData.map(p => p.id)])]);
  };
  const toggleOne = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  // Actions
  const handleBulkStatus = async (status) => {
    if (!selected.length) return showToast('Chưa chọn bài viết nào', true);
    try {
      await adminBulkUpdateStatus(selected, status);
      showToast(`Đã ${status === 'published' ? 'hiện' : 'ẩn'} ${selected.length} bài viết`);
      loadData(appliedFilters);
    } catch { showToast('Thao tác thất bại', true); }
  };

  const handleBulkDelete = () => {
    if (!selected.length) return showToast('Chưa chọn bài viết nào', true);
    setConfirm({
      message: `Xóa ${selected.length} bài viết đã chọn? Thao tác này không thể hoàn tác.`,
      onConfirm: async () => {
        try {
          await adminBulkDelete(selected);
          showToast(`Đã xóa ${selected.length} bài viết`);
          setConfirm(null);
          loadData(appliedFilters);
        } catch { showToast('Xóa thất bại', true); setConfirm(null); }
      }
    });
  };

  const handleClone = async (post) => {
    try {
      await adminClonePost(post.id);
      showToast(`Đã nhân bản "${post.title}"`);
      loadData(appliedFilters);
    } catch { showToast('Nhân bản thất bại', true); }
  };

  const handleDelete = (post) => {
    setConfirm({
      message: `Xóa bài viết "${post.title}"? Thao tác này không thể hoàn tác.`,
      onConfirm: async () => {
        try {
          await adminDeletePost(post.id);
          showToast('Đã xóa bài viết thành công');
          setConfirm(null);
          loadData(appliedFilters);
        } catch { showToast('Xóa thất bại', true); setConfirm(null); }
      }
    });
  };

  return (
    <div className="nm-root">
      {/* Toast */}
      {toast && (
        <div className={`nm-toast ${toast.isErr ? 'nm-toast-err' : 'nm-toast-ok'}`}>
          {toast.msg}
        </div>
      )}
      {confirm && (
        <ConfirmDialog
          message={confirm.message}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}

      {/* Header */}
      <div className="nm-header">
        <div>
          <h1 className="nm-title">QUẢN LÝ TIN TỨC</h1>
        </div>
        <div className="nm-header-actions">
          <button className="nm-btn nm-btn-add" onClick={() => navigate('/admin/news/create')}>
            <Plus size={15} /> Add
          </button>
          <button className="nm-btn nm-btn-manage" onClick={() => navigate('/admin/news')}>
            Manage
          </button>
          <button className="nm-btn nm-btn-help" onClick={() => setShowHelp(true)}>
            <HelpCircle size={14} /> Help
          </button>
        </div>
      </div>

      {/* Filter panel */}
      <div className="nm-filter-panel">
        <div className="nm-filter-row">
          <label className="nm-filter-label">Chuyên mục:</label>
          <select className="nm-select" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
            <option value="">-- Root --</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="nm-filter-row">
          <label className="nm-filter-label">Xem từ ngày:</label>
          <div className="nm-date-input">
            <input type="date" value={filterFrom} onChange={e => setFilterFrom(e.target.value)} />
            <CalendarDays size={16} className="nm-cal-icon" />
          </div>
          <label className="nm-filter-label" style={{ marginLeft: 16 }}>đến ngày:</label>
          <div className="nm-date-input">
            <input type="date" value={filterTo} onChange={e => setFilterTo(e.target.value)} />
            <CalendarDays size={16} className="nm-cal-icon" />
          </div>
        </div>
        <div className="nm-filter-row">
          <label className="nm-filter-label">Tìm kiếm:</label>
          <select className="nm-select nm-select-sm" value={searchBy} onChange={e => setSearchBy(e.target.value)}>
            <option value="id">News ID</option>
            <option value="title">Tiêu đề</option>
            <option value="author">Tác giả</option>
          </select>
          <label className="nm-filter-label" style={{ marginLeft: 12 }}>Từ khóa:</label>
          <input
            className="nm-input"
            type="text"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Nhập từ khóa..."
          />
          <button className="nm-btn nm-btn-search" onClick={handleSearch}>
            <Search size={14} /> Search
          </button>
          <button className="nm-btn nm-btn-refresh" onClick={() => { setFilterCat(''); setFilterFrom(''); setFilterTo(''); setKeyword(''); setAppliedFilters({}); loadData(); }} title="Làm mới">
            <RefreshCw size={14} />
          </button>
        </div>
        <div className="nm-filter-row">
          <label className="nm-filter-label">Tổng cộng:</label>
          <span className="nm-total">{filtered.length}</span>
        </div>
      </div>

      {/* Bulk action bar (top) */}
      <div className="nm-bulk-bar">
        <button className="nm-bulk-btn nm-bulk-hide" onClick={() => handleBulkStatus('draft')}>Ẩn</button>
        <button className="nm-bulk-btn nm-bulk-show" onClick={() => handleBulkStatus('published')}>Hiện</button>
        <button className="nm-bulk-btn nm-bulk-update" onClick={() => {
          if (!selected.length) { showToast('Chưa chọn bài viết nào', true); return; }
          navigate(`/admin/news/edit/${selected[0]}`);
        }}>Cập nhật</button>
        <button className="nm-bulk-btn nm-bulk-clone" onClick={async () => {
          if (!selected.length) { showToast('Chưa chọn bài viết nào', true); return; }
          const post = posts.find(p => p.id === selected[0]);
          if (post) handleClone(post);
        }}>Nhân bản</button>
        <button className="nm-bulk-btn nm-bulk-delete" onClick={handleBulkDelete}>Xóa</button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="admin-loading"><Loader2 size={24} className="spin-icon" /> Đang tải...</div>
      ) : (
        <div className="nm-table-wrapper">
          <table className="nm-table">
            <thead>
              <tr>
                <th style={{ width: 36 }}>
                  <input type="checkbox" checked={allChecked} onChange={toggleAll} className="nm-checkbox" />
                </th>
                <th className="nm-th-order">
                  Thứ tự <span className="nm-sort">▲▼</span>
                </th>
                <th>Hình</th>
                <th>
                  Tiêu đề <span className="nm-sort">▲▼</span>
                </th>
                <th>
                  Chuyên mục <span className="nm-sort">▲▼</span>
                </th>
                <th>
                  Thông tin <span className="nm-sort">▲▼</span>
                </th>
                <th>
                  Action <span className="nm-sort">▲▼</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {pageData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-state">
                    <p>Chưa có bài viết nào</p>
                  </td>
                </tr>
              ) : (
                pageData.map((post, idx) => (
                  <tr key={post.id} className={selected.includes(post.id) ? 'nm-row-selected' : ''}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selected.includes(post.id)}
                        onChange={() => toggleOne(post.id)}
                        className="nm-checkbox"
                      />
                    </td>
                    <td className="nm-td-order">
                      <span className="nm-order-badge">{post.id}</span>
                    </td>
                    <td>
                      {post.thumbnail ? (
                        <img src={post.thumbnail} alt={post.title} className="nm-thumb" />
                      ) : (
                        <div className="nm-thumb-placeholder">📰</div>
                      )}
                    </td>
                    <td className="nm-td-title">
                      <a
                        href="#"
                        className="nm-post-title"
                        onClick={e => { e.preventDefault(); navigate(`/admin/news/edit/${post.id}`); }}
                      >
                        {post.title}
                      </a>
                      <span className="nm-post-id">(ID: {post.id})</span>
                    </td>
                    <td>
                      {post.category_name ? (
                        <span className="nm-cat-link">
                          (ID:{post.category_id}) {post.category_name}
                        </span>
                      ) : (
                        <span className="nm-cat-none">—</span>
                      )}
                    </td>
                    <td className="nm-td-info">
                      <div>Ngày đăng: <b>{post.created_at ? new Date(post.created_at).toLocaleDateString('vi-VN') : '—'}</b></div>
                      <div>Lượt xem: <b>{post.views ?? 0}</b></div>
                      <div>
                        <span className={`badge ${post.status === 'published' ? 'badge-green' : 'badge-yellow'}`}>
                          {post.status === 'published' ? 'Xuất bản' : 'Nháp'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="nm-actions">
                        <button
                          className="nm-action-btn nm-action-clone"
                          title="Nhân bản"
                          onClick={() => handleClone(post)}
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          className="nm-action-btn nm-action-edit"
                          title="Sửa"
                          onClick={() => navigate(`/admin/news/edit/${post.id}`)}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          className="nm-action-btn nm-action-view"
                          title="Xem"
                          onClick={() => window.open(`/post/${post.id}`, '_blank')}
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          className="nm-action-btn nm-action-delete"
                          title="Xóa"
                          onClick={() => handleDelete(post)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Bulk action bar (bottom) */}
      {!loading && (
        <div className="nm-bulk-bar">
          <button className="nm-bulk-btn nm-bulk-hide" onClick={() => handleBulkStatus('draft')}>Ẩn</button>
          <button className="nm-bulk-btn nm-bulk-show" onClick={() => handleBulkStatus('published')}>Hiện</button>
          <button className="nm-bulk-btn nm-bulk-update" onClick={() => {
            if (!selected.length) { showToast('Chưa chọn bài viết nào', true); return; }
            navigate(`/admin/news/edit/${selected[0]}`);
          }}>Cập nhật</button>
          <button className="nm-bulk-btn nm-bulk-clone" onClick={async () => {
            if (!selected.length) { showToast('Chưa chọn bài viết nào', true); return; }
            const post = posts.find(p => p.id === selected[0]);
            if (post) handleClone(post);
          }}>Nhân bản</button>
          <button className="nm-bulk-btn nm-bulk-delete" onClick={handleBulkDelete}>Xóa</button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="nm-pagination">
          <button
            className="nm-page-btn"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            <ChevronLeft size={14} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              className={`nm-page-btn ${p === page ? 'nm-page-active' : ''}`}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}
          <button
            className="nm-page-btn"
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            <ChevronRight size={14} />
          </button>
          <span className="nm-page-info">{page} / {totalPages} trang</span>
        </div>
      )}
      {totalPages <= 1 && !loading && (
        <div className="nm-pagination">
          <button className="nm-page-btn nm-page-active">1</button>
          <span className="nm-page-info">1 Pages</span>
        </div>
      )}
    </div>
  );
}
