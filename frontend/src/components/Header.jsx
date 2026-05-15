import React, { useEffect, useState, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Bell, User, LogOut, X, Home,
  ChevronDown, Shield, BookOpen, Search,
  HelpCircle, Settings, Phone, LayoutGrid,
  Sun, CloudSun, Cloud, CloudRain, CloudLightning, CloudSnow,
  Clock, TrendingUp, Globe, Video,
  Megaphone, Newspaper, LogIn
} from 'lucide-react';
import { fetchCategories, getNotifications, markNotificationRead } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Header.css';

/* ── VDKP Crystal Diamond Logo (BÁO MỚI style) ── */
function VdkpLogo({ size = 56 }) {
  const w = size;
  const h = size * 1.1;
  return (
    <svg width={w} height={h} viewBox="0 0 56 62" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Left dark-blue wing */}
      <polygon points="0,44 18,4 22,58" fill="#1565C0"/>
      {/* Top-right main facet (light cyan) */}
      <polygon points="18,4 50,22 22,58" fill="#29B6F6"/>
      {/* Inner highlight top */}
      <polygon points="18,4 34,13 22,30" fill="rgba(255,255,255,0.45)"/>
      {/* Inner mid facet */}
      <polygon points="34,13 50,22 22,30" fill="#4FC3F7"/>
      {/* Bottom shadow facet */}
      <polygon points="0,44 22,58 50,22 28,48" fill="#0D47A1" opacity="0.75"/>
      {/* Small right bottom accent */}
      <polygon points="28,48 50,22 44,40" fill="#0277BD" opacity="0.6"/>
    </svg>
  );
}


