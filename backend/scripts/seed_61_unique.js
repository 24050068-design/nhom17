const mysql = require('mysql2/promise');

const dbConfig = {
  host: '127.0.0.1',
  user: 'root',
  password: '24050068@Phong',
  database: 'blog_database',
  port: 3306
};

// VDKP - AI GENERATED 61 UNIQUE HEADLINES
const uniqueTitles = [
  "Công bố thiết kế nhà ga ngầm số 2 tuyến Metro Bến Thành - Suối Tiên",
  "Nhiều ngân hàng đồng loạt tung gói tín dụng siêu rẻ cho doanh nghiệp xuất khẩu",
  "Tìm ra phương pháp mới điều trị dứt điểm chứng mất ngủ mãn tính",
  "Tuyển Việt Nam chuẩn bị cho chiến dịch vàng tại vòng loại World Cup",
  "Hàng chục hecta rừng phòng hộ bị biến thành khu du lịch trái phép",
  "Apple xác nhận lỗi sập nguồn trên thiết bị đời mới, hứa hẹn tung bản vá",
  "Thị trường vàng rớt giá thê thảm chỉ sau chuỗi tăng nóng 3 ngày",
  "Phát hiện loài thực vật thân thảo mới tại Vườn quốc gia Phong Nha",
  "Siết chặt quy định đăng kiểm đối với xe ô tô trên 10 năm tuổi",
  "Bão đổ bộ miền Trung: Hàng nghìn tàu thuyền được gọi vào bờ khẩn cấp",
  "Chuyển đổi số nông nghiệp: Nông dân miền Tây ngồi nhà bán bưởi bằng AI",
  "Giới tinh hoa đổ xô mua bất động sản cận biển bất chấp lãi suất",
  "Giải cứu thành công 5 du khách bị kẹt trong hang động hoang sơ",
  "Các rạp chiếu phim vỡ trận trước bom tấn điện ảnh mùa hè",
  "Nghịch lý: Sinh viên IT ra trường chật vật tìm việc dù thiếu hụt nhân lực",
  "Tàu vũ trụ tư nhân đầu tiên đáp thành công xống vùng tối mặt trăng",
  "Bản giao hưởng ánh sáng thắp sáng bầu trời đêm thủ đô nhộn nhịp",
  "Khởi tố thêm 4 bị can trong đại án tham nhũng đất đai vùng ven",
  "Vượt mốc 1 tỷ USD, thị trường thanh toán QR Code tại Việt Nam lên ngôi",
  "Xuất khẩu tôm gặp khó do hàng rào kỹ thuật khắt khe từ thị trường Âu",
  "Khánh thành cao tốc duyên hải nối liền 3 trung tâm kinh tế biển",
  "Đâm đuôi xe tải trên quốc lộ 5, giao thông ùn tắc suốt 6 giờ",
  "Giải mã nguyên nhân hàng loạt cá chết trắng ven hồ trung tâm",
  "Xu hướng sử dụng vật liệu xanh trong thi công căn hộ thế hệ mới",
  "Tuyển bóng chuyền nữ lập kỷ lục vô tiền khoáng hậu ở châu Á",
  "Thảm họa núi lửa phun trào tại Indonesia: Hàng trăm chuyến bay bị hủy",
  "Công nghệ in 3D sinh học vươn tới việc tạo ra nội tạng cấy ghép",
  "Hé lộ nguyên mẫu điện thoại màn hình cuộn từ gã khổng lồ Hàn Quốc",
  "Tạm đình chỉ công tác Giám đốc Sở vì phát ngôn thiếu chuẩn mực",
  "Khám phá ngôi làng 200 năm tuổi không có sóng điện thoại nơi rẻo cao",
  "Luật Kinh doanh BĐS (sửa đổi) siết chặt hoạt động phân lô bán nền",
  "Lễ hội ẩm thực đường phố quy tụ 100 món ngon từ mọi miền đất nước",
  "Các nhà khoa học phát hiện phân tử nước trên bề mặt tiểu hành tinh",
  "Robot y tế phẫu thuật chính xác đến từng milimet đang làm mưa làm gió",
  "Tiền điện tử chao đảo sau đạo luật kiểm soát dòng tiền ảo quốc tế",
  "Gấp rút hoàn thiện sân bay quốc tế trước mùa cao điểm du lịch cuối năm",
  "Cảnh báo lừa đảo trực tuyến: Sập bẫy vì những tin nhắn trúng thưởng mạo danh",
  "Đảng bộ thành phố đề ra nghị quyết đột phá về quy hoạch đô thị lõi",
  "Tăng lương cơ sở: Niềm vui đi kèm nỗi lo bão giá của người dân",
  "Tài xế công nghệ đình công yêu cầu giảm tỷ lệ chiết khấu ứng dụng",
  "Vườn quốc gia Cát Tiên đón thêm 2 cá thể gấu hoang dã quý hiếm",
  "Trường Đại học tốp đầu siết chặt tiêu chuẩn chuẩn đầu ra ngoại ngữ",
  "Xôn xao thông tin quỹ đất vàng nội đô bị thâu tóm với giá rẻ mạt",
  "Nước mắt người trồng thanh long khi giá thu mua giảm kỷ lục chưa từng thấy",
  "Du lịch homestay lên ngôi: Người trẻ bỏ phố về rừng lập nghiệp",
  "Bùng nổ phòng tập gym 24/7 công nghệ cao cho dân văn phòng nhộn nhịp",
  "Xe điện đang thay đổi thói quen di chuyển của cư dân thành thị hoàn toàn",
  "Đấu giá thành công bức tranh quý với mức giá kỷ lục 5 triệu Đô La",
  "Phá vỡ đường dây buôn lậu phụ tùng ô tô quy mô hàng trăm tỷ đồng",
  "Hạn hán kéo dài kỉ lục khiến hàng triệu hécta lúa đối diện nguy cơ mất trắng",
  "Kỳ lân công nghệ gốc Việt gọi vốn thành công vòng mới ở thung lũng Silicon",
  "Phòng ngừa bạo lực học đường: Trách nhiệm không của riêng ai",
  "Vingroup công bố mẫu xe xanh thân thiện môi trường xuất khẩu sang châu Âu",
  "Thanh tra toàn diện dự án khu đô thị do đền bù đất đai vướng mắc",
  "Các hãng thời trang nội địa đồng loạt tấn công thị trường Đông Nam Á",
  "Hành trình kỳ diệu của người mẹ ung thư sinh đôi hai bé khỏe mạnh",
  "Chiến thắng kịch tính phút 90+5 đưa câu lạc bộ quê hương lên đỉnh vinh quang",
  "Tuyến xe buýt sông thứ 2 chính thức khai trương phục vụ khách ngắm cảnh",
  "Độc đáo mô hình trồng rau khí canh trên nóc nhà cao tầng giữa lòng đô thị",
  "Bộ Y tế khuyến cáo nguy cơ bùng phát dịch bệnh hô hấp chủng mới",
  "Lạm phát được kiểm soát tốt, mở ra cơ hội giảm chi phí sinh hoạt dịp giáp Tết"
];

