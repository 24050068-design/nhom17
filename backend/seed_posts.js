const db = require('./config/db');

function createSlug(str) {
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

const mockCategories = {
  8: [ // Thời sự
    { title: "Toàn cảnh kỳ họp bất thường của Quốc hội sáng nay", img: "https://picsum.photos/400/250?random=81" },
    { title: "Đề xuất mới nhất về tăng lương cơ sở năm nay", img: "https://picsum.photos/400/250?random=82" },
    { title: "Nỗ lực giải quyết vấn nạn ùn tắc giao thông tại đô thị lớn", img: "https://picsum.photos/400/250?random=83" }
  ],
  6: [ // Giáo dục
    { title: "Công bố phương án thi tốt nghiệp THPT mới nhất từ Bộ Giáo dục", img: "https://picsum.photos/400/250?random=61" },
    { title: "Hàng loạt trường đại học top đầu mở thêm ngành Trí tuệ Nhân tạo", img: "https://picsum.photos/400/250?random=62" },
    { title: "Học bổng toàn phần du học Mỹ đang mở đơn cho học sinh Việt Nam", img: "https://picsum.photos/400/250?random=63" }
  ],
  5: [ // Sức khỏe
    { title: "Cảnh báo bệnh giao mùa bùng phát mạnh mẽ lúc chuyển lạnh", img: "https://picsum.photos/400/250?random=51" },
    { title: "Phát hiện mới về phương pháp điều trị mất ngủ không dùng thuốc", img: "https://picsum.photos/400/250?random=52" },
    { title: "Chế độ ăn kiêng thanh lọc cơ thể sao cho đảm bảo sức khỏe nhất?", img: "https://picsum.photos/400/250?random=53" }
  ],
  7: [ // Quốc tế
    { title: "Cục diện toàn cầu thay đổi và các bước đi mới ngoại giao Mỹ", img: "https://picsum.photos/400/250?random=71" },
    { title: "Khủng hoảng năng lượng châu Âu thúc đẩy xu hướng năng lượng xanh", img: "https://picsum.photos/400/250?random=72" },
    { title: "Căng thẳng công nghệ Mỹ - Trung chưa có dấu hiệu hạ nhiệt", img: "https://picsum.photos/400/250?random=73" }
  ],
  2: [ // Kinh tế (Kinh doanh)
    { title: "Thị trường vàng biến động cực mạnh sau công bố lãi suất từ Fed", img: "https://picsum.photos/400/250?random=21" },
    { title: "Cổ phiếu ngành công nghệ tiếp tục dẫn sóng thị trường chứng khoán", img: "https://picsum.photos/400/250?random=22" },
    { title: "Chuyên gia kinh tế dự báo giá bất động sản sẽ tiếp tục đà phục hồi", img: "https://picsum.photos/400/250?random=23" }
  ],
  1: [ // Công nghệ
    { title: "ChatGPT ra mắt phiên bản mới nhất phân tích video trực tiếp", img: "https://images.unsplash.com/photo-1593642532744-d377ab507dc8?w=800" },
    { title: "Điện thoại đời cũ sẽ không còn được hỗ trợ cập nhật hệ điều hành", img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800" },
    { title: "Triển lãm công nghệ CES quy tụ hàng nghìn sản phẩm đột phá", img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800" }
  ],
  4: [ // Giải trí
    { title: "Phim điện ảnh Việt Nam vừa ra mắt phá kỷ lục phòng vé lịch sử", img: "https://picsum.photos/400/250?random=41" },
    { title: "Diva nổi tiếng thông báo liveshow hoành tráng kỷ niệm 20 năm ca hát", img: "https://picsum.photos/400/250?random=42" },
    { title: "Hé lộ hình ảnh hậu trường chưa từng công bố của bộ phim đang hot", img: "https://picsum.photos/400/250?random=43" }
  ],
  3: [ // Thể thao
    { title: "Đội tuyển Quốc gia ráo riết chuẩn bị chiến thuật mới cho vòng loại World Cup", img: "https://picsum.photos/400/250?random=31" },
    { title: "Bàn thắng siêu phẩm phút bù giờ cứu rỗi hy vọng vô địch cho HLV", img: "https://picsum.photos/400/250?random=32" },
    { title: "Trận chung kết Grand Slam kéo dài 5 tiếng trở thành kinh điển", img: "https://picsum.photos/400/250?random=33" }
  ]
};

const authorId = 3;

let inserted = 0;
let total = 0;

for (const [catId, arr] of Object.entries(mockCategories)) {
  total += arr.length;
}

for (const [catIdStr, items] of Object.entries(mockCategories)) {
  const catId = Number(catIdStr);
  items.forEach(item => {
    let slug = createSlug(item.title);
    slug = slug + '-' + Math.floor(Math.random()*1000); // ensure uniqueness
    
    // Create random long HTML content
    const content = `
      <p>Năm 2026 đang chứng kiến những bước ngoặt lớn chưa từng có tác động mạnh mẽ đến nhiều khía cạnh của đời sống. Bài viết này tổng hợp những thông tin chi tiết về sự kiện <strong>${item.title}</strong>, một trong những tin tức gây bão dư luận trong khu vực và trên toàn cầu.</p>
      <br />
      <img src="${item.img}" alt="${item.title}" style="width:100%; border-radius: 8px;" />
      <div style="text-align: center; color: #666; font-size: 13px; font-style: italic; margin-top: 5px;">Hình minh họa</div>
      <h2>Bối cảnh sự kiện</h2>
      <p>Theo số liệu thu thập được từ các đơn vị uy tín, tình hình hiện tại mang ý nghĩa sâu sắc giúp các nhà quản lý và cộng đồng có những cái nhìn lạc quan hơn về tương lai. Rất nhiều sự thay đổi mang tính cốt lõi đã được áp dụng, hứa hẹn mở ra một thời kỳ hoàng kim cho tất cả.</p>
      <ul>
        <li>Quy mô tiếp cận người theo dõi đã tăng 250% so với cùng kỳ.</li>
        <li>Ứng dụng công nghệ lõi để giải quyết bài toán nhân sự cấp cao.</li>
        <li>Các quy định điều chỉnh hỗ trợ và bảo vệ quyền lợi hợp pháp.</li>
      </ul>
      <h2>Góc nhìn chuyên gia</h2>
      <p>Các chuyên gia hàng đầu đều nhận định rằng: <em>"Đây là thời điểm để tạo nên sự khác biệt. Không ai có thể dậm chân tại chỗ trong bối cảnh các xu hướng đang biến chuyển từng phút"</em>.</p>
      <p>Sự tham gia của các nguồn lực chất lượng cao giúp tăng cường mức độ an toàn và đẩy nhanh thời gian vận hành dự án. Trong thời gian tới, Ban quản trị dự kiến sẽ có những quyết sách mang tính đột phá hơn nữa để đáp ứng kịp thời kỳ vọng của khán giả.</p>
      <p><em>Xin cảm ơn quý độc giả đã theo dõi Báo Mới.</em></p>
    `;

    db.query(
      `INSERT INTO posts (title, slug, content, thumbnail, status, views, average_rating, category_id, author_id)
       VALUES (?, ?, ?, ?, 'published', ?, 4.5, ?, ?)`,
       [item.title, slug, content, item.img, Math.floor(Math.random() * 2000), catId, authorId],
       (err) => {
         if (err) console.error("Error inserting:", err);
         inserted++;
         if (inserted === total) {
           console.log(`Inserted ${total} posts. Done.`);
           db.end();
         }
       }
    );
  });
}
