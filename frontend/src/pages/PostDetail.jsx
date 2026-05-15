import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  fetchPostById, fetchCommentsByPost, postComment,
  fetchPosts, ratePost, toggleBookmark, addReadingHistory
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Clock, Eye, MessageCircle, Bookmark, Share2, Check, ThumbsUp } from 'lucide-react';
import './PostDetail.css';

// helper: like a comment via direct API
async function likeComment(id) {
  const { default: api } = await import('../services/api');
  return api.post(`/comments/like/${id}`).then(r => r.data);
}

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

const getThumb = (post) => {
  const t = post?.thumbnail || post?.thumbnail_url;
  if (!t || t === "null" || t === "") return `https://picsum.photos/seed/${post?.id || post?.post_id || 1}/640/360`;
  return t;
};

const getPostId = (post) => post?.id || post?.post_id;

function PostDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [post, setPost]             = useState(null);
  const [comments, setComments]     = useState([]);
  const [relatedPosts, setRelated]  = useState([]);
  const [loading, setLoading]       = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [commentError, setCommentError] = useState('');
  const [copied, setCopied]         = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingMsg, setRatingMsg]   = useState('');
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkMsg, setBookmarkMsg] = useState('');
  const [replyTo, setReplyTo]       = useState(null);
  const [replyText, setReplyText]   = useState('');
  const [likedIds, setLikedIds]     = useState(new Set());

  useEffect(() => {
    setLoading(true);
    window.scrollTo(0, 0);

    Promise.all([
      fetchPostById(id),
      fetchCommentsByPost(id).catch(() => []),
      fetchPosts(1, 6).catch(() => []),
    ]).then(([postData, commentData, postsData]) => {
      const p = postData?.post || postData;
      setPost(p);
      setComments(Array.isArray(commentData) ? commentData : []);
      const all = Array.isArray(postsData) ? postsData : (postsData?.posts || []);
      setRelated(all.filter(r => getPostId(r) !== Number(id)).slice(0, 4));
      // Track reading history
      if (user) addReadingHistory(id).catch(() => {});
    }).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  const handleFbShare = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
      'facebook-share-dialog',
      'width=800,height=600'
    );
  };

  const handleShare = async () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleRate = async (score) => {
    if (!user) { setRatingMsg('Vui lòng đăng nhập để đánh giá.'); return; }
    setUserRating(score);
    try {
      await ratePost(id, score);
      setRatingMsg(`Đã đánh giá ${score} sao!`);
      setTimeout(() => setRatingMsg(''), 2500);
    } catch { setRatingMsg('Không thể gửi đánh giá.'); }
  };

  const handleBookmark = async () => {
    if (!user) { setBookmarkMsg('Đăng nhập để lưu bài.'); return; }
    try {
      await toggleBookmark(id);
      setBookmarked(b => !b);
      setBookmarkMsg(bookmarked ? 'Đã bỏ lưu.' : 'Đã lưu bài viết!');
      setTimeout(() => setBookmarkMsg(''), 2200);
    } catch { setBookmarkMsg('Có lỗi xảy ra.'); }
  };

  const handleLikeComment = async (commentId) => {
    if (!user) return;
    try {
      await likeComment(commentId);
      setLikedIds(prev => {
        const next = new Set(prev);
        next.has(commentId) ? next.delete(commentId) : next.add(commentId);
        return next;
      });
    } catch {}
  };

  const handleReplySubmit = async (e, parentId) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    try {
      await postComment({ post_id: id, content: replyText, parent_id: parentId });
      setReplyText(''); setReplyTo(null);
      fetchCommentsByPost(id).then(d => setComments(Array.isArray(d) ? d : []));
    } catch {}
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) { setCommentError('Vui lòng nhập nội dung bình luận.'); return; }
    setSubmitting(true);
    setCommentError('');
    try {
      await postComment({ content: commentText.trim(), postId: id });
      setCommentText('');
      const updated = await fetchCommentsByPost(id).catch(() => []);
      setComments(Array.isArray(updated) ? updated : []);
    } catch (err) {
      setCommentError(err.response?.data?.msg || 'Không thể gửi bình luận.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="spinner-wrap" style={{ minHeight: '60vh' }}>
      <div className="spinner"></div>
      <p>Đang tải bài viết...</p>
    </div>
  );

  if (!post) return (
    <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
      <h2 style={{ marginBottom: '16px' }}>Bài viết không tồn tại</h2>
      <Link to="/" className="btn btn-primary">← Về trang chủ</Link>
    </div>
  );

  const thumbnail  = getThumb(post);
  const views      = post.views ?? post.view_count ?? 0;
  const dateRaw    = post.created_at || post.createdAt;
  const contentParagraphs = post.content
    ? post.content.split('\n').filter(p => p.trim() !== '')
    : [];

  return (
    <div className="container">
      <div className="detail-layout animate-fadeup">

        {/* ── MAIN ARTICLE ── */}
        <article className="detail-article">
          {/* Breadcrumb */}
          <nav className="breadcrumb">
            <Link to="/" className="breadcrumb-link">Trang chủ</Link>
            <span className="breadcrumb-sep">›</span>
            {post.category_name && (
              <>
                <Link
                  to={`/category/${post.category_slug || post.category_id}`}
                  className="breadcrumb-link"
                >
                  {post.category_name}
                </Link>
                <span className="breadcrumb-sep">›</span>
              </>
            )}
            <span className="breadcrumb-current">{post.title}</span>
          </nav>

          {/* Category */}
          {post.category_name && (
            <span className="detail-category" style={{ background: 'transparent', color: '#0056b3', padding: 0, fontSize: '13px', marginBottom: '8px', borderBottom: '1px solid #eee' }}>
              {post.category_name}
            </span>
          )}

          {/* Title - Normalize NFC to fix floating diacritics */}
          <h1 className="detail-title">{post.title?.normalize('NFC')}</h1>

          {/* Meta Bar */}
          <div className="post-top-meta">
            <div className="ptm-row-1">
              <div className="ptm-author">
                <div className="ptm-avatar">
                  <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(post.author_name || 'Ban Bien Tap')}&background=003D8F&color=ffffff`} alt="Author" />
                </div>
                <strong>{post.author_name || 'Ban Biên Tập'}</strong>
              </div>
              <div className="ptm-date">{formatDate(dateRaw)} GMT+7</div>
            </div>

            <div className="ptm-row-2">
              {/* Left: Facebook + Messenger */}
              <div className="ptm-social-left">
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                   target="_blank" rel="noopener noreferrer" className="ptm-btn-fb" title="Chia sẻ Facebook">
                  <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z"/>
                  </svg>
                  <span>Facebook</span>
                </a>
                <a href={`fb-messenger://share?link=${encodeURIComponent(window.location.href)}`}
                   className="ptm-btn-mess" title="Messenger">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.09.301 2.246.464 3.443.464 6.627 0 12-4.974 12-11.111C24 4.974 18.627 0 12 0zm1.191 14.966l-3.048-3.266-5.962 3.266 6.55-6.953 3.129 3.265 5.882-3.265-6.551 6.953z"/>
                  </svg>
                </a>
              </div>

              {/* Right: Zalo + X + Copy */}
              <div className="ptm-social-right">
                <a href={`https://zalo.me/share/url?url=${encodeURIComponent(window.location.href)}`}
                   target="_blank" rel="noopener noreferrer" className="ptm-icon-circle ptm-zalo" title="Zalo">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M21.1146 11.233C21.1146 6.36838 17.0673 2.42468 12.0759 2.42468C7.08451 2.42468 3.03711 6.36838 3.03711 11.233C3.03711 13.9103 4.38153 16.284 6.46747 17.8106C6.2625 18.8475 5.58611 20.3129 5.55833 20.3707C5.4597 20.5905 5.68884 20.8037 5.88939 20.6974L9.41407 18.8268C10.2529 19.102 11.1466 19.2555 12.0759 19.2555C17.0673 19.2555 21.1146 15.3118 21.1146 10.4471V11.233Z" fill="currentColor"/>
                  </svg>
                </a>
                <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.title || '')}`}
                   target="_blank" rel="noopener noreferrer" className="ptm-icon-circle ptm-twitter" title="X (Twitter)">
                  <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <button className="ptm-icon-circle ptm-copy" onClick={handleShare} title={copied ? 'Đã sao chép!' : 'Sao chép link'}>
                  {copied ? <Check size={14} strokeWidth={2.5}/> : <Share2 size={14} strokeWidth={2}/>}
                </button>
              </div>
            </div>
          </div>


          {/* Hero image */}
          {thumbnail && (
            <div className="detail-featured-img">
              <img src={thumbnail} alt={post.title} />
            </div>
          )}

          {/* Content */}
          <div className="detail-content" dangerouslySetInnerHTML={{ __html: post.content?.normalize('NFC') || '' }} />

          {/* Tags / share / save footer */}
          <div className="detail-footer">
            <div className="action-save-box">
              <button 
                className={`action-save-btn ${bookmarked ? 'is-saved' : ''}`} 
                onClick={handleBookmark}
              >
                <Bookmark size={15} fill={bookmarked ? 'currentColor' : 'none'} />
                <span>{bookmarked ? 'Đã lưu bài' : 'Lưu bài viết'}</span>
              </button>
              {bookmarkMsg && <span className="bookmark-msg-toast">{bookmarkMsg}</span>}
            </div>

            <div className="detail-share">
              <span>Chia sẻ:</span>
              <button className="share-btn fb-share" onClick={handleFbShare}>Facebook</button>
              <button className="share-btn tw-share" onClick={handleShare}>Twitter</button>
              <button className="share-btn copy-share" onClick={handleShare}>
                {copied ? <Check size={12} /> : <Share2 size={12} />} {copied ? 'Đã sao chép' : 'Sao chép link'}
              </button>
            </div>
          </div>

          {/* ── COMMENTS ── */}
          <section className="comments-section">
            <div className="section-heading">
              <h2>BÌNH LUẬN ({comments.length})</h2>
            </div>

            {user ? (
              <form className="comment-form" onSubmit={handleCommentSubmit}>
                <div className="comment-form-avatar">
                  {user.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="comment-form-right">
                  <textarea
                    rows="3"
                    placeholder={`Bình luận với tư cách ${user.username}...`}
                    value={commentText}
                    onChange={e => { setCommentText(e.target.value); setCommentError(''); }}
                    className="form-input comment-textarea"
                  />
                  {commentError && <p className="comment-error">{commentError}</p>}
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                    style={{ marginTop: '8px' }}
                  >
                    {submitting ? 'Đang gửi...' : 'Gửi bình luận'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="comment-login-prompt">
                <p>Vui lòng <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>đăng nhập</Link> để bình luận.</p>
              </div>
            )}

            <div className="comments-list">
              {comments.length === 0 ? (
                <p className="no-comments">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
              ) : (
                comments.map((c, i) => {
                  const cid = c.id || c.comment_id;
                  const liked = likedIds.has(cid);
                  const showReplyForm = replyTo?.id === cid;
                  return (
                    <div key={cid || i} className="comment-item">
                      <div className="comment-avatar">
                        {(c.username || 'A')[0].toUpperCase()}
                      </div>
                      <div className="comment-body">
                        <div className="comment-header">
                          <span className="comment-author">{c.username || 'Ẩn danh'}</span>
                          <span className="comment-date">{formatDate(c.created_at || c.createdAt)}</span>
                        </div>
                        <p className="comment-text">{c.content}</p>
                        {/* Action row */}
                        <div className="comment-actions">
                          <button
                            className={`cmt-action-btn ${liked ? 'liked' : ''}`}
                            onClick={() => handleLikeComment(cid)}
                            title="Thích"
                          >
                            <ThumbsUp size={12} /> {liked ? 'Đã thích' : 'Thích'}{c.like_count > 0 ? ` (${c.like_count})` : ''}
                          </button>
                          {user && (
                            <button
                              className="cmt-action-btn"
                              onClick={() => { setReplyTo(showReplyForm ? null : { id: cid, username: c.username }); setReplyText(''); }}
                            >
                            <MessageCircle size={13} /> Trả lời
                            </button>
                          )}
                        </div>
                        {/* Reply form */}
                        {showReplyForm && (
                          <form className="reply-form" onSubmit={e => handleReplySubmit(e, cid)}>
                            <textarea
                              className="form-input reply-textarea"
                              rows="2"
                              placeholder={`Trả lời ${replyTo.username}...`}
                              value={replyText}
                              onChange={e => setReplyText(e.target.value)}
                              autoFocus
                            />
                            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                              <button type="submit" className="btn btn-primary btn-sm">Gửi</button>
                              <button type="button" className="btn btn-outline btn-sm" onClick={() => { setReplyTo(null); setReplyText(''); }}>Hủy</button>
                            </div>
                          </form>
                        )}
                        {/* Nested replies */}
                        {c.replies && c.replies.length > 0 && (
                          <div className="replies-list">
                            {c.replies.map((r, ri) => (
                              <div key={r.id || ri} className="reply-item">
                                <div className="comment-avatar reply-avatar">
                                  {(r.username || 'A')[0].toUpperCase()}
                                </div>
                                <div className="comment-body">
                                  <div className="comment-header">
                                    <span className="comment-author">{r.username || 'Ẩn danh'}</span>
                                    <span className="comment-date">{formatDate(r.created_at)}</span>
                                  </div>
                                  <p className="comment-text">{r.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </article>

        {/* ── DETAIL SIDEBAR ── */}
        <aside className="detail-sidebar">
          {/* Ad Banners */}
          <div className="sidebar-ad">
            <img src="https://picsum.photos/300/600?random=sunprop" alt="Sun Property Ad" style={{ width: '100%', borderRadius: '4px', marginBottom: '16px', display: 'block' }} />
          </div>
          <div className="sidebar-ad">
            <img src="https://picsum.photos/300/600?random=blancacity" alt="Blanca City Ad" style={{ width: '100%', borderRadius: '4px', marginBottom: '16px', display: 'block' }} />
          </div>
          
          <h3 style={{ fontSize: '16px', borderBottom: '2px solid var(--primary)', paddingBottom: '8px', marginBottom: '12px' }}>Tin liên quan</h3>
          <div className="related-list">
            {relatedPosts.map(rp => (
              <Link to={`/post/${getPostId(rp)}`} className="related-item" key={getPostId(rp)}>
                <div className="related-thumb">
                  <img src={getThumb(rp)} alt={rp.title} loading="lazy" />
                </div>
                <div className="related-body">
                  <h4 className="related-title">{rp.title}</h4>
                </div>
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default PostDetail;
