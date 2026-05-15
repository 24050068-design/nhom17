import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  PhoneCall, Mail, MapPin, MonitorPlay, Zap, BarChart2,
  Landmark, TrendingUp, Globe, CloudSun,
  Clock, BarChart, Newspaper, Radio, RefreshCw,
  DollarSign, Layers, Search, Pin, BriefcaseIcon, GraduationCap
} from 'lucide-react';

export default function StaticPage() {
  const { slug } = useParams();

  let title = "Trang thông tin";
  let content = null;

  if (slug === 'lien-he') {
    title = "Liên hệ tòa soạn";
    content = (
      <div style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto', minHeight: '60vh' }}>
        <h1 style={{ fontSize: '28px', color: '#003D8F', marginBottom: '20px', fontWeight: 800 }}>{title}</h1>
        <p style={{ fontSize: '16px', lineHeight: 1.6, color: '#333', marginBottom: '30px' }}>
          Quý độc giả và đối tác có nhu cầu hợp tác, góp ý hoặc mong muốn hỗ trợ công tác, vui lòng gọi điện trực tiếp theo số Hotline bên dưới hoặc liên hệ qua các kênh chính thức của Báo Mới:
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', background: '#F8FAFC', padding: '30px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ width: 50, height: 50, borderRadius: '50%', background: '#00AEEF', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <PhoneCall size={24} />
            </div>
            <div>
              <div style={{ fontSize: '14px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Đường dây nóng tòa soạn</div>
              <a href="tel:0784543079" style={{ fontSize: '26px', color: '#0F172A', fontWeight: 900, textDecoration: 'none', display: 'block', marginTop: '4px' }}>
                0784 543 079
              </a>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ width: 50, height: 50, borderRadius: '50%', background: '#E2E8F0', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0  }}>
              <Mail size={24} />
            </div>
            <div>
              <div style={{ fontSize: '14px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Email tòa soạn</div>
              <a href="mailto:24050068@student.bdu.edu.vn" style={{ fontSize: '18px', color: '#0F172A', fontWeight: 600, textDecoration: 'none', display: 'block', marginTop: '4px' }}>
                24050068@student.bdu.edu.vn
              </a>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ width: 50, height: 50, borderRadius: '50%', background: '#E2E8F0', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0  }}>
              <MapPin size={24} />
            </div>
            <div>
              <div style={{ fontSize: '14px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Địa chỉ giao dịch</div>
              <div style={{ fontSize: '16px', color: '#0F172A', fontWeight: 500, marginTop: '4px' }}>
                TP.HCM
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } else if (slug === 'quang-cao') {
    title = "Liên hệ quảng cáo";
    content = (
      <div style={{ padding: '0', minHeight: '60vh' }}>
        {/* Ad Hero Section */}
        <div style={{ background: '#001E4D', color: '#fff', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '36px', fontWeight: 900, marginBottom: '20px', color: '#fff' }}>Báo Mới - Bệ Phóng Thương Hiệu</h1>
            <p style={{ fontSize: '18px', lineHeight: 1.6, color: '#CBE4F9', marginBottom: '30px' }}>
              Trang tin tức điện tử số 1 Việt Nam với hơn <strong>10 triệu</strong> lượt truy cập mỗi ngày. 
              Mang thông điệp của bạn đến người tiêu dùng mục tiêu một cách nhanh chóng và hiệu quả nhất.
            </p>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
              {/* Placeholder for Video/Image ad */}
              <img src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&h=675&fit=crop" alt="Quảng cáo trên Báo Mới" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,30,77,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <MonitorPlay size={64} color="#fff" strokeWidth={1} style={{ opacity: 0.9 }} />
                <span style={{ marginTop: '15px', fontSize: '20px', fontWeight: 700, letterSpacing: '1px' }}>GIẢI PHÁP TRUYỀN THÔNG TỐI ƯU</span>
              </div>
            </div>
          </div>
        </div>

        {/* Info & Contact Section */}
        <div style={{ padding: '60px 20px', maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '28px', color: '#003D8F', marginBottom: '30px', fontWeight: 800, textAlign: 'center' }}>Tại sao chọn Báo Mới?</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
            <div style={{ background: '#F8FAFC', padding: '24px', borderRadius: '12px', textAlign: 'center', border: '1px solid #E2E8F0' }}>
              <Zap size={36} color="#00AEEF" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', marginBottom: '10px' }}>Tiếp Cận Nhanh Nhất</h3>
              <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6 }}>Hệ thống phân phối nội dung ngay lập tức tới thiết bị di động, PC của hàng triệu người theo thời gian thực.</p>
            </div>
            <div style={{ background: '#F8FAFC', padding: '24px', borderRadius: '12px', textAlign: 'center', border: '1px solid #E2E8F0' }}>
              <BarChart size={36} color="#00AEEF" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', marginBottom: '10px' }}>Tối Ưu Chuyển Đổi</h3>
              <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6 }}>Hiển thị đúng bài báo chuyên sâu theo hành vi người đọc, tăng tỉ lệ nhấp và chuyển đổi bán hàng tốt nhất.</p>
            </div>
          </div>

          <div style={{ background: '#F8FAFC', padding: '30px', borderRadius: '12px', border: '2px dashed #CBD5E1', textAlign: 'center' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', marginBottom: '16px' }}>Liên hệ ngay với bộ phận Quảng Cáo</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
              <a href="tel:0784543079" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', fontSize: '26px', color: '#00AEEF', fontWeight: 900, textDecoration: 'none' }}>
                <PhoneCall size={24} /> 0784 543 079
              </a>
              <a href="mailto:24050068@student.bdu.edu.vn" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', fontSize: '16px', color: '#475569', fontWeight: 600, textDecoration: 'none' }}>
                <Mail size={18} /> 24050068@student.bdu.edu.vn
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  } else if (['tien-ich', 'ban-can-biet', 'toa-soan', 'dat-bao', 'rss', 'chinh-sach'].includes(slug)) {
    title = slug === 'tien-ich' ? "Tiện ích & Ứng dụng" : 
            slug === 'ban-can-biet' ? "Bạn cần biết" : 
            slug === 'toa-soan' ? "Thông tin tòa soạn" :
            slug === 'dat-bao' ? "Đặt báo dài hạn" :
            slug === 'rss' ? "RSS Feed" : "Chính sách bảo mật";
    
    // Custom content for "Bạn cần biết"
    if (slug === 'ban-can-biet') {
      content = (
        <div style={{ padding: '60px 20px', maxWidth: '800px', margin: '0 auto', minHeight: '60vh' }}>
          <h1 style={{ fontSize: '32px', color: '#003D8F', marginBottom: '30px', fontWeight: 800 }}>Bạn cần biết</h1>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <h3 style={{ fontSize: '18px', color: '#0F172A', fontWeight: 700, marginBottom: '10px' }}>1. Quy định về Bản Quyền</h3>
              <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.6 }}>Toàn bộ nội dung, hình ảnh, và video trên hệ thống đều thuộc bản quyền của Báo Mới. Tuyệt đối nghiêm cấm việc sao chép dưới mọi hình thức nếu không được sự cho phép bằng văn bản từ Ban biên tập.</p>
            </div>
            
            <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <h3 style={{ fontSize: '18px', color: '#0F172A', fontWeight: 700, marginBottom: '10px' }}>2. Hướng dẫn gửi bài Truyền Thông</h3>
              <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.6 }}>Bạn đọc có thể gửi trực tiếp các bài viết phản ánh tin tức hoặc hình ảnh sự kiện về địa chỉ hộp thư <strong>24050068@student.bdu.edu.vn</strong>. Bài viết sẽ được kiểm duyệt và ghi nhận nhuận bút nếu xuất bản.</p>
            </div>

            <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <h3 style={{ fontSize: '18px', color: '#0F172A', fontWeight: 700, marginBottom: '10px' }}>3. Bảo mật thông tin bình luận</h3>
              <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.6 }}>Các thông tin email cá nhân khi đăng ký tài khoản tham gia thảo luận sẽ được mã hoá 100%. Độc giả vui lòng tuân thủ quy tắc văn minh khi trao đổi trên trang tin.</p>
            </div>

            <Link to="/" style={{ alignSelf: 'flex-start', marginTop: '20px', background: '#00AEEF', color: 'white', padding: '12px 28px', borderRadius: '6px', textDecoration: 'none', fontWeight: 600, fontSize: '15px' }}>
              ← Về trang chủ
            </Link>
          </div>
        </div>
      );
    } else {
      content = (
        <div style={{ padding: '60px 20px', maxWidth: '800px', margin: '0 auto', minHeight: '60vh' }}>
          <h1 style={{ fontSize: '32px', color: '#003D8F', marginBottom: '20px', fontWeight: 800 }}>{title}</h1>
          <div style={{ background: '#F8FAFC', padding: '40px 30px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '17px', lineHeight: 1.6, color: '#334155' }}>
            <p style={{ marginBottom: '16px' }}>Nội dung chuyên mục <strong>{title}</strong> hiện đang trong quá trình cập nhật nội dung văn bản chi tiết.</p>
            <p>Ban biên tập sẽ sớm ra mắt tính năng và các tài liệu chuyên ngành liên quan trong thời gian tới để phục vụ bạn đọc tốt hơn. Cảm ơn sự đồng hành của quý độc giả!</p>
            <div style={{ marginTop: '30px' }}>
              <Link to="/" style={{ display: 'inline-block', background: '#00AEEF', color: 'white', padding: '12px 28px', borderRadius: '6px', textDecoration: 'none', fontWeight: 600, fontSize: '15px', transition: 'opacity 0.2s' }}>
                ← Quay về trang chủ
              </Link>
            </div>
          </div>
        </div>
      );
    }
  } else if (slug === 'chao-ngay-moi') {
    const newsItems = [
      {
        Icon: Landmark,
        color: '#0050A0', bg: '#EFF6FF',
        title: 'Chính trị & Xã hội',
        desc: 'Tổng hợp các quyết sách, nghị quyết và sự kiện chính trị quan trọng trong ngày.',
      },
      {
        Icon: TrendingUp,
        color: '#059669', bg: '#ECFDF5',
        title: 'Kinh tế & Thị trường',
        desc: 'Cập nhật giá vàng, chứng khoán, tỷ giá ngoại tệ và diễn biến thị trường.',
      },
      {
        Icon: Globe,
        color: '#7C3AED', bg: '#F5F3FF',
        title: 'Thế giới & Quốc tế',
        desc: 'Tin tức quốc tế được chọn lọc từ các nguồn đáng tin cậy trên toàn cầu.',
      },
      {
        Icon: CloudSun,
        color: '#D97706', bg: '#FFFBEB',
        title: 'Thời tiết hôm nay',
        desc: 'Dự báo thời tiết 63 tỉnh thành, cập nhật chính xác từ Trung tâm Khí tượng.',
      },
    ];
    content = (
      <div style={{ minHeight: '60vh' }}>
        {/* Hero */}
        <div style={{ background: 'linear-gradient(135deg, #0066CC 0%, #00AEEF 100%)', color: '#fff', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <CloudSun size={34} color="#fff" strokeWidth={1.5}/>
          </div>
          <h1 style={{ fontSize: '36px', fontWeight: 900, margin: '0 0 12px', color: '#fff' }}>Chào ngày mới</h1>
          <p style={{ fontSize: '18px', opacity: 0.9, maxWidth: '600px', margin: '0 auto' }}>
            Bắt đầu ngày mới với những tin tức quan trọng nhất được tổng hợp từ Ban biên tập Báo Mới
          </p>
        </div>
        <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
          <h2 style={{ fontSize: '22px', color: '#003D8F', marginBottom: '20px', fontWeight: 800, borderLeft: '4px solid #00AEEF', paddingLeft: '14px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Newspaper size={20} color="#00AEEF"/> Tin nổi bật sáng nay
          </h2>
          {newsItems.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '16px', padding: '18px 20px', background: '#fff', borderRadius: '10px', marginBottom: '12px', border: '1px solid #E2E8F0', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ width: 44, height: 44, borderRadius: '10px', background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <item.Icon size={22} color={item.color} strokeWidth={1.8}/>
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '16px', color: '#0F172A', marginBottom: '4px' }}>{item.title}</div>
                <div style={{ fontSize: '13.5px', color: '#475569', lineHeight: 1.6 }}>{item.desc}</div>
              </div>
            </div>
          ))}
          <div style={{ marginTop: '30px' }}>
            <Link to="/" style={{ background: '#00AEEF', color: 'white', padding: '12px 28px', borderRadius: '6px', textDecoration: 'none', fontWeight: 600, fontSize: '15px' }}>
              ← Về trang chủ đọc tin
            </Link>
          </div>
        </div>
      </div>
    );
  } else if (slug === 'tin-24h') {
    const liveItems = [
      { ago: 'Vừa xong', dot: '#EF4444', title: 'Bộ Ngoại giao họp khẩn về tình hình biên giới phía Bắc' },
      { ago: '35 phút', dot: '#F97316', title: 'VN-Index tăng mạnh phiên chiều, dòng tiền đổ vào cổ phiếu ngân hàng' },
      { ago: '1 giờ',   dot: '#EAB308', title: 'Bão số 3 dự kiến đổ bộ miền Trung vào cuối tuần này' },
      { ago: '2 giờ',   dot: '#6B7280', title: 'Kết quả thi tốt nghiệp THPT được công bố sớm hơn dự kiến 2 ngày' },
      { ago: '3 giờ',   dot: '#6B7280', title: 'Thị trường bất động sản TP.HCM ghi nhận nhiều giao dịch tăng tốt' },
    ];
    content = (
      <div style={{ minHeight: '60vh' }}>
        <div style={{ background: 'linear-gradient(135deg, #1E3A5F 0%, #0066CC 100%)', color: '#fff', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Clock size={34} color="#fff" strokeWidth={1.5}/>
          </div>
          <h1 style={{ fontSize: '36px', fontWeight: 900, margin: '0 0 12px', color: '#fff' }}>Tin 24h</h1>
          <p style={{ fontSize: '18px', opacity: 0.9, maxWidth: '600px', margin: '0 auto' }}>
            Cập nhật tin tức liên tục 24 giờ, 7 ngày trong tuần — không bỏ lỡ bất kỳ sự kiện nào
          </p>
        </div>
        <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
          <h2 style={{ fontSize: '22px', color: '#003D8F', marginBottom: '20px', fontWeight: 800, borderLeft: '4px solid #00AEEF', paddingLeft: '14px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Radio size={18} color="#EF4444"/> Đang cập nhật trực tiếp
          </h2>
          {liveItems.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '16px', padding: '16px 0', borderBottom: '1px solid #E2E8F0', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', minWidth: '64px' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.dot, marginTop: 4 }}/>
                <span style={{ fontSize: '11px', color: '#94A3B8', whiteSpace: 'nowrap' }}>{item.ago} trước</span>
              </div>
              <div style={{ fontWeight: 600, fontSize: '15px', color: '#0F172A', lineHeight: 1.5 }}>{item.title}</div>
            </div>
          ))}
          <div style={{ marginTop: '30px' }}>
            <Link to="/" style={{ background: '#0066CC', color: 'white', padding: '12px 28px', borderRadius: '6px', textDecoration: 'none', fontWeight: 600, fontSize: '15px' }}>
              ← Xem tất cả tin tức
            </Link>
          </div>
        </div>
      </div>
    );
  } else if (slug === 'tin-thi-truong') {
    const markets = [
      { Icon: BarChart2, label: 'VN-Index',     value: '1.285,4',        change: '+12,3',  up: true,  color: '#0050A0', bg: '#EFF6FF' },
      { Icon: TrendingUp,label: 'Vàng SJC',     value: '95,5 tr/lượng', change: '+500k',  up: true,  color: '#D97706', bg: '#FFFBEB' },
      { Icon: DollarSign, label: 'USD/VND',     value: '25.890',         change: '-50',    up: false, color: '#4B5563', bg: '#F3F4F6' },
      { Icon: Layers,     label: 'Dầu thô',     value: '$82,4/thùng',   change: '+0,8',   up: true,  color: '#059669', bg: '#ECFDF5' },
    ];
    content = (
      <div style={{ minHeight: '60vh' }}>
        <div style={{ background: 'linear-gradient(135deg, #064E3B 0%, #059669 100%)', color: '#fff', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <TrendingUp size={34} color="#fff" strokeWidth={1.5}/>
          </div>
          <h1 style={{ fontSize: '36px', fontWeight: 900, margin: '0 0 12px', color: '#fff' }}>Tin thị trường</h1>
          <p style={{ fontSize: '18px', opacity: 0.9, maxWidth: '600px', margin: '0 auto' }}>
            Dữ liệu tài chính, chứng khoán, bất động sản và hàng hóa cập nhật nhanh nhất
          </p>
        </div>
        <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '32px' }}>
            {markets.map((item, i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                  <item.Icon size={22} color={item.color} strokeWidth={1.8}/>
                </div>
                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', margin: '6px 0' }}>{item.value}</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: item.up ? '#10B981' : '#EF4444' }}>
                  {item.up ? '▲' : '▼'} {item.change}
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '24px' }}>* Dữ liệu minh hoạ, cập nhật phiên giao dịch gần nhất.</p>
          <Link to="/category/kinh-doanh" style={{ background: '#059669', color: 'white', padding: '12px 28px', borderRadius: '6px', textDecoration: 'none', fontWeight: 600, fontSize: '15px' }}>
            Vào chuyên mục Kinh doanh →
          </Link>
        </div>
      </div>
    );
  } else if (slug === 'tin-360') {
    const analyses = [
      { Icon: Landmark,       color: '#0050A0', bg: '#EFF6FF', angle: 'Góc chính phủ',   tag: 'Phân tích',  title: 'Chính sách mới tác động thế nào đến doanh nghiệp?' },
      { Icon: BriefcaseIcon,  color: '#059669', bg: '#ECFDF5', angle: 'Góc doanh nghiệp',tag: 'Phỏng vấn', title: 'CEO các tập đoàn lớn nói gì về môi trường kinh doanh 2026?' },
      { Icon: GraduationCap,  color: '#7C3AED', bg: '#F5F3FF', angle: 'Góc chuyên gia',  tag: 'Chuyên sâu', title: 'Kinh tế học hành vi giải thích tâm lý người tiêu dùng hiện đại' },
      { Icon: Globe,          color: '#0891B2', bg: '#ECFEFF', angle: 'Góc quốc tế',     tag: 'Quốc tế',   title: 'Thế giới nhìn về Việt Nam: Cơ hội và thách thức trong kỷ nguyên mới' },
    ];
    content = (
      <div style={{ minHeight: '60vh' }}>
        <div style={{ background: 'linear-gradient(135deg, #312E81 0%, #6366F1 100%)', color: '#fff', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <RefreshCw size={34} color="#fff" strokeWidth={1.5}/>
          </div>
          <h1 style={{ fontSize: '36px', fontWeight: 900, margin: '0 0 12px', color: '#fff' }}>Tin 360°</h1>
          <p style={{ fontSize: '18px', opacity: 0.9, maxWidth: '600px', margin: '0 auto' }}>
            Góc nhìn đa chiều về các sự kiện quan trọng — phân tích sâu từ nhiều phía để bạn đọc có bức tranh toàn cảnh
          </p>
        </div>
        <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
          <h2 style={{ fontSize: '22px', color: '#003D8F', marginBottom: '20px', fontWeight: 800, borderLeft: '4px solid #6366F1', paddingLeft: '14px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Search size={18} color="#6366F1"/> Phân tích chuyên sâu
          </h2>
          {analyses.map((item, i) => (
            <div key={i} style={{ padding: '18px 20px', background: '#fff', borderRadius: '10px', marginBottom: '12px', border: '1px solid #E2E8F0', display: 'flex', gap: 14, alignItems: 'flex-start', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ width: 40, height: 40, borderRadius: '8px', background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                <item.Icon size={20} color={item.color} strokeWidth={1.8}/>
              </div>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, background: '#EEF2FF', color: '#6366F1', padding: '2px 10px', borderRadius: '20px' }}>{item.tag}</span>
                <div style={{ fontSize: '13px', color: item.color, fontWeight: 600, margin: '8px 0 4px' }}>{item.angle}</div>
                <div style={{ fontWeight: 700, fontSize: '15px', color: '#0F172A', lineHeight: 1.5 }}>{item.title}</div>
              </div>
            </div>
          ))}
          <div style={{ marginTop: '30px' }}>
            <Link to="/" style={{ background: '#6366F1', color: 'white', padding: '12px 28px', borderRadius: '6px', textDecoration: 'none', fontWeight: 600, fontSize: '15px' }}>
              ← Khám phá thêm tin tức
            </Link>
          </div>
        </div>
      </div>
    );
  } else if (['media-kit-bao-in', 'media-kit-bao-online', 'media-kit-su-kien'].includes(slug)) {
    title = slug === 'media-kit-bao-in' ? "Media Kit - Báo In" : 
            slug === 'media-kit-bao-online' ? "Media Kit - Báo Online" : "Media Kit - Sự Kiện";
            
     content = (
      <div style={{ padding: '60px 20px', maxWidth: '800px', margin: '0 auto', minHeight: '60vh' }}>
        <h1 style={{ fontSize: '32px', color: '#003D8F', marginBottom: '20px', fontWeight: 800, textAlign: 'center' }}>{title}</h1>
        <div style={{ background: '#F8FAFC', padding: '40px 30px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '17px', lineHeight: 1.6, color: '#334155', textAlign: 'center' }}>
          <h2 style={{ fontSize: '24px', color: '#00AEEF', marginBottom: '16px' }}>Tài liệu đang được cập nhật</h2>
          <p style={{ marginBottom: '20px' }}>Bộ tài liệu <strong>{title}</strong> đầy đủ về báo cáo số liệu, thông số kỹ thuật và các gói chiết khấu hiện đang được bộ phận kinh doanh tổng hợp để cung cấp phiên bản mới nhất.</p>
          <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '15px', alignItems: 'center', background: '#fff', padding: '20px', borderRadius: '8px', border: '2px dashed #00AEEF', marginBottom: '30px' }}>
             <span style={{ fontSize: '15px', color: '#475569', fontWeight: 600 }}>Quý khách vui lòng liên hệ Hotline để nhận báo giá trực tiếp:</span>
             <a href="tel:0784543079" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', fontSize: '24px', color: '#0F172A', fontWeight: 900, textDecoration: 'none' }}>
                <PhoneCall size={22} color="#00AEEF"/> 0784 543 079
              </a>
          </div>
          <div>
            <Link to="/quang-cao" style={{ display: 'inline-block', background: '#00AEEF', color: 'white', padding: '12px 28px', borderRadius: '6px', textDecoration: 'none', fontWeight: 600, fontSize: '15px', transition: 'opacity 0.2s' }}>
              ← Quay lại Bảng giá Quảng Cáo
            </Link>
          </div>
        </div>
      </div>
    );
  } else {
    content = (
      <div style={{ padding: '100px 20px', textAlign: 'center', minHeight: '50vh' }}>
        <h2 style={{ fontSize: '24px', color: '#333' }}>Trang nội bộ không tồn tại</h2>
        <Link to="/" style={{ color: '#00AEEF', textDecoration: 'none', marginTop: '20px', display: 'inline-block', fontWeight: 600 }}>Tải lại Trang chủ</Link>
      </div>
    );
  }

  return content;
}
