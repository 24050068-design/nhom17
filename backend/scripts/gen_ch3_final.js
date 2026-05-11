const {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, Table, TableRow, TableCell, WidthType,
  BorderStyle, ShadingType, VerticalAlign, convertInchesToTwip, ImageRun,
} = require("docx");
const fs = require("fs"), path = require("path");

const flowDir = path.join(__dirname, "..", "temp_mermaid");
const f1 = fs.readFileSync(path.join(flowDir, "flow1.png"));
const f2 = fs.readFileSync(path.join(flowDir, "flow2.png"));
const f3 = fs.readFileSync(path.join(flowDir, "flow3.png"));

// ── helpers ───────────────────────────────────────────────────────────────────
const TNR = (t, o={}) => new TextRun({ text: t, font: "Times New Roman", size: 24, ...o });
const h1  = t => new Paragraph({ text: t, heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } });
const h2  = t => new Paragraph({ text: t, heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 140 } });
const p   = (t, o={}) => new Paragraph({ children: [TNR(t, o)], spacing: { after: 120 }, alignment: AlignmentType.JUSTIFIED });
const bl  = t => new Paragraph({ children: [TNR(t)], bullet: { level: 0 }, spacing: { after: 80 }, alignment: AlignmentType.JUSTIFIED });
const bv  = (lbl, val) => new Paragraph({ children: [TNR(lbl, { bold: true }), TNR(val)], spacing: { after: 110 }, alignment: AlignmentType.JUSTIFIED });
const emp = () => new Paragraph({ text: "", spacing: { after: 80 } });

// ── table border presets ───────────────────────────────────────────────────────
const border = (c="BFBFBF", s=4) => ({ style: BorderStyle.SINGLE, size: s, color: c });
const noBorder = () => ({ style: BorderStyle.NONE, size: 0, color: "FFFFFF" });
const fullBorder = (c, s=4) => ({ top: border(c,s), bottom: border(c,s), left: border(c,s), right: border(c,s), insideH: border(c,s), insideV: border(c,s) });
const outerOnly = (c, s=6) => ({ top: border(c,s), bottom: border(c,s), left: border(c,s), right: border(c,s), insideH: noBorder(), insideV: noBorder() });

// ── TH / TC helpers ──────────────────────────────────────────────────────────
const TH = (t, fill="1F4E79") => new TableCell({
  children: [new Paragraph({ children: [TNR(t, { bold:true, size:22, color:"FFFFFF" })], alignment: AlignmentType.CENTER, spacing: { before:80, after:80 } })],
  shading: { fill, type: ShadingType.CLEAR, color: fill },
  verticalAlign: VerticalAlign.CENTER,
  margins: { top:80, bottom:80, left:120, right:120 },
});
const TC = (t, ctr=false, bold=false, fill="FFFFFF") => new TableCell({
  children: [new Paragraph({ children: [TNR(t, { size:22, bold })], alignment: ctr ? AlignmentType.CENTER : AlignmentType.JUSTIFIED, spacing: { before:60, after:60 } })],
  shading: { fill, type: ShadingType.CLEAR, color: fill },
  verticalAlign: VerticalAlign.CENTER,
  margins: { top:80, bottom:80, left:120, right:120 },
});

