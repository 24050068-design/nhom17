const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ShadingType,
  VerticalAlign,
  convertInchesToTwip,
} = require("docx");
const fs = require("fs");
const path = require("path");

// ─── Helpers ────────────────────────────────────────────────────────────────

const heading1 = (text) =>
  new Paragraph({
    text,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 200 },
  });

const heading2 = (text) =>
  new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 120 },
  });

const body = (text, opts = {}) =>
  new Paragraph({
    children: [
      new TextRun({
        text,
        font: "Times New Roman",
        size: 24, // 12pt
        ...opts,
      }),
    ],
    spacing: { after: 120 },
    alignment: AlignmentType.JUSTIFIED,
  });

const bullet = (text, level = 0) =>
  new Paragraph({
    children: [
      new TextRun({
        text,
        font: "Times New Roman",
        size: 24,
      }),
    ],
    bullet: { level },
    spacing: { after: 80 },
    alignment: AlignmentType.JUSTIFIED,
  });

const boldBody = (label, value) =>
  new Paragraph({
    children: [
      new TextRun({ text: label, bold: true, font: "Times New Roman", size: 24 }),
      new TextRun({ text: value, font: "Times New Roman", size: 24 }),
    ],
    spacing: { after: 100 },
    alignment: AlignmentType.JUSTIFIED,
  });

const emptyLine = () => new Paragraph({ text: "", spacing: { after: 80 } });

// ─── Table builder ──────────────────────────────────────────────────────────

const cellText = (text, opts = {}) =>
  new TableCell({
    children: [
      new Paragraph({
        children: [new TextRun({ text, font: "Times New Roman", size: 22, ...opts })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 60, after: 60 },
      }),
    ],
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
  });

const headerCell = (text) =>
  new TableCell({
    children: [
      new Paragraph({
        children: [new TextRun({ text, bold: true, font: "Times New Roman", size: 22, color: "FFFFFF" })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 80, after: 80 },
      }),
    ],
    shading: { fill: "1F4E79", type: ShadingType.CLEAR, color: "1F4E79" },
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
  });

const buildMemberTable = () => {
  const rows = [
    new TableRow({
      children: [
        headerCell("STT"),
        headerCell("Họ và tên"),
        headerCell("MSSV"),
        headerCell("Vai trò"),
        headerCell("Nhiệm vụ chính"),
      ],
      tableHeader: true,
    }),
    new TableRow({
      children: [
        cellText("1"),
        cellText("Vương Đạt Kiến Phong"),
        cellText("—"),
        cellText("Scrum Master / Database"),
        cellText("Quản lý tiến độ dự án, thiết kế CSDL MySQL, viết migration & seed data"),
      ],
    }),
    new TableRow({
      children: [
        cellText("2"),
        cellText("Đỗ Huy Cường"),
        cellText("—"),
        cellText("Backend Developer"),
        cellText("Xây dựng REST API (Node.js/Express), xác thực JWT & OAuth, quản lý upload ảnh"),
      ],
    }),
    new TableRow({
      children: [
        cellText("3"),
        cellText("Nguyễn Trọng Tấn"),
        cellText("—"),
        cellText("Frontend Developer"),
        cellText("Thiết kế giao diện React, tích hợp API, xây dựng trải nghiệm người dùng"),
      ],
    }),
  ];

  return new Table({
    rows,
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: "BFBFBF" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "BFBFBF" },
      left: { style: BorderStyle.SINGLE, size: 1, color: "BFBFBF" },
      right: { style: BorderStyle.SINGLE, size: 1, color: "BFBFBF" },
      insideH: { style: BorderStyle.SINGLE, size: 1, color: "BFBFBF" },
      insideV: { style: BorderStyle.SINGLE, size: 1, color: "BFBFBF" },
    },
  });
};

// ─── Document ───────────────────────────────────────────────────────────────

