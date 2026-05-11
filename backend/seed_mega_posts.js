const mysql = require('mysql2');

const db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: '24050068@Phong',
  database: 'blog_database',
  port: 3306
});

function makeSlug(title) {
  return title
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .substring(0, 300) + '-' + Date.now();
}

db.connect(err => {
  if (err) { console.error('❌ DB Error:', err.message); process.exit(1); }
  console.log('✅ MySQL connected');
});

// Category slugs → IDs from the DB
// 1=cong-nghe, 2=kinh-doanh, 3=the-thao, 4=giai-tri, 5=suc-khoe, 6=giao-duc, 7=quoc-te, 8=thoi-su
const AUTHOR_ID = 3;

const posts = [
  // ── Kinh doanh (id=2) ──
  {
    title: 'Thị trường vàng biến động cực mạnh sau công bố lãi suất từ Fed',
    category_id: 2,
    thumbnail: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&h=500&fit=crop',
    content: `<p>Giá vàng thế giới lập tức phản ứng mạnh ngay sau khi Cục Dự trữ Liên bang Mỹ (Fed) công bố quyết định lãi suất mới nhất. Trong phiên giao dịch hôm nay, giá vàng giao ngay đã dao động mạnh trong biên độ hơn 50 USD/ounce.</p>
    <h3>Diễn biến thị trường</h3>
    <p>Giá vàng trong nước theo đó cũng leo thang theo đà tăng toàn cầu, chạm mốc kỷ lục mới. Các chuyên gia phân tích nhận định đây là chuỗi biến động đáng chú ý nhất từ đầu năm.</p>
    <p>Giới đầu tư đang theo sát từng động thái chính sách tiền tệ của Mỹ, trong bối cảnh lạm phát toàn cầu vẫn chưa trở về mức mục tiêu.</p>`
  },
  {
    title: 'Cổ phiếu ngành công nghệ tiếp tục dẫn sóng thị trường chứng khoán',
    category_id: 2,
    thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=500&fit=crop',
    content: `<p>Nhóm cổ phiếu công nghệ tiếp tục là lực dẫn dắt chính trên thị trường chứng khoán trong tuần qua, với nhiều mã tăng trưởng ấn tượng từ 5% đến 15%.</p>
    <h3>Những mã nổi bật</h3>
    <p>Các cổ phiếu liên quan đến trí tuệ nhân tạo (AI), bán dẫn và điện toán đám mây được nhà đầu tư săn đón nhiệt tình nhất. Chỉ số VN-Index ghi nhận phiên tăng mạnh nhất trong 3 tháng trở lại đây.</p>
    <p>Nhiều quỹ đầu tư nước ngoài tiếp tục mua ròng vào nhóm cổ phiếu công nghệ Việt Nam, phản ánh kỳ vọng lạc quan vào triển vọng dài hạn của ngành.</p>`
  },
  {
    title: 'Chuyên gia kinh tế dự báo giá bất động sản sẽ tiếp tục đà phục hồi',
    category_id: 2,
    thumbnail: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=500&fit=crop',
    content: `<p>Theo đánh giá của các chuyên gia kinh tế hàng đầu, thị trường bất động sản Việt Nam đang bước vào pha phục hồi tích cực và xu hướng này dự kiến sẽ kéo dài trong ít nhất 2–3 năm tới.</p>
    <h3>Phân tích của chuyên gia</h3>
    <p>TS. Nguyễn Văn Minh, Trưởng bộ môn Kinh tế Đô thị, nhận định: "Sau giai đoạn điều chỉnh mạnh vừa qua, bất động sản TP.HCM và vùng ven đang định hình lại mặt bằng giá ở mức hợp lý hơn."</p>
    <p>Các tín hiệu tốt đến từ việc tín dụng bất động sản được nới lỏng, lãi suất vay mua nhà giảm và nguồn cung mới từ các dự án đăng ký pháp lý đầy đủ.</p>`
  },

  // ── Công nghệ (id=1) ──
  {
    title: 'ChatGPT ra mắt phiên bản mới nhất phân tích video trực tiếp',
    category_id: 1,
    thumbnail: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&h=500&fit=crop',
    content: `<p>OpenAI vừa chính thức ra mắt phiên bản nâng cấp của ChatGPT, bổ sung tính năng đột phá: phân tích nội dung video theo thời gian thực mà không cần tải file lên.</p>
    <h3>Tính năng nổi bật</h3>
    <p>Người dùng có thể chỉ cần chia sẻ đường link video từ YouTube hay các nền tảng khác, ChatGPT sẽ tóm tắt, trích dẫn và đặt câu hỏi thông minh về nội dung video đó.</p>
    <p>Đây được coi là bước nhảy vọt lớn trong cuộc đua AI, khi cả Google Gemini và Meta AI cũng đang chạy đua hoàn thiện tính năng tương tự.</p>`
  },
  {
    title: 'Điện thoại đời cũ sẽ không còn được hỗ trợ cập nhật hệ điều hành',
    category_id: 1,
    thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=500&fit=crop',
    content: `<p>Google và Apple đồng loạt công bố danh sách các thiết bị di động sẽ không còn nhận được bản cập nhật hệ điều hành mới kể từ cuối năm, khiến hàng triệu người dùng phải cân nhắc nâng cấp máy.</p>
    <h3>Danh sách thiết bị bị ảnh hưởng</h3>
    <p>Với Android, các điện thoại chạy chip từ thế hệ 2020 trở về trước sẽ bị loại khỏi danh sách hỗ trợ. Với iOS, những máy iPhone dưới dòng 12 cũng không còn nhận được bản vá bảo mật.</p>
    <p>Chuyên gia bảo mật khuyến cáo người dùng nên cập nhật thiết bị để tránh nguy cơ lỗ hổng bảo mật không được vá.</p>`
  },
  {
    title: 'Triển lãm công nghệ CES quy tụ hàng nghìn sản phẩm đột phá',
    category_id: 1,
    thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=500&fit=crop',
    content: `<p>CES 2026 – sự kiện công nghệ tiêu dùng lớn nhất hành tinh – chính thức khai mạc tại Las Vegas với sự tham gia của hơn 4.000 doanh nghiệp từ 150 quốc gia.</p>
    <h3>Những sản phẩm gây bão</h3>
    <p>Nổi bật nhất tại CES năm nay là các thiết bị gia dụng thông minh tích hợp AI, xe tự lái thế hệ mới và màn hình cuộn siêu mỏng chỉ 1mm.</p>
    <p>Samsung, LG, Sony và hàng loạt startup đình đám đều mang đến những sản phẩm chưa từng thấy, hứa hẹn thay đổi cách con người tương tác với công nghệ trong thời gian tới.</p>`
  },

  // ── Giải trí (id=4) ──
  {
    title: 'Phim điện ảnh Việt Nam vừa ra mắt phá kỷ lục phòng vé lịch sử',
    category_id: 4,
    thumbnail: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=500&fit=crop',
    content: `<p>Bộ phim điện ảnh Việt Nam vừa công chiếu chính thức đã tạo nên cơn địa chấn tại phòng vé khi phá vỡ mọi kỷ lục doanh thu trong lịch sử điện ảnh nước nhà chỉ sau 7 ngày ra mắt.</p>
    <h3>Con số ấn tượng</h3>
    <p>Với doanh thu hơn 200 tỷ đồng trong tuần đầu, bộ phim đã vượt qua tất cả các bom tấn Hollywood cùng kỳ và được dự đoán sẽ cán mốc 500 tỷ vào cuối tháng.</p>
    <p>Đạo diễn và toàn bộ diễn viên đã bày tỏ sự xúc động trước tình cảm nồng nhiệt của khán giả dành cho bộ phim.</p>`
  },
  {
    title: 'Diva nổi tiếng thông báo liveshow hoành tráng kỷ niệm 20 năm ca hát',
    category_id: 4,
    thumbnail: 'https://images.unsplash.com/photo-1470019693664-1d202d2be176?w=800&h=500&fit=crop',
    content: `<p>Một trong những giọng ca hàng đầu Việt Nam vừa chính thức công bố sự kiện âm nhạc đặc biệt nhân dịp kỷ niệm tròn 20 năm hoạt động nghệ thuật chuyên nghiệp.</p>
    <h3>Chi tiết chương trình</h3>
    <p>Liveshow dự kiến diễn ra tại Nhà thi đấu Phú Thọ với 15.000 chỗ ngồi trong 3 đêm liên tiếp. Vé đã được bán hết chỉ trong vòng 2 tiếng sau khi mở bán online.</p>
    <p>Khán giả có thể kỳ vọng vào những màn trình diễn chưa từng thấy, với sự tham gia của hàng chục nghệ sĩ khách mời đình đám.</p>`
  },
  {
    title: 'Hé lộ hình ảnh hậu trường chưa từng công bố của bộ phim đang hot',
    category_id: 4,
    thumbnail: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800&h=500&fit=crop',
    content: `<p>Đội ngũ sản xuất của bộ phim truyền hình đang gây bão hiện tại vừa chính thức chia sẻ hàng loạt hình ảnh hậu trường độc quyền, khiến khán giả choáng ngợp với quy mô sản xuất khổng lồ.</p>
    <h3>Bí ẩn phía sau camera</h3>
    <p>Những bức ảnh tiết lộ đội ngũ sản xuất lên đến hơn 300 người, cùng hệ thống trường quay đặc biệt dựng riêng cho bộ phim với kinh phí lên đến hàng trăm tỷ đồng.</p>
    <p>Diễn viên chính tiết lộ đã phải trải qua 6 tháng huấn luyện thể chất và kỹ năng đặc biệt để có thể đảm nhận vai diễn đầy thách thức này.</p>`
  },

  // ── Thể thao (id=3) ──
  {
    title: 'Đội tuyển Quốc gia ráo riết chuẩn bị chiến thuật mới cho vòng loại World Cup',
    category_id: 3,
    thumbnail: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800&h=500&fit=crop',
    content: `<p>Đội tuyển bóng đá nam Quốc gia đang bước vào giai đoạn tập trung cao độ chuẩn bị cho những trận đấu quan trọng trong vòng loại World Cup 2026.</p>
    <h3>Phương án chiến thuật mới</h3>
    <p>HLV trưởng đã tiết lộ sẽ áp dụng sơ đồ 4-3-3 linh hoạt với cách chơi pressing cao và chuyển trạng thái nhanh, dựa trên tốc độ và sự năng động của các cầu thủ trẻ.</p>
    <p>Một số cầu thủ đang thi đấu tại nước ngoài đã được triệu tập về tập trung cùng đội trong đợt này.</p>`
  },
  {
    title: 'Bàn thắng siêu phẩm phút bù giờ cứu rỗi hy vọng vô địch cho HLV',
    category_id: 3,
    thumbnail: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&h=500&fit=crop',
    content: `<p>Một pha lập công ngoạn mục ở phút 94 đã giúp đội bóng thoát khỏi miệng vực thất bại và ghi dấu ấn lịch sử trong cuộc đua vô địch nhờ giành trọn 3 điểm quan trọng.</p>
    <h3>Mô tả bàn thắng</h3>
    <p>Cú vô lê từ khoảng cách 25 mét bay chìm vào góc xa khung thành trong sự bàng hoàng của thủ môn và hàng phòng ngự đối phương.</p>
    <p>Đây là bàn thắng được giới thiệu ứng cử danh hiệu Bàn thắng đẹp nhất tháng, đồng thời mang đến hi vọng mới cho đội bóng trong cuộc đua tranh ngôi vô địch.</p>`
  },
  {
    title: 'Trận chung kết Grand Slam kéo dài 5 tiếng trở thành kinh điển',
    category_id: 3,
    thumbnail: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&h=500&fit=crop',
    content: `<p>Trận chung kết Grand Slam vừa diễn ra được đánh giá là một trong những trận đấu hay nhất lịch sử quần vợt với thời gian lên đến 5 tiếng 23 phút kịch tính.</p>
    <h3>Diễn biến đặc biệt</h3>
    <p>Cả hai tay vợt đã đưa nhau vào set thứ 5 sau những lần ngược dòng ngoạn mục. Khán giả trên sân đã đứng dậy cổ vũ liên tục trong suốt set đấu cuối cùng đầy căng thẳng.</p>
    <p>Người chiến thắng bật khóc khi nhận cúp vô địch và chia sẻ rằng đây là chiến thắng khó khăn nhất nhưng cũng viên mãn nhất trong sự nghiệp của mình.</p>`
  },

  // ── Sức khỏe (id=5) ──
  {
    title: 'Cảnh báo bệnh giao mùa bùng phát mạnh mẽ lúc chuyển lạnh',
    category_id: 5,
    thumbnail: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800&h=500&fit=crop',
    content: `<p>Các bệnh viện trên cả nước ghi nhận lượng bệnh nhân đến khám và điều trị các bệnh hô hấp, cúm mùa tăng đột biến trong những tuần chuyển mùa giao lạnh.</p>
    <h3>Nhóm người dễ bị ảnh hưởng</h3>
    <p>Trẻ em dưới 5 tuổi, người cao tuổi và những người có bệnh nền mãn tính là nhóm đối tượng dễ bị tổn thương nhất. Bộ Y tế khuyến cáo cần tiêm phòng cúm định kỳ và giữ ấm cơ thể đúng cách.</p>
    <p>Các triệu chứng điển hình bao gồm sốt cao, ho khan, đau họng và mệt mỏi toàn thân – cần đến cơ sở y tế ngay khi xuất hiện.</p>`
  },
  {
    title: 'Phát hiện mới về phương pháp điều trị mất ngủ không dùng thuốc',
    category_id: 5,
    thumbnail: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&h=500&fit=crop',
    content: `<p>Các nhà khoa học tại Đại học Stanford vừa công bố nghiên cứu đột phá về phương pháp CBT-I (Liệu pháp Nhận thức Hành vi cho Mất ngủ) có hiệu quả cao hơn thuốc ngủ và không có tác dụng phụ.</p>
    <h3>Các bước thực hiện</h3>
    <p>Phương pháp này bao gồm việc thiết lập thói quen ngủ cố định, hạn chế thời gian trên giường, và kỹ thuật thư giãn cơ tiến bộ giúp 80% bệnh nhân cải thiện rõ rệt chất lượng giấc ngủ sau 6 tuần.</p>
    <p>Bác sĩ tâm thần khuyến cáo không nên tự ý dừng thuốc ngủ đột ngột; nên tham khảo ý kiến chuyên gia trước khi chuyển sang phương pháp không dùng thuốc.</p>`
  },
  {
    title: 'Chế độ ăn kiêng thanh lọc cơ thể sao cho đảm bảo sức khỏe nhất?',
    category_id: 5,
    thumbnail: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=500&fit=crop',
    content: `<p>Detox và ăn kiêng thanh lọc đang là xu hướng được nhiều người quan tâm, nhưng không phải ai cũng biết cách thực hiện đúng để vừa hiệu quả vừa an toàn cho sức khỏe.</p>
    <h3>Nguyên tắc vàng</h3>
    <p>Chuyên gia dinh dưỡng TS. Lê Thị Hương khuyến cáo: "Không có gì gọi là detox thần kỳ trong 3 ngày. Cơ thể đã có hệ thống lọc độc tự nhiên qua gan, thận. Điều quan trọng là duy trì lâu dài."</p>
    <p>Chế độ ăn tốt nhất bao gồm nhiều rau xanh, hạn chế đường tinh luyện, uống đủ 2 lít nước mỗi ngày và ngủ đúng giờ là cách detox hiệu quả nhất.</p>`
  },

  // ── Giáo dục (id=6) ──
  {
    title: 'Công bố phương án thi tốt nghiệp THPT mới nhất từ Bộ Giáo dục',
    category_id: 6,
    thumbnail: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=500&fit=crop',
    content: `<p>Bộ Giáo dục và Đào tạo vừa chính thức công bố phương án tổ chức Kỳ thi tốt nghiệp THPT năm 2026 với một số thay đổi quan trọng so với năm trước nhằm phù hợp chương trình giáo dục mới.</p>
    <h3>Những điểm thay đổi then chốt</h3>
    <p>Thí sinh sẽ thi 4 môn bắt buộc gồm Toán, Ngữ văn và 2 môn do học sinh lựa chọn trong số các môn đã học. Định dạng đề thi thiên về đánh giá năng lực và tư duy phản biện.</p>
    <p>Thời gian công bố kết quả thi sẽ được rút ngắn xuống còn 10 ngày sau khi kỳ thi kết thúc, tạo điều kiện cho thí sinh đăng ký nguyện vọng sớm hơn.</p>`
  },
  {
    title: 'Hàng loạt trường đại học top đầu mở thêm ngành Trí tuệ Nhân tạo',
    category_id: 6,
    thumbnail: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&h=500&fit=crop',
    content: `<p>Trước làn sóng bùng nổ của trí tuệ nhân tạo toàn cầu, nhiều trường đại học hàng đầu Việt Nam đã quyết định mở ngành học chuyên sâu về AI để đáp ứng nhu cầu nhân lực của thị trường.</p>
    <h3>Các trường tiên phong</h3>
    <p>ĐH Bách khoa Hà Nội, ĐH Công nghệ Thông tin TP.HCM và ĐH FPT sẽ tuyển sinh khóa đầu tiên chuyên ngành Kỹ thuật AI từ năm học 2026–2027 với tổng chỉ tiêu hơn 1.500 sinh viên.</p>
    <p>Theo dự báo, kỹ sư AI sẽ là nghề hot nhất trong 5 năm tới với mức lương khởi điểm hơn 2.000 USD/tháng.</p>`
  },
  {
    title: 'Học bổng toàn phần du học Mỹ đang mở đơn cho học sinh Việt Nam',
    category_id: 6,
    thumbnail: 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=800&h=500&fit=crop',
    content: `<p>Chương trình học bổng danh giá của một số trường đại học Ivy League tại Mỹ vừa chính thức mở đơn đăng ký cho thí sinh Việt Nam, với trị giá học bổng toàn phần lên đến 300.000 USD.</p>
    <h3>Điều kiện và hạn nộp hồ sơ</h3>
    <p>Ứng viên cần có điểm GPA từ 3.8 trở lên, điểm SAT hoặc ACT đạt ngưỡng top 5%, và hồ sơ hoạt động ngoại khóa nổi bật. Hạn chót nộp hồ sơ là ngày 15/12/2026.</p>
    <p>Đại sứ quán Mỹ tại Hà Nội sẽ tổ chức buổi tư vấn học bổng miễn phí vào cuối tháng này dành cho học sinh và phụ huynh quan tâm.</p>`
  },

  // ── Quốc tế (id=7) ──
  {
    title: 'Cục diện toàn cầu thay đổi và các bước đi mới ngoại giao Mỹ',
    category_id: 7,
    thumbnail: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&h=500&fit=crop',
    content: `<p>Chính quyền Mỹ vừa công bố loạt sáng kiến ngoại giao chiến lược mới nhằm tái định hình quan hệ với các đồng minh châu Á và châu Âu trong bối cảnh địa chính trị toàn cầu đang có nhiều biến động.</p>
    <h3>Trọng tâm chiến lược mới</h3>
    <p>Washington tăng cường cam kết với các đối tác trong khuôn khổ QUAD và AUKUS, đồng thời mở rộng hợp tác kinh tế trong chuỗi cung ứng toàn cầu để giảm sự phụ thuộc vào một số thị trường nhất định.</p>
    <p>Các nhà phân tích cho rằng đây là phản ứng chiến lược trước sự gia tăng ảnh hưởng của Trung Quốc và Nga tại nhiều khu vực trên thế giới.</p>`
  },
  {
    title: 'Khủng hoảng năng lượng châu Âu thúc đẩy xu hướng năng lượng xanh',
    category_id: 7,
    thumbnail: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&h=500&fit=crop',
    content: `<p>Sau nhiều năm chật vật với khủng hoảng năng lượng, châu Âu đang mạnh mẽ chuyển mình sang năng lượng tái tạo với tốc độ chưa từng có trong lịch sử.</p>
    <h3>Mục tiêu xanh hóa tham vọng</h3>
    <p>EU đặt mục tiêu đạt 45% năng lượng sạch vào năm 2030. Đức, Hà Lan và Đan Mạch đang dẫn đầu cuộc chuyển đổi này với các khoản đầu tư khổng lồ vào điện gió ngoài khơi và điện mặt trời.</p>
    <p>Giá điện mặt trời tại châu Âu đã giảm 90% trong 10 năm qua và lần đầu tiên trở nên rẻ hơn điện từ than và khí đốt.</p>`
  },
  {
    title: 'Căng thẳng công nghệ Mỹ - Trung chưa có dấu hiệu hạ nhiệt',
    category_id: 7,
    thumbnail: 'https://images.unsplash.com/photo-1536304993881-ff86e0c9b9df?w=800&h=500&fit=crop',
    content: `<p>Cuộc chiến công nghệ giữa Mỹ và Trung Quốc tiếp tục leo thang với việc Washington áp đặt thêm các hạn chế xuất khẩu chip và công nghệ bán dẫn tiên tiến sang Bắc Kinh.</p>
    <h3>Diễn biến mới nhất</h3>
    <p>Danh sách đen của Bộ Thương mại Mỹ vừa bổ sung thêm một số tập đoàn công nghệ hàng đầu Trung Quốc. Phía Bắc Kinh đã đáp trả bằng việc hạn chế xuất khẩu một số khoáng sản chiến lược.</p>
    <p>Các chuyên gia cảnh báo cuộc xung đột này có nguy cơ tạo ra hai hệ sinh thái công nghệ hoàn toàn riêng biệt trên toàn cầu trong vòng 5 năm tới.</p>`
  },

  // ── Thời sự (id=8) ──
  {
    title: 'Toàn cảnh kỳ họp bất thường của Quốc hội sáng nay',
    category_id: 8,
    thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=500&fit=crop',
    content: `<p>Quốc hội Việt Nam vừa khai mạc kỳ họp bất thường để xem xét và thông qua một số vấn đề cấp bách về kinh tế - xã hội và sửa đổi, bổ sung một số điều trong các bộ luật quan trọng.</p>
    <h3>Các nội dung chính</h3>
    <p>Kỳ họp tập trung vào các dự án luật liên quan đến đầu tư công, đất đai và một số nghị quyết về tài khóa nhằm tháo gỡ vướng mắc cho doanh nghiệp và thúc đẩy phục hồi kinh tế sau dịch.</p>
    <p>Toàn bộ phiên khai mạc và các phiên thảo luận quan trọng sẽ được truyền hình và phát thanh trực tiếp để nhân dân theo dõi và giám sát.</p>`
  },
  {
    title: 'Đề xuất mới nhất về tăng lương cơ sở năm nay',
    category_id: 8,
    thumbnail: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=500&fit=crop',
    content: `<p>Bộ Nội vụ vừa chính thức trình Chính phủ đề xuất điều chỉnh mức lương cơ sở trong năm nay với mức tăng được đề xuất từ 15% đến 25% tùy từng nhóm đối tượng.</p>
    <h3>Lộ trình điều chỉnh</h3>
    <p>Theo đề xuất, cán bộ, công chức, viên chức và lực lượng vũ trang sẽ được hưởng mức lương mới từ ngày 1/7, trong đó ưu tiên tăng mạnh cho nhóm giáo viên và nhân viên y tế.</p>
    <p>Nguồn kinh phí thực hiện sẽ được bố trí từ ngân sách trung ương và địa phương, được cân đối bảo đảm không gây áp lực lạm phát lớn.</p>`
  },
  {
    title: 'Nỗ lực giải quyết vấn nạn ùn tắc giao thông tại đô thị lớn',
    category_id: 8,
    thumbnail: 'https://images.unsplash.com/photo-1543191400-c5c32c5ee49f?w=800&h=500&fit=crop',
    content: `<p>TP.HCM và Hà Nội đang đẩy mạnh loạt giải pháp để giải quyết tình trạng ùn tắc giao thông ngày càng nghiêm trọng tại các đô thị lớn, ảnh hưởng đến chất lượng sống của người dân.</p>
    <h3>Các giải pháp đang được triển khai</h3>
    <p>Mở rộng mạng lưới metro, phát triển xe buýt nhanh BRT, kiểm soát phương tiện cá nhân qua phí lưu thông và phát triển hạ tầng làn đường xe đạp là những hướng đang được cả 2 thành phố lớn ưu tiên.</p>
    <p>Các chuyên gia giao thông đô thị cho rằng giải pháp căn cơ nhất vẫn là phát triển đồng bộ hệ thống giao thông công cộng hiện đại và tiện lợi.</p>`
  }
];

async function seedPosts() {
  for (const post of posts) {
    const slug = makeSlug(post.title);
    await new Promise((resolve) => {
      db.query(
        'INSERT INTO posts (title, slug, content, thumbnail, category_id, author_id, status, created_at) VALUES (?, ?, ?, ?, ?, ?, "published", NOW())',
        [post.title, slug, post.content, post.thumbnail, post.category_id, AUTHOR_ID],
        (err) => {
          if (err) {
            console.error(`❌ Lỗi "${post.title}":`, err.message);
          } else {
            console.log(`✅ Đã thêm: "${post.title}"`);
          }
          resolve();
        }
      );
    });
  }
  console.log('\n🎉 Xong! Đã thêm', posts.length, 'bài viết.');
  db.end();
}

seedPosts();
