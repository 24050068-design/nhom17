import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Clock, SearchX, ChevronDown, ChevronUp } from 'lucide-react';
import { fetchPosts, fetchCategories } from '../services/api';
import './SearchPage.css';

/* ── Helpers ── */
const fmt = (d) => d ? new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
const getThumb = (post) => {
  const t = post?.thumbnail || post?.thumbnail_url;
  if (!t || t === 'null' || t === '') return `https://picsum.photos/seed/${post?.id || post?.post_id || 1}/640/360`;
  return t;
};
const getPostId = (p) => p?.id || p?.post_id;
const stripHtml = (html) => (html || '').replace(/<[^>]+>/g, '');

/**
 * Chuẩn hóa chuỗi tiếng Việt: bỏ dấu, lowercase
 * "Công Nghệ" → "cong nghe"
 */
const normalize = (str) =>
  (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // bỏ dấu thanh
    .replace(/đ/g, 'd')                // đ → d (sau normalize NFD đ vẫn là đ)
    .replace(/\u0111/g, 'd');          // ký tự đ dạng unicode khác


const DATE_FILTERS = [
  { key: 'all',   label: 'Tất cả' },
  { key: '1d',    label: '1 ngày qua' },
  { key: '1w',    label: '1 tuần qua' },
  { key: '1m',    label: '1 tháng qua' },
  { key: '1y',    label: '1 năm qua' },
];

const SORT_OPTIONS = [
  { key: 'newest',   label: 'Mới nhất' },
  { key: 'oldest',   label: 'Cũ nhất' },
  { key: 'relevant', label: 'Liên quan nhất' },
];

function SidebarSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="sp-sidebar-section">
      <button className="sp-sidebar-title" onClick={() => setOpen(o => !o)}>
        {title}
        {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </button>
      {open && <div className="sp-sidebar-body">{children}</div>}
    </div>
  );
}

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [allPosts, setAllPosts]         = useState([]);
  const [categories, setCategories]     = useState([]);
  const [loading, setLoading]           = useState(false);

  // Filters
  const [searchBy,  setSearchBy]        = useState('title');   // 'title' | 'author'
  const [dateFilter, setDateFilter]     = useState('all');
  const [catFilter,  setCatFilter]      = useState('all');
  const [sortBy,     setSortBy]         = useState('newest');

  // Load posts + categories once
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchPosts(1, 200).catch(() => []),
      fetchCategories().catch(() => []),
    ]).then(([postsData, catsData]) => {
      const arr = Array.isArray(postsData) ? postsData : (postsData?.posts || []);
      setAllPosts(arr);
      setCategories(Array.isArray(catsData) ? catsData : []);
    }).finally(() => setLoading(false));
  }, []);

  // Filter + sort
  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q  = query.toLowerCase();
    const qN = normalize(query);   // từ khóa đã bỏ dấu

    // Match helper: so sánh cả có dấu lẫn không dấu
    const match = (text) => {
      const t = (text || '').toLowerCase();
      return t.includes(q) || normalize(t).includes(qN);
    };

    // 1. Search by
    let filtered = allPosts.filter(p => {
      if (searchBy === 'title')  return match(p.title);
      if (searchBy === 'author') return match(p.author_name || p.author || '');
      return match(p.title);
    });

    // 2. Date filter
    if (dateFilter !== 'all') {
      const now = Date.now();
      const ms = { '1d': 86400000, '1w': 604800000, '1m': 2592000000, '1y': 31536000000 };
      filtered = filtered.filter(p => {
        const t = new Date(p.created_at || p.createdAt).getTime();
        return now - t <= ms[dateFilter];
      });
    }

    // 3. Category filter
    if (catFilter !== 'all') {
      filtered = filtered.filter(p => String(p.category_id || p.categoryId) === String(catFilter));
    }

    // 4. Sort
    filtered = [...filtered].sort((a, b) => {
      const ta = new Date(a.created_at || a.createdAt).getTime();
      const tb = new Date(b.created_at || b.createdAt).getTime();
      if (sortBy === 'newest')   return tb - ta;
      if (sortBy === 'oldest')   return ta - tb;
      // relevant: title match weight
      const qa = a.title?.toLowerCase().includes(q) ? 1 : 0;
      const qb = b.title?.toLowerCase().includes(q) ? 1 : 0;
      return qb - qa || tb - ta;
    });

    return filtered;
  }, [allPosts, query, searchBy, dateFilter, catFilter, sortBy]);

  return (
    <div className="container sp-wrap">
      {/* ── Query bar ── */}
      <div className="sp-query-bar">
        <span className="sp-query-text">
          {query ? (<>Kết quả cho: <strong>"{query}"</strong></>) : 'Nhập từ khóa để tìm kiếm'}
        </span>
        {!loading && query && (
          <span className="sp-count">{results.length} kết quả phù hợp</span>
        )}
      </div>

      <div className="sp-layout">
        {/* ── LEFT SIDEBAR ── */}
        <aside className="sp-sidebar">

          <SidebarSection title="Tìm kiếm theo">
            {[{ key: 'title', label: 'Tiêu đề' }, { key: 'author', label: 'Tác giả' }].map(opt => (
              <button key={opt.key}
                className={`sp-filter-item ${searchBy === opt.key ? 'active' : ''}`}
                onClick={() => setSearchBy(opt.key)}>
                {opt.label}
              </button>
            ))}
          </SidebarSection>

          <SidebarSection title="Lọc bài viết theo">
            {DATE_FILTERS.map(opt => (
              <button key={opt.key}
                className={`sp-filter-item ${dateFilter === opt.key ? 'active' : ''}`}
                onClick={() => setDateFilter(opt.key)}>
                {opt.label}
              </button>
            ))}
          </SidebarSection>

          <SidebarSection title="Chuyên mục">
            <div className="sp-cat-list">
              <button
                className={`sp-filter-item ${catFilter === 'all' ? 'active' : ''}`}
                onClick={() => setCatFilter('all')}>
                Tất cả chuyên mục
              </button>
              {categories.map(cat => {
                const id = String(cat.id || cat.category_id);
                return (
                  <button key={id}
                    className={`sp-filter-item ${catFilter === id ? 'active' : ''}`}
                    onClick={() => setCatFilter(id)}>
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </SidebarSection>

        </aside>

        {/* ── RIGHT RESULTS ── */}
        <main className="sp-results">

          {/* Sort bar */}
          {!loading && results.length > 0 && (
            <div className="sp-sort-bar">
              <span>{results.length} kết quả</span>
              <div className="sp-sort-group">
                <span>Sắp xếp theo:</span>
                <select className="sp-sort-sel" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                  {SORT_OPTIONS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
              </div>
            </div>
          )}

          {loading ? (
            <div className="spinner-wrap"><div className="spinner" /><p>Đang tìm kiếm...</p></div>
          ) : !query.trim() ? (
            <div className="sp-empty">
              <SearchX size={52} color="#CBD5E1" />
              <p>Nhập từ khóa vào ô tìm kiếm phía trên.</p>
              <Link to="/" className="btn btn-primary" style={{ marginTop: 16 }}>← Về trang chủ</Link>
            </div>
          ) : results.length === 0 ? (
            <div className="sp-empty">
              <SearchX size={52} color="#CBD5E1" />
              <p>Không tìm thấy kết quả cho <strong>"{query}"</strong> với bộ lọc hiện tại.</p>
              <button className="btn btn-outline" style={{ marginTop: 12 }}
                onClick={() => { setDateFilter('all'); setCatFilter('all'); setSearchBy('title'); }}>
                Xóa bộ lọc
              </button>
            </div>
          ) : (
            <div className="sp-result-list">
              {results.map(post => (
                <Link key={getPostId(post)} to={`/post/${getPostId(post)}`} className="sp-result-item">
                  <div className="sp-result-thumb">
                    <img src={getThumb(post)} alt={post.title} loading="lazy"
                      onError={e => { e.target.onerror = null; e.target.src = `https://picsum.photos/seed/${getPostId(post)}/640/360`; }} />
                  </div>
                  <div className="sp-result-body">
                    {post.category_name && <span className="category-tag">{post.category_name}</span>}
                    <h3 className="sp-result-title">{post.title}</h3>
                    <p className="sp-result-excerpt">{stripHtml(post.content).substring(0, 150)}...</p>
                    <span className="post-date-meta"><Clock size={11} /> {fmt(post.created_at || post.createdAt)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