function Header() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories]   = useState([]);
  const [megaOpen, setMegaOpen]       = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sticky, setSticky]           = useState(false);
  const [notifOpen, setNotifOpen]     = useState(false);
  const [notifs, setNotifs]           = useState([]);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const notifRef  = useRef(null);
  const userRef   = useRef(null);
  const megaRef   = useRef(null);

  useEffect(() => {
    fetchCategories()
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handler = () => setSticky(window.scrollY > 80);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    if (!user) return;
    getNotifications().then(d => setNotifs(Array.isArray(d) ? d : [])).catch(() => {});
  }, [user]);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (userRef.current  && !userRef.current.contains(e.target))  setUserMenuOpen(false);
      if (megaRef.current  && !megaRef.current.contains(e.target))  setMegaOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { logout(); setUserMenuOpen(false); navigate('/'); };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    } catch {}
  };

  const unreadCount = notifs.filter(n => !n.is_read).length;

  // Format: Thứ Năm, 16/4/2026
  const now = new Date();
  const dayName = now.toLocaleDateString('vi-VN', { weekday: 'long' });
  const dayNum  = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;

  // Live Clock (Vietnam Time)
  const [timeStr, setTimeStr] = useState(
    new Date().toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour12: false })
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeStr(new Date().toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Tiện ích cho Mega menu
  const utilLinks = [
    { icon: <Settings size={18} strokeWidth={1.5}/>,       label: 'Tiện ích',          href: '/page/tien-ich' },
    { icon: <HelpCircle size={18} strokeWidth={1.5}/>,     label: 'Bạn cần biết',      href: '/page/ban-can-biet' },
    { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>, label: 'Liên hệ', href: '/page/lien-he' },
    { icon: <LayoutGrid size={18} strokeWidth={1.5}/>,     label: 'Thông tin toà soạn',href: '/page/toa-soan' },
    { icon: <span style={{fontSize:11,fontWeight:700,border:'1.5px solid currentColor',padding:'1px 3px',borderRadius:3,lineHeight:1}}>ADS</span>, label: 'Liên hệ quảng cáo', href: '/page/quang-cao' }
  ];

  const [weatherMenuOpen, setWeatherMenuOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState(() => localStorage.getItem('weatherCity') || "Hồ Chí Minh");
  const [weatherSearch, setWeatherSearch] = useState("");
  const [weatherData, setWeatherData] = useState({ temp: '--', code: 1 });

  useEffect(() => {
    localStorage.setItem('weatherCity', selectedCity);
  }, [selectedCity]);
  
  const cities = [
    "An Giang", "Bà Rịa - Vũng Tàu", "Bạc Liêu", "Bắc Giang", "Bắc Kạn", "Bắc Ninh", "Bến Tre", "Bình Dương", "Bình Định", "Bình Phước", "Bình Thuận", "Cà Mau", "Cần Thơ", "Cao Bằng", "Đà Nẵng", "Đắk Lắk", "Đắk Nông", "Điện Biên", "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Giang", "Hà Nam", "Hà Nội", "Hà Tĩnh", "Hải Dương", "Hải Phòng", "Hậu Giang", "Hòa Bình", "Hồ Chí Minh", "Hưng Yên", "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu", "Lâm Đồng", "Lạng Sơn", "Lào Cai", "Long An", "Nam Định", "Nghệ An", "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Phú Yên", "Quảng Bình", "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị", "Sóc Trăng", "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên", "Thanh Hóa", "Thừa Thiên Huế", "Tiền Giang", "Trà Vinh", "Tuyên Quang", "Vĩnh Long", "Vĩnh Phúc", "Yên Bái"
  ];

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        let lat = 10.8231, lon = 106.6297; // Default HCM
        if (selectedCity !== "Hồ Chí Minh") {
          const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(selectedCity)}&count=1&language=vi&format=json`);
          const geoData = await geoRes.json();
          if (geoData.results && geoData.results.length > 0) {
            lat = geoData.results[0].latitude;
            lon = geoData.results[0].longitude;
          }
        }
        
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
        const wData = await weatherRes.json();
        if (wData.current_weather) {
          setWeatherData({
            temp: Math.round(wData.current_weather.temperature),
            code: wData.current_weather.weathercode
          });
        }
      } catch(err) {
        console.error(err);
      }
    };
    fetchWeather();
  }, [selectedCity]);

  const getWeatherIcon = (code) => {
    if (code === 0) return <Sun size={20} strokeWidth={1.5} color="#9CA3AF" />;
    if (code >= 1 && code <= 2) return <CloudSun size={20} strokeWidth={1.5} color="#9CA3AF" />;
    if (code === 3 || code === 45 || code === 48) return <Cloud size={20} strokeWidth={1.5} color="#9CA3AF" />;
    if (code >= 51 && code <= 67) return <CloudRain size={20} strokeWidth={1.5} color="#9CA3AF" />;
    if (code >= 71 && code <= 77) return <CloudSnow size={20} strokeWidth={1.5} color="#9CA3AF" />;
    if (code >= 95 && code <= 99) return <CloudLightning size={20} strokeWidth={1.5} color="#9CA3AF" />;
    return <CloudSun size={20} strokeWidth={1.5} color="#9CA3AF" />;
  };

  return (
    <>
      {/* ══════════ BANNER NGHỊ QUYẾT ══════════ */}
      <div className="resolution-banner">
        <div className="resolution-banner-inner">
          <img src="/dang.svg" alt="Cờ Đảng" className="res-flag left" />
          <h2 className="res-title">ĐƯA NGHỊ QUYẾT ĐẠI HỘI XIV VÀO CUỘC SỐNG</h2>
          <img src="/vn.svg" alt="Cờ Tổ Quốc" className="res-flag right" />
        </div>
      </div>

      {/* ══════════ TOP BAR ══════════ */}
      <div className="topbar">
        <div className="container topbar-inner">
          {/* Left: date + quick links */}
          <div className="topbar-left">
            <span className="topbar-date">
              <span className="topbar-day" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={14} style={{ opacity: 0.7 }} />
                {timeStr} &nbsp;•&nbsp; {dayName}, {dayNum}
              </span>
            </span>
            <span className="topbar-sep">|</span>
            
            {/* Weather Dropdown */}
            <div className="topbar-weather-wrap">
              <span className="topbar-weather" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="topbar-weather-city">
                  <select 
                    className="weather-native-select"
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                  >
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </span>
                <span>{weatherData.temp}°C</span>
                {getWeatherIcon(weatherData.code)}
              </span>
            </div>
            
          </div>

          {/* Right: follow social */}
          <div className="topbar-right">
            <span className="topbar-follow-label">Theo dõi báo trên</span>
            {/* YouTube */}
            <a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer" className="topbar-social-btn yt" aria-label="YouTube">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 00.5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 002.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 002.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.8 15.5V8.5l6.3 3.5-6.3 3.5z"/></svg>
            </a>
            {/* Facebook */}
            <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" className="topbar-social-btn fb" aria-label="Facebook">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.88v2.27h3.32l-.53 3.5h-2.79V24C19.61 23.1 24 18.1 24 12.07z"/></svg>
            </a>
            {/* TikTok */}
            <a href="https://www.tiktok.com/" target="_blank" rel="noopener noreferrer" className="topbar-social-btn tik" aria-label="TikTok">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.07a8.19 8.19 0 004.79 1.53V7.16a4.85 4.85 0 01-1.02-.47z"/></svg>
            </a>
          </div>
        </div>
      </div>

      {/* ══════════ BRAND BAR ══════════ */}
      <div className="brandbar" ref={megaRef}>
        <div className="container brandbar-inner">

          {/* Left: mega-menu trigger + search */}
          <div className="brandbar-left">
            <button
              className={`mega-trigger ${megaOpen ? 'is-open' : ''}`}
              onClick={() => setMegaOpen(o => !o)}
              aria-label="Mở menu"
            >
              <span className="hamburger-icon">
                <span/><span/><span/>
              </span>
            </button>

            <form className="bb-search-form" onSubmit={handleSearch}>
              <Search size={15} className="bb-search-icon"/>
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bb-search-input"
              />
            </form>
          </div>

          {/* Center: VDKP Logo */}
          <Link to="/" className="site-logo">
            <VdkpLogo size={52} />
            <span className="logo-main">BÁO MỚI</span>
          </Link>

          {/* Right: bell + user */}
          <div className="brandbar-right">
            {/* Notification bell */}
            {user && (
              <div className="header-notif-wrap" ref={notifRef}>
                <button
                  className={`notif-bell-btn ${unreadCount > 0 ? 'has-unread' : ''}`}
                  onClick={() => setNotifOpen(o => !o)}
                  aria-label="Thông báo"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                  )}
                </button>

                {notifOpen && (
                  <div className="notif-dropdown">
                    <div className="notif-dropdown-header">
                      <span>Thông báo</span>
                      {unreadCount > 0 && <span className="notif-unread-count">{unreadCount} chưa đọc</span>}
                    </div>
                    <div className="notif-list">
                      {notifs.length === 0 ? (
                        <div className="notif-empty">
                          <Bell size={28} style={{ color: '#CBD5E1', marginBottom: '8px' }} />
                          <p>Không có thông báo nào</p>
                        </div>
                      ) : notifs.slice(0, 8).map(n => (
                        <div
                          key={n.id}
                          className={`notif-item ${!n.is_read ? 'unread' : ''}`}
                          onClick={() => handleMarkRead(n.id)}
                        >
                          {!n.is_read && <span className="notif-dot"></span>}
                          <p className="notif-msg">{n.message || n.content || 'Thông báo mới'}</p>
                          <span className="notif-time">
                            {n.created_at ? new Date(n.created_at).toLocaleDateString('vi-VN') : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Header Action Buttons (Quảng cáo, Đặt báo) */}
            <div className="header-actions">
              <Link to="/quang-cao" className="header-action-item">
                <span className="action-text">QUẢNG CÁO</span>
                <div className="action-circle yellow">
                  <Megaphone size={16} fill="black" />
                </div>
              </Link>
              <Link to="/dat-bao" className="header-action-item">
                <span className="action-text">ĐẶT BÁO</span>
                <div className="action-circle yellow">
                  <Newspaper size={16} fill="black" />
                </div>
              </Link>
            </div>

            {/* User menu */}
            {user ? (
              <div className="header-user-menu" ref={userRef}>
                <button
                  className="user-menu-trigger"
                  onClick={() => setUserMenuOpen(o => !o)}
                >
                  <div className="user-avatar-sm">{user.username?.[0]?.toUpperCase()}</div>
                  <ChevronDown size={14} />
                </button>
                {userMenuOpen && (
                  <div className="user-dropdown">
                    <div className="user-dropdown-info">
                      <div className="user-avatar-lg">{user.username?.[0]?.toUpperCase()}</div>
                      <div>
                        <div className="user-dropdown-name">{user.username}</div>
                        <div className="user-dropdown-role">{isAdmin ? 'Quản trị viên' : 'Thành viên'}</div>
                      </div>
                    </div>
                    <div className="user-dropdown-divider"></div>
                    <Link to="/profile?tab=account" className="user-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                      <User size={14} /> Hồ sơ cá nhân
                    </Link>
                    <Link to="/profile?tab=bookmarks" className="user-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                      <BookOpen size={14} /> Bài đã lưu
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" className="user-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                        <Shield size={14} /> Quản trị
                      </Link>
                    )}
                    <div className="user-dropdown-divider"></div>
                    <button className="user-dropdown-item danger" onClick={handleLogout}>
                      <LogOut size={14} /> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="auth-login-btn">
                <span className="auth-login-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                    <polyline points="10 17 15 12 10 7"/>
                    <line x1="15" y1="12" x2="3" y2="12"/>
                  </svg>
                </span>
                <span className="auth-login-text">ĐĂNG NHẬP</span>
              </Link>
            )}

          </div>
        </div>

        {/* ══ MEGA MENU ══ */}
        {megaOpen && (
          <div className="mega-menu">
            <div className="container mega-menu-inner">
              {/* Close button */}
              <button className="mega-close-btn" onClick={() => setMegaOpen(false)}>
                <X size={18}/> Đóng menu
              </button>

              <div className="mega-body">
                {/* Category grid */}
                <div className="mega-cats-grid">
                  {categories.map((cat, idx) => {
                    // Danh sách subcategory chuẩn theo yêu cầu
                    const subcategoriesMap = {
                      'Công nghệ': ["AI", "Thiết bị số", "Bảo mật", "Viễn thông", "Khởi nghiệp"],
                      'Giáo dục': ["Tuyển sinh", "Du học", "Khuyến học", "Góc phụ huynh", "Giáo dục 4.0"],
                      'Giải trí': ["Sao Việt", "Thế giới sao", "Phim ảnh", "Âm nhạc", "Sân khấu"],
                      'Kinh doanh': ["Thị trường", "Tài chính", "Chứng khoán", "Bất động sản", "Doanh nhân"],
                      'Quốc tế': ["Châu Á", "Châu Âu", "Châu Mỹ", "Xung đột", "Điểm nóng"],
                      'Thể thao': ["Bóng đá", "Tennis", "Esports", "Võ thuật"],
                      'Thời sự': ["Chính trị", "Giao thông", "Đô thị", "Dân sinh"],
                      'Sức khỏe': ["Dinh dưỡng", "Làm đẹp", "Y tế", "Khỏe đẹp"]
                    };
                    const subs = subcategoriesMap[cat.name] || [];

                    return (
                      <div key={cat.id || cat.category_id} className="mega-cat-col">
                        <NavLink
                          to={`/category/${cat.slug || cat.id || cat.category_id}`}
                          className="mega-cat-title"
                          onClick={() => setMegaOpen(false)}
                        >
                          {cat.name}
                        </NavLink>
                        <div className="mega-subcats">
                          {subs.map(subItem => (
                            <Link
                              to={`/search?q=${encodeURIComponent(subItem)}`}
                              key={subItem}
                              className="mega-subcat-link"
                              onClick={() => setMegaOpen(false)}
                            >
                              {subItem}
                            </Link>
                          ))}
                          <Link
                            to={`/category/${cat.slug || cat.id || cat.category_id}`}
                            className="mega-subcat-link view-more"
                            onClick={() => setMegaOpen(false)}
                          >
                            xem thêm
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Right utility panel */}
                <div className="mega-utils-panel">
                  {/* Shortcut pills - Báo Mới style */}
                  <div className="mega-shortcuts-block">
                    <Link to="/page/chao-ngay-moi" className="bm-pill" onClick={() => setMegaOpen(false)}><span className="bm-pill-icon"><CloudSun color="#00AEEF" fill="#00AEEF" size={18}/></span> <span className="bm-pill-text">Chào ngày mới</span></Link>
                    <Link to="/page/tin-24h" className="bm-pill" onClick={() => setMegaOpen(false)}><span className="bm-pill-icon"><Clock color="#00AEEF" size={18} strokeWidth={2.5}/></span> <span className="bm-pill-text">Tin 24h</span></Link>
                    <Link to="/page/tin-thi-truong" className="bm-pill" onClick={() => setMegaOpen(false)}><span className="bm-pill-icon"><TrendingUp color="#00AEEF" size={18} strokeWidth={2.5}/></span> <span className="bm-pill-text">Tin thị trường</span></Link>
                    <Link to="/page/tin-360" className="bm-pill" onClick={() => setMegaOpen(false)}><span className="bm-pill-icon"><Globe color="#00AEEF" size={18} strokeWidth={2.2}/></span> <span className="bm-pill-text">Tin 360</span></Link>
                  </div>
                  
                  <div className="mega-divider"></div>

                  {/* Media buttons */}
                  <div className="mega-shortcuts-block">
                    <Link to="/search?q=video" className="bm-pill" onClick={() => setMegaOpen(false)}><span className="bm-pill-icon"><Video color="#00AEEF" fill="#00AEEF" size={18}/></span> <span className="bm-pill-text">Video</span></Link>
                    <Link to="/search?q=đánh giá" className="bm-pill" onClick={() => setMegaOpen(false)}><span className="bm-pill-icon"><div style={{width:18, height:18, borderRadius:'50%', backgroundColor:'#00AEEF', color:'#fff', fontSize:11, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center'}}>M</div></span> <span className="bm-pill-text">Magazine</span></Link>
                  </div>

                  <div className="mega-divider"></div>

                  {/* Utilities list */}
                  <div className="bm-utils-list">
                    {utilLinks.map((u, i) => u.href.startsWith('tel:') ? (
                      <a key={i} href={u.href} className="bm-util-item">
                        <span className="bm-util-item-icon">{u.icon}</span>
                        <span className="bm-util-item-text">{u.label}</span>
                      </a>
                    ) : (
                      <Link key={i} to={u.href} className="bm-util-item" onClick={() => setMegaOpen(false)}>
                        <span className="bm-util-item-icon">{u.icon}</span>
                        <span className="bm-util-item-text">{u.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ══════════ NAVBAR ══════════ */}
      <nav className={`navbar ${sticky ? 'navbar-sticky' : ''}`}>
        <div className="container navbar-inner">
          <ul className="nav-list">
            <li>
              <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active nav-home' : 'nav-link nav-home'}>
                <Home size={17} />
              </NavLink>
            </li>
            {categories.slice(0, 10).map((cat, index) => {
              const catSlug = cat.slug || cat.id || cat.category_id;
              const normName = (cat.name || '').toLowerCase();
              let megaData = {};

              if (normName.includes('thời sự') || normName.includes('chính trị')) {
                megaData = {
                  subs: ["Sự kiện", "Chính trị", "Giao thông", "Môi trường", "Quốc phòng"],
                  articles: [
                    { title: "Toàn cảnh kỳ họp bất thường của Quốc hội sáng nay", img: "https://picsum.photos/400/250?random=" + (index * 10 + 1) },
                    { title: "Đề xuất mới nhất về tăng lương cơ sở năm nay", img: "https://picsum.photos/400/250?random=" + (index * 10 + 2) },
                    { title: "Nỗ lực giải quyết vấn nạn ùn tắc giao thông tại đô thị lớn", img: "https://picsum.photos/400/250?random=" + (index * 10 + 3) }
                  ]
                };
              } else if (normName.includes('giáo dục')) {
                megaData = {
                  subs: ["Tuyển sinh", "Du học", "Khuyến học", "Góc phụ huynh", "Giáo dục 4.0"],
                  articles: [
                    { title: "Công bố phương án thi tốt nghiệp THPT mới nhất từ Bộ Giáo dục", img: "https://picsum.photos/400/250?random=" + (index * 10 + 1) },
                    { title: "Hàng loạt trường đại học top đầu mở thêm ngành Trí tuệ Nhân tạo", img: "https://picsum.photos/400/250?random=" + (index * 10 + 2) },
                    { title: "Học bổng toàn phần du học Mỹ đang mở đơn cho học sinh Việt Nam", img: "https://picsum.photos/400/250?random=" + (index * 10 + 3) }
                  ]
                };
              } else if (normName.includes('sức khỏe') || normName.includes('y tế')) {
                megaData = {
                  subs: ["Dinh dưỡng", "Làm đẹp", "Giới tính", "Bệnh học", "Phòng mạch online"],
                  articles: [
                    { title: "Cảnh báo bệnh giao mùa bùng phát mạnh mẽ lúc chuyển lạnh", img: "https://picsum.photos/400/250?random=" + (index * 10 + 1) },
                    { title: "Phát hiện mới về phương pháp điều trị mất ngủ không dùng thuốc", img: "https://picsum.photos/400/250?random=" + (index * 10 + 2) },
                    { title: "Chế độ ăn kiêng thanh lọc cơ thể sao cho đảm bảo sức khỏe nhất?", img: "https://picsum.photos/400/250?random=" + (index * 10 + 3) }
                  ]
                };
              } else if (normName.includes('quốc tế') || normName.includes('thế giới')) {
                megaData = {
                  subs: ["Châu Á", "Châu Âu", "Châu Mỹ", "Xung đột", "Điểm nóng"],
                  articles: [
                    { title: "Cục diện toàn cầu thay đổi và các bước đi mới ngoại giao Mỹ", img: "https://picsum.photos/400/250?random=" + (index * 10 + 1) },
                    { title: "Khủng hoảng năng lượng châu Âu thúc đẩy xu hướng năng lượng xanh", img: "https://picsum.photos/400/250?random=" + (index * 10 + 2) },
                    { title: "Căng thẳng công nghệ Mỹ - Trung chưa có dấu hiệu hạ nhiệt", img: "https://picsum.photos/400/250?random=" + (index * 10 + 3) }
                  ]
                };
              } else if (normName.includes('pháp luật') || normName.includes('pháp lý')) {
                megaData = {
                  subs: ["Hồ sơ phá án", "Tòa án", "Tư vấn", "Pháp lý", "Quyền lợi"],
                  articles: [
                    { title: "Triệt phá đường dây lừa đảo công nghệ cao quy mô hàng trăm tỷ", img: "https://picsum.photos/400/250?random=" + (index * 10 + 1) },
                    { title: "Luật Đất đai sửa đổi chính thức có hiệu lực mang lại thay đổi gì?", img: "https://picsum.photos/400/250?random=" + (index * 10 + 2) },
                    { title: "Tuyệt đối cảnh giác với những thủ đoạn mạo danh ngân hàng lừa đảo", img: "https://picsum.photos/400/250?random=" + (index * 10 + 3) }
                  ]
                };
              } else if (normName.includes('xe') || normName.includes('ô tô')) {
                megaData = {
                  subs: ["Thị trường ô tô", "Đánh giá xe", "Xe tay ga", "Xe điện", "Kinh nghiệm"],
                  articles: [
                    { title: "Hãng xe VinFast chính thức ra mắt mẫu SUV điện mới phủ kín phân khúc", img: "https://picsum.photos/400/250?random=" + (index * 10 + 1) },
                    { title: "Các mẫu xe SUV 7 chỗ gầm cao hot nhất đang giảm giá kích cầu", img: "https://picsum.photos/400/250?random=" + (index * 10 + 2) },
                    { title: "Xu hướng chuyển dịch sang xe thuần điện tại Việt Nam tăng đột biến", img: "https://picsum.photos/400/250?random=" + (index * 10 + 3) }
                  ]
                };
              } else if (normName.includes('đời sống') || normName.includes('xã hội')) {
                megaData = {
                  subs: ["Nhịp sống", "Giới trẻ", "Gia đình", "Cộng đồng", "Trend mạng"],
                  articles: [
                    { title: "Trào lưu chữa lành, du lịch bỏ phố về rừng của cực kỳ được giới trẻ yêu thích", img: "https://picsum.photos/400/250?random=" + (index * 10 + 1) },
                    { title: "Những câu chuyện ấm áp tình người giữa lòng phố thị náo nhiệt", img: "https://picsum.photos/400/250?random=" + (index * 10 + 2) },
                    { title: "Chuyên gia tâm lý hướng dẫn cân bằng giữa áp lực và hạnh phúc gia đình", img: "https://picsum.photos/400/250?random=" + (index * 10 + 3) }
                  ]
                };
              } else if (normName.includes('kinh tế') || normName.includes('doanh')) {
                megaData = {
                  subs: ["Thị trường", "Tài chính", "Chứng khoán", "Bất động sản", "Doanh nhân"],
                  articles: [
                    { title: "Thị trường vàng biến động cực mạnh sau công bố lãi suất từ Fed", img: "https://picsum.photos/400/250?random=" + (index * 10 + 1) },
                    { title: "Cổ phiếu ngành công nghệ tiếp tục dẫn sóng thị trường chứng khoán", img: "https://picsum.photos/400/250?random=" + (index * 10 + 2) },
                    { title: "Chuyên gia kinh tế dự báo giá bất động sản sẽ tiếp tục đà phục hồi", img: "https://picsum.photos/400/250?random=" + (index * 10 + 3) }
                  ]
                };
              } else if (normName.includes('công nghệ')) {
                megaData = {
                  subs: ["AI", "Thiết bị số", "Bảo mật", "Viễn thông", "Khởi nghiệp"],
                  articles: [
                    { title: "ChatGPT ra mắt phiên bản mới nhất phân tích video trực tiếp", img: "https://picsum.photos/400/250?random=" + (index * 10 + 1) },
                    { title: "Điện thoại đời cũ sẽ không còn được hỗ trợ cập nhật hệ điều hành", img: "https://picsum.photos/400/250?random=" + (index * 10 + 2) },
                    { title: "Triển lãm công nghệ CES quy tụ hàng nghìn sản phẩm đột phá", img: "https://picsum.photos/400/250?random=" + (index * 10 + 3) }
                  ]
                };
              } else if (normName.includes('giải trí')) {
                megaData = {
                  subs: ["Sao Việt", "Thế giới sao", "Phim ảnh", "Âm nhạc", "Sân khấu"],
                  articles: [
                    { title: "Phim điện ảnh Việt Nam vừa ra mắt phá kỷ lục phòng vé lịch sử", img: "https://picsum.photos/400/250?random=" + (index * 10 + 1) },
                    { title: "Diva nổi tiếng thông báo liveshow hoành tráng kỷ niệm 20 năm ca hát", img: "https://picsum.photos/400/250?random=" + (index * 10 + 2) },
                    { title: "Hé lộ hình ảnh hậu trường chưa từng công bố của bộ phim đang hot", img: "https://picsum.photos/400/250?random=" + (index * 10 + 3) }
                  ]
                };
              } else if (normName.includes('thể thao')) {
                megaData = {
                  subs: ["Bóng đá VN", "Ngoại hạng Anh", "Quần vợt", "Hậu trường"],
                  articles: [
                    { title: "Đội tuyển Quốc gia ráo riết chuẩn bị chiến thuật mới cho vòng loại World Cup", img: "https://picsum.photos/400/250?random=" + (index * 10 + 1) },
                    { title: "Bàn thắng siêu phẩm phút bù giờ cứu rỗi hy vọng vô địch cho HLV", img: "https://picsum.photos/400/250?random=" + (index * 10 + 2) },
                    { title: "Trận chung kết Grand Slam kéo dài 5 tiếng trở thành kinh điển", img: "https://picsum.photos/400/250?random=" + (index * 10 + 3) }
                  ]
                };
              } else {
                megaData = {
                  subs: [`Tin tức ${cat.name}`, `Câu chuyện ${cat.name}`, "Xu hướng", "Góc nhìn", "Phân tích"],
                  articles: [
                    { title: `Những sự kiện mới nhất về ${cat.name} trong ngày hôm nay`, img: `https://picsum.photos/400/250?random=${index}1` },
                    { title: `Chuyên gia nhận định về tương lai của mảng ${cat.name} tại Việt Nam`, img: `https://picsum.photos/400/250?random=${index}2` },
                    { title: `Khám phá những điểm nhấn đáng chú ý trong lĩnh vực ${cat.name}`, img: `https://picsum.photos/400/250?random=${index}3` }
                  ]
                };
              }

              return (
              <li key={cat.id || cat.category_id} className="nav-item-has-mega">
                <NavLink
                  to={`/category/${catSlug}`}
                  className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                >
                  {cat.name}
                </NavLink>

                {/* Sub Menu Dropdown Hover */}
                <div className="nav-hover-mega">
                  <div className="container nav-hover-mega-inner">
                    <div className="nhm-left">
                      <h3 className="nhm-title">
                         <Link to={`/category/${catSlug}`} style={{color:'inherit', textDecoration:'none'}}>{cat.name}</Link>
                      </h3>
                      <div className="nhm-subs-grid">
                        {megaData.subs.map((sub, i) => (
                          <Link to={`/search?q=${encodeURIComponent(sub)}`} key={i} onClick={() => setMegaOpen(false)}>{sub}</Link>
                        ))}
                      </div>
                    </div>
                    <div className="nhm-right">
                      {megaData.articles.map((art, i) => (
                        <div className="nhm-article-card" key={i}>
                          <div style={{ position: 'relative', height: '100%' }}>
                            <Link to={`/search?q=${encodeURIComponent(art.title)}`} style={{display: 'block', height: '100%'}} onClick={() => setMegaOpen(false)}>
                              <img src={art.img} alt={art.title} />
                            </Link>
                            <div className="nhm-card-overlay" style={{ pointerEvents: 'none' }}>
                              <Link 
                                to={`/category/${catSlug}`} 
                                className="nhm-card-cat" 
                                style={{ pointerEvents: 'auto', textDecoration: 'none', display: 'inline-block', transition: 'background-color 0.2s, transform 0.2s' }}
                                onMouseEnter={(e) => { e.target.style.backgroundColor = '#0088FF'; e.target.style.transform = 'translateY(-2px)' }}
                                onMouseLeave={(e) => { e.target.style.backgroundColor = '#0050A0'; e.target.style.transform = 'translateY(0)' }}
                                onClick={(e) => { e.stopPropagation(); setMegaOpen(false); }}
                              >
                                {cat.name.toUpperCase()}
                              </Link>
                              
                              <Link 
                                to={`/search?q=${encodeURIComponent(art.title)}`}
                                style={{ pointerEvents: 'auto', textDecoration: 'none', display: 'block' }}
                                onClick={() => setMegaOpen(false)}
                              >
                                <h4 className="nhm-card-title">{art.title}</h4>
                              </Link>
                              
                              <p className="nhm-card-desc" style={{ pointerEvents: 'none' }}>Năm 2026 chứng kiến những biến chuyển lớn chưa từng có tác động mạnh mẽ đến các lĩnh vực trọng điểm...</p>
                              <div className="nhm-card-meta" style={{ pointerEvents: 'none' }}>
                                <Clock size={11} strokeWidth={2.5}/> 07:43 13/04/2026
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </li>
            );})}
          </ul>
        </div>
      </nav>
    </>
  );
}

export default Header;
