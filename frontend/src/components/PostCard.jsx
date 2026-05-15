import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Eye, Star } from 'lucide-react';
import './PostCard.css';

const DEFAULT_IMG = 'https://images.unsplash.com/photo-1495020689067-958852a7765e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

function PostCard({ post }) {
  // Support both snake_case (MySQL) and camelCase
  const postId       = post.id || post.post_id;
  const thumbnail    = post.thumbnail || post.thumbnail_url || DEFAULT_IMG;
  const views        = post.views ?? post.view_count ?? 0;
  const rating       = post.average_rating ? parseFloat(post.average_rating).toFixed(1) : null;
  const dateRaw      = post.created_at || post.createdAt;
  const categoryName = post.category_name || post.status || null; // category JOIN or fallback

  const formattedDate = dateRaw
    ? new Date(dateRaw).toLocaleDateString('vi-VN', {
        year: 'numeric', month: 'short', day: 'numeric'
      })
    : '';

  const excerpt = post.content
    ? post.content.replace(/<[^>]+>/g, '').substring(0, 120) + '...'
    : 'Chưa có nội dung.';

  return (
    <div className="post-card animate-fade-in">
      <div style={{ position: 'relative' }}>
        <Link to={`/post/${postId}`} className="post-card-img-wrapper">
          <img 
            src={thumbnail} 
            alt={post.title} 
            className="post-card-img" 
            onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_IMG; }}
          />
        </Link>
        {categoryName && (
          <Link 
            to={`/category/${post.category_id || post.category_slug || categoryName}`} 
            className="post-card-category"
            style={{ zIndex: 10 }}
          >
            {categoryName}
          </Link>
        )}
      </div>

      <div className="post-card-content">
        <Link to={`/post/${postId}`}>
          <h3 className="post-card-title">{post.title}</h3>
        </Link>
        <p className="post-card-excerpt">{excerpt}</p>

        <div className="post-card-meta">
          {dateRaw && (
            <span className="meta-item">
              <Clock size={14} /> {formattedDate}
            </span>
          )}
          <span className="meta-item">
            <Eye size={14} /> {views}
          </span>
          {rating && (
            <span className="meta-item meta-rating">
              <Star size={14} /> {rating}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default PostCard;
