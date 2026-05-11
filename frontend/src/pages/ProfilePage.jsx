import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  User, Lock, MessageSquare, Bookmark, Eye,
  LogOut, Shield, Clock, Camera, Check, X, Loader2, Calendar, ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getBookmarks, getReadingHistory, updateProfile, getMyComments } from '../services/api';
import './ProfilePage.css';

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

const getThumb = (post) => {
  const t = post?.thumbnail || post?.thumbnail_url;
  if (!t || t === 'null' || t === '') return `https://picsum.photos/seed/${post?.id || post?.post_id || 1}/300/180`;
  return t;
};
const getPostId = (p) => p?.post_id || p?.id;

const MENU = [
  { key: 'account',   label: 'Thông tin tài khoản',  Icon: User },
  { key: 'password',  label: 'Đổi mật khẩu',         Icon: Lock },
  { key: 'comments',  label: 'Hoạt động bình luận',  Icon: MessageSquare },
  { key: 'bookmarks', label: 'Tin đã lưu',            Icon: Bookmark },
  { key: 'history',   label: 'Tin đã xem',            Icon: Eye },
  { key: 'logout',    label: 'Đăng xuất',             Icon: LogOut },
];

/* ── Social icons ── */
const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
    <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.88v2.27h3.32l-.53 3.5h-2.79V24C19.61 23.1 24 18.1 24 12.07z"/>
  </svg>
);
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);
const ZaloIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48">
    <rect width="48" height="48" rx="8" fill="#0068FF"/>
    <text x="24" y="31" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold" fontFamily="Arial">Zalo</text>
  </svg>
);

