import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Plus, Settings, HelpCircle, ImagePlus, Loader2, X, ChevronDown,
  Link2, FileText, AlignLeft, Tag, User, BookOpen, Eye, Calendar, Save
} from 'lucide-react';
import {
  adminCreatePost, adminUpdatePost, fetchCategories
} from '../../services/api';
import api from '../../services/api';
import './Admin.css';
import './NewsEditor.css';

// ── WYSIWYG Editor (Word-like) ──────────────────────────────────────────────
const WYS_FONTS = ['Arial','Times New Roman','Georgia','Courier New','Verdana','Tahoma','Trebuchet MS'];
const WYS_SIZES = [
  { label: '8px',  val: '1' }, { label: '10px', val: '2' },
  { label: '12px', val: '3' }, { label: '14px', val: '4' },
  { label: '18px', val: '5' }, { label: '24px', val: '6' },
  { label: '36px', val: '7' },
];

// ── Color Palette (Word-like) ──
const THEME_COLORS = [
  ['#FFFFFF','#000000','#E7E6E6','#44546A','#4472C4','#ED7D31','#FFC000','#70AD47','#4BACC6','#7030A0'],
  ['#F2F2F2','#808080','#CFCFCF','#D6DCE4','#DAE3F3','#FCE4D6','#FFF2CC','#E2EFDA','#DDEBF7','#EAD9F7'],
  ['#D9D9D9','#595959','#AEABAB','#ADB9CA','#B4C6E7','#F8CBAD','#FFE699','#C6E0B4','#BDD7EE','#D5B8EB'],
  ['#BFBFBF','#404040','#767171','#8497B0','#8EAADB','#F4B183','#FFD966','#A9D18E','#9DC3E6','#C09FDC'],
  ['#A6A6A6','#262626','#3A3838','#323F4F','#305596','#843B0F','#7F6000','#375623','#1F497D','#512D7D'],
  ['#7F7F7F','#0D0D0D','#171616','#212A38','#203864','#531400','#3F3000','#233B1D','#133563','#2E1A4B'],
];
const STANDARD_COLORS = [
  '#C00000','#FF0000','#FFC000','#FFFF00','#92D050',
  '#00B050','#00B0F0','#0070C0','#002060','#7030A0'
];

function ColorDropdown({ onSelect, onClose, hasMore, onMore }) {
  return (
    <div className="wys-clr-drop" onMouseDown={e => e.stopPropagation()}>
      <div className="wys-clr-label">Màu chủ đề</div>
      <div className="wys-clr-grid">
        {THEME_COLORS.map((row, ri) => row.map((c, ci) => (
          <button key={`${ri}-${ci}`} className="wys-clr-swatch" title={c}
            style={{ background: c, outline: c === '#FFFFFF' ? '1px solid #ddd' : undefined }}
            onMouseDown={e => { e.preventDefault(); onSelect(c); }} />
        )))}
      </div>
      <div className="wys-clr-label" style={{ marginTop: 6 }}>Màu chuẩn</div>
      <div className="wys-clr-grid">
        {STANDARD_COLORS.map(c => (
          <button key={c} className="wys-clr-swatch" title={c}
            style={{ background: c }}
            onMouseDown={e => { e.preventDefault(); onSelect(c); }} />
        ))}
      </div>
      <div className="wys-clr-more" onMouseDown={e => { e.preventDefault(); onMore(); onClose(); }}>
        <span>🎨</span> Màu khác...
      </div>
    </div>
  );
}

// ── Helper: get nearest ancestor matching tagName inside editor ──
function getAncestor(tagName, root) {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return null;
  let node = sel.getRangeAt(0).commonAncestorContainer;
  if (node.nodeType === 3) node = node.parentNode;
  while (node && node !== root) {
    if (node.nodeName === tagName.toUpperCase()) return node;
    node = node.parentNode;
  }
  return null;
}


