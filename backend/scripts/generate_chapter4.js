const {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, Table, TableRow, TableCell, WidthType,
  BorderStyle, ShadingType, VerticalAlign, convertInchesToTwip,
} = require("docx");
const fs = require("fs"), path = require("path");

const h1 = t => new Paragraph({ text: t, heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } });
const h2 = t => new Paragraph({ text: t, heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 140 } });
const p  = (t, o={}) => new Paragraph({ children:[new TextRun({text:t,font:"Times New Roman",size:24,...o})], spacing:{after:120}, alignment:AlignmentType.JUSTIFIED });
const bl = (t,lv=0) => new Paragraph({ children:[new TextRun({text:t,font:"Times New Roman",size:24})], bullet:{level:lv}, spacing:{after:80}, alignment:AlignmentType.JUSTIFIED });
const bv = (label,val) => new Paragraph({ children:[new TextRun({text:label,bold:true,font:"Times New Roman",size:24}),new TextRun({text:val,font:"Times New Roman",size:24})], spacing:{after:110}, alignment:AlignmentType.JUSTIFIED });
const emp = () => new Paragraph({ text:"", spacing:{after:80} });
const code = (t) => new Paragraph({ children:[new TextRun({text:t,font:"Courier New",size:20,color:"1F4E79"})], spacing:{after:60}, shading:{fill:"F2F2F2",type:ShadingType.CLEAR,color:"F2F2F2"}, indent:{left:360} });

const TB = {top:{style:BorderStyle.SINGLE,size:1,color:"BFBFBF"},bottom:{style:BorderStyle.SINGLE,size:1,color:"BFBFBF"},left:{style:BorderStyle.SINGLE,size:1,color:"BFBFBF"},right:{style:BorderStyle.SINGLE,size:1,color:"BFBFBF"},insideH:{style:BorderStyle.SINGLE,size:1,color:"BFBFBF"},insideV:{style:BorderStyle.SINGLE,size:1,color:"BFBFBF"}};
const TH = (t,fill="1F4E79") => new TableCell({children:[new Paragraph({children:[new TextRun({text:t,bold:true,font:"Times New Roman",size:22,color:"FFFFFF"})],alignment:AlignmentType.CENTER,spacing:{before:80,after:80}})],shading:{fill,type:ShadingType.CLEAR,color:fill},verticalAlign:VerticalAlign.CENTER,margins:{top:80,bottom:80,left:120,right:120}});
const TC = (t,ctr=false,bold=false) => new TableCell({children:[new Paragraph({children:[new TextRun({text:t,font:"Times New Roman",size:22,bold})],alignment:ctr?AlignmentType.CENTER:AlignmentType.JUSTIFIED,spacing:{before:60,after:60}})],verticalAlign:VerticalAlign.CENTER,margins:{top:80,bottom:80,left:120,right:120}});

const imgBox = label => new Table({
  width:{size:100,type:WidthType.PERCENTAGE},
  borders:{top:{style:BorderStyle.DASHED,size:2,color:"2E74B5"},bottom:{style:BorderStyle.DASHED,size:2,color:"2E74B5"},left:{style:BorderStyle.DASHED,size:2,color:"2E74B5"},right:{style:BorderStyle.DASHED,size:2,color:"2E74B5"},insideH:{style:BorderStyle.NONE,size:0},insideV:{style:BorderStyle.NONE,size:0}},
  rows:[new TableRow({children:[new TableCell({children:[new Paragraph({children:[new TextRun({text:"📷  "+label,font:"Times New Roman",size:22,color:"595959",italics:true})],alignment:AlignmentType.CENTER,spacing:{before:500,after:500}})],shading:{fill:"EBF3FB",type:ShadingType.CLEAR,color:"EBF3FB"},margins:{top:200,bottom:200,left:200,right:200}})]})]
});