const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: "Times New Roman", size: 24 },
      },
    },
    paragraphStyles: [
      {
        id: "Heading1",
        name: "Heading 1",
        basedOn: "Normal",
        next: "Normal",
        run: { bold: true, size: 28, font: "Times New Roman", color: "1F4E79" },
        paragraph: { spacing: { before: 400, after: 200 } },
      },
      {
        id: "Heading2",
        name: "Heading 2",
        basedOn: "Normal",
        next: "Normal",
        run: { bold: true, size: 26, font: "Times New Roman", color: "2E74B5" },
        paragraph: { spacing: { before: 280, after: 120 } },
      },
    ],
  },
  sections: [
    {
      properties: {
        page: {
          margin: {
            top: convertInchesToTwip(1),
            bottom: convertInchesToTwip(1),
            left: convertInchesToTwip(1.25),
            right: convertInchesToTwip(1),
          },
        },
      },
      children: [
        // ── Cover / Title ──────────────────────────────────────────────────
        new Paragraph({
          children: [
            new TextRun({
              text: "BÁO CÁO DỰ ÁN MÔN HỌC",
              bold: true,
              font: "Times New Roman",
              size: 40,
              color: "1F4E79",
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: 600, after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "Hệ thống Cổng thông tin Tin tức Trực tuyến",
              bold: true,
              font: "Times New Roman",
              size: 32,
              color: "2E74B5",
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 160 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "(VDKP News Portal)",
              italics: true,
              font: "Times New Roman",
              size: 26,
              color: "595959",
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 600 },
        }),

        new Paragraph({
          children: [
            new TextRun({ text: "Nhóm thực hiện: ", bold: true, font: "Times New Roman", size: 24 }),
            new TextRun({ text: "Vương Đạt Kiến Phong · Đỗ Huy Cường · Nguyễn Trọng Tấn", font: "Times New Roman", size: 24 }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Mã dự án: ", bold: true, font: "Times New Roman", size: 24 }),
            new TextRun({ text: "24050068_VDKP", font: "Times New Roman", size: 24 }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Năm học: ", bold: true, font: "Times New Roman", size: 24 }),
            new TextRun({ text: "2025 – 2026", font: "Times New Roman", size: 24 }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 800 },
        }),

        // ── CHƯƠNG 1 ──────────────────────────────────────────────────────
        heading1("CHƯƠNG 1. TỔNG QUAN DỰ ÁN"),

        // 1.1
        heading2("1.1. Bối cảnh và bài toán thực tế"),

        body(
          "Trong bối cảnh chuyển đổi số đang diễn ra mạnh mẽ, các cơ quan báo chí và " +
          "tòa soạn truyền thống ngày càng có nhu cầu cấp thiết trong việc số hóa quy trình " +
          "sản xuất, phân phối và quản lý nội dung tin tức. Thay vì xuất bản thông tin qua " +
          "kênh báo in truyền thống với thời gian trễ lớn và chi phí phát hành cao, một cổng " +
          "thông tin trực tuyến cho phép tòa soạn đăng tải tin bài theo thời gian thực, tiếp " +
          "cận lượng độc giả rộng lớn hơn và giảm đáng kể chi phí vận hành."
        ),
        body(
          "Đối tượng sử dụng hệ thống bao gồm ba nhóm chính: (1) Độc giả phổ thông – " +
          "người dùng cuối có nhu cầu đọc tin tức, bình luận, đánh giá và lưu bài viết yêu " +
          "thích; (2) Biên tập viên / Quản trị viên nội dung – người có quyền tạo, chỉnh sửa, " +
          "xuất bản và phân loại bài viết theo chuyên mục; (3) Quản trị hệ thống – người quản " +
          "lý tài khoản người dùng, theo dõi thống kê và cấu hình tổng thể nền tảng."
        ),
        body(
          "Bài toán được Product Owner (giảng viên hướng dẫn) giao là xây dựng một " +
          "nền tảng báo điện tử đầy đủ chức năng, bao gồm: hệ thống quản lý nội dung (CMS) " +
          "cho phép biên tập viên đăng tải và quản lý bài báo; cổng thông tin công khai cho " +
          "phép độc giả tìm kiếm, đọc và tương tác với nội dung; và hệ thống xác thực người " +
          "dùng hỗ trợ cả đăng nhập thông thường lẫn đăng nhập qua mạng xã hội (Google, " +
          "Facebook)."
        ),

        emptyLine(),

        // 1.2
        heading2("1.2. Mục tiêu của dự án"),

        body("a) Mục tiêu chức năng:", { bold: true }),
        bullet("Quản lý bài viết: Tạo, chỉnh sửa, xóa, xuất bản bài viết với hỗ trợ ảnh bìa và trình soạn thảo văn bản phong phú."),
        bullet("Phân loại nội dung: Tổ chức bài viết theo chuyên mục (danh mục) có cấu trúc phân cấp và hỗ trợ điều hướng Mega Menu."),
        bullet("Xác thực & phân quyền: Đăng ký, đăng nhập bằng tài khoản thường và OAuth 2.0 (Google, Facebook); phân quyền Admin / User."),
        bullet("Tương tác người dùng: Bình luận bài viết, đánh giá (rating), lưu bài yêu thích (bookmark) và xem lịch sử đọc."),
        bullet("Tìm kiếm & lọc: Tìm kiếm bài viết theo từ khóa, lọc theo danh mục và sắp xếp theo thời gian hoặc lượt xem."),
        bullet("Thông báo: Hệ thống thông báo nội bộ khi có bình luận mới hoặc tương tác liên quan đến bài viết."),
        bullet("Quản trị hệ thống: Bảng điều khiển admin quản lý người dùng, bài viết, danh mục và xem thống kê tổng quan."),

        emptyLine(),

        body("b) Mục tiêu phi chức năng:", { bold: true }),
        bullet("Trải nghiệm người dùng: Giao diện hiện đại, responsive, hỗ trợ đầy đủ trên các thiết bị di động và máy tính bàn. Thiết kế lấy cảm hứng từ các báo điện tử chuyên nghiệp (Thanh Niên, VnExpress)."),
        bullet("Bảo mật cơ bản: Mật khẩu được mã hóa bằng bcrypt; xác thực API bằng JSON Web Token (JWT); bảo vệ route theo vai trò người dùng."),
        bullet("Hiệu năng: API RESTful phản hồi nhanh; hình ảnh được lưu trữ trên dịch vụ đám mây Cloudinary để giảm tải máy chủ; phân trang dữ liệu giúp tránh tải toàn bộ danh sách lớn."),
        bullet("Khả năng mở rộng: Kiến trúc phân lớp rõ ràng (Controller – Model – Route) giúp dễ dàng thêm tính năng hoặc thay thế cơ sở dữ liệu trong tương lai."),

        emptyLine(),

        // 1.3
        heading2("1.3. Phạm vi và giới hạn dự án"),

        body("a) Phạm vi xây dựng trong khuôn khổ môn học:", { bold: true }),
        bullet("Frontend: Ứng dụng React (Vite) với đầy đủ các trang: Trang chủ, Danh mục, Chi tiết bài viết, Tìm kiếm, Hồ sơ cá nhân, Đăng ký/Đăng nhập, Trang quản trị (Admin Dashboard, Quản lý bài viết, Quản lý người dùng)."),
        bullet("Backend: REST API với Node.js/Express, kết nối MySQL; xử lý xác thực JWT và OAuth 2.0; quản lý tệp với Multer và Cloudinary."),
        bullet("Cơ sở dữ liệu: Thiết kế và triển khai schema MySQL đầy đủ bao gồm các bảng: users, posts, categories, comments, ratings, bookmarks, notifications, reading_history."),
        bullet("Tích hợp bên thứ ba: Cloudinary (lưu trữ ảnh), Google OAuth 2.0, Facebook OAuth 2.0."),

        emptyLine(),

        body("b) Phạm vi để lại cho hướng phát triển sau:", { bold: true }),
        bullet("Hệ thống đặt báo / thanh toán trực tuyến đầy đủ (tích hợp cổng thanh toán VNPAY, MoMo)."),
        bullet("Ứng dụng di động native (React Native / Flutter)."),
        bullet("Hệ thống gợi ý bài viết thông minh dựa trên hành vi người dùng (Machine Learning)."),
        bullet("Tính năng trực tiếp (live stream, podcast) và đa ngôn ngữ."),
        bullet("Hạ tầng triển khai production (CI/CD, Docker, cloud hosting, CDN, load balancing)."),
        bullet("Kiểm thử tự động toàn diện (unit test, integration test, E2E test)."),

        emptyLine(),

        // 1.4
        heading2("1.4. Tổ chức nhóm và vai trò"),

        body(
          "Nhóm gồm 3 thành viên, áp dụng mô hình phát triển Agile/Scrum với các sprint " +
          "kéo dài 1 tuần. Dưới đây là thông tin chi tiết về từng thành viên và vai trò đảm nhận:"
        ),

        emptyLine(),

        buildMemberTable(),

        emptyLine(),

        body("Chi tiết vai trò và trách nhiệm:", { bold: true }),

        body("Vương Đạt Kiến Phong – Scrum Master / Database:", { bold: true, underline: {} }),
        bullet("Lập kế hoạch sprint, tổ chức daily standup và kiểm soát tiến độ chung của nhóm."),
        bullet("Thiết kế sơ đồ Entity-Relationship (ERD) và tối ưu hóa cấu trúc cơ sở dữ liệu MySQL."),
        bullet("Viết các file migration SQL, script seed dữ liệu mẫu (seed_posts.js, seed_mega_posts.js)."),
        bullet("Đảm bảo tính nhất quán và toàn vẹn dữ liệu giữa các module hệ thống."),
        bullet("Phối hợp phân công công việc, giải quyết xung đột kỹ thuật và hỗ trợ các thành viên."),

        emptyLine(),

        body("Đỗ Huy Cường – Backend Developer:", { bold: true, underline: {} }),
        bullet("Xây dựng toàn bộ REST API với Express.js, bao gồm các module: auth, posts, categories, comments, ratings, bookmarks, notifications, reading history, users."),
        bullet("Triển khai hệ thống xác thực JWT (đăng ký, đăng nhập, refresh token) và OAuth 2.0 với Passport.js (Google, Facebook)."),
        bullet("Tích hợp Cloudinary để upload và quản lý hình ảnh bài viết."),
        bullet("Xây dựng middleware phân quyền, bảo vệ các route yêu cầu xác thực."),
        bullet("Viết tài liệu API và hỗ trợ Frontend tích hợp endpoint."),

        emptyLine(),

        body("Nguyễn Trọng Tấn – Frontend Developer:", { bold: true, underline: {} }),
        bullet("Xây dựng toàn bộ giao diện người dùng với React (Vite), bao gồm các trang: Trang chủ, Danh mục, Chi tiết bài, Tìm kiếm, Hồ sơ, Đăng nhập/Đăng ký, Admin Dashboard."),
        bullet("Thiết kế hệ thống UI Components tái sử dụng (Header, Footer, Card, Mega Menu, Modal, ...) với CSS thuần."),
        bullet("Tích hợp các API từ Backend, quản lý trạng thái ứng dụng với React Context và hooks."),
        bullet("Đảm bảo giao diện responsive, tương thích đa thiết bị và tối ưu trải nghiệm người dùng."),
        bullet("Xử lý các luồng tương tác: bình luận, rating, bookmark, thông báo, lịch sử đọc."),

        emptyLine(),

        body("Nguyên tắc làm việc chung và cách phối hợp:", { bold: true }),
        bullet("Sử dụng Git/GitHub để quản lý mã nguồn; mỗi tính năng phát triển trên nhánh riêng (feature branch), sau đó merge vào main qua Pull Request sau khi review."),
        bullet("Họp nhóm trực tuyến tối thiểu 2 lần/tuần để đồng bộ tiến độ, trao đổi vướng mắc kỹ thuật và điều chỉnh kế hoạch."),
        bullet("Quản lý công việc qua bảng Kanban (To Do / In Progress / Done) trên công cụ quản lý dự án."),
        bullet("Tài liệu nội bộ được cập nhật liên tục để đảm bảo mọi thành viên nắm rõ kiến trúc và API interface."),
        bullet("Tuân thủ quy tắc đặt tên biến, hàm, file nhất quán theo convention đã thống nhất trong nhóm."),

        emptyLine(),
      ],
    },
  ],
});

// ─── Export ─────────────────────────────────────────────────────────────────

const outputPath = path.join(__dirname, "..", "Bao_Cao_Du_An_VDKP.docx");

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ Đã tạo file: ${outputPath}`);
}).catch((err) => {
  console.error("❌ Lỗi:", err);
});
