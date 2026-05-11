/**
 * Chèn 4 sơ đồ vào Chương 3 Word doc (thay thế các ô placeholder)
 */
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, Table, TableRow, TableCell, WidthType,
  BorderStyle, ShadingType, VerticalAlign, convertInchesToTwip,
  ImageRun,
} = require("docx");
const fs = require("fs"), path = require("path");

// ── image loader ──────────────────────────────────────────────────────────────
const imgDir = "C:\\Users\\ADMIN\\.gemini\\antigravity\\brain\\d8893c17-dc77-4210-b0f9-ba6a5c3ee185";
const loadImg = (name) => {
  const files = fs.readdirSync(imgDir).filter(f => f.startsWith(name));
  if (!files.length) throw new Error("Image not found: " + name);
  files.sort(); // take latest if multiple
  return fs.readFileSync(path.join(imgDir, files[files.length - 1]));
};

const imgPara = (name, w=600, h=400, caption="") => {
  const data = loadImg(name);
  const nodes = [
    new Paragraph({
      children: [new ImageRun({ data, transformation: { width: w, height: h }, type: "png" })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 80 },
    }),
  ];
  if (caption) nodes.push(new Paragraph({
    children: [new TextRun({ text: caption, italics: true, font: "Times New Roman", size: 22, color: "595959" })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
  }));
  return nodes;
};

// ── helpers ───────────────────────────────────────────────────────────────────
const h1 = t => new Paragraph({ text: t, heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } });
const h2 = t => new Paragraph({ text: t, heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 140 } });
const p  = (t, o={}) => new Paragraph({ children:[new TextRun({text:t,font:"Times New Roman",size:24,...o})], spacing:{after:120}, alignment:AlignmentType.JUSTIFIED });
const bl = (t,lv=0) => new Paragraph({ children:[new TextRun({text:t,font:"Times New Roman",size:24})], bullet:{level:lv}, spacing:{after:80}, alignment:AlignmentType.JUSTIFIED });
const bv = (label,val) => new Paragraph({
  children:[new TextRun({text:label,bold:true,font:"Times New Roman",size:24}),
            new TextRun({text:val,font:"Times New Roman",size:24})],
  spacing:{after:110}, alignment:AlignmentType.JUSTIFIED
});
const emp = () => new Paragraph({ text:"", spacing:{after:80} });

// ── table helpers ─────────────────────────────────────────────────────────────
const TB = {top:{style:BorderStyle.SINGLE,size:1,color:"BFBFBF"},bottom:{style:BorderStyle.SINGLE,size:1,color:"BFBFBF"},left:{style:BorderStyle.SINGLE,size:1,color:"BFBFBF"},right:{style:BorderStyle.SINGLE,size:1,color:"BFBFBF"},insideH:{style:BorderStyle.SINGLE,size:1,color:"BFBFBF"},insideV:{style:BorderStyle.SINGLE,size:1,color:"BFBFBF"}};
const TH = (t,fill="1F4E79") => new TableCell({children:[new Paragraph({children:[new TextRun({text:t,bold:true,font:"Times New Roman",size:22,color:"FFFFFF"})],alignment:AlignmentType.CENTER,spacing:{before:80,after:80}})],shading:{fill,type:ShadingType.CLEAR,color:fill},verticalAlign:VerticalAlign.CENTER,margins:{top:80,bottom:80,left:120,right:120}});
const TC = (t,ctr=false,bold=false) => new TableCell({children:[new Paragraph({children:[new TextRun({text:t,font:"Times New Roman",size:22,bold})],alignment:ctr?AlignmentType.CENTER:AlignmentType.JUSTIFIED,spacing:{before:60,after:60}})],verticalAlign:VerticalAlign.CENTER,margins:{top:80,bottom:80,left:120,right:120}});

