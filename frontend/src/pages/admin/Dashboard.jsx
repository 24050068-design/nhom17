import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Users, MessageSquare, Eye, FolderOpen, TrendingUp, Clock, Loader2, ArrowRight } from 'lucide-react';
import { adminGetStats } from '../../services/api';
import './Admin.css';

function Dashboard() {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminGetStats()
      .then(data => setStats(data))
      .catch(err => console.error('Stats error:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="admin-loading">
        <Loader2 size={32} className="spin-icon" />
        <span>Đang tải dữ liệu...</span>
      </div>
    );
  }

  const cards = [
    { icon: FileText,       label: 'Tổng bài viết',   value: stats?.totalPosts     || 0, cls: 'stat-icon-blue',   color: '#3B82F6' },
    { icon: TrendingUp,     label: 'Đã xuất bản',     value: stats?.publishedPosts || 0, cls: 'stat-icon-green',  color: '#10B981' },
    { icon: Clock,          label: 'Bản nháp',         value: stats?.draftPosts     || 0, cls: 'stat-icon-orange', color: '#F59E0B' },
    { icon: Users,          label: 'Người dùng',       value: stats?.totalUsers     || 0, cls: 'stat-icon-purple', color: '#8B5CF6' },
    { icon: MessageSquare,  label: 'Bình luận',        value: stats?.totalComments  || 0, cls: 'stat-icon-cyan',   color: '#06B6D4' },
    { icon: Eye,            label: 'Lượt xem',         value: Number(stats?.totalViews || 0).toLocaleString('vi-VN'), cls: 'stat-icon-pink', color: '#EC4899' },
    { icon: FolderOpen,     label: 'Danh mục',         value: stats?.totalCategories|| 0, cls: 'stat-icon-red',   color: '#EF4444' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="admin-page-header">
        <h1 className="admin-page-title">Tổng quan hệ thống</h1>
        <p className="admin-page-subtitle">
          Chào mừng trở lại! Đây là tình hình hoạt động của website hôm nay.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        {cards.map((card, i) => (
          <div key={i} className="stat-card">
            <div className={`stat-icon ${card.cls}`}>
              <card.icon size={20} />
            </div>
            <div className="stat-info">
              <div className="stat-label">{card.label}</div>
              <div className="stat-value">{card.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Posts Table */}
      <div className="admin-table-wrapper">
        <div className="admin-table-header">
          <h3 className="admin-table-title">
            Bài viết gần đây
            {stats?.recentPosts?.length > 0 && (
              <span>{stats.recentPosts.length}</span>
            )}
          </h3>
          <Link to="/admin/posts" className="btn btn-sm btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            Xem tất cả <ArrowRight size={13} />
          </Link>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Tiêu đề</th>
              <th>Tác giả</th>
              <th>Trạng thái</th>
              <th>Lượt xem</th>
              <th>Ngày tạo</th>
            </tr>
          </thead>
          <tbody>
            {stats?.recentPosts?.length > 0 ? (
              stats.recentPosts.map(post => (
                <tr key={post.id}>
                  <td><span className="text-truncate">{post.title}</span></td>
                  <td style={{ color: '#64748B' }}>{post.author_name || '—'}</td>
                  <td>
                    <span className={`badge ${post.status === 'published' ? 'badge-green' : 'badge-yellow'}`}>
                      {post.status === 'published' ? 'Xuất bản' : 'Nháp'}
                    </span>
                  </td>
                  <td style={{ color: '#64748B' }}>{(post.views || 0).toLocaleString()}</td>
                  <td style={{ color: '#94A3B8', fontSize: '12.5px' }}>
                    {new Date(post.created_at).toLocaleDateString('vi-VN')}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="empty-state">
                  <p>Chưa có bài viết nào</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;
