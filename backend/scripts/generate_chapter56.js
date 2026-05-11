const { Document, Packer, convertInchesToTwip, HeadingLevel, AlignmentType, TextRun, Paragraph, Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType, VerticalAlign } = require("docx");
const fs = require("fs"), path = require("path");
const { h1, h2, p, bl, bv, emp, center, TB, TH, TC, imgBox } = require("./gen_ch56_helpers");

const meetingTable = () => new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, borders: TB, rows: [
  new TableRow({ tableHeader: true, children: [TH("Loại buổi họp"), TH("Thời điểm"), TH("Nội dung chính"), TH("Kết quả")] }),
  new TableRow({ children: [TC("Sprint Planning", false, true), TC("Đầu mỗi sprint"), TC("Chọn User Story, phân chia task, ước tính thời gian"), TC("Sprint Backlog hoàn chỉnh")] }),
  new TableRow({ children: [TC("Weekly Scrum", false, true), TC("Mỗi thứ 2 hàng tuần"), TC("Cập nhật tiến độ, nêu vướng mắc, điều chỉnh kế hoạch"), TC("To-do list tuần cập nhật")] }),
  new TableRow({ children: [TC("Sprint Review", false, true), TC("Cuối mỗi sprint"), TC("Demo sản phẩm cho PO, đánh giá Definition of Done"), TC("Chấp nhận / yêu cầu sửa đổi")] }),
  new TableRow({ children: [TC("Sprint Retrospective", false, true), TC("Cuối mỗi sprint"), TC("Keep / Improve / Try – cải tiến quy trình nhóm"), TC("Action items sprint tiếp theo")] }),
  new TableRow({ children: [TC("Nghiệm thu nội bộ", false, true), TC("Trước khi nộp"), TC("Demo toàn bộ hệ thống, kiểm tra checklist hoàn thiện"), TC("Sản phẩm sẵn sàng nộp")] }),
] });

const completionTable = () => new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, borders: TB, rows: [
  new TableRow({ tableHeader: true, children: [TH("Module"), TH("Mục tiêu ban đầu"), TH("Mức độ hoàn thành"), TH("Ghi chú")] }),
  new TableRow({ children: [TC("Xác thực & phân quyền", false, true), TC("JWT + OAuth Google/Facebook"), TC("✅ 100%", true), TC("Hoàn chỉnh, kể cả blacklist token")] }),
  new TableRow({ children: [TC("Hiển thị tin tức", false, true), TC("11 chuyên mục, phân trang, đếm view"), TC("✅ 100%", true), TC("Mega Menu đầy đủ")] }),
  new TableRow({ children: [TC("CMS – Quản lý bài viết", false, true), TC("CRUD, Rich Text Editor, upload ảnh"), TC("✅ 100%", true), TC("Clone, Bulk action thêm vào")] }),
  new TableRow({ children: [TC("Bình luận & Tương tác", false, true), TC("Reply đa tầng, Like, Rating, Báo cáo"), TC("✅ 100%", true), TC("Có cơ chế chống spam")] }),
  new TableRow({ children: [TC("Cá nhân hóa", false, true), TC("Bookmark, Lịch sử đọc, Thông báo"), TC("✅ 100%", true), TC("Đầy đủ theo yêu cầu")] }),
  new TableRow({ children: [TC("Tìm kiếm & SEO", false, true), TC("Full-text search, slug URL, Open Graph"), TC("✅ 100%", true), TC("Preview ảnh khi share MXH")] }),
  new TableRow({ children: [TC("Admin Dashboard", false, true), TC("Thống kê tổng quan"), TC("✅ 100%", true), TC("7 chỉ số + danh sách bài mới")] }),
  new TableRow({ children: [TC("Thanh toán / Đặt báo", false, true), TC("Tích hợp cổng thanh toán"), TC("⏳ 20%", true), TC("UI có, logic thanh toán chưa tích hợp thực tế")] }),
  new TableRow({ children: [TC("Unit Test tự động", false, true), TC("Kiểm thử tự động"), TC("❌ 0%", true), TC("Chưa thực hiện, để lại hướng phát triển")] }),
  new TableRow({ children: [TC("Deploy production", false, true), TC("Triển khai thực tế"), TC("❌ 0%", true), TC("Chỉ chạy local; kế hoạch dùng Railway + Vercel")] }),
] });

