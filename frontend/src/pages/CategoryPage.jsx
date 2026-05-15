import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, FolderOpen, ChevronRight } from 'lucide-react';
import { fetchPosts, fetchCategories } from '../services/api';
import './CategoryPage.css';

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '';

const getThumb = (post) => {
  const t = post?.thumbnail || post?.thumbnail_url;
  if (!t || t === 'null' || t === '') return `https://picsum.photos/seed/${post?.id || 1}/400/250`;
  return t;
};
const getPostId = (p) => p?.id || p?.post_id;

const PER_PAGE = 10;

export default function CategoryPage() {
  const { slug } = useParams();
  const [category,    setCategory]    = useState(null);
  const [allCats,     setAllCats]     = useState([]);
  const [posts,       setPosts]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [page,        setPage]        = useState(1);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    Promise.all([fetchCategories(), fetchPosts(1, 100)])
      .then(([cats, postsData]) => {
        const categories = Array.isArray(cats) ? cats : [];
        setAllCats(categories);
        const found = categories.find(
          c => c.slug === slug || String(c.id) === slug || String(c.category_id) === slug
        );
        setCategory(found || null);

        const all = Array.isArray(postsData) ? postsData : (postsData?.posts || []);
        if (found) {
          const catId = found.id || found.category_id;
          setPosts(all.filter(p => Number(p.category_id) === Number(catId)));
        } else {
          setPosts(all);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const totalPages = Math.ceil(posts.length / PER_PAGE);
  const pagePosts  = posts.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  /* Split into feature (first 3) + list (rest) */
  const featurePosts = pagePosts.slice(0, 3);
  const listPosts    = pagePosts.slice(3);

  /* Related categories — siblings at same level */
  const relatedCats = allCats.filter(c => {
    const cid = c.id || c.category_id;
    const thisCid = category?.id || category?.category_id;
    return cid !== thisCid;
  }).slice(0, 8);

  if (loading) return (
    <div className="spinner-wrap" style={{ minHeight: '50vh' }}>
      <div className="spinner"/>
      <p>Đang tải...</p>
    </div>
  );

  return (
    <div className="cat-page container" style={{ marginTop: 24, marginBottom: 48 }}>

      {/* ── Category heading ── */}
      <div className="cat-heading">
        <h1 className="cat-title">{category?.name?.toUpperCase() || 'TẤT CẢ BÀI VIẾT'}</h1>
      </div>

      {pagePosts.length === 0 ? (
        <div className="cat-empty">
          <FolderOpen size={52}/>
          <p>Chưa có bài viết nào trong chuyên mục này.</p>
          <Link to="/" className="btn btn-primary">← Về trang chủ</Link>
        </div>
      ) : (
        <div className="cat-layout">

          {/* ══ LEFT: sidebar ══ */}
          <aside className="cat-sidebar">
            <div className="cat-sb-box">
              <p className="cat-sb-label">Chuyên mục khác</p>
              {relatedCats.map(c => (
                <Link
                  key={c.id || c.category_id}
                  to={`/category/${c.slug || c.id || c.category_id}`}
                  className="cat-sb-link"
                >
                  <ChevronRight size={13}/>
                  {c.name}
                </Link>
              ))}
            </div>
          </aside>

          {/* ══ RIGHT: content ══ */}
          <div className="cat-content">

            {/* Feature row — top 3 with thumbnails */}
            {featurePosts.length > 0 && (
              <div className="cat-feature-row">
                {featurePosts.map(post => (
                  <Link key={getPostId(post)} to={`/post/${getPostId(post)}`} className="cat-feature-card">
                    <div className="cat-feature-thumb">
                      <img
                        src={getThumb(post)}
                        alt={post.title}
                        loading="lazy"
                        onError={e => { e.target.onerror = null; e.target.src = `https://picsum.photos/seed/${getPostId(post)}/400/250`; }}
                      />
                      {post.category_name && (
                        <span className="cat-badge">{post.category_name}</span>
                      )}
                    </div>
                    <p className="cat-feature-title">{post.title}</p>
                    <span className="cat-feature-date"><Clock size={11}/> {formatDate(post.created_at)}</span>
                  </Link>
                ))}
              </div>
            )}

            {/* Divider */}
            {listPosts.length > 0 && <div className="cat-divider"/>}

            {/* Rest as compact horizontal list */}
            <div className="cat-list">
              {listPosts.map(post => (
                <Link key={getPostId(post)} to={`/post/${getPostId(post)}`} className="cat-list-item">
                  <img
                    src={getThumb(post)}
                    alt={post.title}
                    className="cat-list-thumb"
                    loading="lazy"
                    onError={e => { e.target.onerror = null; e.target.src = `https://picsum.photos/seed/${getPostId(post)}/300/180`; }}
                  />
                  <div className="cat-list-info">
                    <p className="cat-list-title">{post.title}</p>
                    <span className="cat-list-date"><Clock size={10}/> {formatDate(post.created_at)}</span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="cat-pagination">
                {page > 1 && (
                  <button onClick={() => { setPage(p => p - 1); window.scrollTo(0, 0); }} className="cat-page-btn">
                    ← Trước
                  </button>
                )}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => { setPage(p); window.scrollTo(0, 0); }}
                    className={`cat-page-btn ${p === page ? 'active' : ''}`}
                  >
                    {p}
                  </button>
                ))}
                {page < totalPages && (
                  <button onClick={() => { setPage(p => p + 1); window.scrollTo(0, 0); }} className="cat-page-btn">
                    Tiếp →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
