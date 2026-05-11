const db = require('../config/db');

const dummyContent = `
<p>Đây là nội dung bài viết mẫu được tự động tạo ra nhằm mục đích kiểm thử hệ thống giao diện và trải nghiệm người dùng (UI/UX).</p>
<p>Trong thực tế, nội dung này sẽ được thay thế bằng bài báo thật do các biên tập viên soạn thảo cẩn thận. Tuy nhiên trong môi trường thử nghiệm, chúng tôi đưa vào các đoạn văn bản giữ chỗ để bạn có thể xem bố cục, font chữ, độ dãn cách dòng và hiển thị hình ảnh có hoạt động ổn định hay không.</p>
<h3>Phân Tích Chuyên Sâu</h3>
<p>Một bài viết tốt không chỉ chứa thông tin bề mặt mà còn có các đoạn phân tích kỹ lưỡng, trích dẫn số liệu cụ thể và đi sâu vào cốt lõi vấn đề để mang tới người đọc góc nhìn đa chiều.</p>
`;

const categoryMocks = {
  'giao-duc': [
    { title: "Công bố phương án thi tốt nghiệp THPT mới nhất từ Bộ Giáo dục" },
    { title: "Hàng loạt trường đại học top đầu mở thêm ngành Trí tuệ Nhân tạo" },
    { title: "Học bổng toàn phần du học Mỹ đang mở đơn cho học sinh Việt Nam" },
    { title: "Bộ Giáo dục đề xuất miễn học phí cấp 2 cho học sinh trên toàn quốc" }
  ],
  'suc-khoe': [
    { title: "Cảnh báo bệnh giao mùa bùng phát mạnh mẽ lúc chuyển lạnh" },
    { title: "Phát hiện mới về phương pháp điều trị mất ngủ không dùng thuốc" },
    { title: "Chế độ ăn kiêng thanh lọc cơ thể sao cho đảm bảo sức khỏe nhất?" }
  ],
  'quoc-te': [
    { title: "Cục diện toàn cầu thay đổi và các bước đi mới ngoại giao Mỹ" },
    { title: "Khủng hoảng năng lượng châu Âu thúc đẩy xu hướng năng lượng xanh" },
    { title: "Căng thẳng công nghệ Mỹ - Trung chưa có dấu hiệu hạ nhiệt" }
  ],
  'the-gioi': [
    { title: "Tranh cử tổng thống bước vào hồi gay cấn tại các bang chiến địa" },
    { title: "Điều chỉnh tỷ giá ngoại giao theo bước đi mới của Liên minh châu Âu" },
    { title: "Tình hình eo biểu diễn biến phức tạp trong cuối tuần qua" }
  ],
  'phap-luat': [
    { title: "Triệt phá đường dây lừa đảo công nghệ cao quy mô hàng trăm tỷ" },
    { title: "Luật Đất đai sửa đổi chính thức có hiệu lực mang lại thay đổi gì?" },
    { title: "Tuyệt đối cảnh giác với những thủ đoạn mạo danh ngân hàng điện tử" }
  ],
  'xe': [
    { title: "Hãng xe VinFast chính thức ra mắt mẫu SUV điện mới phủ kín phân khúc" },
    { title: "Các mẫu xe SUV 7 chỗ gầm cao hot nhất đang giảm giá hàng loạt" },
    { title: "Xu hướng người Việt chuyển dịch sang xe thuần điện tăng đột biến kỷ lục" }
  ],
  'doi-song': [
    { title: "Trào lưu chữa lành, du lịch bỏ phố về rừng được giới văn phòng chuộng" },
    { title: "Những câu chuyện ấm tình làng nghĩa xóm giữa lòng phố thị náo nhiệt" },
    { title: "Làm sao cân bằng giữa áp lực thăng tiến và hạnh phúc gia đình?" }
  ],
  'cong-nghe': [
    { title: "Ví điện tử và xu hướng thanh toán một chạm tăng trưởng bùng nổ" },
    { title: "Apple dự kiến tung ra dòng tai nghe không dây khử ồn thế hệ mới" },
    { title: "AI của Google và OpenAI đại chiến tại sự kiện triển lãm lớn nhất năm" },
    { title: "Công nghệ đám mây thay đổi hoàn toàn thói quen doanh nghiệp vừa và nhỏ" }
  ],
  'giai-tri': [
    { title: "Bộ phim điện ảnh về đề tài làng quê vừa phá kỷ lục phòng vé lịch sử" },
    { title: "Diva nổi tiếng công bố liveshow kỉ niệm sự nghiệp tại sân vận động" },
    { title: "Nhóm nhạc Pop hàng đầu Châu Á xác nhận lịch trình tổ chức hòa nhạc tại Hà Nội" }
  ],
  'kinh-doanh': [
    { title: "Thị trường bất động sản cuối năm có dấu hiệu khởi sắc nhẹ ở phân khúc nhà ở" },
    { title: "Cổ phiếu ngân hàng đồng loạt bứt tốc sau tuyên bố hạ lãi suất của Fed" },
    { title: "Các doanh nghiệp SME vượt qua bài toán chi phí nhờ phương án chuyển đổi số" }
  ],
  'kinh-te': [
    { title: "Thông tin mấu chốt về nguồn vốn FDI đổ vào Việt Nam trong tháng vừa qua" },
    { title: "Cán cân xuất nhập khẩu tiếp đà tăng trưởng dương bất chấp bão giá" },
    { title: "Kế hoạch nâng hạng thị trường chứng khoán đã qua rà soát bước đầu" }
  ],
  'the-thao': [
    { title: "Đội tuyển Quốc gia sang châu Âu tập huấn đón đầu vòng chung kết khu vực" },
    { title: "Cú ngược dòng không tưởng và bàn thắng đẹp nhất mùa bóng Ngoại hạng Anh" },
    { title: "Tay vợt huyền thoại lội ngược dòng ngoạn mục bảo vệ vương miện Grand Slam" }
  ],
  'thoi-su': [
    { title: "Hội nghị toàn quốc thảo luận khẩn các dự án xây Cầu và Cao Tốc trọng điểm" },
    { title: "Siết chặt quy định an ninh mạng bảo vệ tổ chức và cơ quan hành chính" },
    { title: "Biến đổi khí hậu gây xói mòn nghiêm trọng tại các khu vực ven bờ biển" }
  ]
};

