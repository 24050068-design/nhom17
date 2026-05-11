const {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, Table, TableRow, TableCell, WidthType,
  BorderStyle, ShadingType, VerticalAlign, convertInchesToTwip,
} = require("docx");
const fs = require("fs");
const path = require("path");

// ─── Helpers ─────────────────────────────────────────────────────────────────
const h1 = (t) => new Paragraph({ text: t, heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } });
const h2 = (t) => new Paragraph({ text: t, heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 140 } });
const body = (t, opts = {}) => new Paragraph({
  children: [new TextRun({ text: t, font: "Times New Roman", size: 24, ...opts })],
  spacing: { after: 120 }, alignment: AlignmentType.JUSTIFIED,
});
const boldLine = (label, val) => new Paragraph({
  children: [
    new TextRun({ text: label, bold: true, font: "Times New Roman", size: 24 }),
    new TextRun({ text: val, font: "Times New Roman", size: 24 }),
  ],
  spacing: { after: 120 }, alignment: AlignmentType.JUSTIFIED,
});
const bullet = (t, level = 0) => new Paragraph({
  children: [new TextRun({ text: t, font: "Times New Roman", size: 24 })],
  bullet: { level }, spacing: { after: 90 }, alignment: AlignmentType.JUSTIFIED,
});
const empty = () => new Paragraph({ text: "", spacing: { after: 80 } });

// Ô chỗ trống chèn ảnh
const imgPlaceholder = (label) => new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  borders: {
    top: { style: BorderStyle.DASHED, size: 2, color: "2E74B5" },
    bottom: { style: BorderStyle.DASHED, size: 2, color: "2E74B5" },
    left: { style: BorderStyle.DASHED, size: 2, color: "2E74B5" },
    right: { style: BorderStyle.DASHED, size: 2, color: "2E74B5" },
    insideH: { style: BorderStyle.NONE, size: 0 },
    insideV: { style: BorderStyle.NONE, size: 0 },
  },
  rows: [
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({ text: "📷  " + label, font: "Times New Roman", size: 22, color: "595959", italics: true })],
              alignment: AlignmentType.CENTER,
              spacing: { before: 600, after: 600 },
            }),
          ],
          shading: { fill: "EBF3FB", type: ShadingType.CLEAR, color: "EBF3FB" },
          margins: { top: 200, bottom: 200, left: 200, right: 200 },
        }),
      ],
    }),
  ],
});

// ─── Tables ──────────────────────────────────────────────────────────────────
const tBorder = {
  top: { style: BorderStyle.SINGLE, size: 1, color: "BFBFBF" },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: "BFBFBF" },
  left: { style: BorderStyle.SINGLE, size: 1, color: "BFBFBF" },
  right: { style: BorderStyle.SINGLE, size: 1, color: "BFBFBF" },
  insideH: { style: BorderStyle.SINGLE, size: 1, color: "BFBFBF" },
  insideV: { style: BorderStyle.SINGLE, size: 1, color: "BFBFBF" },
};
const tH = (t, fill = "1F4E79") => new TableCell({
  children: [new Paragraph({ children: [new TextRun({ text: t, bold: true, font: "Times New Roman", size: 22, color: "FFFFFF" })], alignment: AlignmentType.CENTER, spacing: { before: 80, after: 80 } })],
  shading: { fill, type: ShadingType.CLEAR, color: fill },
  verticalAlign: VerticalAlign.CENTER,
  margins: { top: 80, bottom: 80, left: 120, right: 120 },
});
const tC = (t, center = false, bold = false) => new TableCell({
  children: [new Paragraph({ children: [new TextRun({ text: t, font: "Times New Roman", size: 22, bold })], alignment: center ? AlignmentType.CENTER : AlignmentType.JUSTIFIED, spacing: { before: 60, after: 60 } })],
  verticalAlign: VerticalAlign.CENTER,
  margins: { top: 80, bottom: 80, left: 120, right: 120 },
});