// The generic Sapo generators based on topic
const genericSapos = [
  "Đây là một bước tiến quan trọng mang lại nhiều kỳ vọng cho cả giới chuyên gia lẫn cộng đồng, hứa hẹn mở ra bình minh mới cho lĩnh vực này trong thời gian tới.",
  "Mặc dù còn nhiều khó khăn bủa vây, những dấu hiệu tích cực ban đầu đang chứng minh cho những nỗ lực bền bỉ và không ngừng nghỉ của tất cả các bên liên quan.",
  "Trước tình hình biến động không ngừng, quyết định mới nhất đã thu hút sự chú ý đặc biệt, mở ra một cuộc tranh luận sôi nổi về định hướng tương lai bền vững.",
  "Nếu không có những biện pháp can thiệp kịp thời ngay từ lúc này, hệ lụy kéo theo sẽ là không thể đo đếm được đối với sự phát triển lâu dài.",
  "Từ câu chuyện tưởng chừng như nhỏ bé giấu ở hậu trường, một bức tranh toàn cảnh về tinh thần sáng tạo vươn lên đã được khắc họa rõ nét hơn bao giờ hết."
];

const genericParagraphs = [
  "Theo đó, báo cáo mới nhất chỉ ra rằng sự dịch chuyển cơ cấu đang diễn ra với tốc độ chóng mặt. Các con số thống kê không hề biết nói dối khi phản ánh một thực tế hoàn toàn mới lạ so với dự đoán cách đây vài năm.",
  "Các chuyên gia phân tích hàng đầu cho rằng điều trăn trở lớn nhất hiện nay chính là hành lang pháp lý chưa theo kịp sự phát triển của xã hội. Nếu được khai thông, nguồn lực ngủ quên sẽ được đánh thức vô cùng mạnh mẽ.",
  "Chia sẻ bên lề hội nghị, một cựu lãnh đạo có chuyên môn sâu nhận định: 'Chúng ta không thể bê nguyên xi mô hình cũ để lắp vào bài toán mới. Phải thay đổi tận gốc tư duy quản trị rủi ro'.",
  "Động thái này đã ngay lập tức tạo đà hưởng ứng vô cùng lớn. Tuy nhiên, vẫn còn đó những hoài nghi về tính khả thi nếu nguồn ngân sách không được đảm bảo hoặc phân bổ thiếu minh bạch.",
  "Giữa dòng chảy tin tức hỗn loạn, điểm tựa duy nhất của chúng ta chính là sự minh bạch và trách nhiệm giải trình. Kết quả thực tế vào cuối năm sẽ là câu trả lời rõ ràng nhất thay cho ngàn lời cam kết."
];