function WysiwygEditor({ value, onChange, placeholder, minHeight = 150 }) {
  const editorRef    = useRef(null);
  const skipSync     = useRef(false);
  const savedRange   = useRef(null);

  const [popup, setPopup]           = useState(null);
  const [popupData, setPopupData]   = useState({});
  const [inTable, setInTable]       = useState(false);
  const [openClr, setOpenClr]       = useState(null); // 'fore' | 'back' | null
  const moreColorRef                = useRef(null);
  const moreBackColorRef            = useRef(null);


  useEffect(() => {
    if (!editorRef.current || skipSync.current) return;
    const html = value || '';
    if (editorRef.current.innerHTML !== html) editorRef.current.innerHTML = html;
  }, [value]);

  const emit = useCallback(() => {
    skipSync.current = true;
    onChange(editorRef.current?.innerHTML || '');
    requestAnimationFrame(() => { skipSync.current = false; });
  }, [onChange]);

  const exec = (cmd, val = null) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
    emit();
  };

  const saveRange = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount) savedRange.current = sel.getRangeAt(0).cloneRange();
  };

  const restoreRange = () => {
    // Phải focus editor TRƯỚC mới restore selection được
    editorRef.current?.focus();
    const sel = window.getSelection();
    if (sel && savedRange.current) {
      sel.removeAllRanges();
      sel.addRange(savedRange.current);
    }
  };

  const openPopup = (type, defaults = {}) => {
    saveRange();
    setPopupData(defaults);
    setPopup(type);
  };
  const closePopup = () => setPopup(null);

  // Detect if cursor is inside a table
  const handleSelectionChange = () => {
    if (!editorRef.current) return;
    const cell = getAncestor('TD', editorRef.current) || getAncestor('TH', editorRef.current);
    setInTable(!!cell);
  };

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

  // ── Table operations ──
  const tableOp = (op) => {
    const editor = editorRef.current;
    if (!editor) return;
    const cell = getAncestor('TD', editor) || getAncestor('TH', editor);
    if (!cell) return;
    const row   = cell.parentElement;
    const tbody = row.parentElement;
    const table = tbody.parentElement;
    const colIdx = Array.from(row.cells).indexOf(cell);

    if (op === 'addRowBelow') {
      const newRow = row.cloneNode(true);
      Array.from(newRow.cells).forEach(c => { c.innerHTML = '&nbsp;'; });
      row.after(newRow);
    } else if (op === 'addRowAbove') {
      const newRow = row.cloneNode(true);
      Array.from(newRow.cells).forEach(c => { c.innerHTML = '&nbsp;'; });
      row.before(newRow);
    } else if (op === 'delRow') {
      if (tbody.rows.length > 1) row.remove();
    } else if (op === 'addColRight') {
      Array.from(tbody.rows).forEach(r => {
        const newCell = document.createElement('td');
        newCell.style.cssText = 'padding:6px 10px;border:1px solid #ccc';
        newCell.innerHTML = '&nbsp;';
        r.cells[colIdx]?.after(newCell);
      });
    } else if (op === 'addColLeft') {
      Array.from(tbody.rows).forEach(r => {
        const newCell = document.createElement('td');
        newCell.style.cssText = 'padding:6px 10px;border:1px solid #ccc';
        newCell.innerHTML = '&nbsp;';
        r.cells[colIdx]?.before(newCell);
      });
    } else if (op === 'delCol') {
      if (row.cells.length > 1) {
        Array.from(tbody.rows).forEach(r => { r.cells[colIdx]?.remove(); });
      }
    } else if (op === 'delTable') {
      table.remove();
    }
    emit();
  };

  // Popup apply helpers
  const applyLink = () => {
    if (!popupData.url) return;
    restoreRange(); exec('createLink', popupData.url); closePopup();
  };
  const applyImage = () => {
    if (!popupData.url) return;
    restoreRange(); exec('insertImage', popupData.url); closePopup();
  };
  const applyTable = () => {
    const r = parseInt(popupData.rows) || 3;
    const c = parseInt(popupData.cols) || 3;
    let t = '<table border="1" style="border-collapse:collapse;width:100%"><tbody>';
    for (let i = 0; i < r; i++) {
      t += '<tr>';
      for (let j = 0; j < c; j++) t += '<td style="padding:6px 10px;border:1px solid #ccc">&nbsp;</td>';
      t += '</tr>';
    }
    t += '</tbody></table><p><br></p>';
    restoreRange(); exec('insertHTML', t); closePopup();
  };
  const applyHtml = () => {
    if (editorRef.current) { editorRef.current.innerHTML = popupData.html || ''; emit(); }
    closePopup();
  };

  const TB = ({ title, onClick, children, danger }) => (
    <button type="button" className={`wys-btn${danger ? ' wys-btn-danger' : ''}`} title={title}
      onMouseDown={e => { e.preventDefault(); onClick(); }}>
      {children}
    </button>
  );
  const Sep = () => <span className="wys-sep" />;

  return (
    <div className="wys-wrap">
      {/* ── Main Toolbar ── */}
      <div className="wys-toolbar">
        <select className="wys-select" title="Kiểu đoạn văn"
          onChange={e => { exec('formatBlock', e.target.value); e.target.selectedIndex = 0; }}>
          <option>Kiểu</option>
          <option value="p">Đoạn văn</option>
          <option value="h1">Tiêu đề 1</option>
          <option value="h2">Tiêu đề 2</option>
          <option value="h3">Tiêu đề 3</option>
          <option value="h4">Tiêu đề 4</option>
          <option value="blockquote">Trích dẫn</option>
          <option value="pre">Code</option>
        </select>
        <select className="wys-select wys-font-sel" title="Phông chữ"
          onChange={e => { exec('fontName', e.target.value); e.target.selectedIndex = 0; }}>
          <option>Phông</option>
          {WYS_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        <select className="wys-select wys-size-sel" title="Cỡ chữ"
          onChange={e => { exec('fontSize', e.target.value); e.target.selectedIndex = 0; }}>
          <option>Cỡ</option>
          {WYS_SIZES.map(s => <option key={s.val} value={s.val}>{s.label}</option>)}
        </select>
        <Sep />
        <TB title="In đậm (Ctrl+B)"   onClick={() => exec('bold')}><b>B</b></TB>
        <TB title="In nghiêng (Ctrl+I)" onClick={() => exec('italic')}><i>I</i></TB>
        <TB title="Gạch chân (Ctrl+U)" onClick={() => exec('underline')}><u>U</u></TB>
        <TB title="Gạch ngang"         onClick={() => exec('strikeThrough')}><s>S</s></TB>
        <TB title="Chỉ số dưới"        onClick={() => exec('subscript')}>x₂</TB>
        <TB title="Chỉ số trên"        onClick={() => exec('superscript')}>x²</TB>
        <Sep />

        {/* ── Màu chữ: custom palette dropdown ── */}
        <div className="wys-color-wrap" style={{ position: 'relative' }}>
          <button type="button" className="wys-color-btn" title="Màu chữ"
            onMouseDown={e => {
              e.preventDefault(); saveRange();
              setOpenClr(p => p === 'fore' ? null : 'fore');
            }}>
            <span style={{ borderBottom: '3px solid #E53E3E', fontWeight: 700, lineHeight: 1 }}>A</span>
            <span className="wys-clr-arrow">▾</span>
          </button>
          {openClr === 'fore' && (
            <ColorDropdown
              onSelect={c => { restoreRange(); exec('foreColor', c); setOpenClr(null); }}
              onClose={() => setOpenClr(null)}
              onMore={() => moreColorRef.current?.click()}
            />
          )}
          <input ref={moreColorRef} type="color" style={{ display: 'none' }}
            onChange={e => { restoreRange(); exec('foreColor', e.target.value); }}
          />
        </div>

        {/* ── Màu nền chữ: custom palette dropdown ── */}
        <div className="wys-color-wrap" style={{ position: 'relative' }}>
          <button type="button" className="wys-color-btn" title="Màu nền chữ"
            onMouseDown={e => {
              e.preventDefault(); saveRange();
              setOpenClr(p => p === 'back' ? null : 'back');
            }}>
            <span style={{ background: '#FEF08A', padding: '0 3px', fontWeight: 700 }}>A</span>
            <span className="wys-clr-arrow">▾</span>
          </button>
          {openClr === 'back' && (
            <ColorDropdown
              onSelect={c => { restoreRange(); exec('hiliteColor', c); setOpenClr(null); }}
              onClose={() => setOpenClr(null)}
              onMore={() => moreBackColorRef.current?.click()}
            />
          )}
          <input ref={moreBackColorRef} type="color" style={{ display: 'none' }}
            onChange={e => { restoreRange(); exec('hiliteColor', e.target.value); }}
          />
        </div>

        <Sep />
        <TB title="Căn trái"  onClick={() => exec('justifyLeft')}>≡←</TB>
        <TB title="Căn giữa"  onClick={() => exec('justifyCenter')}>≡↔</TB>
        <TB title="Căn phải"  onClick={() => exec('justifyRight')}>≡→</TB>
        <TB title="Căn đều"   onClick={() => exec('justifyFull')}>☰</TB>
        <Sep />
        <TB title="Danh sách chấm"  onClick={() => exec('insertUnorderedList')}>• ≡</TB>
        <TB title="Danh sách số"    onClick={() => exec('insertOrderedList')}>1.≡</TB>
        <TB title="Tăng thụt lề"    onClick={() => exec('indent')}>→|</TB>
        <TB title="Giảm thụt lề"    onClick={() => exec('outdent')}>|←</TB>
        <Sep />
        <TB title="Chèn liên kết" onClick={() => openPopup('link',  { url: 'https://' })}>🔗</TB>
        <TB title="Chèn hình ảnh" onClick={() => openPopup('image', { url: '' })}>🖼</TB>
        <TB title="Chèn bảng"     onClick={() => openPopup('table', { rows: 3, cols: 3 })}>⊞</TB>
        <TB title="Đường kẻ ngang" onClick={() => exec('insertHorizontalRule')}>—</TB>
        <Sep />
        <TB title="Hoàn tác (Ctrl+Z)" onClick={() => exec('undo')}>↩</TB>
        <TB title="Làm lại (Ctrl+Y)"  onClick={() => exec('redo')}>↪</TB>
        <Sep />
        <TB title="Xóa định dạng — bỏ toàn bộ bold/italic/màu của text đang chọn" onClick={() => exec('removeFormat')}>✕ Định dạng</TB>
        <TB title="HTML nguồn"    onClick={() => openPopup('html', { html: editorRef.current?.innerHTML || '' })}>&lt;/&gt;</TB>
        <Sep />
        <TB title="Xóa toàn bộ nội dung" onClick={() => {
          if (window.confirm('Xóa toàn bộ nội dung trong editor?')) {
            if (editorRef.current) { editorRef.current.innerHTML = ''; emit(); }
          }
        }} danger>🗑 Xóa tất cả</TB>
      </div>

      {/* ── Table Toolbar (hiện khi con trỏ trong bảng) ── */}
      {inTable && (
        <div className="wys-table-bar">
          <span className="wys-table-bar-label">⊞ Bảng:</span>
          <button type="button" className="wys-tbar-btn" onMouseDown={e => { e.preventDefault(); tableOp('addRowAbove'); }} title="Thêm hàng phía trên">+ Hàng trên</button>
          <button type="button" className="wys-tbar-btn" onMouseDown={e => { e.preventDefault(); tableOp('addRowBelow'); }} title="Thêm hàng phía dưới">+ Hàng dưới</button>
          <button type="button" className="wys-tbar-btn wys-tbar-del" onMouseDown={e => { e.preventDefault(); tableOp('delRow'); }} title="Xóa hàng hiện tại">− Hàng</button>
          <span className="wys-sep" style={{ height: 18 }} />
          <button type="button" className="wys-tbar-btn" onMouseDown={e => { e.preventDefault(); tableOp('addColLeft'); }} title="Thêm cột bên trái">+ Cột trái</button>
          <button type="button" className="wys-tbar-btn" onMouseDown={e => { e.preventDefault(); tableOp('addColRight'); }} title="Thêm cột bên phải">+ Cột phải</button>
          <button type="button" className="wys-tbar-btn wys-tbar-del" onMouseDown={e => { e.preventDefault(); tableOp('delCol'); }} title="Xóa cột hiện tại">− Cột</button>
          <span className="wys-sep" style={{ height: 18 }} />
          <button type="button" className="wys-tbar-btn wys-tbar-del" onMouseDown={e => { e.preventDefault(); tableOp('delTable'); }} title="Xóa toàn bộ bảng">🗑 Xóa bảng</button>
        </div>
      )}

      {/* ── Inline Popup ── */}
      {popup && (
        <div className="wys-popup">
          {popup === 'link' && (
            <div className="wys-popup-row">
              <span className="wys-popup-label">🔗 URL:</span>
              <input className="wys-popup-input" type="url" placeholder="https://example.com"
                value={popupData.url || ''}
                onChange={e => setPopupData(d => ({ ...d, url: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && applyLink()} autoFocus />
              <button type="button" className="wys-popup-ok" onClick={applyLink}>Chèn</button>
              <button type="button" className="wys-popup-cancel" onClick={closePopup}>✕</button>
            </div>
          )}
          {popup === 'image' && (
            <div className="wys-popup-row">
              <span className="wys-popup-label">🖼 URL hình:</span>
              <input className="wys-popup-input" type="url" placeholder="https://example.com/image.jpg"
                value={popupData.url || ''}
                onChange={e => setPopupData(d => ({ ...d, url: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && applyImage()} autoFocus />
              <button type="button" className="wys-popup-ok" onClick={applyImage}>Chèn</button>
              <button type="button" className="wys-popup-cancel" onClick={closePopup}>✕</button>
            </div>
          )}
          {popup === 'table' && (
            <div className="wys-popup-row">
              <span className="wys-popup-label">⊞ Bảng:</span>
              <label className="wys-popup-label">Hàng</label>
              <input className="wys-popup-num" type="number" min={1} max={20}
                value={popupData.rows || 3}
                onChange={e => setPopupData(d => ({ ...d, rows: e.target.value }))} />
              <label className="wys-popup-label">Cột</label>
              <input className="wys-popup-num" type="number" min={1} max={20}
                value={popupData.cols || 3}
                onChange={e => setPopupData(d => ({ ...d, cols: e.target.value }))} />
              <button type="button" className="wys-popup-ok" onClick={applyTable}>Chèn</button>
              <button type="button" className="wys-popup-cancel" onClick={closePopup}>✕</button>
            </div>
          )}
          {popup === 'html' && (
            <div className="wys-popup-col">
              <div className="wys-popup-row" style={{ marginBottom: 6 }}>
                <span className="wys-popup-label" style={{ fontWeight: 700 }}>&lt;/&gt; HTML nguồn:</span>
                <button type="button" className="wys-popup-cancel" onClick={closePopup} style={{ marginLeft: 'auto' }}>✕</button>
              </div>
              <textarea className="wys-popup-textarea" rows={8} spellCheck={false}
                value={popupData.html || ''}
                onChange={e => setPopupData(d => ({ ...d, html: e.target.value }))} />
              <div className="wys-popup-row" style={{ marginTop: 8, justifyContent: 'flex-end' }}>
                <button type="button" className="wys-popup-cancel" onClick={closePopup}>Hủy</button>
                <button type="button" className="wys-popup-ok" onClick={applyHtml}>Áp dụng</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Content editable area ── */}
      <div ref={editorRef} className="wys-content" contentEditable suppressContentEditableWarning
        onInput={emit} onBlur={emit} style={{ minHeight }} data-placeholder={placeholder} />
      <div className="wys-footer">HTML</div>
    </div>
  );
}




function applyTextCommand(cmd, textareaEl, getValue, setValue) {
  if (!textareaEl) return;
  const start = textareaEl.selectionStart;
  const end = textareaEl.selectionEnd;
  const current = getValue();
  const selected = current.substring(start, end);

  let before = '', after = '', replacement = selected;

  switch (cmd) {
    case 'bold':        before = '<b>';  after = '</b>';  break;
    case 'italic':      before = '<i>';  after = '</i>';  break;
    case 'underline':   before = '<u>';  after = '</u>';  break;
    case 'strike':      before = '<s>';  after = '</s>';  break;
    case 'alignLeft':   before = '<p style="text-align:left">';   after = '</p>'; break;
    case 'alignCenter': before = '<p style="text-align:center">'; after = '</p>'; break;
    case 'alignRight':  before = '<p style="text-align:right">';  after = '</p>'; break;
    case 'justify':     before = '<p style="text-align:justify">';after = '</p>'; break;
    case 'image': {
      const url = window.prompt('Nhập URL hình ảnh:', 'https://');
      if (!url) return;
      replacement = `<img src="${url}" alt="" style="max-width:100%" />`;
      before = ''; after = '';
      break;
    }
    case 'link': {
      const href = window.prompt('Nhập URL liên kết:', 'https://');
      if (!href) return;
      const txt = selected || href;
      replacement = `<a href="${href}" target="_blank">${txt}</a>`;
      before = ''; after = '';
      break;
    }
    default: return;
  }

  const newVal = current.substring(0, start) + before + replacement + after + current.substring(end);
  setValue(newVal);

  // Restore cursor after insertion
  setTimeout(() => {
    const newPos = start + before.length + replacement.length + after.length;
    textareaEl.focus();
    textareaEl.setSelectionRange(newPos, newPos);
  }, 0);
}

function RichToolbar({ onCommand, textareaRef }) {
  const exec = (cmd) => {
    if (textareaRef?.current) textareaRef.current.focus();
    onCommand(cmd);
  };
  return (
    <div className="ne-toolbar">
      <button type="button" className="ne-tool-btn" title="HTML source" onClick={() => exec('source')}>&lt;/&gt;</button>
      <span className="ne-tool-sep" />
      <button type="button" className="ne-tool-btn" title="Bold" onClick={() => exec('bold')}><b>B</b></button>
      <button type="button" className="ne-tool-btn" title="Italic" onClick={() => exec('italic')}><i>I</i></button>
      <button type="button" className="ne-tool-btn" title="Underline" onClick={() => exec('underline')}><u>U</u></button>
      <button type="button" className="ne-tool-btn" title="Strikethrough" onClick={() => exec('strike')}><s>S</s></button>
      <span className="ne-tool-sep" />
      <button type="button" className="ne-tool-btn" title="Align left" onClick={() => exec('alignLeft')}>≡</button>
      <button type="button" className="ne-tool-btn" title="Align center" onClick={() => exec('alignCenter')}>☰</button>
      <button type="button" className="ne-tool-btn" title="Align right" onClick={() => exec('alignRight')}>≡</button>
      <button type="button" className="ne-tool-btn" title="Justify" onClick={() => exec('justify')}>⋮</button>
      <span className="ne-tool-sep" />
      <button type="button" className="ne-tool-btn" title="Chèn hình" onClick={() => exec('image')}>🖼</button>
      <button type="button" className="ne-tool-btn" title="Chèn link" onClick={() => exec('link')}>🔗</button>
    </div>
  );
}

const SOURCES = [
  '-- Chọn nguồn bài viết --',
  'Báo Nhân Dân', 'Tuổi Trẻ', 'Thanh Niên', 'VnExpress',
  'Dân Trí', 'Zing News', 'Soha News', 'VTC News',
  'Lao Động', 'Tiền Phong', 'Pháp Luật TP.HCM', 'Nội bộ'
];

function EditorHelpModal({ onClose }) {
  const fields = [
    { icon: <FileText size={15}/>, color: '#3B82F6', label: 'Tiêu đề', desc: 'Tiêu đề bài viết hiển thị trên trang. URL thân thiện sẽ tự động sinh ra từ tiêu đề.' },
    { icon: <ImagePlus size={15}/>, color: '#38A169', label: 'Hình ảnh', desc: 'Chọn ảnh từ máy tính (upload lên Cloudinary) hoặc nhập trực tiếp URL ảnh.' },
    { icon: <AlignLeft size={15}/>, color: '#8B5CF6', label: 'Mô tả ngắn', desc: 'Hiển thị trên trang danh sách tin tức. Nên viết 1-3 câu tóm tắt nội dung bài.' },
    { icon: <Link2 size={15}/>, color: '#DD6B20', label: 'Friendly URL', desc: 'URL thân thiện cho SEO. Chỉ dùng chữ thường, số, dấu gạch nối. Không dấu, không khoảng trắng.' },
    { icon: <Tag size={15}/>, color: '#EC4899', label: 'Meta Keyword', desc: 'Từ khóa giúp máy tìm kiếm phân loại bài. Cách nhau bằng dấu phẩy. VD: "tin tức, công nghệ, AI".' },
    { icon: <Eye size={15}/>, color: '#0EA5E9', label: 'Hiển thị', desc: '"Có" = xuất bản bài viết (người đọc thấy). "Không" = lưu nháp (chỉ admin thấy).' },
    { icon: <Save size={15}/>, color: '#10B981', label: 'Lưu', desc: 'Nhấn "Ẩn náp" để lưu nháp. Nhấn "Xuất bản" để đăng bài lên website ngay.' },
  ];
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h3 className="modal-title"><HelpCircle size={18} color="#3B82F6"/> Hướng dẫn điền bài viết</h3>
          <button className="modal-close" onClick={onClose}><X size={18}/></button>
        </div>
        <div className="modal-body" style={{ padding: '4px 24px 20px' }}>
          <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '12px', marginBottom: '16px' }}>
            Điền đầy đủ các trường bên dưới để bài viết đạt chất lượng và SEO tốt nhất.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
            {fields.map((f, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  background: f.color + '1A', color: f.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>{f.icon}</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B', marginBottom: 2 }}>{f.label}</div>
                  <div style={{ fontSize: '12.5px', color: '#64748B', lineHeight: 1.5 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>Đã hiểu</button>
        </div>
      </div>
    </div>
  );
}

export default function NewsEditor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [uploadingImg, setUploadingImg] = useState(false);
  const [previewImg, setPreviewImg] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    title: '',
    category_id: '',
    thumbnail: '',
    image_caption: '',
    description: '',
    content: '',
    // SEO / right panel
    friendly_url: '',
    friendly_title: '',
    meta_description: '',
    meta_keyword: '',
    // Display options
    author_name: '',
    source: '',
    published_date: new Date().toISOString().slice(0, 10),
    published_time: new Date().toTimeString().slice(0, 5),
    status: 'published',
  });

  const showToast = (msg, isErr = false) => {
    setToast({ msg, isErr });
    setTimeout(() => setToast(''), 3000);
  };

  useEffect(() => {
    fetchCategories().then(d => setCategories(Array.isArray(d) ? d : []));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    api.get(`/posts/${id}`).then(r => {
      const p = r.data;
      const dt = p.created_at ? new Date(p.created_at) : new Date();
      setForm({
        title: p.title || '',
        category_id: p.category_id || '',
        thumbnail: p.thumbnail || '',
        image_caption: p.image_caption || '',
        description: p.description || '',
        content: p.content || '',
        friendly_url: p.slug || '',
        friendly_title: p.friendly_title || '',
        meta_description: p.meta_description || '',
        meta_keyword: p.meta_keyword || '',
        author_name: p.author_name || '',
        source: p.source || '',
        published_date: dt.toISOString().slice(0, 10),
        published_time: dt.toTimeString().slice(0, 5),
        status: p.status || 'published',
      });
      setPreviewImg(p.thumbnail || '');
    }).catch(err => {
      console.error('Load post error:', err);
    }).finally(() => setLoading(false));
  }, [id, isEdit]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  // Auto friendly_url from title
  const handleTitleChange = (val) => {
    set('title', val);
    if (!form.friendly_url || !isEdit) {
      const slug = val.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd').replace(/Đ/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-').replace(/-+/g, '-').trim();
      set('friendly_url', slug);
    }
  };

  // Image upload via Cloudinary
  const handleImageUpload = async (file) => {
    if (!file) return;
    setUploadingImg(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const token = localStorage.getItem('token');
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData
      });
      const data = await res.json();
      const url = data.url || data.secure_url || '';
      set('thumbnail', url);
      setPreviewImg(url);
      showToast('Upload ảnh thành công');
    } catch {
      showToast('Upload ảnh thất bại', true);
    } finally {
      setUploadingImg(false);
    }
  };

  const handleSubmit = async (e, overrideStatus) => {
    if (e) e.preventDefault();
    if (!form.title.trim()) return showToast('Vui lòng nhập tiêu đề', true);

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        category_id: form.category_id ? parseInt(form.category_id) : null,
        thumbnail: form.thumbnail || null,
        image_caption: form.image_caption || null,
        description: form.description || null,
        content: form.content || '',
        friendly_url: form.friendly_url || null,
        friendly_title: form.friendly_title || null,
        meta_description: form.meta_description || null,
        meta_keyword: form.meta_keyword || null,
        source: form.source || null,
        status: overrideStatus || form.status,
        author_name: form.author_name || null,
      };

      if (isEdit) {
        await adminUpdatePost(id, payload);
        showToast('Cập nhật bài viết thành công!');
      } else {
        const r = await adminCreatePost(payload);
        showToast('Tạo bài viết thành công!');
        setTimeout(() => navigate(`/admin/news/edit/${r.postId || ''}`), 1200);
      }
    } catch (err) {
      showToast(err?.response?.data?.msg || 'Có lỗi xảy ra', true);
    } finally {
      setSaving(false);
    }
  };

  const descCharCount = (form.meta_description || '').length;
  const titleCharCount = (form.friendly_title || '').length;

  if (loading) {
    return <div className="admin-loading"><Loader2 size={24} className="spin-icon" /> Đang tải...</div>;
  }

  return (
    <div className="ne-root">
      {/* Toast */}
      {toast && (
        <div className={`nm-toast ${toast.isErr ? 'nm-toast-err' : 'nm-toast-ok'}`}>{toast.msg}</div>
      )}
      {showHelp && <EditorHelpModal onClose={() => setShowHelp(false)} />}

      {/* Page header */}
      <div className="ne-page-header">
        <h1 className="ne-page-title">{isEdit ? 'SỬA TIN TỨC' : 'THÊM TIN TỨC'}</h1>
        <div className="ne-header-right">
          <button type="button" className="nm-btn nm-btn-add" onClick={() => navigate('/admin/news/create')}>
            <Plus size={14} /> Add
          </button>
          <button type="button" className="nm-btn nm-btn-manage" onClick={() => navigate('/admin/news')}>
            <Settings size={14} /> Manage
          </button>
          <button type="button" className="nm-btn nm-btn-help" onClick={() => setShowHelp(true)}>
            <HelpCircle size={14} /> Help
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="ne-body">
        {/* ── LEFT COLUMN ── */}
        <div className="ne-left">

          {/* 1. Danh mục */}
          <div className="ne-field-row ne-section-border">
            <label className="ne-label">Danh mục :</label>
            <div className="ne-select-wrap">
              <select
                className="ne-select"
                value={form.category_id}
                onChange={e => set('category_id', e.target.value)}
              >
                <option value="">-- Root --</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <ChevronDown size={14} className="ne-select-arrow" />
            </div>
          </div>

          {/* 2. Tiêu đề */}
          <div className="ne-field-row">
            <label className="ne-label">Tiêu đề :</label>
            <div className="ne-title-wrap">
              <input
                className="ne-title-input"
                type="text"
                value={form.title}
                onChange={e => handleTitleChange(e.target.value)}
                placeholder="Nhập tiêu đề bài viết..."
                required
              />
              <select
                className="ne-follow-select"
                value={form.status}
                onChange={e => set('status', e.target.value)}
              >
                <option value="published">follow</option>
                <option value="draft">nofollow</option>
              </select>
            </div>
          </div>

          {/* 3. Hình ảnh */}
          <div className="ne-field-row">
            <label className="ne-label">Hình :</label>
            <div className="ne-img-section">
              <div className="ne-img-row">
                <button
                  type="button"
                  className="ne-choose-img-btn"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImg}
                >
                  {uploadingImg ? <Loader2 size={14} className="spin-icon" /> : <ImagePlus size={14} />}
                  {uploadingImg ? ' Đang tải...' : ' Chọn hình'}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={e => handleImageUpload(e.target.files[0])}
                />
                {form.thumbnail && (
                  <button
                    type="button"
                    className="ne-clear-img"
                    onClick={() => { set('thumbnail', ''); setPreviewImg(''); }}
                    title="Xóa ảnh"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              {previewImg && (
                <div className="ne-img-preview">
                  <img src={previewImg} alt="preview" />
                </div>
              )}
              <input
                type="text"
                className="ne-url-input"
                placeholder="hoặc nhập URL ảnh..."
                value={form.thumbnail}
                onChange={e => { set('thumbnail', e.target.value); setPreviewImg(e.target.value); }}
              />
            </div>
          </div>

          {/* Ghi chú hình */}
          <div className="ne-field-row">
            <label className="ne-label">Ghi chú hình :</label>
            <input
              className="ne-input-full"
              type="text"
              value={form.image_caption}
              onChange={e => set('image_caption', e.target.value)}
              placeholder="Chú thích ảnh..."
            />
          </div>

          {/* 4. Mô tả ngắn */}
          <div className="ne-editor-section">
            <div className="ne-editor-label-row">
              <label className="ne-section-label">Mô tả ngắn:</label>
            </div>
            <WysiwygEditor
              value={form.description}
              onChange={v => set('description', v)}
              placeholder="Nhập mô tả ngắn về bài viết..."
              minHeight={130}
            />
          </div>

          {/* Nội dung tin */}
          <div className="ne-editor-section" style={{ marginTop: 16 }}>
            <div className="ne-editor-label-row">
              <label className="ne-section-label">Nội dung tin</label>
            </div>
            <WysiwygEditor
              value={form.content}
              onChange={v => set('content', v)}
              placeholder="Nhập nội dung bài viết đầy đủ..."
              minHeight={260}
            />
          </div>

          {/* Save buttons */}
          <div className="ne-save-row">
            <button
              type="button"
              className="ne-save-btn ne-save-draft"
              onClick={() => handleSubmit(null, 'draft')}
              disabled={saving}
            >
              {saving ? <Loader2 size={14} className="spin-icon" /> : null}
              Lưu nháp
            </button>
            <button
              type="submit"
              className="ne-save-btn ne-save-publish"
              disabled={saving}
            >
              {saving ? <Loader2 size={14} className="spin-icon" /> : null}
              {isEdit ? 'Cập nhật' : 'Xuất bản'}
            </button>
            <button
              type="button"
              className="ne-save-btn ne-save-cancel"
              onClick={() => navigate('/admin/news')}
            >
              Hủy
            </button>
          </div>
        </div>

        {/* ── RIGHT PANEL (SEO + Display options) ── */}
        <div className="ne-right">

          {/* SEO panel */}
          <div className="ne-right-section">
            {/* Friendly URL */}
            <div className="ne-right-field">
              <label className="ne-right-label">
                <Link2 size={13} /> Friendly URL :
              </label>
              <input
                className="ne-right-input ne-url-orange"
                type="text"
                value={form.friendly_url}
                onChange={e => set('friendly_url', e.target.value)}
                placeholder="ten-bai-viet-than-thien"
              />
              <p className="ne-right-hint">
                (Lưu ý: Nhập chuỗi ký tự thường, không dấu, không khoảng cách và các ký tự đặc biệt)
              </p>
            </div>

            {/* Friendly Title */}
            <div className="ne-right-field">
              <label className="ne-right-label">
                <FileText size={13} /> Friendly Title:
              </label>
              <input
                className="ne-right-input"
                type="text"
                value={form.friendly_title}
                onChange={e => set('friendly_title', e.target.value)}
                placeholder="Tiêu đề SEO..."
                maxLength={70}
              />
              <p className="ne-right-hint">
                Title display in search engines is limited to 70 chars,{' '}
                <b style={{ color: '#E87A00' }}>{70 - titleCharCount} chars</b> left.
              </p>
            </div>

            {/* Meta Description */}
            <div className="ne-right-field">
              <label className="ne-right-label">
                <AlignLeft size={13} /> Meta Description:
              </label>
              <textarea
                className="ne-right-textarea"
                value={form.meta_description}
                onChange={e => set('meta_description', e.target.value)}
                rows={3}
                maxLength={155}
                placeholder="Mô tả ngắn cho SEO..."
              />
              <p className="ne-right-hint">
                The meta description will be limited to 155 chars (because date display).{' '}
                <b style={{ color: '#E87A00' }}>{155 - descCharCount} chars</b> left.
              </p>
            </div>

            {/* Meta Keyword */}
            <div className="ne-right-field">
              <label className="ne-right-label">
                <Tag size={13} /> Meta Keyword:
              </label>
              <input
                className="ne-right-input"
                type="text"
                value={form.meta_keyword}
                onChange={e => set('meta_keyword', e.target.value)}
                placeholder="từ khóa 1, từ khóa 2..."
              />
            </div>
          </div>

          {/* SEO status indicators */}
          <div className="ne-seo-indicators">
            {[
              { label: 'Article Heading', ok: form.title.length > 0 },
              { label: 'Page URL', ok: form.friendly_url.length > 0 },
              { label: 'Page title', ok: form.friendly_title.length > 0 },
              { label: 'Meta description', ok: form.meta_description.length > 0 },
              { label: 'Content', ok: form.content.length > 100 },
            ].map(({ label, ok }) => (
              <div key={label} className="ne-seo-item">
                <span className="ne-seo-label">{label}</span>
                <span className={`ne-seo-status ${ok ? 'ne-seo-ok' : 'ne-seo-no'}`}>
                  {ok ? 'YES' : 'NO'}
                </span>
              </div>
            ))}
          </div>

          {/* Facebook demo */}
          <div className="ne-fb-section">
            <div className="ne-fb-header">
              <span>Xem Demo tương tác FaceBook :</span>
            </div>
            <div className="ne-fb-preview">
              <span className="ne-fb-dot">...</span>
            </div>
          </div>

          {/* CÁC TÙY CHỌN HIỂN THỊ */}
          <div className="ne-display-section">
            <div className="ne-display-header">
              <span>CÁC TÙY CHỌN HIỂN THỊ</span>
            </div>

            <div className="ne-display-field">
              <label className="ne-display-label">
                <User size={13} /> Tác giả
              </label>
              <input
                className="ne-display-input"
                type="text"
                value={form.author_name}
                onChange={e => set('author_name', e.target.value)}
                placeholder="admin"
              />
            </div>

            <div className="ne-display-field">
              <label className="ne-display-label">
                <BookOpen size={13} /> Nguồn (tin tức)
              </label>
              <select
                className="ne-display-select"
                value={form.source}
                onChange={e => set('source', e.target.value)}
              >
                {SOURCES.map(s => <option key={s} value={s === SOURCES[0] ? '' : s}>{s}</option>)}
              </select>
            </div>

            <div className="ne-display-field">
              <label className="ne-display-label">
                <Calendar size={13} /> Ngày đăng
              </label>
              <div className="ne-date-row">
                <input
                  className="ne-display-input ne-time-input"
                  type="time"
                  value={form.published_time}
                  onChange={e => set('published_time', e.target.value)}
                />
                <input
                  className="ne-display-input ne-date-input"
                  type="date"
                  value={form.published_date}
                  onChange={e => set('published_date', e.target.value)}
                />
              </div>
            </div>

            <div className="ne-display-field">
              <label className="ne-display-label">
                <Eye size={13} /> Hiển thị
              </label>
              <select
                className="ne-display-select"
                value={form.status}
                onChange={e => set('status', e.target.value)}
              >
                <option value="published">Có</option>
                <option value="draft">Không</option>
              </select>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
