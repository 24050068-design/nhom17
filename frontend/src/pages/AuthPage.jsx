import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import './AuthPage.css';

/* ── Google Icon ── */
function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

/* ── Facebook Icon ── */
function FacebookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="4" fill="#1877F2"/>
      <path d="M16.5 12H14v8h-3v-8H9V9.5h2V8c0-2.2 1.3-3.5 3.3-3.5.9 0 1.7.1 1.7.1V7h-1c-.9 0-1 .4-1 1v1.5h2.1L16.5 12z" fill="white"/>
    </svg>
  );
}

/* ── Zalo Icon ── */
function ZaloIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="8" fill="#0068FF"/>
      <path d="M8 32c0 0 3-6 3-12s-3-8-3-8h6c0 0 2 2 2 8s-2 12-2 12H8z" fill="white" opacity="0"/>
      <text x="24" y="31" textAnchor="middle" fill="white" fontSize="15" fontWeight="bold" fontFamily="Arial, sans-serif">Zalo</text>
    </svg>
  );
}

function AuthPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isRegisterRoute = location.pathname === '/register';
  const [activeTab, setActiveTab] = useState(isRegisterRoute ? 'register' : 'login');
  const [toast, setToast] = useState(null); // { msg, type }

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSocialLogin = (provider) => {
    // Direct redirect đến backend port 3000 — OAuth flow thật sự
    window.location.href = `http://localhost:3000/auth/${provider}`;
  };

  useEffect(() => {

    setActiveTab(location.pathname === '/register' ? 'register' : 'login');
  }, [location.pathname]);

  const switchTab = (tab) => {
    setActiveTab(tab);
    navigate(tab === 'register' ? '/register' : '/login', { replace: true });
  };

  /* ── Login state ── */
  const [loginForm, setLoginForm]   = useState({ username: '', password: '' });
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  /* ── Register state ── */
  const [regForm, setRegForm] = useState({ email: '', displayName: '', password: '', confirmPassword: '' });
  const [showRegPw, setShowRegPw]       = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [regError, setRegError]   = useState('');
  const [regSuccess, setRegSuccess] = useState(false);
  const [regLoading, setRegLoading] = useState(false);

  const handleLoginChange = (e) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
    if (loginError) setLoginError('');
  };
  const handleRegChange = (e) => {
    setRegForm({ ...regForm, [e.target.name]: e.target.value });
    if (regError) setRegError('');
  };

  /* ── Login submit ── */
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginForm.username || !loginForm.password) {
      setLoginError('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    setLoginLoading(true);
    try {
      const data = await login(loginForm);
      if (data.user?.role_id === 1) navigate('/admin');
      else navigate('/');
    } catch (err) {
      setLoginError(err.response?.data?.msg || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoginLoading(false);
    }
  };

  /* ── Register submit ── */
  const handleRegSubmit = async (e) => {
    e.preventDefault();
    if (!regForm.displayName || !regForm.email || !regForm.password) {
      setRegError('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    if (regForm.password.length < 6) {
      setRegError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    if (regForm.password !== regForm.confirmPassword) {
      setRegError('Mật khẩu xác nhận không khớp');
      return;
    }
    setRegLoading(true);
    try {
      const usernameToUse = regForm.displayName.trim() || regForm.email.split('@')[0];
      await register({ username: usernameToUse, email: regForm.email, password: regForm.password });
      setRegSuccess(true);
      setTimeout(() => {
        switchTab('login');
        setRegSuccess(false);
      }, 2000);
    } catch (err) {
      setRegError(err.response?.data?.msg || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setRegLoading(false);
    }
  };

  const passwordStrength = regForm.password.length >= 10 ? 'strong'
    : regForm.password.length >= 6 ? 'medium'
    : regForm.password.length > 0 ? 'weak' : '';

  return (
    <div className="ap-page">
      <div className="ap-card">

        {/* ── Tabs ── */}
        <div className="ap-tabs">
          <button
            className={`ap-tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => switchTab('login')}
          >
            Đăng nhập
          </button>
          <button
            className={`ap-tab ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => switchTab('register')}
          >
            Đăng ký
          </button>
        </div>

        <div className="ap-card-body">

          {/* ── Social Login ── */}
          <p className="ap-social-label">Bằng tài khoản mạng xã hội</p>
          <div className="ap-social-btns">
            <button className="ap-social-btn" type="button" onClick={() => handleSocialLogin('google')}>
              <GoogleIcon /> Google
            </button>
            <button className="ap-social-btn" type="button" onClick={() => handleSocialLogin('facebook')}>
              <FacebookIcon /> Facebook
            </button>
            <button className="ap-social-btn" type="button" onClick={() => handleSocialLogin('zalo')}>
              <ZaloIcon /> Zalo
            </button>
          </div>

          {/* Toast notification */}
          {toast && (
            <div className={`ap-toast ap-toast-${toast.type}`}>
              {toast.type === 'warn' && '⚠️ '}
              {toast.type === 'error' && '❌ '}
              {toast.type === 'info' && 'ℹ️ '}
              {toast.msg}
            </div>
          )}

          <div className="ap-divider"><span>Hoặc</span></div>

          {/* ══ LOGIN FORM ══ */}
          {activeTab === 'login' && (
            <form className="ap-form" onSubmit={handleLoginSubmit}>
              {loginError && (
                <div className="ap-alert ap-alert-error">
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zM7 5h2v4H7V5zm0 5h2v2H7v-2z"/></svg>
                  {loginError}
                </div>
              )}

              <div className="ap-field">
                <label htmlFor="ap-login-email">Email</label>
                <input
                  id="ap-login-email"
                  type="text"
                  name="username"
                  placeholder="Nhập email"
                  value={loginForm.username}
                  onChange={handleLoginChange}
                  autoComplete="username"
                />
              </div>

              <div className="ap-field">
                <div className="ap-field-header">
                  <label htmlFor="ap-login-pw">Mật khẩu</label>
                  <Link to="/forgot-password" className="ap-forgot-link">Quên mật khẩu?</Link>
                </div>
                <div className="ap-pw-wrap">
                  <input
                    id="ap-login-pw"
                    type={showLoginPw ? 'text' : 'password'}
                    name="password"
                    placeholder="Nhập mật khẩu"
                    value={loginForm.password}
                    onChange={handleLoginChange}
                    autoComplete="current-password"
                  />
                  <button type="button" className="ap-pw-toggle" onClick={() => setShowLoginPw(s => !s)}>
                    {showLoginPw ? <EyeOff size={18} color="#9CA3AF"/> : <Eye size={18} color="#9CA3AF"/>}
                  </button>
                </div>
              </div>

              <button type="submit" className="ap-submit-btn" disabled={loginLoading}>
                {loginLoading
                  ? <><Loader2 size={17} className="spin-icon"/> Đang xử lý...</>
                  : 'Đăng nhập'}
              </button>
            </form>
          )}

          {/* ══ REGISTER FORM ══ */}
          {activeTab === 'register' && (
            <form className="ap-form" onSubmit={handleRegSubmit}>
              {regSuccess && (
                <div className="ap-alert ap-alert-success">
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zm3.7 5.3l-4 4a1 1 0 01-1.4 0l-2-2a1 1 0 011.4-1.4L7 8.2l3.3-3.3a1 1 0 011.4 1.4z"/></svg>
                  Đăng ký thành công! Đang chuyển hướng...
                </div>
              )}
              {regError && (
                <div className="ap-alert ap-alert-error">
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zM7 5h2v4H7V5zm0 5h2v2H7v-2z"/></svg>
                  {regError}
                </div>
              )}

              <div className="ap-field">
                <label htmlFor="ap-reg-email">Email</label>
                <input
                  id="ap-reg-email"
                  type="email"
                  name="email"
                  placeholder="Nhập email"
                  value={regForm.email}
                  onChange={handleRegChange}
                  autoComplete="email"
                />
              </div>

              <div className="ap-field">
                <label htmlFor="ap-reg-display">Tên hiển thị</label>
                <input
                  id="ap-reg-display"
                  type="text"
                  name="displayName"
                  placeholder="Nhập tên"
                  value={regForm.displayName}
                  onChange={handleRegChange}
                />
              </div>

              <div className="ap-field">
                <label htmlFor="ap-reg-pw">Mật khẩu</label>
                <div className="ap-pw-wrap">
                  <input
                    id="ap-reg-pw"
                    type={showRegPw ? 'text' : 'password'}
                    name="password"
                    placeholder="Nhập mật khẩu"
                    value={regForm.password}
                    onChange={handleRegChange}
                    autoComplete="new-password"
                  />
                  <button type="button" className="ap-pw-toggle" onClick={() => setShowRegPw(s => !s)}>
                    {showRegPw ? <EyeOff size={18} color="#9CA3AF"/> : <Eye size={18} color="#9CA3AF"/>}
                  </button>
                </div>
                {regForm.password && (
                  <div className="ap-strength">
                    <div className={`ap-strength-bar ap-strength-${passwordStrength}`}/>
                    <span className={`ap-strength-label ap-strength-label-${passwordStrength}`}>
                      {passwordStrength === 'strong' ? 'Mạnh' : passwordStrength === 'medium' ? 'Trung bình' : 'Yếu'}
                    </span>
                  </div>
                )}
              </div>

              <div className="ap-field">
                <label htmlFor="ap-reg-confirm">Xác nhận mật khẩu</label>
                <div className="ap-pw-wrap">
                  <input
                    id="ap-reg-confirm"
                    type={showConfirmPw ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="Nhập mật khẩu"
                    value={regForm.confirmPassword}
                    onChange={handleRegChange}
                    autoComplete="new-password"
                  />
                  <button type="button" className="ap-pw-toggle" onClick={() => setShowConfirmPw(s => !s)}>
                    {showConfirmPw ? <EyeOff size={18} color="#9CA3AF"/> : <Eye size={18} color="#9CA3AF"/>}
                  </button>
                </div>
              </div>

              <p className="ap-terms">
                Khi bấm đăng ký tài khoản bạn đã đồng ý với{' '}
                <Link to="/page/toa-soan" className="ap-terms-link">quy định</Link>{' '}
                của tòa soạn
              </p>

              <button type="submit" className="ap-submit-btn" disabled={regLoading || regSuccess}>
                {regLoading
                  ? <><Loader2 size={17} className="spin-icon"/> Đang xử lý...</>
                  : 'Đăng ký tài khoản'}
              </button>
            </form>
          )}

        </div>{/* end ap-card-body */}
      </div>
    </div>
  );
}

export default AuthPage;
