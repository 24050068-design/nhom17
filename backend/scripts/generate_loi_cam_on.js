const {
  Document, Packer, Paragraph, TextRun, AlignmentType,
  BorderStyle, TableRow, TableCell, Table,
  WidthType, convertInchesToTwip, LineRuleType,
} = require("docx");
const fs   = require("fs");
const path = require("path");

const COLOR = {
  primary:  "1a3c5e",
  accent:   "f39c12",
  dark:     "1c2833",
  gray:     "626567",
};

function line(color = COLOR.accent) {
  return new Paragraph({
    spacing: { before: 80, after: 80 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color } },
    children: [],
  });
}

function body(text, indent = true) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { before: 80, after: 80, line: 340, lineRule: LineRuleType.AUTO },
    indent: indent ? { firstLine: convertInchesToTwip(0.5) } : {},
    children: [
      new TextRun({ text, font: "Times New Roman", size: 26, color: COLOR.dark }),
    ],
  });
}

function sp(n = 80) {
  return new Paragraph({ spacing: { before: n, after: n }, children: [] });
}

async function build() {
  const children = [];

  // ── Tên trường + Khoa ─────────────────────────────────────────
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 40 },
      children: [new TextRun({
        text: "TRƯỜNG ĐẠI HỌC KINH TẾ - TÀI CHÍNH TP. HỒ CHÍ MINH",
        font: "Times New Roman", size: 23, bold: true, color: COLOR.primary, allCaps: true,
      })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 40 },
      children: [new TextRun({
        text: "KHOA CÔNG NGHỆ THÔNG TIN",
        font: "Times New Roman", size: 23, bold: true, color: COLOR.primary, allCaps: true,
      })],
    }),
  );

  children.push(line());
  children.push(sp(160));

  // ── Tiêu đề LỜI CẢM ƠN ───────────────────────────────────────
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 40 },
      children: [new TextRun({
        text: "LỜI CẢM ƠN",
        font: "Times New Roman", size: 36, bold: true, color: COLOR.primary,
      })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 160 },
      children: [new TextRun({
        text: "───────────────────────",
        font: "Times New Roman", size: 22, color: COLOR.accent,
      })],
    }),
  );

  // ── Nội dung (3 đoạn gọn) ────────────────────────────────────
  children.push(body(
    'Để hoàn thành báo cáo tiểu luận môn học với đề tài \u201cXây dựng Website Tin Tức \u2013 Dự án VDKP\u201d, ' +
    'nhóm chúng em xin bày tỏ lòng biết ơn chân thành đến Quý Thầy/Cô Giảng viên hướng dẫn ' +
    'đã tận tình chỉ bảo và định hướng trong suốt quá trình thực hiện đề tài.'
  ));

  children.push(body(
    'Chúng em xin trân trọng cảm ơn Ban Giám hiệu Nhà trường và toàn thể Quý Thầy, Cô Khoa Công nghệ Thông tin ' +
    'đã tạo điều kiện thuận lợi về cơ sở vật chất và môi trường học tập để chúng em tiếp cận ' +
    'các công nghệ hiện đại và áp dụng vào thực tiễn.'
  ));

  children.push(body(
    'Xin cảm ơn các thành viên trong nhóm đã cùng nhau nỗ lực, hỗ trợ và phối hợp chặt chẽ trong suốt quá trình ' +
    'thực hiện dự án. Trong quá trình thực hiện không tránh khỏi những thiếu sót, nhóm chúng em ' +
    'rất mong nhận được sự góp ý của Quý Thầy Cô để đề tài được hoàn thiện hơn.'
  ));

  children.push(sp(120));

  // ── Ngày & chữ ký ────────────────────────────────────────────
  children.push(
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { before: 0, after: 40 },
      children: [new TextRun({
        text: "TP. Hồ Chí Minh, tháng 5 năm 2025",
        font: "Times New Roman", size: 24, italics: true, color: COLOR.gray,
      })],
    }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { before: 0, after: 80 },
      children: [new TextRun({
        text: "Nhóm sinh viên thực hiện",
        font: "Times New Roman", size: 26, bold: true, color: COLOR.primary,
      })],
    }),
  );

  // Bảng chữ ký 2 cột
  children.push(sp(200));
  children.push(new Table({
    width: { size: 8500, type: WidthType.DXA },
    columnWidths: [4000, 4000],
    borders: {
      top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
      insideH: { style: BorderStyle.NONE }, insideV: { style: BorderStyle.NONE },
    },
    rows: [
      new TableRow({
        children: [
          sigCell("Trương Hoài Phong"),
          sigCell("Trần Văn Duy Khang"),
        ],
      }),
    ],
  }));

  // ── Footer ────────────────────────────────────────────────────
  children.push(sp(120));
  children.push(line());
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 40, after: 0 },
      children: [new TextRun({
        text: "Website Tin Tức – VDKP  |  Báo cáo Tiểu luận Môn học  |  2025",
        font: "Times New Roman", size: 20, italics: true, color: COLOR.gray,
      })],
    }),
  );

  const doc = new Document({
    styles: {
      default: { document: { run: { font: "Times New Roman", size: 26 } } },
    },
    sections: [{
      properties: {
        page: {
          margin: {
            top:    convertInchesToTwip(0.9),
            bottom: convertInchesToTwip(0.9),
            left:   convertInchesToTwip(1.25),
            right:  convertInchesToTwip(1.0),
          },
        },
      },
      children,
    }],
  });

  const outDir  = path.join(__dirname, "..", "output_docs");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, "Loi_Cam_On.docx");
  fs.writeFileSync(outPath, await Packer.toBuffer(doc));
  console.log("✅  Đã tạo file:", outPath);
}

function sigCell(name) {
  return new TableCell({
    width: { size: 4000, type: WidthType.DXA },
    borders: {
      top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
    },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 40 },
        children: [new TextRun({ text: "_______________________", font: "Times New Roman", size: 24, color: COLOR.gray })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 0 },
        children: [new TextRun({ text: name, font: "Times New Roman", size: 24, bold: true, color: COLOR.dark })],
      }),
    ],
  });
}

build().catch(console.error);