const issuesTable = () => new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, borders: TB, rows: [
  new TableRow({ tableHeader: true, children: [TH("Khó khăn"), TH("Biểu hiện"), TH("Cách khắc phục"), TH("Thành viên xử lý")] }),
  new TableRow({ children: [TC("CORS & Cookie"), TC("Frontend không gọi được API, lỗi 401"), TC("Cấu hình cors credentials, thống nhất port"), TC("Đỗ Huy Cường")] }),
  new TableRow({ children: [TC("Mã hóa tiếng Việt slug"), TC("URL bị lỗi ký tự đặc biệt"), TC("Viết hàm createSlug() chuẩn hóa NFD"), TC("Đỗ Huy Cường")] }),
  new TableRow({ children: [TC("Xung đột merge Git"), TC("Conflict file CSS khi 2 người cùng sửa"), TC("Pull trước khi push, giải quyết conflict theo feature"), TC("Nguyễn Trọng Tấn")] }),
  new TableRow({ children: [TC("FK constraint khi xóa"), TC("DELETE bài viết báo lỗi FK"), TC("Xóa cascade thủ công theo thứ tự bảng"), TC("Đỗ Huy Cường")] }),
  new TableRow({ children: [TC("Schema DB thay đổi giữa chừng"), TC("Thêm cột mới làm vỡ API cũ"), TC("Viết file migrate_news_columns.sql riêng"), TC("Vương Đạt Kiến Phong")] }),
  new TableRow({ children: [TC("OAuth redirect khác môi trường"), TC("Google từ chối redirect URL local"), TC("Đăng ký đúng origin trong Google Console"), TC("Đỗ Huy Cường")] }),
  new TableRow({ children: [TC("Thời gian sprint không đủ"), TC("Sprint 3 chậm do tính năng reply phức tạp"), TC("SM điều chỉnh scope, dời tính năng phụ sang sprint 4"), TC("Vương Đạt Kiến Phong")] }),
] });

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Times New Roman", size: 24 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", run: { bold: true, size: 28, font: "Times New Roman", color: "1F4E79" }, paragraph: { spacing: { before: 400, after: 200 } } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", run: { bold: true, size: 26, font: "Times New Roman", color: "2E74B5" }, paragraph: { spacing: { before: 280, after: 120 } } },
    ]
  },
  sections: [{ properties: { page: { margin: { top: convertInchesToTwip(1), bottom: convertInchesToTwip(1), left: convertInchesToTwip(1.25), right: convertInchesToTwip(1) } } },
    children: [
      // CH5 cover
      center("CHƯƠNG 5", 40, "1F4E79"),
      center("QUẢN LÝ DỰ ÁN VÀ KỶ LUẬT LÀM VIỆC", 30, "2E74B5"),
      emp(),

      h1("CHƯƠNG 5. QUẢN LÝ DỰ ÁN VÀ KỶ LUẬT LÀM VIỆC"),

      // 5.1
      h2("5.1. Quản lý công việc với Jira"),
      p("Nhóm sử dụng Jira để quản lý toàn bộ vòng đời công việc từ Product Backlog đến Done. Quy trình cụ thể:"),
      bl("Tạo Backlog: Scrum Master (Vương Đạt Kiến Phong) tổng hợp User Story từ yêu cầu PO, tạo issue trên Jira với loại Story/Task/Bug, ưu tiên theo điểm story point."),
      bl("Sprint Backlog: Đầu mỗi sprint, nhóm họp Sprint Planning, kéo issue từ Backlog vào Sprint, gán người thực hiện và đặt thời hạn."),
      bl("Cập nhật trạng thái: Mỗi thành viên tự kéo card theo luồng: To Do → In Progress → In Review → Done. SM nhắc nhở cập nhật Jira sau mỗi buổi họp."),
      bl("Theo dõi Sprint: SM kiểm tra Jira Board hàng ngày, phát hiện card bị block và hỗ trợ giải quyết ngay."),
      emp(),
      imgBox("[Chèn ảnh Jira Board – Sprint Backlog tổng quan]"),
      emp(),
      imgBox("[Chèn ảnh Jira Board – Kanban To Do / In Progress / Done]"),
      emp(),

      // 5.2
      h2("5.2. Quản lý mã nguồn với Git/GitHub"),
      p("Chiến lược nhánh (Branch Strategy):", { bold: true }),
      bl("main: Nhánh ổn định, chỉ chứa code đã được review và test. Không commit trực tiếp."),
      bl("develop: Nhánh tích hợp, merge các feature branch vào đây trước khi lên main."),
      bl("feature/<tên>: Mỗi tính năng tạo nhánh riêng. Ví dụ: feature/auth-jwt, feature/comment-reply, feature/bookmark, feature/admin-news-editor."),
      bl("fix/<tên>: Nhánh vá lỗi. Ví dụ: fix/cors-error, fix/slug-encoding, fix/fk-delete-cascade."),
      emp(),
      p("Quy trình làm việc:", { bold: true }),
      bl("Pull code mới nhất từ develop trước khi tạo nhánh mới."),
      bl("Commit thường xuyên với message rõ ràng theo quy ước: [feat] / [fix] / [refactor] / [style] + mô tả ngắn. Ví dụ: [feat] add comment reply multi-level, [fix] resolve CORS credentials error."),
      bl("Khi hoàn thành feature: tạo Pull Request vào develop, mô tả thay đổi, tag thành viên review."),
      bl("Code review: Ít nhất 1 thành viên khác review trước khi merge. Reviewer kiểm tra logic, naming convention và không có hardcode."),
      bl("Sau khi merge: Xóa feature branch, cập nhật Jira card sang Done."),
      emp(),
      p("Ví dụ các commit/nhánh quan trọng:", { bold: true }),
      bl("feature/auth-jwt: Triển khai đăng ký, đăng nhập JWT, middleware verifyToken, blacklist token."),
      bl("feature/oauth-google-facebook: Cấu hình Passport.js, route /auth/google, /auth/facebook, xử lý callback."),
      bl("feature/admin-cms: Toàn bộ Admin Panel – Dashboard, NewsManager, NewsEditor với Rich Text Editor."),
      bl("feature/interaction-sprint3: Comment reply đa tầng, Like, Rating 1-5 sao, Báo cáo bình luận."),
      bl("fix/fk-delete-cascade: Sửa lỗi xóa bài viết bị FK constraint – cascade thủ công."),
      emp(),

      // 5.3
      h2("5.3. Biên bản họp và theo dõi tiến độ"),
      p("Các loại biên bản họp nhóm đã thực hiện:", { bold: true }),
      emp(), meetingTable(), emp(),
      p("Cách theo dõi tiến độ:", { bold: true }),
      bl("Burn-down Chart: SM vẽ burn-down chart cuối mỗi tuần trên Jira, so sánh công việc thực tế hoàn thành vs. kế hoạch."),
      bl("Checklist tuần: Mỗi thứ 6 hàng tuần, SM tổng hợp checklist: task Done / In Progress / Blocked của từng thành viên, gửi vào nhóm Zalo/Discord."),
      bl("Ghi chú biên bản: Mỗi buổi họp có người ghi chú ngắn (Quyết định, Action item, Người chịu trách nhiệm, Deadline). Lưu trữ trong tài liệu chung của nhóm."),
      emp(),
      imgBox("[Chèn ảnh Burn-down Chart sprint hoặc checklist tiến độ tuần]"),
      emp(),

      // 5.4
      h2("5.4. Vai trò Scrum Master và xử lý xung đột"),
      p("Scrum Master (Vương Đạt Kiến Phong) đảm nhận các trách nhiệm cụ thể:"),
      bl("Điều phối công việc: Phân chia task theo năng lực từng thành viên (FE cho Tấn, BE cho Cường, DB cho Phong), đảm bảo workload cân bằng giữa các sprint."),
      bl("Xử lý Blockers: Khi thành viên bị block (chờ API, lỗi kỹ thuật), SM kết nối ngay hai bên liên quan để giải quyết trong ngày. Ưu tiên unblock hơn làm task mới."),
      bl("Giải quyết xung đột kỹ thuật: Khi FE và BE không thống nhất về cấu trúc API response, SM tổ chức cuộc gọi ngắn để thống nhất format JSON chung, ghi vào tài liệu API."),
      bl("Kỷ luật Jira & Git: SM nhắc nhở (qua Zalo) khi thành viên quên cập nhật card Jira hoặc không commit cuối ngày. Quy tắc: không merge trực tiếp vào main."),
      bl("Retrospective: Sau mỗi sprint, SM dẫn dắt buổi Retro theo mẫu Keep/Improve/Try, ghi lại action item và kiểm tra xem sprint sau có cải thiện không."),
      emp(),

      // CH6 cover
      center("CHƯƠNG 6", 40, "1F4E79"),
      center("ĐÁNH GIÁ KẾT QUẢ VÀ BÀI HỌC KINH NGHIỆM", 30, "2E74B5"),
      emp(),

      h1("CHƯƠNG 6. ĐÁNH GIÁ KẾT QUẢ VÀ BÀI HỌC KINH NGHIỆM"),

      // 6.1
      h2("6.1. Đánh giá mức độ hoàn thành mục tiêu"),
      p("Đối chiếu kết quả thực tế với mục tiêu ban đầu đặt ra trong Sprint Planning và Product Backlog:"),
      emp(), completionTable(), emp(),
      p("Nhận xét tổng quan:", { bold: true }),
      bl("Sản phẩm: 8/11 module hoàn thành 100%. Hệ thống có thể chạy thực tế với đầy đủ tính năng cốt lõi của một báo điện tử. Vượt ngoài yêu cầu ban đầu: thêm Clone bài viết, Bulk action, cơ chế chống spam bot."),
      bl("Quy trình: Áp dụng Scrum đúng quy trình 4 sprint, đủ 4 loại ceremonies. Jira và GitHub được duy trì nhất quán suốt dự án. Tuy nhiên, thời gian estimate một số task còn chưa chính xác (sprint 3 chậm hơn kế hoạch ~3 ngày)."),
      emp(),

      // 6.2
      h2("6.2. Những khó khăn và cách khắc phục"),
      emp(), issuesTable(), emp(),

      // 6.3
      h2("6.3. Bài học kinh nghiệm về kỹ thuật"),
      bv("REST API Design: ", "Thiết kế endpoint rõ ràng (method + resource + auth) từ đầu giúp FE và BE phối hợp suôn sẻ. Versioning API (/api/...) tránh xung đột routing."),
      bv("JWT & Bảo mật: ", "Token không nên lưu mãi mãi – cần cơ chế blacklist khi đăng xuất. bcrypt salt round=10 là đủ cho môi trường học tập, production nên dùng 12+."),
      bv("Database Design: ", "UNIQUE constraint kép ở tầng DB mạnh hơn check ở tầng application. ON DELETE CASCADE tiết kiệm code nhưng cần cẩn thận với dữ liệu quan trọng."),
      bv("OAuth 2.0: ", "Luồng Authorization Code phức tạp hơn mong đợi. Cần đăng ký đúng redirect URI cho từng môi trường (local, staging, production)."),
      bv("File Upload: ", "Không lưu ảnh trực tiếp trên server – dùng Cloudinary CDN tránh tốn disk và đơn giản hóa deployment. URL ảnh lưu vào DB là đủ."),
      bv("Parameterized Query: ", "Luôn dùng ? placeholder thay vì nối chuỗi SQL – phòng SQL Injection là kỹ thuật bắt buộc, không phải tùy chọn."),
      bv("Git Workflow: ", "Feature branch + Pull Request + Code Review giúp phát hiện lỗi sớm hơn và giữ lịch sử commit sạch. Commit nhỏ, thường xuyên dễ rollback hơn commit to."),
      emp(),

      // 6.4
      h2("6.4. Bài học kinh nghiệm về kỹ năng mềm"),
      bv("Làm việc nhóm: ", "Phân công rõ ràng theo chuyên môn (FE/BE/DB) nhưng mỗi thành viên cần hiểu cơ bản công việc của người khác để hỗ trợ khi cần. Không nên 'đóng cửa' trong phần việc của mình."),
      bv("Giao tiếp kỹ thuật: ", "Thống nhất API contract (format request/response) bằng văn bản trước khi code tránh mất thời gian chỉnh sửa sau. Postman Collection là tài liệu sống tốt nhất."),
      bv("Quản lý thời gian: ", "Estimate task nên cộng thêm 20-30% buffer cho các vấn đề không lường trước (lỗi kỹ thuật, tài liệu thiếu). Sprint quá đầy task dẫn đến chất lượng kém hơn ít task nhưng hoàn chỉnh."),
      bv("Báo cáo tiến độ: ", "Cập nhật Jira và báo cáo SM hàng ngày dù task chưa xong – 'In Progress + gặp vấn đề X' có giá trị hơn im lặng. SM không thể giúp nếu không biết vướng mắc."),
      bv("Trách nhiệm cam kết: ", "Nếu không thể hoàn thành đúng hạn, báo sớm cho SM để điều chỉnh scope sprint – tốt hơn là im lặng rồi nộp trễ. Scrum không trừng phạt việc re-estimate, nhưng không báo cáo là vấn đề nghiêm trọng."),
      bv("Tinh thần học hỏi: ", "Nhiều kỹ thuật (OAuth, Cloudinary, Rich Text Editor, SEO) nhóm chưa học trong lý thuyết – tự nghiên cứu tài liệu và thử-sai là kỹ năng quan trọng nhất trong môi trường thực tế."),
      emp(),

      // KẾT LUẬN
      center("KẾT LUẬN", 36, "1F4E79"),
      emp(),
      p("Dự án VDKP News Portal đã được nhóm hoàn thành thành công trong khuôn khổ 4 sprint (8 tuần), xây dựng nên một hệ thống cổng thông tin báo điện tử đầy đủ chức năng với hơn 20 tính năng từ xác thực, quản lý nội dung, tương tác người dùng đến tối ưu SEO."),
      p("Những gì nhóm đã đạt được: Sản phẩm có thể chạy thực tế với kiến trúc 3 lớp tách biệt, REST API đầy đủ, bảo mật JWT+OAuth, giao diện responsive thân thiện người dùng. Quy trình Scrum được áp dụng đúng phương pháp, giúp nhóm tự tổ chức và liên tục cải thiện qua từng sprint."),
      p("Định hướng phát triển: Nếu tiếp tục trong môi trường doanh nghiệp hoặc khởi nghiệp, hệ thống có thể được phát triển theo hướng: (1) Triển khai production với CI/CD tự động trên Railway/Vercel; (2) Tích hợp cổng thanh toán thực tế (VNPAY, MoMo) cho module Đặt Báo; (3) Phát triển mobile app React Native; (4) Áp dụng Machine Learning gợi ý bài viết theo lịch sử đọc; (5) Xây dựng bộ unit test và E2E test đầy đủ để đảm bảo chất lượng khi scale."),
      p("Dự án là minh chứng thực tế cho giá trị của mô hình Work-Integrated Learning – nơi kiến thức học thuật được kiểm chứng và củng cố thông qua thực hành có hướng dẫn. Nhóm trân trọng sự hỗ trợ của giảng viên hướng dẫn và xem đây là nền tảng vững chắc cho sự nghiệp lập trình phần mềm chuyên nghiệp sau này."),
      emp(),

      // PHỤ LỤC
      center("PHỤ LỤC", 36, "1F4E79"),
      emp(),
      p("A. Liên kết tài nguyên dự án:", { bold: true }),
      bv("GitHub Repository: ", "[Điền link GitHub repository của nhóm tại đây]"),
      bv("Jira Board: ", "[Điền link Jira Board tại đây hoặc chèn ảnh minh họa bên dưới]"),
      emp(),
      imgBox("[Chèn ảnh Jira Board tổng quan]"),
      emp(),

      p("B. Biên bản họp tiêu biểu:", { bold: true }),
      imgBox("[Chèn ảnh / scan biên bản họp Sprint Planning 1]"),
      emp(),
      imgBox("[Chèn ảnh / scan biên bản họp Sprint Review cuối cùng]"),
      emp(),

      p("C. Kết quả kiểm thử (Test Evidence):", { bold: true }),
      imgBox("[Chèn ảnh Postman – Test API đăng nhập thành công]"),
      emp(),
      imgBox("[Chèn ảnh Postman – Test API tạo bài viết]"),
      emp(),

      p("D. Hình ảnh giao diện hệ thống:", { bold: true }),
      imgBox("[Chèn ảnh chụp màn hình Trang chủ (Home)]"),
      emp(),
      imgBox("[Chèn ảnh chụp màn hình Trang chi tiết bài viết + Bình luận]"),
      emp(),
      imgBox("[Chèn ảnh chụp màn hình Admin Dashboard]"),
      emp(),
      imgBox("[Chèn ảnh chụp màn hình Admin NewsEditor – Rich Text Editor]"),
      emp(),
      imgBox("[Chèn ảnh chụp màn hình Trang đăng nhập / đăng ký]"),
      emp(),
      imgBox("[Chèn ảnh chụp màn hình Trang hồ sơ cá nhân]"),
      emp(),
    ]
  }]
});

const out = path.join(__dirname, "..", "Chuong5_6_KetLuan_PhuLuc_VDKP.docx");
Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(out, buf);
  console.log("✅ Đã tạo:", out);
}).catch(e => console.error("❌", e));
