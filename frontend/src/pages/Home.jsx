import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { fetchPosts, fetchCategories } from '../services/api';
import './Home.css';

/* ── Helpers ── */
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

const getThumb = (post) => {
  const t = post?.thumbnail || post?.thumbnail_url;
  if (!t || t === "null" || t === "") return `https://picsum.photos/seed/${post?.id || post?.post_id || 1}/640/360`;
  return t;
};

const getExcerpt = (content, len = 110) => {
  if (!content) return '';
  const plain = content.replace(/<[^>]+>/g, '');
  return plain.length > len ? plain.substring(0, len) + '...' : plain;
};

const getPostId = (post) => post?.id || post?.post_id;

/* ── Sub-components ── */
function FeaturedCard({ post }) {
  if (!post) return null;
  return (
    <Link to={`/post/${getPostId(post)}`} className="featured-main">
      <div className="featured-main-thumb">
        <img src={getThumb(post)} alt={post.title} loading="lazy" />
      </div>
      <div className="featured-main-body">
        {post.category_name && (
          <span className="category-tag">{post.category_name}</span>
        )}
        <h2 className="featured-main-title">{post.title}</h2>
        <p className="featured-main-excerpt">{getExcerpt(post.content, 160)}</p>
        <span className="post-date-meta featured-date-meta">
            <Clock size={13} /> {formatDate(post.created_at || post.createdAt)}
          </span>
      </div>
    </Link>
  );
}

function SmallCard({ post }) {
  return (
    <Link to={`/post/${getPostId(post)}`} className="small-card">
      <div className="small-card-thumb">
        <img src={getThumb(post)} alt={post.title} loading="lazy" />
      </div>
      <div className="small-card-body">
        <h3 className="small-card-title">{post.title}</h3>
        <span className="post-date-meta"><Clock size={10} /> {formatDate(post.created_at || post.createdAt)}</span>
      </div>
    </Link>
  );
}

function ListCard({ post }) {
  return (
    <Link to={`/post/${getPostId(post)}`} className="list-card">
      <div className="list-card-thumb">
        <img src={getThumb(post)} alt={post.title} loading="lazy" />
      </div>
      <div className="list-card-body">
        <h3 className="list-card-title">{post.title}</h3>
        <p className="list-card-excerpt">{getExcerpt(post.content, 80)}</p>
        <span className="post-date-meta"><Clock size={11} /> {formatDate(post.created_at || post.createdAt)}</span>
      </div>
    </Link>
  );
}

function LatestNewsItem({ post, index }) {
  return (
    <li className="latest-item">
      <span className="latest-num">{index + 1}</span>
      <Link to={`/post/${getPostId(post)}`} className="latest-link">
        {post.title}
      </Link>
    </li>
  );
}

function HotNewsItem({ post }) {
  return (
    <li className="hot-item">
      <div className="hot-item-thumb">
        <img src={getThumb(post)} alt={post.title} loading="lazy" />
      </div>
      <div className="hot-item-body">
        <Link to={`/post/${getPostId(post)}`} className="hot-item-title">
          {post.title}
        </Link>
        <span className="post-date-meta"><Clock size={11} /> {formatDate(post.created_at || post.createdAt)}</span>
      </div>
    </li>
  );
}

