import React, { useState } from 'react';
import './DatBaoPage.css';
import { Calendar, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const PROVINCES = [
  "Hà Nội", "Hà Giang", "Cao Bằng", "Bắc Kạn", "Tuyên Quang", "Lào Cai", "Điện Biên", "Lai Châu", "Sơn La", "Yên Bái", "Hòa Bình", "Thái Nguyên", "Lạng Sơn", "Quảng Ninh", "Bắc Giang", "Phú Thọ", "Vĩnh Phúc", "Bắc Ninh", "Hải Dương", "Hải Phòng", "Hưng Yên", "Thái Bình", "Hà Nam", "Nam Định", "Ninh Bình", "Thanh Hóa", "Nghệ An", "Hà Tĩnh", "Quảng Bình", "Quảng Trị", "Thừa Thiên Huế", "Đà Nẵng", "Quảng Nam", "Quảng Ngãi", "Bình Định", "Phú Yên", "Khánh Hòa", "Ninh Thuận", "Bình Thuận", "Kon Tum", "Gia Lai", "Đắk Lắk", "Đắk Nông", "Lâm Đồng", "Bình Phước", "Tây Ninh", "Bình Dương", "Đồng Nai", "Bà Rịa - Vũng Tàu", "TP. Hồ Chí Minh", "Long An", "Tiền Giang", "Bến Tre", "Trà Vinh", "Vĩnh Long", "Đồng Tháp", "An Giang", "Kiên Giang", "Cần Thơ", "Hậu Giang", "Sóc Trăng", "Bạc Liêu", "Cà Mau"
];

const SPECIAL_EDITIONS = [
  "Đặc san chào mừng ngày Thống nhất đất nước 30/4",
  "Đặc san chào mừng ngày Báo chí cách mạng Việt Nam 21/6",
  "Đặc san chào mừng ngày Quốc Khánh 2/9",
  "Đặc san chào mừng ngày Doanh nhân Việt Nam 13/10",
  "Đặc san chào mừng ngày Nhà giáo Việt Nam 20/11"
];

const PROMOS = {
  3: { price: 5500, ky: 92, discount: 0.05 },
  6: { price: 5500, ky: 180, discount: 0.10 },
  12: { price: 5500, ky: 345, discount: 0.15 },
};

const formatVND = (val) => new Intl.NumberFormat('vi-VN').format(Math.round(val)) + 'đ';

const DatBaoPage = () => {
  const { user } = useAuth();

  // Đơn hàng
  const [qty, setQty] = useState(0);
  const [period, setPeriod] = useState(null);
  const [customKy, setCustomKy] = useState(0);
  const [specials, setSpecials] = useState([0,0,0,0,0]);
  const [payment, setPayment] = useState("");
  const [invoice, setInvoice] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState(null);

  // Thông tin khách hàng
  const [customerName, setCustomerName] = useState(user?.full_name || user?.username || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerProvince, setCustomerProvince] = useState('');
  const [customerAddress, setCustomerAddress] = useState(user?.address || '');

  // Thông tin hóa đơn
  const [invoiceCompany, setInvoiceCompany] = useState('');
  const [invoiceTax, setInvoiceTax] = useState('');
  const [invoiceAddress, setInvoiceAddress] = useState('');

  // ─── Tính tiền (phải khai báo trước handleSubmit để dùng được trong closure) ───
  const currentPromo = PROMOS[period] || { price: 5500, ky: customKy, discount: 0 };
  const baseCost     = currentPromo.price * currentPromo.ky * qty;
  const promoCost    = baseCost * (1 - currentPromo.discount);
  const specialCost  = specials.reduce((acc, count) => acc + count * 35000, 0);
  const total        = promoCost + specialCost;

  const handleSubmit = async () => {
    if (total === 0) {
      alert("Vui lòng chọn ít nhất 1 ấn phẩm trước khi đặt báo!");
      return;
    }
    if (!customerName.trim() || !customerPhone.trim()) {
      alert("Vui lòng nhập họ tên và số điện thoại!");
      return;
    }
    // Build items array
    const items = [];
    if (baseCost > 0) {
      items.push({ type: 'newspaper', name: 'Nhật báo Báo Mới', price: 5500, qty, ky: currentPromo.ky, period, discount: currentPromo.discount, subtotal: Math.round(promoCost) });
    }
    specials.forEach((count, i) => {
      if (count > 0) items.push({ type: 'special', name: SPECIAL_EDITIONS[i], price: 35000, qty: count, subtotal: count * 35000 });
    });

    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: customerName, email: customerEmail, phone: customerPhone,
          province: customerProvince, address: customerAddress,
          payment_method: payment, invoice,
          invoice_company: invoiceCompany, invoice_tax: invoiceTax, invoice_address: invoiceAddress,
          items, total_amount: Math.round(total),
          user_id: user?.id || null
        })
      });
      const data = await res.json();
      if (res.ok) {
        setOrderId(data.order_id);
        setIsSubmitted(true);
      } else {
        alert(data.msg || 'Đặt báo thất bại, vui lòng thử lại!');
      }
    } catch (err) {
      alert('Lỗi kết nối mạng, vui lòng thử lại!');
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="dat-bao-page container">
      {isSubmitted ? (
        <div style={{ textAlign: 'center', padding: '100px 20px', background: '#fff', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <div style={{ width: '80px', height: '80px', background: '#10B981', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '40px' }}>
            ✓
          </div>
          <h2 style={{ color: '#0F172A', marginBottom: '15px', fontSize: '24px' }}>ĐẶT BÁO THÀNH CÔNG!</h2>
          <p style={{ color: '#64748B', fontSize: '16px', lineHeight: 1.6, maxWidth: '600px', margin: '0 auto 30px' }}>
            Cảm ơn bạn đã đặt báo. Đơn hàng#{orderId} với tổng thanh toán <strong style={{ color: '#00AEEF' }}>{formatVND(total)}</strong> đã được ghi nhận.
            Bộ phận phát hành sẽ liên hệ với bạn trong thời gian sớm nhất để xác nhận thông tin giao hàng và thanh toán.
          </p>
          <button 
            onClick={() => {
              setIsSubmitted(false);
              setQty(0);
              setCustomKy(0);
              setSpecials([0,0,0,0,0]);
              setPeriod(null);
              setPayment("");
            }}
            style={{ padding: '12px 30px', background: '#00AEEF', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}
          >
            Tiếp tục mua báo
          </button>
        </div>
      ) : (
        <div className="db-layout">
          <div className="db-main">
          
          <section className="db-section">
            <h2 className="db-sec-title">NHẬT BÁO BÁO MỚI</h2>
            <div className="db-date-picker">
              <div className="db-date-group">
                <label>Thời gian</label>
                <div className="db-input-wrap">
                  <input type="date" />
                  <Calendar size={18} className="db-icon" />
                </div>
              </div>
              <span className="db-date-sep">đến</span>
              <div className="db-date-group">
                <div className="db-input-wrap">
                  <input type="date" />
                  <Calendar size={18} className="db-icon" />
                </div>
              </div>
            </div>

            <table className="db-table main-table">
              <thead>
                <tr>
                  <th>Loại báo</th>
                  <th>Giá</th>
                  <th>Số kỳ</th>
                  <th>Số lượng/kỳ</th>
                  <th>Khuyến mãi</th>
                  <th>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Nhật báo Báo Mới</td>
                  <td>5.500đ</td>
                  <td>
                    {period === null ? (
                      <input 
                        type="number" 
                        min="0" 
                        value={customKy} 
                        onChange={(e) => setCustomKy(e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value) || 0))} 
                        className="db-num-input" 
                      />
                    ) : (
                      currentPromo.ky
                    )}
                  </td>
                  <td><input type="number" min="0" value={qty} onChange={(e) => setQty(e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value) || 0))} className="db-num-input" /></td>
                  <td>{currentPromo.discount * 100}%</td>
                  <td>{formatVND(promoCost)}</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className="db-section">
            <h3 className="db-sec-subtitle">Thông tin khuyến mãi</h3>
            <table className="db-table promo-table">
              <thead>
                <tr>
                  <th>Thời gian</th>
                  <th>Giá</th>
                  <th>Số lượng</th>
                  <th>Khuyến mãi</th>
                  <th>Tổng</th>
                </tr>
              </thead>
              <tbody>
                {[3, 6, 12].map((m) => {
                  const p = PROMOS[m];
                  const tBase = p.price * p.ky;
                  const tFinal = tBase * (1 - p.discount);
                  return (
                    <tr key={m}>
                      <td>
                        <button 
                          className={`db-period-btn ${period === m ? 'active' : ''}`}
                          onClick={() => setPeriod(period === m ? null : m)}
                        >
                          {m} Tháng
                        </button>
                      </td>
                      <td>{formatVND(p.price)}</td>
                      <td>{p.ky}</td>
                      <td>{p.discount * 100}%</td>
                      <td>{formatVND(tFinal)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </section>

          <section className="db-section">
            <h3 className="db-sec-subtitle">ẤN PHẨM ĐẶC BIỆT</h3>
            <table className="db-table special-table">
              <thead>
                <tr>
                  <th>Ấn phẩm báo</th>
                  <th>Giá</th>
                  <th>Số lượng</th>
                  <th>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {SPECIAL_EDITIONS.map((item, index) => (
                  <tr key={item}>
                    <td>{item}</td>
                    <td>{formatVND(35000)}</td>
                    <td>
                      <input 
                        type="number" 
                        min="0" 
                        value={specials[index]} 
                        onChange={(e) => {
                          const newSpecials = [...specials];
                          newSpecials[index] = Number(e.target.value) || 0;
                          setSpecials(newSpecials);
                        }} 
                        className="db-num-input" 
                      />
                    </td>
                    <td>{formatVND(specials[index] * 35000)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="db-section">
            <h3 className="db-sec-subtitle">THÔNG TIN</h3>
            <div className="db-info-form">
              <div className="db-form-row">
                <input type="text" placeholder="Họ và tên *" className="db-input full"
                  value={customerName} onChange={e => setCustomerName(e.target.value)} required />
              </div>
              <div className="db-form-row col-2">
                <input type="email" placeholder="Email" className="db-input"
                  value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} />
                <input type="tel" placeholder="Điện thoại *" className="db-input"
                  value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} required />
              </div>
              <div className="db-form-row col-2">
                <select className="db-select" value={customerProvince} onChange={e => setCustomerProvince(e.target.value)}>
                  <option value="">Chọn Tỉnh / Thành phố</option>
                  {PROVINCES.map(prov => (
                    <option key={prov} value={prov}>{prov}</option>
                  ))}
                </select>
                <input type="text" placeholder="Số nhà, tên đường, phường/xã/đặc khu" className="db-input"
                  value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} />
              </div>
            </div>
          </section>

          <section className="db-section">
            <h3 className="db-sec-subtitle">Thanh toán</h3>
            <div className="db-payment-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <label className="db-radio-label">
                <input type="radio" name="payment" value="Tại Phòng phát hành" checked={payment === "Tại Phòng phát hành"} onChange={(e) => setPayment(e.target.value)} /> Tại Phòng phát hành
              </label>
              <label className="db-radio-label">
                <input type="radio" name="payment" value="Tại nhà" checked={payment === "Tại nhà"} onChange={(e) => setPayment(e.target.value)} /> Tại nhà
              </label>

              <label className="db-radio-label">
                <input type="radio" name="payment" value="Chuyển khoản qua Ngân hàng" checked={payment === "Chuyển khoản qua Ngân hàng"} onChange={(e) => setPayment(e.target.value)} /> Chuyển khoản qua Ngân hàng
              </label>
              <div>
                <label className="db-radio-label">
                  <input type="radio" name="payment" value="Cổng thanh toán Payoo" checked={payment === "Cổng thanh toán Payoo"} onChange={(e) => setPayment(e.target.value)} /> Cổng thanh toán Payoo
                </label>
                {payment === "Cổng thanh toán Payoo" && (
                  <div style={{ marginTop: '15px', padding: '15px', background: '#fff', border: '1px solid #eaeaea', borderRadius: '4px', fontSize: '13px', lineHeight: 1.6, color: '#333' }}>
                    THANH TOÁN ONLINE QUA VÍ PAYOO<br/>
                    Lưu ý : KHÔNG THANH TOÁN TIỀN TRƯỚC (để Báo Mới liên hệ lại nếu phát báo được sẽ thanh toán sau)
                  </div>
                )}
              </div>

              <label className="db-radio-label">
                <input type="radio" name="payment" value="Ví Momo" checked={payment === "Ví Momo"} onChange={(e) => setPayment(e.target.value)} /> Ví Momo
              </label>
            </div>
            
            {(payment === "Chuyển khoản qua Ngân hàng" || payment === "Ví Momo" || payment === "Cổng thanh toán Payoo") && (
              <div className="db-qr-code-section" style={{ marginTop: '20px', textAlign: 'center', background: '#F8FAFC', padding: '20px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <h4 style={{ color: payment === 'Ví Momo' ? '#A50064' : payment === 'Cổng thanh toán Payoo' ? '#00AEEF' : '#0F172A', marginBottom: '15px' }}>
                  Quét mã QR để thanh toán qua {payment}
                </h4>
                <img src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg" alt="QR Code" style={{ width: '150px', height: '150px', objectFit: 'contain', background: '#fff', padding: '10px', borderRadius: '8px', border: `2px solid ${payment === 'Ví Momo' ? '#A50064' : payment === 'Cổng thanh toán Payoo' ? '#00AEEF' : '#ddd'}` }} />
                <p style={{ marginTop: '10px', fontSize: '14px', color: '#64748B' }}>
                  {payment === "Ví Momo" ? (
                    <>Mở ứng dụng Momo và quét mã QR.<br/>Số điện thoại: 0784 543 079 - Tên: BAO MOI</>
                  ) : payment === "Cổng thanh toán Payoo" ? (
                    <>Sử dụng ứng dụng Payoo hoặc ngân hàng liên kết quét mã.<br/>Mã dịch vụ: BAO MOI - Tên: BAO MOI</>
                  ) : (
                    <>Ngân hàng Vietcombank - CN Tân Bình<br/>STK: 123456789 - CTK: BAO MOI</>
                  )}
                  <br/>Nội dung: [Số điện thoại]
                </p>
              </div>
            )}

          </section>

          <section className="db-section">
            <h3 className="db-sec-subtitle">Thông tin hoá đơn</h3>
            <div className="db-payment-options" style={{ marginBottom: invoice ? '20px' : '0' }}>
              <label className="db-radio-label">
                <input type="radio" name="invoice" checked={invoice} onChange={() => setInvoice(true)} /> Có hóa đơn
              </label>
              <label className="db-radio-label">
                <input type="radio" name="invoice" checked={!invoice} onChange={() => setInvoice(false)} /> Không xuất hóa đơn
              </label>
            </div>
            
            {invoice && (
              <div className="db-invoice-form">
                <div className="db-form-row col-2">
                  <input type="text" placeholder="Tên đơn vị *" className="db-input"
                    value={invoiceCompany} onChange={e => setInvoiceCompany(e.target.value)} />
                  <input type="text" placeholder="Mã số thuế *" className="db-input"
                    value={invoiceTax} onChange={e => setInvoiceTax(e.target.value)} />
                </div>
                <div className="db-form-row">
                  <textarea rows="4" placeholder="Địa chỉ hóa đơn" className="db-input full" style={{ resize: 'vertical' }}
                    value={invoiceAddress} onChange={e => setInvoiceAddress(e.target.value)} />
                </div>
              </div>
            )}
          </section>

          <section className="db-section contact-directory">
            <h3 className="contact-dir-title" style={{ fontSize: '18px', marginBottom: '15px', color: '#333' }}>
              Chi tiết quý bạn đọc vui lòng liên hệ<br/>
              <span style={{color: '#00AEEF', fontSize: '16px', fontWeight: '500'}}>Tại TP.HCM nhận giao tại các phường, xã:</span>
            </h3>
            
            <div className="contact-main-hub" style={{ background: '#D6EAF8', padding: '15px', borderRadius: '4px', marginBottom: '20px' }}>
              <h4 style={{ color: '#0F172A', fontSize: '15px', marginBottom: '10px' }}>Bộ phận Phát hành - Trung tâm dịch vụ truyền thông Báo Mới</h4>
              <p style={{ margin: '5px 0', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>📍 268-270 Nguyễn Đình Chiểu, phường Xuân Hòa, TP.HCM</p>
              <p style={{ margin: '5px 0', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>📞 0784.543.079</p>
              <p style={{ margin: '5px 0', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>✉️ 24050068@student.bdu.edu.vn</p>
            </div>

            <div className="contact-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="contact-card" style={{ border: '1px solid #E2E8F0', padding: '15px', borderRadius: '4px' }}>
                <h4 style={{ fontSize: '15px', marginBottom: '15px', color: '#0F172A' }}>Thành phố Hà Nội</h4>
                <p style={{ fontSize: '13px', margin: '5px 0', color: '#444' }}><span style={{ color: '#888' }}>Địa chỉ:</span> 218 Tây Sơn, phường Đống Đa, TP.Hà Nội</p>
                <p style={{ fontSize: '13px', margin: '5px 0', color: '#444' }}><span style={{ color: '#888' }}>Điện thoại:</span> (024) 38570981 - 0904.266.866</p>
              </div>
              <div className="contact-card" style={{ border: '1px solid #E2E8F0', padding: '15px', borderRadius: '4px' }}>
                <h4 style={{ fontSize: '15px', marginBottom: '15px', color: '#0F172A' }}>Thành phố Hải Phòng</h4>
                <p style={{ fontSize: '13px', margin: '5px 0', color: '#444' }}><span style={{ color: '#888' }}>Điện thoại:</span> 0988.819.968</p>
              </div>
              <div className="contact-card" style={{ border: '1px solid #E2E8F0', padding: '15px', borderRadius: '4px' }}>
                <h4 style={{ fontSize: '15px', marginBottom: '15px', color: '#0F172A' }}>VP liên lạc tại Thanh Hóa</h4>
                <p style={{ fontSize: '13px', margin: '5px 0', color: '#444' }}><span style={{ color: '#888' }}>Địa chỉ:</span> 1 Nhà Thờ, phường Hạc Thành, tỉnh Thanh Hóa</p>
                <p style={{ fontSize: '13px', margin: '5px 0', color: '#444' }}><span style={{ color: '#888' }}>Điện thoại:</span> (0237) 3855748 - 0913.310.398</p>
              </div>
              <div className="contact-card" style={{ border: '1px solid #E2E8F0', padding: '15px', borderRadius: '4px' }}>
                <h4 style={{ fontSize: '15px', marginBottom: '15px', color: '#0F172A' }}>VPĐD khu vực Duyên hải miền Trung</h4>
                <p style={{ fontSize: '13px', margin: '5px 0', color: '#444' }}><span style={{ color: '#888' }}>Địa chỉ:</span> 144 Bạch Đằng, phường Hải Châu, TP.Đà Nẵng</p>
                <p style={{ fontSize: '13px', margin: '5px 0', color: '#444' }}><span style={{ color: '#888' }}>Điện thoại:</span> 0905.541.164</p>
              </div>
              <div className="contact-card" style={{ border: '1px solid #E2E8F0', padding: '15px', borderRadius: '4px' }}>
                <h4 style={{ fontSize: '15px', marginBottom: '15px', color: '#0F172A' }}>VP liên lạc tại Gia Lai</h4>
                <p style={{ fontSize: '13px', margin: '5px 0', color: '#444' }}><span style={{ color: '#888' }}>Địa chỉ:</span> 133 Lê Lợi, phường Quy Nhơn, tỉnh Gia Lai</p>
                <p style={{ fontSize: '13px', margin: '5px 0', color: '#444' }}><span style={{ color: '#888' }}>Điện thoại:</span> (0256) 3824142 - 0905.459.589</p>
              </div>
              <div className="contact-card" style={{ border: '1px solid #E2E8F0', padding: '15px', borderRadius: '4px' }}>
                <h4 style={{ fontSize: '15px', marginBottom: '15px', color: '#0F172A' }}>VPĐD khu vực Nam Trung bộ</h4>
                <p style={{ fontSize: '13px', margin: '5px 0', color: '#444' }}><span style={{ color: '#888' }}>Địa chỉ:</span> 120 Thống Nhất, phường Nha Trang, tỉnh Khánh Hòa</p>
                <p style={{ fontSize: '13px', margin: '5px 0', color: '#444' }}><span style={{ color: '#888' }}>Điện thoại:</span> (0258) 3819306 - 0909.723.444</p>
              </div>
              <div className="contact-card" style={{ border: '1px solid #E2E8F0', padding: '15px', borderRadius: '4px' }}>
                <h4 style={{ fontSize: '15px', marginBottom: '15px', color: '#0F172A' }}>Tỉnh Lâm Đồng</h4>
                <p style={{ fontSize: '13px', margin: '5px 0', color: '#444' }}><span style={{ color: '#888' }}>Điện thoại:</span> 0909.723.444</p>
              </div>
              <div className="contact-card" style={{ border: '1px solid #E2E8F0', padding: '15px', borderRadius: '4px' }}>
                <h4 style={{ fontSize: '15px', marginBottom: '15px', color: '#0F172A' }}>Tỉnh Đồng Nai</h4>
                <p style={{ fontSize: '13px', margin: '5px 0', color: '#444' }}><span style={{ color: '#888' }}>Địa chỉ:</span> Tòa nhà Tỉnh Đoàn - 33 Võ Thị Sáu, Phường Trấn Biên</p>
                <p style={{ fontSize: '13px', margin: '5px 0', color: '#444' }}><span style={{ color: '#888' }}>Điện thoại:</span> 0918.710.737</p>
              </div>
              <div className="contact-card" style={{ border: '1px solid #E2E8F0', padding: '15px', borderRadius: '4px' }}>
                <h4 style={{ fontSize: '15px', marginBottom: '15px', color: '#0F172A' }}>VPĐD khu vực Tây Nam Bộ</h4>
                <p style={{ fontSize: '13px', margin: '5px 0', color: '#444' }}><span style={{ color: '#888' }}>Địa chỉ:</span> 99 Trần Văn Hoài, phường Ninh Kiều, TP Cần Thơ</p>
                <p style={{ fontSize: '13px', margin: '5px 0', color: '#444' }}><span style={{ color: '#888' }}>Điện thoại:</span> (0292) 3825852</p>
              </div>
            </div>
          </section>

        </div>

        <aside className="db-sidebar">
          <div className="db-summary-card">
            <div className="db-summary-header" style={{ paddingBottom: '10px', borderBottom: '1px solid #eee', marginBottom: '15px' }}>
              <span>Loại báo</span>
              <span>Thành tiền</span>
            </div>
            
            <div className="db-summary-items" style={{ minHeight: '50px' }}>
              {baseCost > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontSize: '14px', borderBottom: '1px dashed #f0f0f0' }}>
                  <div style={{ paddingRight: '15px', color: '#444' }}>
                    <strong style={{ color: '#0F172A' }}>Nhật báo Báo Mới</strong><br/>
                    <span style={{ fontSize: '12px', color: '#888' }}>{currentPromo.ky} kỳ x {qty} tờ</span>
                    {period && <div style={{ fontSize: '12px', color: '#00AEEF', fontWeight: 600 }}>Khuyến mãi: -{currentPromo.discount * 100}%</div>}
                  </div>
                  <div style={{ fontWeight: 600 }}>{formatVND(promoCost)}</div>
                </div>
              )}
              
              {specials.map((count, index) => {
                if (count <= 0) return null;
                return (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontSize: '14px', borderBottom: '1px dashed #f0f0f0' }}>
                    <div style={{ paddingRight: '15px', color: '#444' }}>
                      <strong style={{ color: '#0F172A', display: 'block', maxWidth: '140px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{SPECIAL_EDITIONS[index]}</strong>
                      <span style={{ fontSize: '12px', color: '#888' }}>Số lượng: {count} cuốn</span>
                    </div>
                    <div style={{ fontWeight: 600 }}>{formatVND(count * 35000)}</div>
                  </div>
                );
              })}
              
              {total === 0 && <div style={{ fontSize: '13px', color: '#aaa', textAlign: 'center', padding: '20px 0' }}>Chưa chọn ấn phẩm nào</div>}
            </div>

            <div className="db-summary-divider" style={{ margin: '15px 0' }}></div>
            <div className="db-summary-total">
              <span className="total-label">Tổng thanh toán</span>
              <span className="total-value">{formatVND(total)}</span>
            </div>
            <button className="db-submit-btn" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Đang xử lý...' : <> ĐẶT BÁO <BookOpen size={16} style={{ marginLeft: '8px' }} /></>}
            </button>
            <div className="db-hotline">
              <p>Mọi thắc mắc xin liên hệ đường dây nóng:</p>
              <h3>0784 543 079</h3>
            </div>
          </div>
        </aside>
      </div>
      )}
    </div>
  );
};

export default DatBaoPage;