// ── tables ────────────────────────────────────────────────────────────────────
const userStoryTable = () => new Table({
  width:{size:100,type:WidthType.PERCENTAGE}, borders:TB,
  rows:[
    new TableRow({tableHeader:true,children:[TH("ID"),TH("Vai trò"),TH("Mục tiêu"),TH("Lợi ích")]}),
    new TableRow({children:[TC("US-01",true),TC("Khách"),TC("Đăng ký tài khoản bằng email"),TC("Truy cập tính năng cá nhân hoá")]}),
    new TableRow({children:[TC("US-02",true),TC("Người dùng"),TC("Đăng nhập Google / Facebook"),TC("Tiện lợi, không cần nhớ mật khẩu")]}),
    new TableRow({children:[TC("US-03",true),TC("Người dùng"),TC("Đăng xuất khỏi hệ thống"),TC("Bảo mật tài khoản cá nhân")]}),
    new TableRow({children:[TC("US-04",true),TC("Khách"),TC("Xem danh sách bài báo theo 11 chuyên mục"),TC("Tìm nội dung quan tâm nhanh chóng")]}),
    new TableRow({children:[TC("US-05",true),TC("Khách"),TC("Đọc nội dung chi tiết bài báo"),TC("Nắm thông tin đầy đủ")]}),
    new TableRow({children:[TC("US-06",true),TC("Khách"),TC("Tìm kiếm bài báo theo từ khóa"),TC("Tiết kiệm thời gian tìm nội dung")]}),
    new TableRow({children:[TC("US-07",true),TC("Người dùng"),TC("Lưu bài viết vào Bookmark"),TC("Đọc lại khi thuận tiện")]}),
    new TableRow({children:[TC("US-08",true),TC("Người dùng"),TC("Xem lịch sử bài đã đọc"),TC("Tiếp tục bài còn dang dở")]}),
    new TableRow({children:[TC("US-09",true),TC("Người dùng"),TC("Nhận thông báo khi có reply bình luận"),TC("Theo dõi cuộc hội thoại")]}),
    new TableRow({children:[TC("US-10",true),TC("Người dùng"),TC("Viết bình luận và reply đa tầng"),TC("Trao đổi quan điểm về bài viết")]}),
    new TableRow({children:[TC("US-11",true),TC("Người dùng"),TC("Like bình luận của người khác"),TC("Thể hiện đồng thuận")]}),
    new TableRow({children:[TC("US-12",true),TC("Người dùng"),TC("Đánh giá bài viết 1–5 sao"),TC("Phản hồi chất lượng nội dung")]}),
    new TableRow({children:[TC("US-13",true),TC("Người dùng"),TC("Báo cáo bình luận vi phạm"),TC("Giữ môi trường bình luận lành mạnh")]}),
    new TableRow({children:[TC("US-14",true),TC("Người dùng"),TC("Chia sẻ bài viết qua link chuẩn SEO"),TC("Lan truyền nội dung có preview ảnh trên MXH")]}),
    new TableRow({children:[TC("US-15",true),TC("Admin"),TC("Đăng bài viết mới với Rich Text Editor"),TC("Xuất bản nội dung chất lượng")]}),
    new TableRow({children:[TC("US-16",true),TC("Admin"),TC("Chỉnh sửa và xóa bài viết"),TC("Quản lý nội dung linh hoạt")]}),
    new TableRow({children:[TC("US-17",true),TC("Admin"),TC("Quản lý chuyên mục (CRUD)"),TC("Tổ chức nội dung có cấu trúc")]}),
    new TableRow({children:[TC("US-18",true),TC("Admin"),TC("Xem và xóa bình luận vi phạm"),TC("Kiểm soát chất lượng thảo luận")]}),
    new TableRow({children:[TC("US-19",true),TC("Admin"),TC("Quản lý tài khoản người dùng"),TC("Kiểm soát quyền truy cập")]}),
    new TableRow({children:[TC("US-20",true),TC("Admin"),TC("Xem bảng thống kê tổng quan"),TC("Theo dõi hoạt động hệ thống")]}),
  ]
});

