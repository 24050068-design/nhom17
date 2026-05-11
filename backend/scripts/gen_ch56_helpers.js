const {
  Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, BorderStyle,
  ShadingType, VerticalAlign,
} = require("docx");

const h1 = t => new Paragraph({ text: t, heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } });
const h2 = t => new Paragraph({ text: t, heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 140 } });
const p = (t, o = {}) => new Paragraph({ children: [new TextRun({ text: t, font: "Times New Roman", size: 24, ...o })], spacing: { after: 120 }, alignment: AlignmentType.JUSTIFIED });
const bl = (t, lv = 0) => new Paragraph({ children: [new TextRun({ text: t, font: "Times New Roman", size: 24 })], bullet: { level: lv }, spacing: { after: 80 }, alignment: AlignmentType.JUSTIFIED });
const bv = (label, val) => new Paragraph({ children: [new TextRun({ text: label, bold: true, font: "Times New Roman", size: 24 }), new TextRun({ text: val, font: "Times New Roman", size: 24 })], spacing: { after: 110 }, alignment: AlignmentType.JUSTIFIED });
const emp = () => new Paragraph({ text: "", spacing: { after: 80 } });
const center = (t, sz = 40, color = "1F4E79", bold = true) => new Paragraph({ children: [new TextRun({ text: t, bold, font: "Times New Roman", size: sz, color })], alignment: AlignmentType.CENTER, spacing: { before: 300, after: 200 } });

const TB = { top: { style: BorderStyle.SINGLE, size: 1, color: "BFBFBF" }, bottom: { style: BorderStyle.SINGLE, size: 1, color: "BFBFBF" }, left: { style: BorderStyle.SINGLE, size: 1, color: "BFBFBF" }, right: { style: BorderStyle.SINGLE, size: 1, color: "BFBFBF" }, insideH: { style: BorderStyle.SINGLE, size: 1, color: "BFBFBF" }, insideV: { style: BorderStyle.SINGLE, size: 1, color: "BFBFBF" } };
const TH = (t, fill = "1F4E79") => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: t, bold: true, font: "Times New Roman", size: 22, color: "FFFFFF" })], alignment: AlignmentType.CENTER, spacing: { before: 80, after: 80 } })], shading: { fill, type: ShadingType.CLEAR, color: fill }, verticalAlign: VerticalAlign.CENTER, margins: { top: 80, bottom: 80, left: 120, right: 120 } });
const TC = (t, ctr = false, bold = false) => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: t, font: "Times New Roman", size: 22, bold })], alignment: ctr ? AlignmentType.CENTER : AlignmentType.JUSTIFIED, spacing: { before: 60, after: 60 } })], verticalAlign: VerticalAlign.CENTER, margins: { top: 80, bottom: 80, left: 120, right: 120 } });
const imgBox = label => new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, borders: { top: { style: BorderStyle.DASHED, size: 2, color: "2E74B5" }, bottom: { style: BorderStyle.DASHED, size: 2, color: "2E74B5" }, left: { style: BorderStyle.DASHED, size: 2, color: "2E74B5" }, right: { style: BorderStyle.DASHED, size: 2, color: "2E74B5" }, insideH: { style: BorderStyle.NONE, size: 0 }, insideV: { style: BorderStyle.NONE, size: 0 } }, rows: [new TableRow({ children: [new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "📷  " + label, font: "Times New Roman", size: 22, color: "595959", italics: true })], alignment: AlignmentType.CENTER, spacing: { before: 500, after: 500 } })], shading: { fill: "EBF3FB", type: ShadingType.CLEAR, color: "EBF3FB" }, margins: { top: 200, bottom: 200, left: 200, right: 200 } })] })] });

module.exports = { h1, h2, p, bl, bv, emp, center, TB, TH, TC, imgBox };