// ── Bảng User Story ──────────────────────────────────────────────────────────
const userStoryTable = () => new Table({
  width: { size:100, type:WidthType.PERCENTAGE }, borders: fullBorder("BFBFBF"),
  rows: [
    new TableRow({ tableHeader:true, children:[TH("ID"),TH("Vai trò"),TH("Mục tiêu"),TH("Lợi ích")] }),
    ...([
      ["US-01","Khách","Đăng ký tài khoản bằng email","Truy cập tính năng cá nhân hoá"],
      ["US-02","Người dùng","Đăng nhập Google / Facebook","Tiện lợi, không cần nhớ mật khẩu"],
      ["US-03","Người dùng","Đăng xuất khỏi hệ thống","Bảo mật tài khoản cá nhân"],
      ["US-04","Khách","Xem danh sách bài báo theo 11 chuyên mục","Tìm nội dung quan tâm nhanh chóng"],
      ["US-05","Khách","Đọc nội dung chi tiết bài báo","Nắm thông tin đầy đủ"],
      ["US-06","Khách","Tìm kiếm bài báo theo từ khóa","Tiết kiệm thời gian tìm nội dung"],
      ["US-07","Người dùng","Lưu bài viết vào Bookmark","Đọc lại khi thuận tiện"],
      ["US-08","Người dùng","Xem lịch sử bài đã đọc","Tiếp tục bài còn dang dở"],
      ["US-09","Người dùng","Nhận thông báo khi có reply bình luận","Theo dõi cuộc hội thoại"],
      ["US-10","Người dùng","Viết bình luận và reply đa tầng","Trao đổi quan điểm về bài viết"],
      ["US-11","Người dùng","Like bình luận của người khác","Thể hiện đồng thuận"],
      ["US-12","Người dùng","Đánh giá bài viết 1–5 sao","Phản hồi chất lượng nội dung"],
      ["US-13","Người dùng","Báo cáo bình luận vi phạm","Giữ môi trường bình luận lành mạnh"],
      ["US-14","Người dùng","Chia sẻ bài viết qua link chuẩn SEO","Lan truyền nội dung có preview ảnh trên MXH"],
      ["US-15","Admin","Đăng bài viết mới với Rich Text Editor","Xuất bản nội dung chất lượng"],
      ["US-16","Admin","Chỉnh sửa và xóa bài viết","Quản lý nội dung linh hoạt"],
      ["US-17","Admin","Quản lý chuyên mục (CRUD)","Tổ chức nội dung có cấu trúc"],
      ["US-18","Admin","Xem và xóa bình luận vi phạm","Kiểm soát chất lượng thảo luận"],
      ["US-19","Admin","Quản lý tài khoản người dùng","Kiểm soát quyền truy cập"],
      ["US-20","Admin","Xem bảng thống kê tổng quan","Theo dõi hoạt động hệ thống"],
    ].map(([id,role,goal,benefit]) =>
      new TableRow({ children:[TC(id,true),TC(role),TC(goal),TC(benefit)] })
    ))
  ]
});

// ── Bảng NFR ─────────────────────────────────────────────────────────────────
const nfrTable = () => new Table({
  width: { size:100, type:WidthType.PERCENTAGE }, borders: fullBorder("BFBFBF"),
  rows: [
    new TableRow({ tableHeader:true, children:[TH("Nhóm"),TH("Yêu cầu"),TH("Thực hiện")] }),
    new TableRow({ children:[TC("Hiệu năng",false,true),TC("API < 500ms; phân trang 10–20 bài/trang"),TC("Index trên status, category_id, author_id")] }),
    new TableRow({ children:[TC("Bảo mật",false,true),TC("Mật khẩu bcrypt; JWT 7 ngày; blacklist token; route phân quyền admin"),TC("middleware verifyToken, checkAdmin")] }),
    new TableRow({ children:[TC("Bảo mật",false,true),TC("OAuth 2.0 Google & Facebook; không lưu mật khẩu OAuth"),TC("passport-google-oauth20, passport-facebook")] }),
    new TableRow({ children:[TC("UX",false,true),TC("Giao diện responsive; loading state; toast thông báo"),TC("CSS custom, React Context")] }),
    new TableRow({ children:[TC("SEO",false,true),TC("Meta title/description, Open Graph image khi share MXH"),TC("Slug URL, thumbnail OG tag")] }),
    new TableRow({ children:[TC("Mở rộng",false,true),TC("Kiến trúc phân lớp Controller–Model–Route"),TC("Cấu trúc thư mục module hoá")] }),
    new TableRow({ children:[TC("Lưu trữ",false,true),TC("Ảnh lưu Cloudinary; DB chỉ lưu URL"),TC("Multer + Cloudinary storage")] }),
  ]
});

