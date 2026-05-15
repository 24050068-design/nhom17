import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, FileText, FolderOpen, Users, MessageSquare,
  LogOut, Menu, X, ChevronLeft, Bell, Settings, ExternalLink, Newspaper, Package
} from 'lucide-react';
import './AdminLayout.css';

const navItems = [
  { to: '/admin',            icon: LayoutDashboard, label: 'Tổng quan',    end: true },
  { to: '/admin/news',       icon: Newspaper,        label: 'Tin tức' },
  { to: '/admin/posts',      icon: FileText,         label: 'Bài viết' },
  { to: '/admin/categories', icon: FolderOpen,       label: 'Danh mục' },
  { to: '/admin/users',      icon: Users,            label: 'Người dùng' },
  { to: '/admin/comments',   icon: MessageSquare,    label: 'Bình luận' },
  { to: '/admin/orders',     icon: Package,          label: 'Đơn đặt báo' },
];

function AdminLayout() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen]   = useState(false);

  if (!user || !isAdmin) return <Navigate to="/login" replace />;

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="admin-layout">
      {/* Mobile overlay */}
      {mobileOpen && <div className="admin-overlay" onClick={() => setMobileOpen(false)} />}

      {/* ── Sidebar ── */}
      <aside className={`admin-sidebar ${sidebarOpen ? '' : 'admin-sidebar-collapsed'} ${mobileOpen ? 'admin-sidebar-mobile-open' : ''}`}>

        {/* Header */}
        <div className="admin-sidebar-header">
          <NavLink to="/" className="admin-logo" title="Về trang chủ">
            <svg width="22" height="22" viewBox="0 0 40 40" fill="none" style={{ flexShrink: 0 }}>
              <rect width="40" height="40" rx="6" fill="rgba(255,255,255,0.15)"/>
              <rect x="5" y="8" width="30" height="2.5" rx="1" fill="white" opacity="0.9"/>
              <rect x="5" y="14" width="18" height="2" rx="1" fill="white" opacity="0.7"/>
              <rect x="5" y="19" width="18" height="2" rx="1" fill="white" opacity="0.7"/>
              <rect x="5" y="24" width="12" height="2" rx="1" fill="white" opacity="0.5"/>
              <rect x="25" y="14" width="10" height="12" rx="2" fill="#F87171" opacity="0.9"/>
            </svg>
            {sidebarOpen && (
              <div style={{ lineHeight: 1.1, overflow: 'hidden' }}>
                <div style={{ fontSize: '15px', fontWeight: 800, color: 'white', letterSpacing: '1.5px', fontFamily: 'Montserrat, sans-serif' }}>BÁO MỚI</div>
                <div style={{ fontSize: '9.5px', color: '#60A5FA', letterSpacing: '1px', fontWeight: 500 }}>QUẢN TRỊ</div>
              </div>
            )}
          </NavLink>
          <button className="sidebar-toggle desktop-toggle" onClick={() => setSidebarOpen(s => !s)} title="Thu gọn menu">
            <ChevronLeft size={16} className={sidebarOpen ? '' : 'rotate-180'} />
          </button>
          <button className="sidebar-toggle mobile-toggle" onClick={() => setMobileOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="admin-nav">
          {sidebarOpen && (
            <div style={{ fontSize: '10px', fontWeight: 600, color: '#334155', textTransform: 'uppercase', letterSpacing: '1px', padding: '4px 12px 8px', marginBottom: '4px' }}>
              Menu chính
            </div>
          )}
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
              title={!sidebarOpen ? item.label : undefined}
            >
              <item.icon size={18} style={{ flexShrink: 0 }} />
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="admin-sidebar-footer">
          <div className="admin-user-info">
            <div className="admin-user-avatar">
              {user.username?.[0]?.toUpperCase() || 'A'}
            </div>
            {sidebarOpen && (
              <div className="admin-user-details">
                <span className="admin-user-name">{user.username}</span>
                <span className="admin-user-role">Quản trị viên</span>
              </div>
            )}
          </div>
          <button className="admin-logout-btn" onClick={handleLogout} title="Đăng xuất">
            <LogOut size={16} style={{ flexShrink: 0 }} />
            {sidebarOpen && <span>Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="admin-main">

        {/* Top bar */}
        <header className="admin-topbar">
          <button className="mobile-menu-trigger" onClick={() => setMobileOpen(true)}>
            <Menu size={20} />
          </button>

          <div className="admin-topbar-right">
            <NavLink to="/" className="back-to-site">
              <ExternalLink size={13} />
              Xem website
            </NavLink>
          </div>
        </header>

        {/* Content */}
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;