const scrumTable = () => new Table({
  width: { size: 100, type: WidthType.PERCENTAGE }, borders: tBorder,
  rows: [
    new TableRow({ tableHeader: true, children: [tH("Vai trò Scrum"), tH("Người đảm nhận"), tH("Trách nhiệm")] }),
    new TableRow({ children: [tC("Product Owner", false, true), tC("Nguyễn Thanh Sơn\n(Giảng viên)"), tC("Xác định yêu cầu, ưu tiên Product Backlog, phê duyệt kết quả Sprint")] }),
    new TableRow({ children: [tC("Project Manager", false, true), tC("Dương Anh Tuấn\n(Giảng viên)"), tC("Giám sát tiến độ tổng thể, hỗ trợ định hướng kỹ thuật")] }),
    new TableRow({ children: [tC("Scrum Master", false, true), tC("Vương Đạt Kiến Phong"), tC("Tổ chức họp Scrum, theo dõi sprint, gỡ rào cản, phối hợp nhóm")] }),
    new TableRow({ children: [tC("Dev Team – DB", false, true), tC("Vương Đạt Kiến Phong"), tC("Thiết kế ERD, viết schema MySQL, migration, seed data")] }),
    new TableRow({ children: [tC("Dev Team – BE", false, true), tC("Đỗ Huy Cường"), tC("Xây dựng REST API, xác thực JWT & OAuth, upload ảnh Cloudinary")] }),
    new TableRow({ children: [tC("Dev Team – FE", false, true), tC("Nguyễn Trọng Tấn"), tC("Thiết kế giao diện React, tích hợp API, xây dựng UX")] }),
  ],
});

const sprintTable = () => new Table({
  width: { size: 100, type: WidthType.PERCENTAGE }, borders: tBorder,
  rows: [
    new TableRow({ tableHeader: true, children: [tH("Sprint"), tH("Chủ đề"), tH("Thời gian"), tH("Kết quả (Definition of Done)")] }),
    new TableRow({ children: [tC("Sprint 1", true, true), tC("Nền tảng, tài khoản & hiển thị tin tức"), tC("Tuần 1–2", true), tC("Đăng ký, Đăng nhập, Đăng xuất. Xem danh sách bài báo theo 11 chuyên mục, đọc chi tiết, đếm lượt xem (View).")] }),
    new TableRow({ children: [tC("Sprint 2", true, true), tC("Hệ thống Quản trị (CMS), Đăng bài & Kiểm duyệt"), tC("Tuần 3–4", true), tC("Admin/BTV đăng bài qua CMS với Rich Text Editor, có hoặc không ảnh minh họa. Admin quản lý chuyên mục, xóa bình luận.")] }),
    new TableRow({ children: [tC("Sprint 3", true, true), tC("Tương tác: Bình luận, Thích, Đánh giá sao & Báo cáo"), tC("Tuần 5–6", true), tC("Bình luận, Reply đa tầng, Like, Đánh giá 1–5 sao, Báo cáo bình luận xấu. Có cơ chế chống Spam bot.")] }),
    new TableRow({ children: [tC("Sprint 4", true, true), tC("Cá nhân hóa, Tìm kiếm & Hoàn thiện SEO"), tC("Tuần 7–8", true), tC("Cập nhật hồ sơ, Bookmark, Lịch sử đọc, Thông báo. Tìm kiếm nâng cao, link chia sẻ chuẩn SEO (preview ảnh khi share MXH).")] }),
  ],
});

const toolsTable = () => new Table({
  width: { size: 100, type: WidthType.PERCENTAGE }, borders: tBorder,
  rows: [
    new TableRow({ tableHeader: true, children: [tH("Công cụ"), tH("Mục đích"), tH("Cách sử dụng")] }),
    new TableRow({ children: [tC("GitHub", false, true), tC("Quản lý mã nguồn"), tC("Feature branch cho mỗi tính năng, merge vào main qua Pull Request sau khi review.")] }),
    new TableRow({ children: [tC("Jira", false, true), tC("Quản lý công việc (Kanban & Sprint)"), tC("Lập Sprint Backlog, phân công task, theo dõi trạng thái To Do → In Progress → Done. (Xem hình minh họa bên dưới)")] }),
    new TableRow({ children: [tC("Zalo / Discord", false, true), tC("Kênh trao đổi nhóm"), tC("Họp định kỳ online qua Discord (chia sẻ màn hình), thông báo nhanh qua Zalo.")] }),
    new TableRow({ children: [tC("VS Code", false, true), tC("Môi trường lập trình"), tC("Toàn bộ thành viên dùng VS Code, Live Share để pair programming khi debug chung.")] }),
    new TableRow({ children: [tC("Postman", false, true), tC("Kiểm thử API"), tC("BE test endpoint trước khi bàn giao FE; xuất Collection chia sẻ cho cả nhóm.")] }),
    new TableRow({ children: [tC("Cloudinary", false, true), tC("Lưu trữ ảnh đám mây"), tC("Upload ảnh bìa, avatar; trả URL lưu vào database thay vì lưu file local.")] }),
    new TableRow({ children: [tC("MySQL Workbench", false, true), tC("Quản lý CSDL"), tC("Thiết kế ERD, chạy migration, kiểm tra dữ liệu và tối ưu truy vấn.")] }),
  ],
});