const techTable = () => new Table({ width:{size:100,type:WidthType.PERCENTAGE}, borders:TB, rows:[
  new TableRow({tableHeader:true, children:[TH("Nhóm"),TH("Công nghệ / Thư viện"),TH("Phiên bản"),TH("Mục đích")]}),
  new TableRow({children:[TC("Frontend",false,true),TC("React"),TC("^18",true),TC("UI framework component-based")]}),
  new TableRow({children:[TC("Frontend",false,true),TC("Vite"),TC("^5",true),TC("Build tool, dev server tốc độ cao")]}),
  new TableRow({children:[TC("Frontend",false,true),TC("React Router DOM"),TC("^6",true),TC("Điều hướng SPA")]}),
  new TableRow({children:[TC("Frontend",false,true),TC("CSS thuần (custom)"),TC("—",true),TC("Styling, responsive, animation")]}),
  new TableRow({children:[TC("Backend",false,true),TC("Node.js"),TC("^20",true),TC("Runtime JavaScript phía server")]}),
  new TableRow({children:[TC("Backend",false,true),TC("Express.js"),TC("^5",true),TC("HTTP framework, routing")]}),
  new TableRow({children:[TC("Backend",false,true),TC("jsonwebtoken"),TC("^9",true),TC("Tạo và xác thực JWT")]}),
  new TableRow({children:[TC("Backend",false,true),TC("bcryptjs"),TC("^3",true),TC("Mã hóa mật khẩu")]}),
  new TableRow({children:[TC("Backend",false,true),TC("passport + passport-google-oauth20 + passport-facebook"),TC("^0.7",true),TC("OAuth 2.0 Google & Facebook")]}),
  new TableRow({children:[TC("Backend",false,true),TC("multer + multer-storage-cloudinary"),TC("^2",true),TC("Upload ảnh lên Cloudinary")]}),
  new TableRow({children:[TC("Backend",false,true),TC("cloudinary"),TC("^2",true),TC("CDN lưu trữ ảnh đám mây")]}),
  new TableRow({children:[TC("Backend",false,true),TC("mysql2"),TC("^3",true),TC("Kết nối MySQL, hỗ trợ Promise API")]}),
  new TableRow({children:[TC("Backend",false,true),TC("express-session + nodemon"),TC("^1",true),TC("Session OAuth / hot reload dev")]}),
  new TableRow({children:[TC("Database",false,true),TC("MySQL"),TC("^8",true),TC("Hệ quản trị CSDL quan hệ")]}),
  new TableRow({children:[TC("IDE / Tool",false,true),TC("VS Code, MySQL Workbench, Postman"),TC("latest",true),TC("Lập trình, quản lý DB, test API")]}),
  new TableRow({children:[TC("OS",false,true),TC("Windows 11"),TC("—",true),TC("Môi trường phát triển")]}),
]});

const apiTable = () => new Table({ width:{size:100,type:WidthType.PERCENTAGE}, borders:TB, rows:[
  new TableRow({tableHeader:true, children:[TH("Method"),TH("Endpoint"),TH("Auth"),TH("Mô tả")]}),
  new TableRow({children:[TC("POST",true),TC("/api/auth/register"),TC("Public"),TC("Đăng ký tài khoản mới")]}),
  new TableRow({children:[TC("POST",true),TC("/api/auth/login"),TC("Public"),TC("Đăng nhập, trả JWT")]}),
  new TableRow({children:[TC("POST",true),TC("/api/auth/logout"),TC("JWT"),TC("Đăng xuất, blacklist token")]}),
  new TableRow({children:[TC("GET",true),TC("/api/auth/me"),TC("JWT"),TC("Lấy thông tin user hiện tại")]}),
  new TableRow({children:[TC("GET",true),TC("/auth/google"),TC("Public"),TC("Khởi động OAuth Google")]}),
  new TableRow({children:[TC("GET",true),TC("/api/posts"),TC("Public"),TC("Danh sách bài đã đăng (phân trang)")]}),
  new TableRow({children:[TC("GET",true),TC("/api/posts/:id"),TC("Public"),TC("Chi tiết bài viết (tăng view)")]}),
  new TableRow({children:[TC("POST",true),TC("/api/posts"),TC("Admin"),TC("Tạo bài viết mới")]}),
  new TableRow({children:[TC("PUT",true),TC("/api/posts/:id"),TC("Admin"),TC("Cập nhật bài viết")]}),
  new TableRow({children:[TC("DELETE",true),TC("/api/posts/:id"),TC("Admin"),TC("Xóa bài viết + cascade")]}),
  new TableRow({children:[TC("POST",true),TC("/api/posts/:id/clone"),TC("Admin"),TC("Nhân bản bài viết (status=draft)")]}),
  new TableRow({children:[TC("GET",true),TC("/api/categories"),TC("Public"),TC("Danh sách chuyên mục")]}),
  new TableRow({children:[TC("GET",true),TC("/api/comments/:postId"),TC("Public"),TC("Bình luận theo bài (đa tầng)")]}),
  new TableRow({children:[TC("POST",true),TC("/api/comments"),TC("JWT"),TC("Đăng bình luận / reply")]}),
  new TableRow({children:[TC("POST",true),TC("/api/bookmarks"),TC("JWT"),TC("Toggle bookmark bài viết")]}),
  new TableRow({children:[TC("POST",true),TC("/api/ratings"),TC("JWT"),TC("Đánh giá sao bài viết")]}),
  new TableRow({children:[TC("GET",true),TC("/api/notifications"),TC("JWT"),TC("Lấy danh sách thông báo")]}),
  new TableRow({children:[TC("POST",true),TC("/api/upload"),TC("Admin"),TC("Upload ảnh → Cloudinary URL")]}),
]});

