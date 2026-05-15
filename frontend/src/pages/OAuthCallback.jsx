import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Trang này nhận token từ backend sau khi OAuth thành công
// URL dạng: /oauth-callback?token=xxx&name=xxx&role=2
export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [status, setStatus] = useState('processing'); // 'processing' | 'error'

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      const msgs = {
        google_not_configured: 'Đăng nhập Google chưa được cấu hình. Liên hệ quản trị viên.',
        facebook_not_configured: 'Đăng nhập Facebook chưa được cấu hình.',
        zalo_not_configured: 'Đăng nhập Zalo chưa được cấu hình.',
        google_failed: 'Đăng nhập Google thất bại. Vui lòng thử lại.',
        fb_failed: 'Đăng nhập Facebook thất bại. Vui lòng thử lại.',
        auth_failed: 'Xác thực thất bại.',
      };
      setStatus(msgs[error] || 'Đăng nhập thất bại.');
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    if (token) {
      // Lưu token vào localStorage
      localStorage.setItem('token', token);

      // Gọi /api/auth/me để lấy thông tin user
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(r => r.json())
        .then(data => {
          if (data?.user || data?.id) {
            const user = data.user || data;
            setUser(user);
            if (user.role_id === 1) navigate('/admin');
            else navigate('/');
          } else {
            setStatus('Không lấy được thông tin tài khoản.');
            setTimeout(() => navigate('/login'), 2000);
          }
        })
        .catch(() => {
          setStatus('Lỗi kết nối server.');
          setTimeout(() => navigate('/login'), 2000);
        });
    } else {
      setStatus('Không nhận được dữ liệu xác thực.');
      setTimeout(() => navigate('/login'), 2000);
    }
  }, []);

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', background: '#f5f5f5',
      fontFamily: 'sans-serif', gap: '16px'
    }}>
      {status === 'processing' ? (
        <>
          <div style={{
            width: '44px', height: '44px', border: '4px solid #e5e7eb',
            borderTopColor: '#0069C0', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }} />
          <p style={{ color: '#555', fontSize: '15px' }}>Đang xác thực, vui lòng chờ...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </>
      ) : (
        <>
          <div style={{ fontSize: '40px' }}>⚠️</div>
          <p style={{ color: '#DC2626', fontSize: '15px', maxWidth: '360px', textAlign: 'center' }}>{status}</p>
          <p style={{ color: '#888', fontSize: '13px' }}>Đang chuyển về trang đăng nhập...</p>
        </>
      )}
    </div>
  );
}