// ─── Document ─────────────────────────────────────────────────────────────────
const doc = new Document({
  styles: {
    default: { document: { run: { font: "Times New Roman", size: 24 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", run: { bold: true, size: 28, font: "Times New Roman", color: "1F4E79" }, paragraph: { spacing: { before: 400, after: 200 } } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", run: { bold: true, size: 26, font: "Times New Roman", color: "2E74B5" }, paragraph: { spacing: { before: 280, after: 120 } } },
    ],
  },
  sections: [{
    properties: {
      page: { margin: { top: convertInchesToTwip(1), bottom: convertInchesToTwip(1), left: convertInchesToTwip(1.25), right: convertInchesToTwip(1) } },
    },
    children: [
      // Trang bìa
      new Paragraph({ children: [new TextRun({ text: "CHƯƠNG 2", bold: true, font: "Times New Roman", size: 40, color: "1F4E79" })], alignment: AlignmentType.CENTER, spacing: { before: 600, after: 200 } }),
      new Paragraph({ children: [new TextRun({ text: "PHƯƠNG PHÁP TIẾP CẬN VÀ QUY TRÌNH LÀM VIỆC", bold: true, font: "Times New Roman", size: 30, color: "2E74B5" })], alignment: AlignmentType.CENTER, spacing: { after: 600 } }),

      // 2.1
      h1("CHƯƠNG 2. PHƯƠNG PHÁP TIẾP CẬN VÀ QUY TRÌNH LÀM VIỆC"),
      h2("2.1. Mô hình Work-Integrated Learning (WIL)"),
      body("Work-Integrated Learning (WIL) là mô hình giáo dục tích hợp giữa học thuật và thực hành nghề nghiệp, trong đó sinh viên áp dụng trực tiếp kiến thức lý thuyết vào các dự án có tính thực tiễn cao. Mô hình được xây dựng trên mối quan hệ ba bên: Nhà trường – Sinh viên – Doanh nghiệp (hoặc Product Owner)."),
      body("Vai trò các bên:", { bold: true }),
      bullet("Nhà trường: Cung cấp khung chương trình, bố trí giảng viên đóng vai PO và Project Manager, đảm bảo sinh viên tiếp xúc quy trình phát triển phần mềm chuyên nghiệp."),
      bullet("Sinh viên (Dev Team): Chủ động nghiên cứu, lập kế hoạch, thực thi dự án theo sprint, tự tổ chức và chịu trách nhiệm chất lượng sản phẩm."),
      bullet("Product Owner (Giảng viên): Đặt bài toán thực tế, ưu tiên Product Backlog, đánh giá kết quả từng Sprint Review, phản ánh kỳ vọng thị trường."),
      empty(),
      body("Liên hệ với môn Dự án Lập trình Web: Giảng viên Nguyễn Thanh Sơn đóng vai PO giao bài toán và phê duyệt kết quả; giảng viên Dương Anh Tuấn đảm nhận Project Manager. Nhóm tự tổ chức theo Scrum, áp dụng công cụ chuyên nghiệp (GitHub, REST API) để sản phẩm có thể triển khai thực tế."),
      empty(),

      // 2.2
      h2("2.2. Cấu trúc nhóm Scrum"),
      body("Scrum được xây dựng trên ba vai trò cốt lõi: Product Owner, Scrum Master và Development Team. Mỗi vai trò có trách nhiệm rõ ràng tạo nên cấu trúc tự tổ chức hiệu quả."),
      bullet("Product Owner: Duy trì và ưu tiên Product Backlog, đảm bảo nhóm phát triển đúng tính năng có giá trị nhất."),
      bullet("Scrum Master: Bảo vệ quy trình Scrum, loại bỏ rào cản, tổ chức các ceremonies và hỗ trợ nhóm cải thiện liên tục."),
      bullet("Development Team: Nhóm đa chức năng, tự tổ chức, biến Sprint Backlog thành Increment hoàn chỉnh cuối mỗi sprint."),
      empty(),
      body("Hiện thực hóa trong nhóm dự án:", { bold: true }),
      empty(),
      scrumTable(),
      empty(),

      // 2.3
      h2("2.3. Quy trình Scrum, Sprint và các buổi họp"),
      body("Nhóm thực hiện tổng cộng 4 Sprint, mỗi sprint kéo dài 2 tuần. Các giai đoạn trong mỗi sprint:"),
      boldLine("Sprint Planning (60–90 phút – đầu sprint): ", "Xem xét Product Backlog, chọn User Story, phân rã thành task, phân công cho từng thành viên, tạo Sprint Backlog với thời gian ước tính."),
      boldLine("Weekly Scrum (15–30 phút – mỗi tuần): ", "Mỗi thành viên chia sẻ: đã làm gì, sẽ làm gì, có vướng mắc không. SM ghi nhận và hỗ trợ giải quyết rào cản."),
      boldLine("Sprint Review (30–45 phút – cuối sprint): ", "Demo sản phẩm cho PO (giảng viên). PO đánh giá theo Definition of Done, chấp nhận hoặc yêu cầu điều chỉnh."),
      boldLine("Sprint Retrospective (20–30 phút – cuối sprint): ", "Nhóm tự đánh giá: điều gì tốt (Keep), cần cải thiện (Improve), thử nghiệm mới (Try). Áp dụng ngay sprint tiếp theo."),
      empty(),
      body("Tổng quan 4 Sprint đã thực hiện:", { bold: true }),
      empty(),
      sprintTable(),
      empty(),

      // 4 Sprint Planning placeholders
      body("Minh họa Sprint Planning – Jira Board:", { bold: true }),
      empty(),
      body("Sprint Planning 1 – Nền tảng, tài khoản & hiển thị tin tức:", { bold: true }),
      imgPlaceholder("[Chèn ảnh chụp màn hình Jira – Sprint Planning 1 tại đây]"),
      empty(),
      body("Sprint Planning 2 – Hệ thống Quản trị (CMS), Đăng bài & Kiểm duyệt:", { bold: true }),
      imgPlaceholder("[Chèn ảnh chụp màn hình Jira – Sprint Planning 2 tại đây]"),
      empty(),
      body("Sprint Planning 3 – Tương tác: Bình luận, Thích, Đánh giá sao & Báo cáo:", { bold: true }),
      imgPlaceholder("[Chèn ảnh chụp màn hình Jira – Sprint Planning 3 tại đây]"),
      empty(),
      body("Sprint Planning 4 – Cá nhân hóa, Tìm kiếm & Hoàn thiện SEO:", { bold: true }),
      imgPlaceholder("[Chèn ảnh chụp màn hình Jira – Sprint Planning 4 tại đây]"),
      empty(),

      // 2.4
      h2("2.4. Công cụ hỗ trợ (Jira, GitHub, ...)"),
      body("Nhóm sử dụng bộ công cụ chuyên nghiệp xuyên suốt quá trình phát triển, bao gồm quản lý mã nguồn, quản lý công việc và kênh trao đổi nội bộ."),
      empty(),
      toolsTable(),
      empty(),

      // Jira placeholder
      body("Minh họa Jira Board – Kanban & Sprint Backlog của nhóm:", { bold: true }),
      empty(),
      imgPlaceholder("[Chèn ảnh chụp màn hình Jira Board – Kanban tổng quan tại đây]"),
      empty(),
      imgPlaceholder("[Chèn ảnh chụp màn hình Jira – Sprint Backlog / Danh sách task tại đây]"),
      empty(),

      body("Quy trình làm việc thực tế: Khi bắt đầu task mới, thành viên kéo card Jira sang 'In Progress', tạo branch GitHub theo format feature/<tên-tính-năng>. Sau khi hoàn thành, tạo Pull Request, thành viên khác review code, Scrum Master merge vào main. Card Jira được chuyển sang 'Done' và thông báo qua Discord/Zalo."),
      empty(),
    ],
  }],
});

const outputPath = path.join(__dirname, "..", "Chuong2_Phuong_Phap_VDKP.docx");
Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(outputPath, buf);
  console.log("✅ Đã tạo file:", outputPath);
}).catch((e) => console.error("❌", e));