const testTable = () => new Table({ width:{size:100,type:WidthType.PERCENTAGE}, borders:TB, rows:[
  new TableRow({tableHeader:true, children:[TH("TC#"),TH("Chức năng"),TH("Dữ liệu đầu vào"),TH("Kết quả mong đợi"),TH("Kết quả")]}),
  new TableRow({children:[TC("TC-01",true),TC("Đăng ký"),TC("username, email, password hợp lệ"),TC("200 OK, userId trả về"),TC("✅ Đạt")]}),
  new TableRow({children:[TC("TC-02",true),TC("Đăng ký trùng"),TC("email đã tồn tại"),TC("400 – User/email đã tồn tại"),TC("✅ Đạt")]}),
  new TableRow({children:[TC("TC-03",true),TC("Đăng nhập"),TC("username + password đúng"),TC("200 OK, JWT token"),TC("✅ Đạt")]}),
  new TableRow({children:[TC("TC-04",true),TC("Đăng nhập sai"),TC("password sai"),TC("400 – Sai mật khẩu"),TC("✅ Đạt")]}),
  new TableRow({children:[TC("TC-05",true),TC("Tạo bài viết"),TC("Admin + tiêu đề + nội dung"),TC("201, postId trả về"),TC("✅ Đạt")]}),
  new TableRow({children:[TC("TC-06",true),TC("Tạo bài không auth"),TC("Không có JWT"),TC("401 Unauthorized"),TC("✅ Đạt")]}),
  new TableRow({children:[TC("TC-07",true),TC("Xem danh sách bài"),TC("GET /api/posts?page=1"),TC("Array bài published"),TC("✅ Đạt")]}),
  new TableRow({children:[TC("TC-08",true),TC("Chi tiết bài viết"),TC("GET /api/posts/:id hợp lệ"),TC("Object bài + tăng view"),TC("✅ Đạt")]}),
  new TableRow({children:[TC("TC-09",true),TC("Bookmark toggle"),TC("POST /api/bookmarks (đã bookmark)"),TC("Xóa bookmark (toggle)"),TC("✅ Đạt")]}),
  new TableRow({children:[TC("TC-10",true),TC("Đánh giá sao"),TC("score=5, post đã đánh giá"),TC("Cập nhật average_rating"),TC("✅ Đạt")]}),
  new TableRow({children:[TC("TC-11",true),TC("Bình luận"),TC("content, post_id, user đăng nhập"),TC("Comment thêm vào DB"),TC("✅ Đạt")]}),
  new TableRow({children:[TC("TC-12",true),TC("Reply đa tầng"),TC("parent_id=commentId"),TC("Reply lồng đúng cấp"),TC("✅ Đạt")]}),
  new TableRow({children:[TC("TC-13",true),TC("Upload ảnh"),TC("File JPG < 5MB"),TC("Cloudinary URL trả về"),TC("✅ Đạt")]}),
  new TableRow({children:[TC("TC-14",true),TC("OAuth Google"),TC("Tài khoản Google hợp lệ"),TC("JWT + redirect /oauth-callback"),TC("✅ Đạt")]}),
  new TableRow({children:[TC("TC-15",true),TC("Tìm kiếm"),TC("keyword='công nghệ'"),TC("Danh sách bài khớp từ khóa"),TC("✅ Đạt")]}),
]});