const nfrTable = () => new Table({
  width:{size:100,type:WidthType.PERCENTAGE}, borders:TB,
  rows:[
    new TableRow({tableHeader:true,children:[TH("Nhóm"),TH("Yêu cầu"),TH("Thực hiện")]}),
    new TableRow({children:[TC("Hiệu năng",false,true),TC("API < 500ms; phân trang 10–20 bài/trang"),TC("Index trên status, category_id, author_id")]}),
    new TableRow({children:[TC("Bảo mật",false,true),TC("Mật khẩu bcrypt; JWT 7 ngày; blacklist token khi đăng xuất; route phân quyền admin"),TC("middleware verifyToken, checkAdmin")]}),
    new TableRow({children:[TC("Bảo mật",false,true),TC("OAuth 2.0 Google & Facebook; không lưu mật khẩu OAuth"),TC("passport-google-oauth20, passport-facebook")]}),
    new TableRow({children:[TC("UX",false,true),TC("Giao diện responsive; loading state; toast thông báo"),TC("CSS custom, React Context")]}),
    new TableRow({children:[TC("SEO",false,true),TC("Meta title/description, Open Graph image khi share MXH"),TC("Slug URL, thumbnail OG tag")]}),
    new TableRow({children:[TC("Mở rộng",false,true),TC("Kiến trúc phân lớp Controller–Model–Route"),TC("Cấu trúc thư mục module hoá")]}),
    new TableRow({children:[TC("Lưu trữ",false,true),TC("Ảnh lưu Cloudinary; DB chỉ lưu URL"),TC("Multer + Cloudinary storage")]}),
  ]
});

const dbTable = () => new Table({
  width:{size:100,type:WidthType.PERCENTAGE}, borders:TB,
  rows:[
    new TableRow({tableHeader:true,children:[TH("Bảng"),TH("Các trường chính"),TH("Mục đích")]}),
    new TableRow({children:[TC("users",false,true),TC("id(PK), username, email, password, full_name, avatar_url, role_id, created_at"),TC("Tài khoản. role_id: 1=admin, 2=user")]}),
    new TableRow({children:[TC("categories",false,true),TC("id(PK), name, slug, created_at"),TC("11 chuyên mục bài viết")]}),
    new TableRow({children:[TC("posts",false,true),TC("id(PK), title, slug, content, thumbnail, status(draft/published), views, average_rating, category_id(FK), author_id(FK)"),TC("Bài viết; slug SEO; status kiểm soát xuất bản")]}),
    new TableRow({children:[TC("comments",false,true),TC("id(PK), content, post_id(FK), user_id(FK), parent_id(FK→self)"),TC("Bình luận đa tầng; parent_id=NULL là gốc")]}),
    new TableRow({children:[TC("likes",false,true),TC("id(PK), comment_id(FK), user_id(FK); UNIQUE(comment_id,user_id)"),TC("Like bình luận; unique chống trùng")]}),
    new TableRow({children:[TC("bookmarks",false,true),TC("id(PK), post_id(FK), user_id(FK); UNIQUE(post_id,user_id)"),TC("Lưu bài yêu thích")]}),
    new TableRow({children:[TC("post_ratings",false,true),TC("id(PK), post_id(FK), user_id(FK), score(1–5); UNIQUE(post_id,user_id)"),TC("Đánh giá sao; average_rating cập nhật vào posts")]}),
    new TableRow({children:[TC("notifications",false,true),TC("id(PK), user_id(FK), type, message, is_read"),TC("Thông báo nội bộ")]}),
    new TableRow({children:[TC("reading_history",false,true),TC("id(PK), post_id(FK), user_id(FK), read_at; UNIQUE(post_id,user_id)"),TC("Lịch sử đọc bài")]}),
    new TableRow({children:[TC("comment_reports",false,true),TC("id(PK), comment_id(FK), user_id(FK), reason; UNIQUE(comment_id,user_id)"),TC("Báo cáo bình luận vi phạm")]}),
    new TableRow({children:[TC("token_blacklist",false,true),TC("id(PK), token(TEXT), created_at"),TC("JWT đã đăng xuất (blacklist)")]}),
  ]
});

