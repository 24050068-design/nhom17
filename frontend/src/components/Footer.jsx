import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';
import { ArrowUp } from 'lucide-react';
import { fetchCategories } from '../services/api';

function Footer() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories()
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Chia danh mục thành các cột (mỗi cột 4 item)
  const chunkArray = (arr, size) => {
    const res = [];
    for (let i = 0; i < arr.length; i += size) {
      res.push(arr.slice(i, i + size));
    }
    return res;
  };
  
  // Nếu chưa load API kịp, fallback tạm
  const displayCats = categories.length > 0 ? categories : [
    { slug: 'chinh-tri', name: 'Chính trị' },
    { slug: 'kinh-te', name: 'Kinh tế' },
    { slug: 'phap-luat', name: 'Pháp luật' },
    { slug: 'the-gioi', name: 'Thế giới' },
    { slug: 'giao-duc', name: 'Giáo dục' },
    { slug: 'the-thao', name: 'Thể thao' },
    { slug: 'van-hoa', name: 'Văn hóa' },
    { slug: 'suc-khoe', name: 'Sức khỏe' },
    { slug: 'cong-nghe', name: 'Công nghệ' },
    { slug: 'xe', name: 'Xe' }
  ];
  
  const columns = chunkArray(displayCats, Math.ceil(displayCats.length / 5));

  return (
    <footer className="tn-footer">
      <div className="container">
        
        {/* ── Category Links Section ── */}
        <div className="tn-footer-categories">
          {columns.map((col, idx) => (
            <ul className="category-col" key={idx}>
              {col.map(cat => {
                const id = cat.slug || cat.id || cat.category_id;
                return (
                  <li key={id}>
                    <Link to={`/category/${id}`}>{cat.name}</Link>
                  </li>
                );
              })}
            </ul>
          ))}
        </div>

        {/* ── Action Links & Socials ── */}
        <div className="tn-footer-actions">
          <div className="tn-footer-logo">
             <div className="tn-brand-text">BÁO MỚI</div>
             <div className="tn-brand-sub">CỔNG THÔNG TIN ĐIỆN TỬ CẬP NHẬT NHANH NHẤT</div>
          </div>
          
          <div className="tn-footer-nav">
            <Link to="/page/dat-bao">Đặt báo</Link>
            <Link to="/page/quang-cao">Quảng cáo</Link>
            <Link to="/page/rss">RSS</Link>
            <Link to="/page/toa-soan">Tòa soạn</Link>
            <Link to="/page/chinh-sach">Chính sách bảo mật</Link>
            <span className="divider"></span>
            <span className="social-label">Theo dõi báo trên</span>
            <div className="social-icons">
               <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" className="social-btn face" title="Facebook">
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.88v2.27h3.32l-.53 3.5h-2.79V24C19.61 23.1 24 18.1 24 12.07z"/></svg>
               </a>
               <a href="https://zalo.me/" target="_blank" rel="noopener noreferrer" className="social-btn zalo" title="Zalo">
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                   <path d="M21.1146 11.233C21.1146 6.36838 17.0673 2.42468 12.0759 2.42468C7.08451 2.42468 3.03711 6.36838 3.03711 11.233C3.03711 13.9103 4.38153 16.284 6.46747 17.8106C6.2625 18.8475 5.58611 20.3129 5.55833 20.3707C5.4597 20.5905 5.68884 20.8037 5.88939 20.6974L9.41407 18.8268C10.2529 19.102 11.1466 19.2555 12.0759 19.2555C17.0673 19.2555 21.1146 15.3118 21.1146 10.4471V11.233ZM15.9372 13.9577H13.7915C13.5658 13.9577 13.3828 13.7747 13.3828 13.5489C13.3828 13.3232 13.5658 13.1402 13.7915 13.1402H15.0232L12.5714 10.1554V13.5489C12.5714 13.7747 12.3884 13.9577 12.1627 13.9577C11.9369 13.9577 11.7539 13.7747 11.7539 13.5489V9.58983C11.7539 9.36406 11.9369 9.18105 12.1627 9.18105C12.338 9.18105 12.4932 9.29057 12.5516 9.45899L15.1147 12.5701V9.58983C15.1147 9.36406 15.2977 9.18105 15.5235 9.18105C15.7493 9.18105 15.9323 9.36406 15.9323 9.58983V13.5489C15.9323 13.7747 15.7493 13.9577 15.5235 13.9577H15.9372ZM10.0213 13.5489H7.66981C7.44405 13.5489 7.26104 13.3659 7.26104 13.1402V12.7231C7.26104 12.4973 7.44405 12.3143 7.66981 12.3143H9.20392C9.42968 12.3143 9.61269 12.1313 9.61269 11.9056C9.61269 11.6798 9.42968 11.4968 9.20392 11.4968H7.66981C7.44405 11.4968 7.26104 11.3138 7.26104 11.088V10.0035C7.26104 9.77772 7.44405 9.59471 7.66981 9.59471H10.0213C10.2471 9.59471 10.4301 9.77772 10.4301 10.0035C10.4301 10.2292 10.2471 10.4122 10.0213 10.4122H8.0785V10.6792H9.61269C10.0641 10.6792 10.4301 11.0452 10.4301 11.4968C10.4301 11.9483 10.0641 12.3143 9.61269 12.3143H8.0785V12.7303H10.0213C10.2471 12.7303 10.4301 12.9133 10.4301 13.1391C10.4301 13.3659 10.2471 13.5489 10.0213 13.5489Z" fill="currentColor"/>
                 </svg>
               </a>
               <a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer" className="social-btn yt" title="YouTube">
                 <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 00.5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 002.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 002.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.8 15.5V8.5l6.3 3.5-6.3 3.5z"/></svg>
               </a>
            </div>
          </div>
        </div>

        {/* ── Info & License ── */}
        <div className="tn-footer-info">
          
          <div className="tn-info-col tn-contact">
            <div className="info-line">Hotline<br/><strong>0786555897</strong></div>
            <div className="info-line">Liên hệ quảng cáo<br/><strong>0784543079</strong></div>
          </div>

          <div className="tn-info-col tn-editor">
            <div className="info-line">Tổng biên tập: Đỗ Huy Cường</div>
            <div className="info-line">Phó tổng biên tập: Nguyễn Trọng Tấn</div>
            <div className="info-line">Phó tổng biên tập: Vương Đạt Kiến Phong</div>
          </div>

          <div className="tn-info-col tn-license">
            <p>
              Giấy phép xuất bản số 110/GP - BTTTT cấp ngày 24.3.2020<br/>
              © 2003-2026 Bản quyền thuộc về Báo Mới.<br/>
              Cấm sao chép dưới mọi hình thức nếu không có sự chấp thuận bằng văn bản.
            </p>
            <div className="ncsc-badge">
              <img src="https://tinnhiemmang.vn/handle_cert?id=thanhnien.vn" alt="Chung nhan NCSC" style={{height: '38px', marginTop: '10px'}} onError={(e) => e.target.style.display='none'}/>
            </div>
          </div>

        </div>
      </div>
      
      {/* Scroll to Top Button */}
      <button className="tn-btn-top" onClick={scrollToTop} aria-label="Go to Top">
         <ArrowUp size={20} strokeWidth={1.5} />
         <span>TOP</span>
      </button>
    </footer>
  );
}

export default Footer;