const doc = new Document({
  styles:{ default:{ document:{ run:{ font:"Times New Roman", size:24 } } },
    paragraphStyles:[
      {id:"Heading1",name:"Heading 1",basedOn:"Normal",next:"Normal",run:{bold:true,size:28,font:"Times New Roman",color:"1F4E79"},paragraph:{spacing:{before:400,after:200}}},
      {id:"Heading2",name:"Heading 2",basedOn:"Normal",next:"Normal",run:{bold:true,size:26,font:"Times New Roman",color:"2E74B5"},paragraph:{spacing:{before:280,after:120}}},
    ]
  },
  sections:[{ properties:{ page:{ margin:{ top:convertInchesToTwip(1),bottom:convertInchesToTwip(1),left:convertInchesToTwip(1.25),right:convertInchesToTwip(1) } } },
    children:[
      new Paragraph({children:[new TextRun({text:"CHƯƠNG 4",bold:true,font:"Times New Roman",size:40,color:"1F4E79"})],alignment:AlignmentType.CENTER,spacing:{before:600,after:200}}),
      new Paragraph({children:[new TextRun({text:"CÀI ĐẶT VÀ TRIỂN KHAI HỆ THỐNG",bold:true,font:"Times New Roman",size:30,color:"2E74B5"})],alignment:AlignmentType.CENTER,spacing:{after:600}}),

      // 4.1
      h1("CHƯƠNG 4. CÀI ĐẶT VÀ TRIỂN KHAI HỆ THỐNG"),
      h2("4.1. Môi trường phát triển và công nghệ sử dụng"),
      p("Hệ thống được xây dựng theo kiến trúc tách biệt Frontend – Backend – Database, mỗi lớp sử dụng bộ công nghệ chuyên biệt:"),
      emp(), techTable(), emp(),

      // 4.2
      h2("4.2. Cài đặt Frontend"),
      p("Cấu trúc thư mục Frontend:", {bold:true}),
      code("frontend/"),
      code("├── src/"),
      code("│   ├── components/       # Header, Footer, PostCard, CommentSection"),
      code("│   ├── pages/            # Home, PostDetail, CategoryPage, SearchPage,"),
      code("│   │                     # AuthPage, ProfilePage, DatBaoPage, StaticPage"),
      code("│   ├── pages/admin/      # Dashboard, NewsManager, NewsEditor,"),
      code("│   │                     # PostsManager, CategoriesManager, UsersManager"),
      code("│   ├── context/          # AuthContext.jsx – quản lý state đăng nhập"),
      code("│   ├── services/         # api.js – axios instance, interceptors"),
      code("│   ├── index.css         # Design tokens, global styles"),
      code("│   └── App.jsx           # Routing (React Router v6)"),
      code("├── vite.config.js"),
      code("└── package.json"),
      emp(),
      p("Các điểm nhấn kỹ thuật Frontend:", {bold:true}),
      bl("AuthContext: Lưu trữ token và thông tin user trong localStorage, cung cấp hàm login/logout toàn ứng dụng qua React Context. Mọi component con đều có thể gọi useAuth() để truy cập trạng thái đăng nhập."),
      bl("React Router v6: Phân chia 2 layout riêng biệt – MainLayout (có Header/Footer) và AdminLayout (sidebar quản trị). Route /admin/* yêu cầu role_id=1 để truy cập."),
      bl("Validate phía client: Form đăng ký kiểm tra username không khoảng trắng, email đúng định dạng, password ≥ 6 ký tự trước khi gọi API. NewsEditor kiểm tra tiêu đề và nội dung bắt buộc."),
      bl("Responsive Design: CSS thuần với flexbox/grid, breakpoints tại 768px và 1024px. Mega Menu chuyển sang mobile menu dạng accordion trên màn hình nhỏ."),
      bl("Tối ưu UX: Loading skeleton khi chờ API, toast notification sau mỗi hành động, lazy render bình luận reply theo từng cấp."),
      emp(),
      p("Minh họa giao diện Frontend:", {bold:true}), emp(),
      imgBox("[Chèn ảnh chụp màn hình Trang chủ (Home) tại đây]"), emp(),
      imgBox("[Chèn ảnh chụp màn hình Admin NewsEditor tại đây]"), emp(),

      // 4.3
      h2("4.3. Cài đặt Backend và API"),
      p("Cấu trúc Backend:", {bold:true}),
      code("backend/"),
      code("├── app.js               # Entry point, mount routes"),
      code("├── config/"),
      code("│   ├── db.js            # Kết nối MySQL (mysql2)"),
      code("│   └── passport.js      # Cấu hình Google/Facebook OAuth"),
      code("├── controllers/         # authController, postController, commentController..."),
      code("├── middleware/          # verifyToken.js, checkAdmin.js"),
      code("├── routes/              # auth, post, category, comment, bookmark..."),
      code("├── utils/               # Helper functions"),
      code("└── .env                 # Biến môi trường"),
      emp(),
      p("Middleware xác thực JWT (verifyToken.js):", {bold:true}),
      code("const jwt = require('jsonwebtoken');"),
      code("const db  = require('../config/db');"),
      code("module.exports = (req, res, next) => {"),
      code("  const token = req.headers.authorization?.split(' ')[1];"),
      code("  if (!token) return res.status(401).json({ msg: 'Thiếu token' });"),
      code("  // Kiểm tra blacklist"),
      code("  db.query('SELECT id FROM token_blacklist WHERE token=?',[token],(err,r)=>{"),
      code("    if (r && r.length>0) return res.status(401).json({msg:'Token đã hết hạn'});"),
      code("    const decoded = jwt.verify(token, process.env.JWT_SECRET);"),
      code("    req.user = decoded; next();"),
      code("  });"),
      code("};"),
      emp(),
      p("Luồng tạo bài viết (postController.createPost):", {bold:true}),
      code("exports.createPost = (req, res) => {"),
      code("  const { title, content, category_id, thumbnail, status } = req.body;"),
      code("  const slug = createSlug(title) + '-' + Date.now(); // SEO-friendly"),
      code("  db.query(`INSERT INTO posts (title,content,slug,category_id,"),
      code("           author_id,thumbnail,status) VALUES (?,?,?,?,?,?,?)`,"),
      code("    [title,content,slug,category_id,req.user.id,thumbnail,status||'draft'],"),
      code("    (err,result) => res.json({msg:'Tạo thành công',postId:result.insertId})"),
      code("  );"),
      code("};"),
      emp(),
      p("Bảng API chính của hệ thống:", {bold:true}), emp(),
      apiTable(), emp(),

      // 4.4
      h2("4.4. Cài đặt và tối ưu cơ sở dữ liệu"),
      p("Kết nối MySQL qua mysql2 (config/db.js):", {bold:true}),
      code("const mysql = require('mysql2');"),
      code("const db = mysql.createConnection({"),
      code("  host: process.env.DB_HOST,"),
      code("  user: process.env.DB_USER,"),
      code("  password: process.env.DB_PASS,"),
      code("  database: process.env.DB_NAME,"),
      code("  charset: 'utf8mb4'"),
      code("});"),
      code("db.connect(err => { if(err) throw err; console.log('DB connected'); });"),
      code("module.exports = db;"),
      emp(),
      p("Các tối ưu đã thực hiện:", {bold:true}),
      bl("Index tự động: PRIMARY KEY AUTO_INCREMENT trên tất cả bảng; UNIQUE KEY trên username, email (users), slug (posts), tổ hợp khóa (post_id,user_id) trên bookmarks, post_ratings, reading_history."),
      bl("Index thường: KEY idx_posts_status(status), idx_posts_category(category_id), idx_posts_author(author_id), idx_comments_post(post_id), idx_notif_user(user_id), idx_notif_read(is_read) – tăng tốc các truy vấn lọc thường gặp."),
      bl("ON DELETE CASCADE: Xóa bài viết → tự xóa comments, bookmarks, ratings, reading_history. Xóa comment → tự xóa likes, reports, replies con."),
      bl("Phân trang: API /api/posts nhận tham số ?page=&limit= (mặc định 10 bài/trang), dùng LIMIT/OFFSET tránh tải toàn bộ dữ liệu."),
      bl("Charset utf8mb4 + collation utf8mb4_0900_ai_ci: Hỗ trợ tiếng Việt đầy đủ dấu và emoji, tránh lỗi encoding."),
      bl("Parameterized query: Toàn bộ truy vấn dùng dấu ? và mảng tham số, phòng chống SQL Injection."),
      emp(),

      // 4.5
      h2("4.5. Kiểm thử và đảm bảo chất lượng"),
      p("Nhóm thực hiện kiểm thử thủ công (manual testing) theo từng sprint, sử dụng Postman để test API và trình duyệt để test giao diện. Tổng cộng 15 test case chính:"),
      emp(), testTable(), emp(),
      p("Một số lỗi đã phát hiện và khắc phục:", {bold:true}),
      bl("Lỗi CORS: Frontend port 5173 bị chặn bởi Backend port 3000 → Thêm cấu hình cors({ origin: process.env.FRONTEND_URL, credentials: true }) vào app.js."),
      bl("Lỗi JWT sau OAuth: Token không được gửi đúng header → Chuẩn hóa /oauth-callback xử lý token từ query param và lưu vào localStorage."),
      bl("Lỗi encoding tiếng Việt trong slug: Ký tự đặc biệt gây lỗi URL → Bổ sung hàm createSlug() chuẩn hóa NFD, loại dấu, thay khoảng trắng bằng gạch ngang."),
      bl("Lỗi xóa bài viết có FK: DELETE trực tiếp bị lỗi constraint → Chuyển sang xóa cascade thủ công theo thứ tự: comments → bookmarks → ratings → history → posts."),
      bl("Avatar Cloudinary bị lỗi HTTPS: URL trả về dạng http → Thêm secure: true vào cấu hình Cloudinary."),
      emp(),

      // 4.6
      h2("4.6. Triển khai (Deploy)"),
      p("Trong phạm vi môn học, hệ thống được chạy trên môi trường local (localhost). Chưa triển khai lên server thực tế do giới hạn về chi phí hosting và thời gian."),
      emp(),
      p("Hướng dẫn chạy hệ thống (Local):", {bold:true}),
      bv("Bước 1 – Cài đặt MySQL: ","Tạo database blog_database, chạy file database.sql để tạo bảng và dữ liệu mẫu."),
      bv("Bước 2 – Cấu hình Backend: ","Tạo file .env trong thư mục backend với các biến: DB_HOST, DB_USER, DB_PASS, DB_NAME, JWT_SECRET, CLOUDINARY_NAME/KEY/SECRET, GOOGLE_CLIENT_ID/SECRET, FACEBOOK_APP_ID/SECRET, FRONTEND_URL=http://localhost:5173."),
      bv("Bước 3 – Chạy Backend: ","cd backend → npm install → npm run dev (nodemon, port 3000)."),
      bv("Bước 4 – Chạy Frontend: ","cd frontend → npm install → npm run dev (Vite, port 5173)."),
      bv("Bước 5 – Truy cập: ","Mở trình duyệt tại http://localhost:5173. Admin: http://localhost:5173/admin."),
      emp(),
      p("Kế hoạch triển khai thực tế (hướng phát triển):", {bold:true}),
      bl("Backend: Deploy lên VPS (Ubuntu) hoặc dịch vụ cloud (Railway, Render, AWS EC2). Dùng PM2 để quản lý process Node.js."),
      bl("Frontend: Build production (npm run build) và deploy tĩnh lên Vercel, Netlify hoặc Nginx."),
      bl("Database: MySQL trên server riêng hoặc dịch vụ quản lý như PlanetScale, AWS RDS."),
      bl("CI/CD: Thiết lập GitHub Actions để tự động test và deploy khi push lên nhánh main."),
      bl("Domain & HTTPS: Đăng ký tên miền, cấu hình SSL/TLS qua Let's Encrypt (Certbot)."),
      emp(),
    ]
  }]
});

const out = path.join(__dirname, "..", "Chuong4_CaiDat_TrienKhai_VDKP.docx");
Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(out, buf);
  console.log("✅ Đã tạo:", out);
}).catch(e => console.error("❌", e));