// ── Bảng DB ──────────────────────────────────────────────────────────────────
const dbTable = () => new Table({
  width: { size:100, type:WidthType.PERCENTAGE }, borders: fullBorder("BFBFBF"),
  rows: [
    new TableRow({ tableHeader:true, children:[TH("Bảng"),TH("Các trường chính"),TH("Mục đích")] }),
    new TableRow({ children:[TC("users",false,true),TC("id(PK), username, email, password, full_name, avatar_url, role_id, created_at"),TC("Tài khoản. role_id: 1=admin, 2=user")] }),
    new TableRow({ children:[TC("categories",false,true),TC("id(PK), name, slug, created_at"),TC("11 chuyên mục bài viết")] }),
    new TableRow({ children:[TC("posts",false,true),TC("id(PK), title, slug, content, thumbnail, status, views, average_rating, category_id(FK), author_id(FK)"),TC("Bài viết; slug SEO; status kiểm soát xuất bản")] }),
    new TableRow({ children:[TC("comments",false,true),TC("id(PK), content, post_id(FK), user_id(FK), parent_id(FK→self)"),TC("Bình luận đa tầng; parent_id=NULL là gốc")] }),
    new TableRow({ children:[TC("likes",false,true),TC("id(PK), comment_id(FK), user_id(FK); UNIQUE(comment_id,user_id)"),TC("Like bình luận; unique chống trùng")] }),
    new TableRow({ children:[TC("bookmarks",false,true),TC("id(PK), post_id(FK), user_id(FK); UNIQUE(post_id,user_id)"),TC("Lưu bài yêu thích")] }),
    new TableRow({ children:[TC("post_ratings",false,true),TC("id(PK), post_id(FK), user_id(FK), score(1–5); UNIQUE(post_id,user_id)"),TC("Đánh giá sao; average_rating cập nhật vào posts")] }),
    new TableRow({ children:[TC("notifications",false,true),TC("id(PK), user_id(FK), type, message, is_read"),TC("Thông báo nội bộ")] }),
    new TableRow({ children:[TC("reading_history",false,true),TC("id(PK), post_id(FK), user_id(FK), read_at; UNIQUE(post_id,user_id)"),TC("Lịch sử đọc bài")] }),
    new TableRow({ children:[TC("comment_reports",false,true),TC("id(PK), comment_id(FK), user_id(FK), reason"),TC("Báo cáo bình luận vi phạm")] }),
    new TableRow({ children:[TC("token_blacklist",false,true),TC("id(PK), token(TEXT), created_at"),TC("JWT đã đăng xuất (blacklist)")] }),
  ]
});

// ════════════════════════════════════════════════════════════════════════════════
// PHẦN 3.3 – Layout C:
//   1. Bảng tóm tắt 3 luồng (Tên / Vai trò / Mô tả / Kết quả)
//   2. 3 sơ đồ flowchart full-width xếp dọc, mỗi cái có header màu riêng
// ════════════════════════════════════════════════════════════════════════════════

// Bảng tóm tắt 3 luồng
const summaryTable = () => new Table({
  width: { size:100, type:WidthType.PERCENTAGE },
  borders: fullBorder("B0C4DE", 4),
  rows: [
    new TableRow({ tableHeader:true, children:[
      TH("Luồng", "1F4E79"), TH("Tên nghiệp vụ", "1F4E79"),
      TH("Vai trò", "1F4E79"), TH("Kết quả", "1F4E79"),
    ]}),
    new TableRow({ children:[
      TC("1", true, true, "EEF3FA"),
      TC("Xuất bản bài viết", false, false, "EEF3FA"),
      TC("Admin", true, false, "EEF3FA"),
      TC("Bài viết hiển thị trên trang công khai (status = published)", false, false, "EEF3FA"),
    ]}),
    new TableRow({ children:[
      TC("2", true, true, "EDFAF2"),
      TC("Đọc và tương tác", false, false, "EDFAF2"),
      TC("Độc giả", true, false, "EDFAF2"),
      TC("Lưu lịch sử đọc, gửi Notification, cập nhật DB tương tác", false, false, "EDFAF2"),
    ]}),
    new TableRow({ children:[
      TC("3", true, true, "FDF3EE"),
      TC("Đăng nhập OAuth", false, false, "FDF3EE"),
      TC("Người dùng", true, false, "FDF3EE"),
      TC("JWT Token lưu LocalStorage, xác thực thành công", false, false, "FDF3EE"),
    ]}),
  ]
});

