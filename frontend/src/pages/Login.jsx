import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import './Auth.css';
import { fetchPublicStats } from '../services/api';

function BaoMoiLogo({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="10" fill="url(#brandGradientLogin)"/>
      <defs>
        <linearGradient id="brandGradientLogin" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0052CC" />
          <stop offset="1" stopColor="#0088FF" />
        </linearGradient>
      </defs>
      <path d="M12 14h16M12 20h16M12 26h10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="26" cy="26" r="2.5" fill="white" />
    </svg>
  );
}

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ posts: '...', users: '...', categories: '...' });

  useEffect(() => {
    fetchPublicStats().then(data => {
      setStats({ posts: data.posts, users: data.users, categories: data.categories });
    }).catch(err => console.error("Error fetching stats:", err));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    setLoading(true);
    try {
      const data = await login(form);
      if (data.user?.role_id === 1) navigate('/admin');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.msg || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    window.location.href = `http://localhost:3000/auth/${provider}`;
  };

  return (
    <main className="auth-page">
      <div className="auth-container">

        {/* ── LEFT: Branding ── */}
        <div className="auth-branding">
          <div className="auth-branding-overlay"></div>
          <div className="auth-branding-content">
            <Link to="/" className="auth-brand-logo">
              <span className="auth-brand-logo-icon"><BaoMoiLogo size={38} /></span>
              <div className="auth-brand-logo-text">
                <span className="auth-brand-name">BÁO MỚI</span>
                <span className="auth-brand-name-sub">TIN TỨC</span>
              </div>
            </Link>
            <h2 className="auth-brand-title">Cập nhật tin tức<br />mọi lúc, mọi nơi</h2>
            <p className="auth-brand-desc">
              Đăng nhập để theo dõi tin tức yêu thích, lưu bài viết và tham gia bình luận cùng cộng đồng.
            </p>
            <div className="auth-brand-stats">
              <div className="brand-stat">
                <span className="brand-stat-num">{stats.posts}</span>
                <span className="brand-stat-label">Bài viết</span>
              </div>
              <div className="brand-stat">
                <span className="brand-stat-num">{stats.users}</span>
                <span className="brand-stat-label">Người đọc</span>
              </div>
              <div className="brand-stat">
                <span className="brand-stat-num">{stats.categories}</span>
                <span className="brand-stat-label">Chuyên mục</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Form ── */}
        <div className="auth-form-side">
          <div className="auth-form-wrapper">

            <div className="auth-mobile-logo">
              <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', textDecoration: 'none' }}>
                <BaoMoiLogo size={30} />
                <div>
                  <div className="auth-brand-name" style={{ fontSize: '26px', lineHeight: 1 }}>BÁO MỚI</div>
                  <div className="auth-brand-name-sub" style={{ fontSize: '9px' }}>TIN TỨC</div>
                </div>
              </Link>
            </div>

            <h1 className="auth-heading">Đăng nhập</h1>
            <p className="auth-subheading">Chào mừng trở lại! Nhập thông tin để tiếp tục.</p>

            {/* ── Social Login ── */}
            <p className="auth-social-label">Đăng nhập bằng mạng xã hội</p>
            <div className="auth-social-btns">
              <button
                type="button"
                id="btn-login-google"
                className="auth-social-btn auth-social-btn--google"
                onClick={() => handleSocialLogin('google')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Google</span>
              </button>

              <button
                type="button"
                id="btn-login-facebook"
                className="auth-social-btn auth-social-btn--facebook"
                onClick={() => handleSocialLogin('facebook')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <rect width="24" height="24" rx="5" fill="#1877F2"/>
                  <path d="M16.5 12H14v8h-3v-8H9V9.5h2V8c0-2.2 1.3-3.5 3.3-3.5.9 0 1.7.1 1.7.1V7h-1c-.9 0-1 .4-1 1v1.5h2.1L16.5 12z" fill="white"/>
                </svg>
                <span>Facebook</span>
              </button>

              <button
                type="button"
                id="btn-login-zalo"
                className="auth-social-btn auth-social-btn--zalo"
                onClick={() => handleSocialLogin('zalo')}
              >
                <svg width="20" height="20" viewBox="0 0 48 48">
                  <rect width="48" height="48" rx="10" fill="#0068FF"/>
                  <text x="24" y="32" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold" fontFamily="Arial, sans-serif">Zalo</text>
                </svg>
                <span>Zalo</span>
              </button>
            </div>

            <div className="auth-divider"><span>Hoặc đăng nhập bằng email</span></div>

            {error && (
              <div className="auth-alert auth-alert-error">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zM7 5h2v4H7V5zm0 5h2v2H7v-2z"/></svg>
                {error}
              </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-field">
                <label htmlFor="login-username">Tên đăng nhập hoặc Email</label>
                <input
                  id="login-username"
                  type="text"
                  name="username"
                  placeholder="Nhập tên đăng nhập hoặc email"
                  value={form.username}
                  onChange={handleChange}
                  autoComplete="username"
                />
              </div>

              <div className="form-field">
                <div className="form-field-header">
                  <label htmlFor="login-password">Mật khẩu</label>
                  <Link to="/forgot-password" className="form-link">Quên mật khẩu?</Link>
                </div>
                <div className="password-field">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Nhập mật khẩu"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                  />
                  <button type="button" className="password-toggle" onClick={() => setShowPassword(s => !s)}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <label className="checkbox-field">
                <input type="checkbox" />
                <span>Ghi nhớ đăng nhập</span>
              </label>

              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? (<><Loader2 size={18} className="spin-icon" /> Đang xử lý...</>) : ('Đăng nhập')}
              </button>
            </form>

            <p className="auth-switch">
              Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}

export default Login;