function makeSlug(text, index) {
  const t = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();
  return t.replace(/[^a-z0-9]+/g, '-') + '-' + index + '-' + Date.now();
}

async function run() {
  const connection = await mysql.createConnection(dbConfig);

  console.log("Bat dau tao 61 bai viet CHUA TUNG TRUNG LAP...");
  for (let i = 0; i < uniqueTitles.length; i++) {
    const title = uniqueTitles[i];
    const cat = (i % 6) + 1; // Categories 1 to 6
    const thumb = 'https://picsum.photos/1200/800?random=' + (i + 5000); // Unique images
    
    // Pick random sapo & paragraphs
    const sapo = genericSapos[Math.floor(Math.random() * genericSapos.length)];
    const body = [];
    body.push(genericParagraphs[Math.floor(Math.random() * genericParagraphs.length)]);
    body.push(genericParagraphs[Math.floor(Math.random() * genericParagraphs.length)]);
    body.push(genericParagraphs[Math.floor(Math.random() * genericParagraphs.length)]);
    
    // Convert to proper HTML string
    const htmlContent = '<p>' + sapo + '</p>\\n<p>' + body[0] + '</p>\\n<p>' + body[1] + '</p>\\n<h3>Phân Tích Chuyên Sâu</h3>\\n<p>' + body[2] + '</p>';
    
    const slug = makeSlug(title, i);
    const viewCount = Math.floor(Math.random() * 9500) + 1500;
    
    // Spread dates randomly
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 60)); // Post within 2 months
    date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
    const created_at = date.toISOString().slice(0, 19).replace('T', ' ');

    try {
      await connection.query(
        "INSERT INTO posts (title, slug, content, thumbnail, status, views, category_id, author_id, created_at) VALUES (?, ?, ?, ?, 'published', ?, ?, NULL, ?)",
        [title, slug, htmlContent, thumb, viewCount, cat, created_at]
      );
      console.log('✅ Đã đăng bài ' + (i+1) + '/61: ' + title.slice(0, 40) + '...');
    } catch(err) {
      console.error('❌ Lỗi bài ' + i + ':', err.message);
    }
  }

  await connection.end();
  console.log("HOÀN TẤT SINH 61 BÀI VIẾT ĐỘC QUYỀN MỚI 100%!");
}

run();