// ── build doc ─────────────────────────────────────────────────────────────────
const doc = new Document({
  styles:{
    default:{ document:{ run:{ font:"Times New Roman", size:24 } } },
    paragraphStyles:[
      {id:"Heading1",name:"Heading 1",basedOn:"Normal",next:"Normal",run:{bold:true,size:28,font:"Times New Roman",color:"1F4E79"},paragraph:{spacing:{before:400,after:200}}},
      {id:"Heading2",name:"Heading 2",basedOn:"Normal",next:"Normal",run:{bold:true,size:26,font:"Times New Roman",color:"2E74B5"},paragraph:{spacing:{before:280,after:120}}},
    ]
  },
  sections:[{
    properties:{ page:{ margin:{ top:convertInchesToTwip(1),bottom:convertInchesToTwip(1),left:convertInchesToTwip(1.25),right:convertInchesToTwip(1) } } },
    children:[
      // cover
      new Paragraph({children:[new TextRun({text:"CHƯƠNG 3",bold:true,font:"Times New Roman",size:40,color:"1F4E79"})],alignment:AlignmentType.CENTER,spacing:{before:600,after:200}}),
      new Paragraph({children:[new TextRun({text:"PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG",bold:true,font:"Times New Roman",size:30,color:"2E74B5"})],alignment:AlignmentType.CENTER,spacing:{after:600}}),

      // 3.1
      h1("CHƯƠNG 3. PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG"),
      h2("3.1. Yêu cầu chức năng (User Stories)"),
      p('Các yêu cầu chức năng theo mẫu: "Là một [vai trò], tôi muốn [mục tiêu] để [lợi ích]". Nhóm theo 4 module: Xác thực, Đọc tin, Tương tác, Quản trị.'),
      emp(),
      userStoryTable(),
      emp(),

      // 3.2
      h2("3.2. Yêu cầu phi chức năng"),
      p("Các yêu cầu phi chức năng đảm bảo hệ thống hoạt động ổn định, an toàn và thân thiện người dùng trong phạm vi môn học."),
      emp(),
      nfrTable(),
      emp(),

      // 3.3
      h2("3.3. Luồng nghiệp vụ và sơ đồ use case"),
      p("Hệ thống có 3 luồng nghiệp vụ chính:", {bold:true}),
      emp(),
      bv("Luồng 1 – Xuất bản bài viết (Admin): ","Admin đăng nhập → Vào CMS (NewsManager) → Tạo bài mới → Soạn thảo Rich Text (tiêu đề, nội dung, chuyên mục, ảnh bìa) → Chọn Lưu nháp hoặc Xuất bản → Bài hiện trên trang công khai với status='published'."),
      bv("Luồng 2 – Đọc và tương tác (Độc giả): ","Khách truy cập trang chủ → Chọn chuyên mục hoặc tìm kiếm → Đọc bài (hệ thống tăng view) → (Đã đăng nhập) Đánh giá sao, Bình luận/Reply, Like, Bookmark, Chia sẻ → Lưu reading_history, gửi notification."),
      bv("Luồng 3 – Đăng nhập OAuth: ","Nhấn Đăng nhập Google/Facebook → OAuth redirect → Passport.js đổi code lấy profile → Tạo/cập nhật tài khoản DB → Tạo JWT → Redirect /oauth-callback → Lưu token localStorage."),
      emp(),

      p("Sơ đồ Use Case tổng thể:", {bold:true}),
      emp(),
      ...imgPara("usecase_diagram", 620, 480, "Hình 3.1 – Sơ đồ Use Case hệ thống VDKP News Portal"),
      emp(),

      p("Sơ đồ luồng xuất bản bài viết (Flowchart):", {bold:true}),
      emp(),
      ...imgPara("flowchart_publish", 520, 600, "Hình 3.2 – Flowchart luồng Tạo → Duyệt → Đăng tin"),
      emp(),

      // 3.4
      h2("3.4. Thiết kế kiến trúc hệ thống"),
      p("Hệ thống áp dụng kiến trúc Client–Server 3 lớp tách biệt hoàn toàn:"),
      bl("Frontend (React/Vite – Port 5173): Home, CategoryPage, PostDetail, SearchPage, AuthPage, ProfilePage, DatBaoPage, StaticPage và Admin Panel (Dashboard, NewsManager, NewsEditor, PostsManager, CategoriesManager, UsersManager, CommentsManager). Giao tiếp với Backend qua REST API JSON."),
      bl("Backend (Node.js/Express – Port 3000): Routes → Controllers → Models → Database. Xử lý JWT, OAuth 2.0 (Passport.js), upload ảnh (Multer + Cloudinary), toàn bộ logic nghiệp vụ qua 11 API module."),
      bl("Lớp dữ liệu (MySQL): 11 bảng, kết nối qua mysql2. Ảnh lưu Cloudinary CDN, DB chỉ lưu URL."),
      emp(),
      p("Sơ đồ kiến trúc hệ thống:", {bold:true}),
      emp(),
      ...imgPara("architecture_diagram", 640, 460, "Hình 3.3 – Kiến trúc Client–Server–Database của hệ thống"),
      emp(),

      // 3.5
      h2("3.5. Thiết kế cơ sở dữ liệu"),
      p("Cơ sở dữ liệu MySQL tên blog_database gồm 11 bảng, charset utf8mb4, engine InnoDB hỗ trợ khóa ngoại và transaction."),
      emp(),
      dbTable(),
      emp(),
      p("Nguyên tắc thiết kế:"),
      bl("AUTO_INCREMENT PK trên tất cả bảng."),
      bl("UNIQUE constraint kép (post_id+user_id, comment_id+user_id) ngăn dữ liệu trùng ở tầng DB."),
      bl("ON DELETE CASCADE đảm bảo toàn vẹn: xóa bài → tự xóa comments, bookmarks, ratings, history."),
      bl("INDEX trên status, category_id, author_id, user_id, is_read tăng tốc SELECT."),
      bl("Slug VARCHAR UNIQUE trên posts cho URL thân thiện SEO."),
      emp(),
      p("Sơ đồ ERD (Entity-Relationship Diagram):", {bold:true}),
      emp(),
      ...imgPara("erd_diagram", 640, 460, "Hình 3.4 – Sơ đồ ERD cơ sở dữ liệu blog_database"),
      emp(),

      // 3.6
      h2("3.6. Thiết kế giao diện người dùng"),
      p("Giao diện phong cách báo điện tử chuyên nghiệp (Thanh Niên, VnExpress), CSS thuần, responsive mobile-first, design token nhất quán."),
      emp(),
      bv("Trang chủ (Home): ","Header Mega Menu 11 chuyên mục, banner tin nổi bật, lưới bài theo danh mục, sidebar tin mới, Footer."),
      bv("Trang danh mục (CategoryPage): ","Layout 2 cột (danh sách bài + sidebar), phân trang."),
      bv("Trang chi tiết (PostDetail): ","Nội dung đầy đủ, đánh giá sao, bình luận đa tầng, Bookmark, Chia sẻ, bài liên quan."),
      bv("Đăng nhập / Đăng ký (AuthPage): ","Form validation, nút OAuth Google/Facebook, chuyển tab mượt."),
      bv("Tìm kiếm (SearchPage): ","Tìm kiếm nâng cao, highlight từ khóa, lọc theo danh mục."),
      bv("Hồ sơ cá nhân (ProfilePage): ","Tab Thông tin, Bookmarks, Lịch sử đọc, Thông báo."),
      bv("Admin Dashboard: ","Thống kê tổng quan (bài, user, danh mục)."),
      bv("Admin CMS (NewsManager + NewsEditor): ","Danh sách bài có tìm kiếm/lọc; Rich Text Editor, upload ảnh bìa, chọn danh mục, chọn trạng thái."),
      bv("Admin – User & Comment Manager: ","Quản lý quyền người dùng; xóa bình luận vi phạm."),
      emp(),
      p("(Chèn ảnh chụp màn hình giao diện thực tế vào các vị trí tương ứng trong báo cáo)", {italics:true, color:"595959"}),
      emp(),
    ]
  }]
});

const out = path.join(__dirname, "..", "Chuong3_PhanTich_ThietKe_VDKP.docx");
Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(out, buf);
  console.log("✅ Đã tạo:", out);
}).catch(e => console.error("❌", e));
