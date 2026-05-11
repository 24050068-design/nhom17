/**
 * Tạo file DANH_MUC_KY_HIEU.docx
 * Danh mục các ký hiệu và chữ viết tắt dùng trong đề tài VDKP News Portal
 */
const {
  Document, Packer, Paragraph, TextRun,
  AlignmentType, Table, TableRow, TableCell,
  WidthType, BorderStyle, ShadingType, VerticalAlign,
  convertInchesToTwip,
} = require("docx");
const fs = require("fs"), path = require("path");

const TNR = (t, o={}) => new TextRun({ text: t, font: "Times New Roman", size: 24, ...o });
const emp = () => new Paragraph({ text: "", spacing: { after: 100 } });

// ── Dữ liệu viết tắt ─────────────────────────────────────────────────────────
const abbreviations = [
  ["API",     "Application Programming Interface",         "Giao diện lập trình ứng dụng"],
  ["REST",    "Representational State Transfer",           "Kiến trúc truyền tải trạng thái đại diện"],
  ["HTTP",    "HyperText Transfer Protocol",               "Giao thức truyền tải siêu văn bản"],
  ["HTTPS",   "HTTP Secure",                               "HTTP có mã hóa SSL/TLS"],
  ["HTML",    "HyperText Markup Language",                 "Ngôn ngữ đánh dấu siêu văn bản"],
  ["CSS",     "Cascading Style Sheets",                    "Ngôn ngữ định kiểu tầng"],
  ["JS",      "JavaScript",                                "Ngôn ngữ lập trình kịch bản phía client/server"],
  ["JSON",    "JavaScript Object Notation",                "Định dạng trao đổi dữ liệu nhẹ"],
  ["JWT",     "JSON Web Token",                            "Chuẩn xác thực dạng token mã hóa"],
  ["OAuth",   "Open Authorization",                        "Giao thức ủy quyền mở (đăng nhập bên thứ ba)"],
  ["CRUD",    "Create, Read, Update, Delete",              "4 thao tác cơ bản với cơ sở dữ liệu"],
  ["CMS",     "Content Management System",                 "Hệ thống quản lý nội dung"],
  ["SEO",     "Search Engine Optimization",                "Tối ưu hóa công cụ tìm kiếm"],
  ["CDN",     "Content Delivery Network",                  "Mạng phân phối nội dung"],
  ["URL",     "Uniform Resource Locator",                  "Địa chỉ tài nguyên thống nhất"],
  ["UI",      "User Interface",                            "Giao diện người dùng"],
  ["UX",      "User Experience",                           "Trải nghiệm người dùng"],
  ["DB",      "Database",                                  "Cơ sở dữ liệu"],
  ["SQL",     "Structured Query Language",                 "Ngôn ngữ truy vấn có cấu trúc"],
  ["PK",      "Primary Key",                               "Khóa chính trong CSDL"],
  ["FK",      "Foreign Key",                               "Khóa ngoại trong CSDL"],
  ["ERD",     "Entity Relationship Diagram",               "Sơ đồ thực thể – mối quan hệ"],
  ["MVC",     "Model – View – Controller",                 "Mô hình kiến trúc phần mềm 3 lớp"],
  ["npm",     "Node Package Manager",                      "Trình quản lý gói cho Node.js"],
  ["MXH",     "Mạng xã hội",                              "Nền tảng chia sẻ nội dung trực tuyến"],
  ["VDKP",   "Website Tin Tức",                            "Tên mã đề tài – Dự án xây dựng cổng thông tin tin tức trực tuyến"],
];

// ── Bảng viết tắt ─────────────────────────────────────────────────────────────
const BORDER = { style: BorderStyle.SINGLE, size: 4, color: "BFBFBF" };
const borders = { top:BORDER, bottom:BORDER, left:BORDER, right:BORDER, insideH:BORDER, insideV:BORDER };

const hdrCell = (text, w) => new TableCell({
  width: { size: w, type: WidthType.PERCENTAGE },
  shading: { fill: "1F4E79", type: ShadingType.CLEAR, color: "1F4E79" },
  margins: { top:100, bottom:100, left:140, right:140 },
  verticalAlign: VerticalAlign.CENTER,
  children: [new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [TNR(text, { bold:true, size:22, color:"FFFFFF" })],
    spacing: { before:60, after:60 },
  })],
});

const dataCell = (text, w, ctr=false, fill="FFFFFF") => new TableCell({
  width: { size: w, type: WidthType.PERCENTAGE },
  shading: { fill, type: ShadingType.CLEAR, color: fill },
  margins: { top:80, bottom:80, left:140, right:140 },
  verticalAlign: VerticalAlign.CENTER,
  children: [new Paragraph({
    alignment: ctr ? AlignmentType.CENTER : AlignmentType.JUSTIFIED,
    children: [TNR(text, { size:22 })],
    spacing: { before:60, after:60 },
  })],
});

const abbrevTable = () => new Table({
  width: { size:100, type:WidthType.PERCENTAGE },
  borders,
  rows: [
    new TableRow({ tableHeader:true, children:[
      hdrCell("Ký hiệu / Viết tắt", 15),
      hdrCell("Tên đầy đủ (Tiếng Anh / Tiếng Việt)", 48),
      hdrCell("Giải thích", 37),
    ]}),
    ...abbreviations.map(([abbr, full, explain], i) => {
      const fill = i % 2 === 0 ? "FFFFFF" : "F5F8FC";
      return new TableRow({ children:[
        dataCell(abbr, 15, true, fill),
        dataCell(full, 48, false, fill),
        dataCell(explain, 37, false, fill),
      ]});
    }),
  ],
});

// ── Build document ────────────────────────────────────────────────────────────
const doc = new Document({
  styles:{
    default:{ document:{ run:{ font:"Times New Roman", size:24 } } },
  },
  sections:[{
    properties:{ page:{ margin:{
      top:convertInchesToTwip(1), bottom:convertInchesToTwip(1),
      left:convertInchesToTwip(1.25), right:convertInchesToTwip(1),
    }}},
    children:[
      // Tiêu đề trang
      new Paragraph({
        children: [TNR("DANH MỤC CÁC KÝ HIỆU, CÁC CHỮ VIẾT TẮT", { bold:true, size:28, color:"1F4E79" })],
        alignment: AlignmentType.CENTER,
        spacing: { before:200, after:400 },
      }),

      // Ghi chú
      new Paragraph({
        children: [TNR("Bảng dưới đây liệt kê các ký hiệu, chữ viết tắt được sử dụng trong đề tài theo thứ tự bảng chữ cái. Các thuật ngữ tiếng Anh được giữ nguyên theo quy ước chuyên ngành.", { italics:true, size:22, color:"505050" })],
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after:200 },
      }),
      emp(),

      // Bảng
      abbrevTable(),
      emp(),
    ]
  }]
});

const out = path.join(__dirname, "..", "DanhMuc_KyHieu_ChuVietTat.docx");
Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(out, buf);
  console.log("✅ Đã tạo:", out);
}).catch(e => console.error("❌", e));
