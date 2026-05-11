const mysql = require('mysql2/promise');

const dbConfig = {
  host: '127.0.0.1',
  user: 'root',
  password: '24050068@Phong',
  database: 'blog_database',
  port: 3306
};

const templates = [
  {
    title: "Đẩy nhanh dự án kéo dài đường Võ Văn Kiệt nối thẳng về Tây Ninh",
    cat: 2, // Kinh Doanh / Bất động sản
    thumb: "https://picsum.photos/800/500?random=1",
    sapo: "Sở Xây dựng vừa có tờ trình khẩn gửi Hội đồng Thẩm định TP báo cáo nghiên cứu tiền khả thi dự án xây dựng đường trục Đông Tây (đường Võ Văn Kiệt) kéo dài từ quốc lộ 1 đến ranh tỉnh Long An (cũ, giờ thuộc tỉnh Tây Ninh).",
    body: [
      "Dự án đường nối Võ Văn Kiệt với cao tốc TP.HCM - Trung Lương có tổng mức đầu tư hơn 1.550 tỉ đồng, triển khai từ năm 2016 nhưng dang dở nhiều năm do nhà đầu tư không đủ năng lực, có nhiều vi phạm nghiêm trọng trong hợp đồng BOT đã ký kết.",
      "Đại lộ Võ Văn Kiệt sẽ kéo dài tới Tây Ninh (khu vực Long An cũ), mở hướng kết nối liên vùng đô thị TP.HCM.",
      "Sau thời gian dài đình trệ, ngày 13.11.2024, UBND TP đã quyết định chấm dứt trước thời hạn Hợp đồng BOT của dự án. Sau đó hơn 1 năm, TP tiếp tục có quyết định giao nhiệm vụ cho Sở Xây dựng thực hiện chuẩn bị đầu tư dự án bằng ngân sách nhà nước nhằm tái khởi động công trình giao thông trọng điểm này.",
      "Thực hiện chỉ đạo của UBND TP, Sở Xây dựng đã hoàn thiện hồ sơ báo cáo nghiên cứu tiền khả thi và chuyển cho các cơ quan chuyên môn thẩm định thiết kế cơ sở, qua đó kỳ vọng sẽ có thể khởi công lại vào cuối quý III năm tới."
    ]
  },
  {
    title: "Ngân hàng Nhà nước giảm mạnh lãi suất điều hành để hỗ trợ thanh khoản",
    cat: 2,
    thumb: "https://picsum.photos/800/500?random=2",
    sapo: "Trong động thái bất ngờ chiều nay, Ngân hàng Nhà nước tuyên bố giảm thêm 0.5% các mức lãi suất điều hành chủ chốt, nhằm khơi thông dòng vốn và bơm thanh khoản cho thị trường bất động sản.",
    body: [
      "Quyết định này được giới chuyên gia đánh giá là bước đi 'chưa từng có tiền lệ' trong bối cảnh các ngân hàng trung ương toàn cầu vẫn đang duy trì chính sách thắt chặt tiền tệ. Các doanh nghiệp sản xuất và thương mại sẽ là nhóm được hưởng lợi trực tiếp từ làn sóng giảm lãi suất cho vay sắp tới.",
      "Ông Nguyễn Văn A, chuyên gia phân tích tại SSI Research nhận định: 'Đây là tín hiệu cực tốt. Mức giảm này đủ lớn để kích hoạt lại các dự án đang tạm dừng, giải phóng nguồn vốn vay tiêu dùng và phục hồi niềm tin của các nhà đầu tư cá nhân trên thị trường chứng khoán.'",
      "Tuy nhiên, áp lực tỷ giá vẫn là biến số cần theo dõi chặt chẽ khi mức chênh lệch lãi suất VND-USD tiếp tục bị thu hẹp."
    ]
  },
  {
    title: "Apple dự kiến tung ra dòng tai nghe không dây hoàn toàn mới với AI tích hợp",
    cat: 3, // Cong Nghe
    thumb: "https://picsum.photos/800/500?random=3",
    sapo: "Chỉ vài tuần trước sự kiện WWDC thường niên, các nguồn tin mật từ chuỗi cung ứng cho thấy Apple đang rục rịch ra mắt phiên bản AirPods cao cấp với chip H3 mới và khả năng xử lý trí tuệ nhân tạo độc lập.",
    body: [
      "Dòng tai nghe mới dự kiến sẽ có thiết kế công thái học cải tiến, tích hợp các vi hạt cảm biến nhiệt độ cơ thể và nhịp tim. Đáng chú ý nhất là trợ lý ảo Siri trên thiết bị này sẽ được nâng cấp bằng mô hình ngôn ngữ lớn (LLM) nội bộ của Apple, cho phép dịch thuật đa ngôn ngữ thời gian thực mà không cần kết nối internet.",
      "Theo nhà phân tích Ming-Chi Kuo, động thái này của gã khổng lồ xứ Cupertino nhằm tái khẳng định vị thế thống trị trên thị trường thiết bị đeo thông minh, vốn đang bị đe dọa bởi sự vươn lên mạnh mẽ của Samsung và các pháp sư Trung Hoa.",
      "Sản phẩm dự kiến sẽ lên kệ vào mùa thu năm nay cùng mức giá khởi điểm không thấp hơn 300 USD."
    ]
  },
  {
    title: "Cấm xe máy ở nội đô: Bài toán giao thông hay cơn ác mộng của người lao động?",
    cat: 1, // Thoi Su
    thumb: "https://picsum.photos/800/500?random=4",
    sapo: "Đề án phân vùng hạn chế, tiến tới cấm xe máy vào nội thành sau năm 2030 đang vấp phải luồng ý kiến đa chiều. Dù hướng tới mục tiêu giảm ùn tắc và ô nhiễm, nhiều người lo ngại đây sẽ là cú đòn giáng mạnh vào sinh kế của hàng vạn người dân.",
    body: [
      "Theo thống kê, hơn 70% phương tiện di chuyển chính yếu của bộ phận người dân thu nhập thấp vẫn là xe máy. Việc hạn chế loại hình này đòi hỏi hệ thống giao thông công cộng (Metro, xe buýt) phải phát triển đạt mức dư thừa năng lực phục vụ.",
      "Tuy nhiên, hiện trạng mạng lưới Metro vẫn đang chậm tiến độ, trong khi xe buýt chưa đáp ứng được tính linh hoạt trong các ngõ ngách chật hẹp của đô thị Việt Nam.",
      "Chia sẻ tại hội thảo về giao thông đô thị, TS. Phạm Sanh cho rằng: 'Cấm thì dễ, nhưng quản lý và tạo đường sống cho người dân mới khó. Không thể chỉ cắt ngọn mà quên gốc rễ của việc quy hoạch đô thị bất cập suốt nhiều thập kỷ qua.'"
    ]
  },
  {
    title: "Biến đổi khí hậu gây xói mòn nghiêm trọng tại các khu vực ven biển miền Trung",
    cat: 1,
    thumb: "https://picsum.photos/800/500?random=5",
    sapo: "Những đợt triều cường bất thường và hiện tượng nước biển dâng đang 'nuốt trọn' hàng chục dặm bờ biển tại các tỉnh miền Trung, đe dọa trực tiếp đến cuộc sống của hàng nghìn hộ dân ven biển.",
    body: [
      "Chỉ trong vòng 3 năm trở lại đây, dải cát ven biển từ Quảng Nam đến Phú Yên đã biến mất nhanh chóng. Các hàng phi lao chắn cát - tấm khiên bảo vệ cuối cùng - cũng bị sóng đánh bật gốc vùi xuống lòng đại dương đỏ ngầu bùn đất.",
      "Để khắc phục, chính quyền địa phương đang gấp rút triển khai các dự án đê kè bê tông cốt thép, tuy nhiên đây chỉ là giải pháp tạm thời. Việc phục hồi hệ sinh thái ngập mặn và rừng phòng hộ ven biển mới mang lại hiệu quả bền vững lâu dài.",
      "Nhiều làng chài truyền thống đang đứng trước nguy cơ phải di dời toàn bộ vào đất liền, bỏ lại phía sau không chỉ là nhà cửa, mà còn là cả một nếp sống bám biển hàng trăm năm."
    ]
  },
  {
    title: "Công nghệ V2X: Khi ô tô biết trò chuyện với đèn đỏ và người đi đường",
    cat: 3,
    thumb: "https://picsum.photos/800/500?random=6",
    sapo: "Hệ thống kết nối V2X (Vehicle-to-Everything) đang dần hiện thực hóa viễn cảnh giao thông không tai nạn. Bằng cách chia sẻ dữ liệu liên tục mọi lúc mọi nơi, xe hơi nay không chỉ là phương tiện mà còn là thiết bị IoT thông minh khổng lồ.",
    body: [
      "Hãy tưởng tượng xe của bạn đang chạy ở tốc độ 80km/h trên cao tốc, và chiếc xe phía trước cách xa hàng trăm mét bất ngờ phanh gấp. Ngay lập tức, nhờ sóng 5G độ trễ cực thấp, xe của bạn đã nhận được tín hiệu cảnh báo và tự động giảm tốc trước khi mắt bạn kịp nhận ra.",
      "Đó chính là sức mạnh của V2X. Công nghệ này có thể trao đổi thông tin hạ tầng giao thông (V2I), mạng lưới bộ hành (V2P) hay giữa các phương tiện với nhau (V2V).",
      "Mặc dù gặp một số rào cản về vấn đề bảo mật quyền riêng tư và chi phí hạ tầng ban đầu đắt đỏ, Liên minh Viễn thông Châu Âu dự kiến sẽ ban hành tiêu chuẩn bắt buộc trang bị mô-đun V2X trên tất cả ô tô mới bán ra vào năm 2028."
    ]
  },
  {
    title: "Dòng tiền hàng nghìn tỷ chảy mạnh vào cổ phiếu công nghệ",
    cat: 2,
    thumb: "https://picsum.photos/800/500?random=7",
    sapo: "Chỉ số VN-Index ghi nhận tuần giao dịch bùng nổ khi nhóm cổ phiếu vốn hóa lớn, đặc biệt là nhóm ngành viễn thông và công nghệ thông tin, dẫn dắt đà tăng vọt chưa từng thấy.",
    body: [
      "Nguyên nhân chủ yếu được cho là nhờ vào làn sóng đầu tư mạnh mẽ từ các quỹ ngoại ETF và kỳ vọng tăng trưởng bứt phá lợi nhuận từ các gã khổng lồ cung cấp dịch vụ hạ tầng đám mây và trung tâm dữ liệu tại Việt Nam.",
      "Mã cổ phiếu FPT, CMG đều xác lập đỉnh lịch sử mới với chuỗi tăng trần 3 phiên liên tiếp. Khối ngoại đã giải ngân ròng hơn 4.500 tỷ đồng vào riêng rổ VN30 trong chưa đầy một tuần làm việc.",
      "Dù vậy, một số chuyên gia cảnh báo các nhịp điều chỉnh sâu hoàn toàn có thể xảy ra do định giá một số công ty đã vượt xa giá trị nội tại, hình thành bong bóng cục bộ."
    ]
  },
  {
    title: "Bí quyết cải thiện chất lượng giấc ngủ để làm việc hiệu quả",
    cat: 4, // Sức Khỏe/Đời sống
    thumb: "https://picsum.photos/800/500?random=8",
    sapo: "Chúng ta dành 1/3 cuộc đời để ngủ, nhưng dường như trong nhịp sống hiện đại, giấc ngủ chất lượng lại là một điều xa xỉ. Rối loạn giấc ngủ đang trở thành một 'đại dịch' thầm lặng.",
    body: [
      "Theo nghiên cứu của tổ chức WHO, ánh sáng xanh từ màn hình thiết bị điện tử làm ức chế sản sinh hormone Melatonin, khiến nhịp sinh học cơ thể bị đảo lộn toàn diện. Để có một giấc ngủ sâu, nguyên tắc vàng là ngắt toàn bộ điện thoại ít nhất 1 giờ trước khi lên giường.",
      "Ngoài ra, nhiệt độ phòng ngủ ở mức 18-20 độ C sẽ đánh lừa cơ thể rằng màn đêm đã bao phủ hoàn toàn, phối hợp cùng máy tạo tiếng ồn trắng (White noise) giúp loại bỏ mọi tạp âm kích thích não bộ.",
      "Đối với nhân viên công sở, một giấc ngủ trưa ngắn chỉ từ 15-20 phút được chứng minh giúp khôi phục tới 60% năng lượng tinh thần, tuy nhiên không nên ngủ quá 30 phút để tránh rơi vào trạng thái 'quán tính giấc ngủ' gây đờ đẫn."
    ]
  },
  {
    title: "Bóng đá Việt Nam và bài toán thay đổi hệ thống đào tạo trẻ",
    cat: 5, // Thể thao
    thumb: "https://picsum.photos/800/500?random=9",
    sapo: "Sự chững lại của các cấp độ ĐTQG đang gióng lên hồi chuông cảnh báo về mô hình phát triển bóng đá vĩ mô. Trọng tâm dường như đang bị lệch về thành tích ngắn hạn thay vì đầu tư chiều sâu cho học viện trẻ.",
    body: [
      "Tại hội thảo bóng đá chuyên nghiệp Đông Nam Á, nhiều giám đốc kỹ thuật đã chỉ ra điểm yếu chí mạng của V.League: Thiếu môi trường cọ xát thực chiến cho các tài năng lứa tuổi U19 và U21. Đa số các tài năng ngậm ngùi mài đũng quần trên băng ghế dự bị do các CLB ưa dùng ngoại binh ở vị trí xương sống.",
      "Đã đến lúc cần có những quy chế cứng rắn từ VFF buộc các CLB phải dành hạn mức thời lượng thi đấu cho lứa trẻ, hoặc tổ chức hệ thống giải đấu B-Team song song như mô hình của Tây Ban Nha.",
      "Cuộc cách mạng thực sự phải bắt đầu ngay từ bây giờ, đầu tư toàn diện vào chế độ dinh dưỡng, y tế phục hồi và áp dụng khoa học dữ liệu vào từng ngóc ngách của quá trình huấn luyện."
    ]
  },
  {
    title: "Vẻ đẹp vượt thời gian của cố đô Huế mùa rụng lá",
    cat: 6, // Du Lịch
    thumb: "https://picsum.photos/800/500?random=10",
    sapo: "Không ồn ào và náo nhiệt, cố đô Huế những ngày này khoác lên mình một tấm áo vàng úa hoài niệm của những hàng cây ngô đồng, làm say lòng bất cứ bước chân lữ khách nào ghé qua.",
    body: [
      "Men theo dòng sông Hương lững lờ trôi, những con đường tĩnh lặng rợp bóng xà cừ cổ thụ đang lác đác thả vô vàn chiếc lá vàng rơi. Tiếng chuông chùa Thiên Mụ thỉnh thoảng ngân vang trong không gian u tịch, xua tan hết mọi muộn phiền của thực tại tấp nập.",
      "Nét thơ mộng của Huế không chỉ nằm ở cảnh quan, mà còn ẩn chứa trong văn hóa ẩm thực tinh tế: một bát bún bò cay nồng thơm lừng ruốc sả, hay đĩa bánh nậm mỏng tang dẻo mịn bọc trong lá dong xanh mướt.",
      "Huế luôn như vậy, dịu dàng, chậm rãi, nhưng đủ sức gây nhung nhớ một đời nếu ai đã trót một lần cảm nhận bằng trọn vẹn trái tim."
    ]
  }
];