// Khối sơ đồ full-width: header màu + ảnh căn giữa + chú thích
const flowBlock = (color, title, buf, figNum, figLabel) => {
  // Header row (1 ô full-width, nền màu)
  const headerRow = new TableRow({ children:[
    new TableCell({
      columnSpan: 1,
      shading: { fill: color, type: ShadingType.CLEAR, color },
      margins: { top:100, bottom:100, left:200, right:200 },
      children: [new Paragraph({
        alignment: AlignmentType.LEFT,
        children: [TNR(title, { bold:true, size:26, color:"FFFFFF" })],
        spacing: { before:60, after:60 },
      })],
    })
  ]});

  // Image row
  const imgRow = new TableRow({ children:[
    new TableCell({
      shading: { fill:"FAFAFA", type:ShadingType.CLEAR, color:"FAFAFA" },
      margins: { top:160, bottom:120, left:200, right:200 },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new ImageRun({ data: buf, transformation:{ width:420, height:560 }, type:"png" })],
          spacing: { after:80 },
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [TNR(`${figNum} – ${figLabel}`, { italics:true, size:21, color:"606060" })],
          spacing: { after:100 },
        }),
      ],
    })
  ]});

  return new Table({
    width: { size:100, type:WidthType.PERCENTAGE },
    borders: outerOnly(color, 8),
    rows: [headerRow, imgRow],
  });
};