function generateSlug(str) {
  return str.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-") 
    + '-' + Date.now().toString().slice(-4) + Math.floor(Math.random() * 100);
}

db.query('SELECT * FROM categories', (err, categories) => {
  if (err) {
    console.error("Lỗi lấy chuyên mục:", err);
    process.exit();
  }
  
  let queries = [];
  categories.forEach(cat => {
    // Tìm key phù hợp
    let keyToUse = Object.keys(categoryMocks).find(k => cat.slug.includes(k));
    
    let articles = keyToUse ? categoryMocks[keyToUse] : [
      { title: `Dòng sự kiện mới nhất về ${cat.name} thu hút dân mạng` },
      { title: `Chuyên gia đầu ngành nhận định sâu về ${cat.name} trong tuần` },
      { title: `Góc nhìn đánh giá chi tiết các vấn đề trọng tâm của ${cat.name}` },
      { title: `Tổng hợp tất cả diễn biến quan trọng xung quanh ${cat.name} mới cập nhật` }
    ];
    
    articles.forEach((art) => {
      // Create random views 10 - 5000
      let views = Math.floor(Math.random() * 5000) + 10;
      let q = `INSERT INTO posts (title, slug, content, thumbnail, status, views, category_id, created_at) VALUES (
        '${art.title}', 
        '${generateSlug(art.title)}', 
        '${dummyContent}', 
        'https://picsum.photos/1200/800?random=${Math.floor(Math.random()*10000)}', 
        'published', 
        ${views},
        ${cat.id},
        NOW()
      )`;
      queries.push(q);
    });
  });
  
  let i = 0;
  function runNext() {
    if (i >= queries.length) {
      console.log('✅ Đã tạo thành công ' + queries.length + ' bài báo vô CSDL!');
      process.exit();
    }
    db.query(queries[i], (err) => {
      if(err && err.code !== 'ER_DUP_ENTRY') console.error('Lỗi insert:', err.message);
      i++;
      runNext();
    });
  }
  
  runNext();
});