// Combine words to generic slug
function makeSlug(text, index) {
  const t = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();
  return t.replace(/[^a-z0-9]+/g, '-') + '-' + index + '-' + Date.now();
}

async function run() {
  const connection = await mysql.createConnection(dbConfig);
  let count = 1;
  const totalPosts = 30;

  console.log("Bat dau tao 30 bai viet mau...");
  for (let i = 0; i < totalPosts; i++) {
    const tpl = templates[i % templates.length];
    
    // Generate organic content
    const bodyHtml = tpl.body.map(para => '<p>' + para + '</p>').join('\\n');
    const htmlContent = '<p>' + tpl.sapo + '</p>\\n' + bodyHtml;
    const title = tpl.title + (i >= 10 ? ' (Cập nhật ' + i + ')' : "");
    const slug = makeSlug(title, i);
    const viewCount = Math.floor(Math.random() * 5000) + 100;
    
    // Spread dates organically over the last 30 days
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
    const created_at = date.toISOString().slice(0, 19).replace('T', ' ');

    try {
      await connection.query(
        `INSERT INTO posts (title, slug, content, thumbnail, status, views, category_id, author_id, created_at) 
         VALUES (?, ?, ?, ?, 'published', ?, ?, NULL, ?)`,
        [title, slug, htmlContent, tpl.thumb, viewCount, tpl.cat, created_at]
      );
      console.log('✅ Đã đăng bài: ' + title);
    } catch(err) {
      console.error('Lỗi đăng bài id ' + i + ':', err.message);
    }
  }

  await connection.end();
  console.log("HOÀN TẤT SINH 30 BÀI VIẾT VỚI DỮ LIỆU THỰC NHƯ MẪU!");
}

run();