export default function ProfilePage() {
  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentKey = searchParams.get('tab') || 'account';
  const validKeys  = MENU.map(m => m.key);
  const activeKey  = validKeys.includes(currentKey) ? currentKey : 'account';

  const setTab = (key) => {
    if (key === 'logout') { logout(); navigate('/'); return; }
    setSearchParams({ tab: key });
  };

  /* ── Data ── */
  const [bookmarks, setBookmarks] = useState([]);
  const [history,   setHistory]   = useState([]);
  const [comments,  setComments]  = useState([]);
  const [loadingB,  setLoadingB]  = useState(false);
  const [loadingH,  setLoadingH]  = useState(false);
  const [loadingC,  setLoadingC]  = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    setLoadingB(true);
    getBookmarks()
      .then(d => setBookmarks(Array.isArray(d) ? d : (d?.bookmarks || [])))
      .catch(() => setBookmarks([]))
      .finally(() => setLoadingB(false));

    setLoadingH(true);
    getReadingHistory()
      .then(d => setHistory(Array.isArray(d) ? d : (d?.history || [])))
      .catch(() => setHistory([]))
      .finally(() => setLoadingH(false));

    setLoadingC(true);
    getMyComments()
      .then(d => setComments(Array.isArray(d) ? d : []))
      .catch(() => setComments([]))
      .finally(() => setLoadingC(false));
  }, [user]);

  /* ── Avatar ── */
  const fileRef = useRef();
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar_url || null);
  const [savingAvatar, setSavingAvatar]   = useState(false);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target.result;
      setAvatarPreview(dataUrl);
      setSavingAvatar(true);
      try {
        const res = await updateProfile({
          username: user.username, email: user.email,
          full_name: user.full_name || null, avatar_url: dataUrl,
        });
        if (setUser) setUser(res.user);
      } catch { /* ignore */ }
      finally { setSavingAvatar(false); }
    };
    reader.readAsDataURL(file);
  };

  /* ── Profile info edit ── */
  // Parse birthday thành ngày/tháng/năm
  const parseBirthday = (bd) => {
    if (!bd) return { bDay: '', bMonth: '', bYear: '' };
    const d = new Date(bd);
    if (isNaN(d)) return { bDay: '', bMonth: '', bYear: '' };
    return { bDay: String(d.getDate()), bMonth: String(d.getMonth() + 1), bYear: String(d.getFullYear()) };
  };
  const initBD = parseBirthday(user?.birthday);

  const [infoForm,   setInfoForm]   = useState({
    username:  user?.username  || '',
    email:     user?.email     || '',
    full_name: user?.full_name || '',
    gender:    user?.gender    || '',
    bDay:      initBD.bDay,
    bMonth:    initBD.bMonth,
    bYear:     initBD.bYear,
    phone:     user?.phone     || '',
    address:   user?.address   || '',
  });
  const [infoSaving, setInfoSaving] = useState(false);
  const [infoMsg,    setInfoMsg]    = useState('');

  const handleInfoSave = async (e) => {
    e.preventDefault();
    setInfoSaving(true); setInfoMsg('');
    // Gộp ngày/tháng/năm thành ISO date string
    let birthday = null;
    if (infoForm.bYear && infoForm.bMonth && infoForm.bDay) {
      const m = infoForm.bMonth.padStart(2,'0');
      const d = infoForm.bDay.padStart(2,'0');
      birthday = `${infoForm.bYear}-${m}-${d}`;
    }
    try {
      const res = await updateProfile({ ...infoForm, birthday, avatar_url: avatarPreview });
      if (setUser) setUser(res.user);
      setInfoMsg('success');
    } catch { setInfoMsg('error'); }
    finally { setInfoSaving(false); setTimeout(() => setInfoMsg(''), 3000); }
  };

  /* ── Password change ── */
  const [pwForm,   setPwForm]   = useState({ current_password: '', new_password: '', confirm: '' });
  const [showPw,   setShowPw]   = useState({ current: false, new: false, confirm: false });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg,    setPwMsg]    = useState('');
  const [pwErr,    setPwErr]    = useState('');

  const handlePwSave = async (e) => {
    e.preventDefault(); setPwErr(''); setPwMsg('');
    if (pwForm.new_password !== pwForm.confirm) { setPwErr('Mật khẩu xác nhận không khớp'); return; }
    if (pwForm.new_password.length < 6) { setPwErr('Mật khẩu mới phải có ít nhất 6 ký tự'); return; }
    setPwSaving(true);
    try {
      await updateProfile({
        username: user.username, email: user.email, full_name: user.full_name || null,
        current_password: pwForm.current_password, new_password: pwForm.new_password,
      });
      setPwMsg('Đổi mật khẩu thành công!');
      setPwForm({ current_password: '', new_password: '', confirm: '' });
    } catch (err) {
      setPwErr(err.response?.data?.msg || 'Đổi mật khẩu thất bại');
    } finally {
      setPwSaving(false);
      setTimeout(() => { setPwMsg(''); setPwErr(''); }, 4000);
    }
  };

  if (!user) return null;

  const avatarLetter = user.username?.[0]?.toUpperCase() || 'U';
  const displayName  = user.full_name || user.username || '';

  const SOCIAL = [
    {
      name: 'Facebook', Icon: FacebookIcon,
      href: 'https://www.facebook.com/',
      color: '#1877F2',
    },
    {
      name: 'Google', Icon: GoogleIcon,
      href: 'https://accounts.google.com/',
      color: '#EA4335',
    },
    {
      name: 'Zalo', Icon: ZaloIcon,
      href: 'https://zalo.me/',
      color: '#0068FF',
    },
  ];

  return (
    <div className="pp-page">
      <div className="pp-layout">

        {/* ══ LEFT SIDEBAR ══ */}
        <aside className="pp-sidebar">
          {/* Avatar */}
          <div className="pp-sb-avatar-wrap">
            {/* Avatar circle + camera outside */}
            <div className="pp-avatar-container">
              <div className="pp-sb-avatar">
                {avatarPreview
                  ? <img src={avatarPreview} alt="avatar" />
                  : <span>{avatarLetter}</span>
                }
                {savingAvatar && (
                  <div className="pp-avatar-saving"><Loader2 size={20} className="pp-spin"/></div>
                )}
              </div>
              {/* Camera btn OUTSIDE the circle, bottom-right of container */}
              <button
                className="pp-avatar-cam-btn"
                onClick={() => fileRef.current?.click()}
                title="Thay đổi ảnh đại diện"
                type="button"
              >
                <Camera size={13}/>
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleAvatarChange}
              />
            </div>
            <p className="pp-sb-name">{displayName}</p>
            {user.role_id === 1 && (
              <span className="pp-sb-admin-badge"><Shield size={10}/> Admin</span>
            )}
          </div>

          {/* Nav menu */}
          <nav className="pp-sb-nav">
            {MENU.map(({ key, label, Icon }) => (
              <button
                key={key}
                className={`pp-sb-item ${activeKey === key ? 'active' : ''} ${key === 'logout' ? 'logout' : ''}`}
                onClick={() => setTab(key)}
              >
                <Icon size={15} strokeWidth={2}/>
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* ══ RIGHT CONTENT ══ */}
        <div className="pp-content">

          {/* ── Thông tin tài khoản ── */}
          {activeKey === 'account' && (
            <div className="pp-section">
              <h2 className="pp-section-title">Thông tin tài khoản</h2>
              <form className="pp-info-form" onSubmit={handleInfoSave}>

                {/* Hàng 1: Tên hiển thị + Giới tính */}
                <div className="pp-form-row">
                  <div className="pp-form-field">
                    <label>Tên hiển thị</label>
                    <input
                      type="text"
                      value={infoForm.full_name}
                      onChange={e => setInfoForm(f => ({ ...f, full_name: e.target.value }))}
                      placeholder="Nhập tên hiển thị"
                    />
                  </div>
                  <div className="pp-form-field">
                    <label>Giới tính</label>
                    <div className="pp-gender-inline">
                      {[{val:'male',label:'Nam'},{val:'female',label:'Nữ'},{val:'other',label:'Khác'}].map(({val,label}) => (
                        <label key={val} className="pp-gender-opt">
                          <input
                            type="radio"
                            name="gender"
                            value={val}
                            checked={infoForm.gender === val}
                            onChange={() => setInfoForm(f => ({ ...f, gender: val }))}
                          />
                          <span>{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Hàng 2: Ngày sinh (3 dropdown) */}
                <div className="pp-form-field">
                  <label>Ngày sinh</label>
                  <div className="pp-birthday-row">
                    <select
                      value={infoForm.bDay}
                      onChange={e => setInfoForm(f => ({ ...f, bDay: e.target.value }))}
                      className="pp-birthday-sel"
                    >
                      <option value="">Ngày</option>
                      {Array.from({length:31},(_,i)=>i+1).map(d => (
                        <option key={d} value={String(d)}>{d}</option>
                      ))}
                    </select>
                    <select
                      value={infoForm.bMonth}
                      onChange={e => setInfoForm(f => ({ ...f, bMonth: e.target.value }))}
                      className="pp-birthday-sel"
                    >
                      <option value="">Tháng</option>
                      {Array.from({length:12},(_,i)=>i+1).map(m => (
                        <option key={m} value={String(m)}>Tháng {m}</option>
                      ))}
                    </select>
                    <select
                      value={infoForm.bYear}
                      onChange={e => setInfoForm(f => ({ ...f, bYear: e.target.value }))}
                      className="pp-birthday-sel"
                    >
                      <option value="">Năm</option>
                      {Array.from({length:100},(_,i)=>new Date().getFullYear()-i).map(y => (
                        <option key={y} value={String(y)}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Hàng 3: Email | Điện thoại | Địa chỉ */}
                <div className="pp-form-row pp-form-row-3">
                  <div className="pp-form-field">
                    <label>Email</label>
                    <input
                      type="email"
                      value={infoForm.email}
                      onChange={e => setInfoForm(f => ({ ...f, email: e.target.value }))}
                    />
                  </div>
                  <div className="pp-form-field">
                    <label>Điện thoại</label>
                    <input
                      type="tel"
                      value={infoForm.phone}
                      onChange={e => setInfoForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                  <div className="pp-form-field">
                    <label>Địa chỉ</label>
                    <input
                      type="text"
                      value={infoForm.address}
                      onChange={e => setInfoForm(f => ({ ...f, address: e.target.value }))}
                      placeholder="Nhập địa chỉ"
                    />
                  </div>
                </div>

                {infoMsg === 'success' && (
                  <div className="pp-alert pp-alert-ok"><Check size={14}/> Lưu thay đổi thành công!</div>
                )}
                {infoMsg === 'error' && (
                  <div className="pp-alert pp-alert-err"><X size={14}/> Lưu thất bại, vui lòng thử lại.</div>
                )}

                <div className="pp-form-actions">
                  <button type="submit" className="pp-btn-save" disabled={infoSaving}>
                    {infoSaving ? <><Loader2 size={15} className="pp-spin"/> Đang lưu...</> : 'Lưu thay đổi'}
                  </button>
                </div>

                {/* Social links */}
                <h3 className="pp-section-subtitle">Liên kết tài khoản xã hội</h3>
                <div className="pp-social-links">
                  {SOCIAL.map(({ name, Icon, href, color }) => (
                    <a
                      key={name}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pp-social-row"
                    >
                      <div className="pp-social-icon"><Icon /></div>
                      <span className="pp-social-name">Tài khoản {name}</span>
                      <span className="pp-social-link-btn" style={{ color }}>
                        Liên kết <ExternalLink size={12}/>
                      </span>
                    </a>
                  ))}
                </div>

                {user.role_id === 1 && (
                  <div style={{ marginTop: 20 }}>
                    <Link to="/admin" className="pp-btn-admin">
                      <Shield size={14}/> Vào trang quản trị
                    </Link>
                  </div>
                )}
              </form>
            </div>
          )}

          {/* ── Đổi mật khẩu ── */}
          {activeKey === 'password' && (
            <div className="pp-section">
              <h2 className="pp-section-title">Đổi mật khẩu</h2>
              <form className="pp-pw-form" onSubmit={handlePwSave}>
                {[
                  { label: 'Mật khẩu cũ',          field: 'current_password', showKey: 'current' },
                  { label: 'Mật khẩu mới',          field: 'new_password',     showKey: 'new'     },
                  { label: 'Nhập lại mật khẩu mới', field: 'confirm',          showKey: 'confirm' },
                ].map(({ label, field, showKey }) => (
                  <div className="pp-form-field" key={field}>
                    <label>{label}</label>
                    <div className="pp-pw-wrap">
                      <input
                        type={showPw[showKey] ? 'text' : 'password'}
                        value={pwForm[field]}
                        onChange={e => setPwForm(f => ({ ...f, [field]: e.target.value }))}
                      />
                      <button type="button" className="pp-pw-eye"
                        onClick={() => setShowPw(s => ({ ...s, [showKey]: !s[showKey] }))}>
                        {showPw[showKey]
                          ? <Eye size={17} color="#9CA3AF"/>
                          : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M1 1l22 22"/></svg>
                        }
                      </button>
                    </div>
                  </div>
                ))}

                {pwErr && <div className="pp-alert pp-alert-err"><X size={14}/> {pwErr}</div>}
                {pwMsg && <div className="pp-alert pp-alert-ok"><Check size={14}/> {pwMsg}</div>}

                <button type="submit" className="pp-btn-save" disabled={pwSaving}>
                  {pwSaving ? <><Loader2 size={15} className="pp-spin"/> Đang lưu...</> : 'Lưu thay đổi'}
                </button>
              </form>
            </div>
          )}

          {/* ── Hoạt động bình luận ── */}
          {activeKey === 'comments' && (
            <div className="pp-section">
              <h2 className="pp-section-title">Hoạt động bình luận</h2>
              {loadingC ? (
                <div className="pp-loading"><Loader2 size={26} className="pp-spin"/></div>
              ) : comments.length === 0 ? (
                <div className="pp-empty">
                  <MessageSquare size={44}/>
                  <p>Bạn chưa có bình luận nào.</p>
                  <Link to="/" className="pp-btn-save" style={{ textDecoration: 'none', textAlign: 'center' }}>
                    Đọc tin và bình luận
                  </Link>
                </div>
              ) : (
                <div className="pp-comment-list">
                  {comments.map((c) => (
                    <Link key={c.id} to={`/post/${c.post_id}`} className="pp-comment-item">
                      <div className="pp-comment-meta">
                        <MessageSquare size={13} className="pp-comment-icon"/>
                        <span className="pp-comment-post">{c.post_title || 'Bài viết'}</span>
                        <span className="pp-comment-date">
                          <Clock size={11}/> {formatDate(c.created_at)}
                        </span>
                      </div>
                      <p className="pp-comment-content">"{c.content}"</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Tin đã lưu ── */}
          {activeKey === 'bookmarks' && (
            <div className="pp-section">
              <h2 className="pp-section-title">Tin đã lưu</h2>
              {loadingB ? (
                <div className="pp-loading"><Loader2 size={26} className="pp-spin"/></div>
              ) : bookmarks.length === 0 ? (
                <div className="pp-empty">
                  <Bookmark size={44}/><p>Bạn chưa lưu bài viết nào.</p>
                  <Link to="/" className="pp-btn-save" style={{ textDecoration: 'none', textAlign: 'center' }}>Khám phá tin tức</Link>
                </div>
              ) : (
                <div className="pp-post-list">
                  {bookmarks.map((item, i) => {
                    const post = item.post || item;
                    return (
                      <Link key={i} to={`/post/${getPostId(post)}`} className="pp-post-item">
                        <img src={getThumb(post)} alt={post.title} className="pp-post-thumb"/>
                        <div className="pp-post-info">
                          <p className="pp-post-title">{post.title}</p>
                          <span className="pp-post-date"><Clock size={11}/> {formatDate(post.created_at || item.saved_at)}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Tin đã xem ── */}
          {activeKey === 'history' && (
            <div className="pp-section">
              <h2 className="pp-section-title">Tin đã xem</h2>
              {loadingH ? (
                <div className="pp-loading"><Loader2 size={26} className="pp-spin"/></div>
              ) : history.length === 0 ? (
                <div className="pp-empty">
                  <Eye size={44}/><p>Bạn chưa xem bài viết nào.</p>
                  <Link to="/" className="pp-btn-save" style={{ textDecoration: 'none', textAlign: 'center' }}>Đọc tin tức</Link>
                </div>
              ) : (
                <div className="pp-post-list">
                  {history.map((item, i) => {
                    const post = item.post || item;
                    return (
                      <Link key={i} to={`/post/${getPostId(post)}`} className="pp-post-item">
                        <img src={getThumb(post)} alt={post.title} className="pp-post-thumb"/>
                        <div className="pp-post-info">
                          <p className="pp-post-title">{post.title}</p>
                          <span className="pp-post-date"><Calendar size={11}/> {formatDate(item.read_at || item.created_at)}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>{/* end pp-content */}
      </div>
    </div>
  );
}
