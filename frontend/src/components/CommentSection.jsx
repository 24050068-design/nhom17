import React, { useState } from 'react';
import { ThumbsUp, MessageCircle } from 'lucide-react';
import './CommentSection.css';

function CommentItem({ comment, depth = 0 }) {
  const [showReply, setShowReply] = useState(false);

  const dateRaw = comment.created_at || comment.createdAt;
  const date = dateRaw
    ? new Date(dateRaw).toLocaleDateString('vi-VN', { year: 'numeric', month: 'short', day: 'numeric' })
    : '';

  return (
    <div className={`comment-item ${depth > 0 ? 'comment-reply' : ''}`}>
      <div className="comment-avatar">
        {comment.username ? comment.username[0].toUpperCase() : 'U'}
      </div>
      <div className="comment-body">
        <div className="comment-header">
          <span className="comment-author">{comment.username || 'Ẩn danh'}</span>
          {date && <span className="comment-date">{date}</span>}
        </div>
        <p className="comment-content">{comment.content}</p>
        <div className="comment-actions">
          <button className="comment-action-btn">
            <ThumbsUp size={14} /> Thích
          </button>
          <button className="comment-action-btn" onClick={() => setShowReply(s => !s)}>
            <MessageCircle size={14} /> Trả lời
          </button>
        </div>

        {/* Nested replies */}
        {comment.children && comment.children.length > 0 && (
          <div className="comment-children">
            {comment.children.map(child => (
              <CommentItem key={child.id} comment={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CommentSection({ comments = [], postId, onSubmit }) {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit(text);
      setText('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="comment-section">
      <h3 className="comment-section-title">
        <MessageCircle size={20} />
        Bình luận ({comments.length})
      </h3>

      {/* Comment form */}
      <form className="comment-form" onSubmit={handleSubmit}>
        <textarea
          className="comment-input"
          placeholder="Viết bình luận của bạn..."
          value={text}
          onChange={e => setText(e.target.value)}
          rows={3}
          required
        />
        <button className="btn-primary comment-submit" type="submit" disabled={submitting}>
          {submitting ? 'Đang gửi...' : 'Gửi bình luận'}
        </button>
      </form>

      {/* Comment list */}
      <div className="comment-list">
        {comments.length === 0 && (
          <p className="no-comments">Chưa có bình luận. Hãy là người đầu tiên!</p>
        )}
        {comments.map(c => (
          <CommentItem key={c.id} comment={c} />
        ))}
      </div>
    </section>
  );
}

export default CommentSection;