// ── Build document ────────────────────────────────────────────────────────────
const doc = new Document({
  styles:{
    default:{ document:{ run:{ font:"Times New Roman", size:24 } } },
    paragraphStyles:[
      { id:"Heading1", name:"Heading 1", basedOn:"Normal", next:"Normal",
        run:{ bold:true, size:28, font:"Times New Roman", color:"1F4E79" },
        paragraph:{ spacing:{ before:400, after:200 } } },
      { id:"Heading2", name:"Heading 2", basedOn:"Normal", next:"Normal",
        run:{ bold:true, size:26, font:"Times New Roman", color:"2E74B5" },
        paragraph:{ spacing:{ before:280, after:120 } } },
    ]
  },
  sections:[{
    properties:{ page:{ margin:{
      top:convertInchesToTwip(1), bottom:convertInchesToTwip(1),
      left:convertInchesToTwip(1.25), right:convertInchesToTwip(1),
    }}},
    children:[
      // Trang bìa chương
      new Paragraph({ children:[TNR("CHƯƠNG 3",{ bold:true, size:40, color:"1F4E79" })], alignment:AlignmentType.CENTER, spacing:{ before:600, after:200 } }),
      new Paragraph({ children:[TNR("PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG",{ bold:true, size:30, color:"2E74B5" })], alignment:AlignmentType.CENTER, spacing:{ after:600 } }),

      // 3.1
      h1("CHƯƠNG 3. PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG"),
      h2("3.1. Yêu cầu chức năng (User Stories)"),
      p('Các yêu cầu chức năng theo mẫu: "Là một [vai trò], tôi muốn [mục tiêu] để [lợi ích]". Nhóm theo 4 module: Xác thực, Đọc tin, Tương tác, Quản trị.'),
      emp(), userStoryTable(), emp(),

      // 3.2
      h2("3.2. Yêu cầu phi chức năng"),
      p("Các yêu cầu phi chức năng đảm bảo hệ thống hoạt động ổn định, an toàn và thân thiện người dùng."),
      emp(), nfrTable(), emp(),

      // ── 3.3 ──────────────────────────────────────────────────────────────────
      h2("3.3. Luồng nghiệp vụ và sơ đồ Use Case"),
      p("Hệ thống bao gồm 3 luồng nghiệp vụ chính. Bảng dưới tóm tắt từng luồng, tiếp theo là sơ đồ Flowchart chi tiết cho từng luồng."),
      emp(),

      // Bảng tóm tắt
      summaryTable(),
      emp(),

      // Flowchart Luồng 1
      flowBlock("1F4E79",
        "  Sơ đồ Luồng 1 – Xuất bản bài viết (Admin)",
        f1, "Hình 3.1", "Flowchart luồng Xuất bản bài viết"
      ),
      emp(),

      // Flowchart Luồng 2
      flowBlock("1E6B3A",
        "  Sơ đồ Luồng 2 – Đọc và tương tác (Độc giả)",
        f2, "Hình 3.2", "Flowchart luồng Đọc và tương tác"
      ),
      emp(),

      // Flowchart Luồng 3
      flowBlock("B84C00",
        "  Sơ đồ Luồng 3 – Đăng nhập OAuth (Google / Facebook)",
        f3, "Hình 3.3", "Flowchart luồng Đăng nhập OAuth"
      ),
      emp(),

      // 3.4
      h2("3.4. Thiết kế kiến trúc hệ thống"),
      p("Hệ thống áp dụng kiến trúc Client–Server 3 lớp tách biệt hoàn toàn:"),
      bl("Frontend (React/Vite – Port 5173): Home, CategoryPage, PostDetail, SearchPage, AuthPage, ProfilePage, DatBaoPage và Admin Panel. Giao tiếp Backend qua REST API JSON."),
      bl("Backend (Node.js/Express – Port 3000): Routes → Controllers → Models → Database. Xử lý JWT, OAuth 2.0 (Passport.js), upload ảnh (Multer + Cloudinary)."),
      bl("Lớp dữ liệu (MySQL): 11 bảng, kết nối qua mysql2. Ảnh lưu Cloudinary CDN, DB chỉ lưu URL."),
      emp(),

      // 3.5
      h2("3.5. Thiết kế cơ sở dữ liệu"),
      p("Cơ sở dữ liệu MySQL tên blog_database gồm 11 bảng, charset utf8mb4, engine InnoDB hỗ trợ khóa ngoại và transaction."),
      emp(), dbTable(), emp(),
      p("Nguyên tắc thiết kế:"),
      bl("AUTO_INCREMENT PK trên tất cả bảng."),
      bl("UNIQUE constraint kép (post_id+user_id) ngăn dữ liệu trùng ở tầng DB."),
      bl("ON DELETE CASCADE đảm bảo toàn vẹn: xóa bài → tự xóa comments, bookmarks, ratings."),
      bl("INDEX trên status, category_id, author_id, user_id, is_read tăng tốc SELECT."),
      bl("Slug VARCHAR UNIQUE trên posts cho URL thân thiện SEO."),
      emp(),

      // 3.6
      h2("3.6. Thiết kế giao diện người dùng"),
      p("Giao diện phong cách báo điện tử chuyên nghiệp (Thanh Niên, VnExpress), CSS thuần, responsive mobile-first."),
      emp(),
      bv("Trang chủ (Home): ","Header Mega Menu 11 chuyên mục, banner tin nổi bật, lưới bài theo danh mục, sidebar tin mới, Footer."),
      bv("Trang danh mục (CategoryPage): ","Layout 2 cột (danh sách bài + sidebar), phân trang."),
      bv("Trang chi tiết (PostDetail): ","Nội dung đầy đủ, đánh giá sao, bình luận đa tầng, Bookmark, Chia sẻ."),
      bv("Đăng nhập / Đăng ký (AuthPage): ","Form validation, nút OAuth Google/Facebook, chuyển tab mượt."),
      bv("Tìm kiếm (SearchPage): ","Tìm kiếm nâng cao, highlight từ khóa, lọc theo danh mục."),
      bv("Hồ sơ cá nhân (ProfilePage): ","Tab Thông tin, Bookmarks, Lịch sử đọc, Thông báo."),
      bv("Admin CMS (NewsManager + NewsEditor): ","Danh sách bài có tìm kiếm/lọc; Rich Text Editor, upload ảnh bìa."),
      emp(),
    ]
  }]
});

const out = path.join(__dirname, "..", "Chuong3_Final.docx");
Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(out, buf);
  console.log("✅ Đã tạo:", out);
}).catch(e => console.error("❌", e));