/* ── Main Component ── */
function Home() {
  const [posts, setPosts]       = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState(null);
  const [sideTab, setSideTab]     = useState('latest'); // 'latest' or 'hot'


  useEffect(() => {
    Promise.all([
      fetchPosts(1, 30).catch(() => []),
      fetchCategories().catch(() => []),
    ]).then(([postsData, catsData]) => {
      const arr = Array.isArray(postsData) ? postsData : (postsData?.posts || []);
      setPosts(arr);
      const cats = Array.isArray(catsData) ? catsData : [];
      setCategories(cats);
      if (cats.length > 0) setActiveTab(cats[0].id || cats[0].category_id);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="spinner-wrap" style={{ minHeight: '60vh' }}>
        <div className="spinner"></div>
        <p>Đang tải tin tức...</p>
      </div>
    );
  }

  const publishedPosts = posts.filter(p => !p.status || p.status === 'published' || p.status === 'Xuất bản');

  const featuredPost  = publishedPosts[0] || null;
  const secondaryPosts = publishedPosts.slice(1, 4);
  const latestPosts   = publishedPosts.slice(0, 8);
  const hotPosts      = [...publishedPosts].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);

  // Group by category
  const activeTabCat  = categories.find(c => (c.id || c.category_id) === activeTab);
  const tabPosts      = activeTab
    ? publishedPosts.filter(p => {
        const catId = p.category_id || p.categoryId;
        return Number(catId) === Number(activeTab);
      }).slice(0, 4)
    : publishedPosts.slice(4, 8);

  return (
    <main className="home-page animate-fadeup">



      <div className="container">

        {/* ── MAIN AD BANNER ── */}
        <div className="home-ad-banner container" style={{ marginTop: '15px' }}>
           <img src="https://picsum.photos/1200/100?random=adlongchau" alt="Ad Banner" style={{ width: '100%', borderRadius: '4px', display: 'block' }} />
        </div>

        {/* ── HERO SECTION (THỂ LOẠI BÁO) ── */}
        {publishedPosts.length > 0 ? (
          <section className="hero-section">
            
            {/* Left 2/3 Content */}
            <div className="hero-main">
              {featuredPost && (
                <Link to={`/post/${getPostId(featuredPost)}`} className="hero-featured">
                  <div className="hero-featured-thumb">
                    <img src={getThumb(featuredPost)} alt={featuredPost.title} loading="lazy" />
                  </div>
                  <div className="hero-featured-body">
                    {featuredPost.category_name && (
                      <span className="feat-cat-tag">{featuredPost.category_name}</span>
                    )}
                    <h2>{featuredPost.title}</h2>
                    <p className="hero-featured-excerpt">{getExcerpt(featuredPost.content, 180)}</p>
                    <div className="feat-date">
                       <Clock size={12} /> {formatDate(featuredPost.created_at || featuredPost.createdAt)}
                    </div>
                  </div>
                </Link>
              )}
              {secondaryPosts.length > 0 && (
                <div className="hero-sub-row">
                  {secondaryPosts.map((post, idx) => (
                    <Link to={`/post/${getPostId(post)}`} className="hero-sub-card" key={getPostId(post)}>
                      {post.category_name && (
                         <span className="feat-cat-tag">{post.category_name}</span>
                      )}
                      <h3>{idx === 0 && <span className="live-badge">LIVE</span>}{post.title}</h3>
                      <div className="feat-date">
                         <Clock size={12} /> {formatDate(post.created_at || post.createdAt)}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Right 1/3 Sidebar List */}
            <div className="hero-side">
               <div className="hs-tabs">
                  <div 
                    className={`hs-tab ${sideTab === 'latest' ? 'active' : ''}`}
                    onClick={() => setSideTab('latest')}
                  >
                    Tin mới
                  </div>
                  <div 
                    className={`hs-tab ${sideTab === 'hot' ? 'active' : ''}`}
                    onClick={() => setSideTab('hot')}
                  >
                    Đọc nhiều
                  </div>
               </div>
               <div className="hs-list">
                 {(sideTab === 'latest' ? latestPosts : hotPosts.slice(0, 8)).map(post => (
                    <Link to={`/post/${getPostId(post)}`} className="hs-item" key={getPostId(post)}>
                      <span className="hs-bullet"></span> {post.title}
                    </Link>
                 ))}
               </div>
            </div>

          </section>
        ) : (
          <div className="no-posts-msg">
            <div>📰</div>
            <h2>Chưa có bài viết nào</h2>
            <p>Hãy thêm bài viết qua trang quản trị.</p>
            <Link to="/admin" className="btn btn-primary">Đến trang quản trị</Link>
          </div>
        )}

        {/* ── MAIN LAYOUT: Content + Sidebar ── */}
        <div className="page-wrapper">

          {/* LEFT/MAIN content */}
          <div className="main-content">

            {/* ── Category tabs section ── */}
            {categories.length > 0 && (
              <section className="cat-tabs-section">
                <div className="cat-tabs-header">
                  {categories.slice(0, 6).map(cat => {
                    const catId = cat.id || cat.category_id;
                    return (
                      <button
                        key={catId}
                        className={`cat-tab ${activeTab === catId ? 'active' : ''}`}
                        onClick={() => setActiveTab(catId)}
                      >
                        {cat.name}
                        <span className="cat-tab-arrow">›</span>
                      </button>
                    );
                  })}
                </div>
                <div className="cat-tabs-body">
                  {tabPosts.length > 0 ? (
                    <div className="cat-tabs-grid">
                      {tabPosts.map(post => (
                        <SmallCard key={getPostId(post)} post={post} />
                      ))}
                    </div>
                  ) : (
                    <div className="cat-empty">
                      <p>Chưa có bài viết trong chuyên mục này.</p>
                    </div>
                  )}
                  {activeTabCat && (
                    <div style={{ textAlign: 'right', marginTop: '12px' }}>
                      <Link
                        to={`/category/${activeTabCat.slug || activeTabCat.id || activeTabCat.category_id}`}
                        className="see-more-link"
                      >
                        Xem tất cả chuyên mục {activeTabCat.name} ›
                      </Link>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* ── Latest news list ── */}
            <section className="news-list-section">
              <div className="section-heading">
                <h2>TIN MỚI NHẤT</h2>
              </div>
              <div className="news-list-grid">
                {publishedPosts.slice(0, 8).map(post => (
                  <ListCard key={getPostId(post)} post={post} />
                ))}
              </div>
              {publishedPosts.length === 0 && (
                <p style={{ color: 'var(--text-3)', padding: '20px 0' }}>Chưa có bài viết.</p>
              )}
            </section>

          </div>

          {/* RIGHT Sidebar */}
          <aside className="sidebar">

            {/* Latest items list */}
            <div className="sidebar-widget">
              <div className="section-heading section-heading-accent">
                <h3>TIN MỚI NHẤT</h3>
              </div>
              <ul className="latest-list">
                {latestPosts.map((post, i) => (
                  <LatestNewsItem key={getPostId(post)} post={post} index={i} />
                ))}
              </ul>
            </div>

            {/* Hot news */}
            <div className="sidebar-widget" style={{ marginTop: '20px' }}>
              <div className="section-heading section-heading-accent">
                <h3>TIN XEM NHIỀU</h3>
              </div>
              <ul className="hot-list">
                {hotPosts.map(post => (
                  <HotNewsItem key={getPostId(post)} post={post} />
                ))}
              </ul>
            </div>

          </aside>
        </div>

      </div>
    </main>
  );
}

export default Home;
