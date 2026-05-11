import React from 'react';
import { Link } from 'react-router-dom';
import './QuangCaoPage.css';
import { Phone } from 'lucide-react';

const QuangCaoPage = () => {
  return (
    <div className="quang-cao-page container">
      <div className="qc-header-nav">
        <div className="qc-header-links">
          <span>Báo Online</span>
          <span>Báo in</span>
          <span>Sự kiện</span>
        </div>
        <div className="qc-header-contact">
          <div className="qc-contact-item">Hotline: <strong>0784543079</strong></div>
          <div className="qc-contact-item">Email: <strong>24050068@student.bdu.edu.vn</strong></div>
        </div>
      </div>

      <h1 className="qc-title">Bảng giá Quảng cáo</h1>
      
      <div className="qc-grid">
        <div className="qc-card">
          <div className="qc-card-img">
            <img src="https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=600&q=80" alt="Báo in" />
          </div>
          <h3 className="qc-card-title">Báo in</h3>
          <Link to="/page/media-kit-bao-in" className="qc-btn cyan">Media kit Báo in</Link>
        </div>

        <div className="qc-card">
          <div className="qc-card-img">
            <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80" alt="Báo Online" />
          </div>
          <h3 className="qc-card-title">Báo Online</h3>
          <Link to="/page/media-kit-bao-online" className="qc-btn red">Media kit Báo Online</Link>
        </div>

        <div className="qc-card">
          <div className="qc-card-img">
            <img src="https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=600&q=80" alt="Sự kiện" />
          </div>
          <h3 className="qc-card-title">Sự kiện</h3>
          <Link to="/page/media-kit-su-kien" className="qc-btn yellow">Media kit Sự kiện</Link>
        </div>
      </div>

      {/* Floating Phone Button */}
      <a href="tel:0784543079" className="qc-floating-phone">
        <Phone size={24} fill="white" />
      </a>
    </div>
  );
};

export default QuangCaoPage;
