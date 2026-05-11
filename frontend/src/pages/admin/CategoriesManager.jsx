import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Loader2, AlertTriangle } from 'lucide-react';
import { fetchCategories, adminCreateCategory, adminUpdateCategory, adminDeleteCategory } from '../../services/api';
import './Admin.css';

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
        <div className="modal-header">
          <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#DC2626' }}>
            <AlertTriangle size={18} /> Xác nhận xóa
          </h3>
          <button className="modal-close" onClick={onCancel}><X size={18} /></button>
        </div>
        <div className="modal-body" style={{ padding: '20px 24px' }}>
          <p style={{ fontSize: '14px', color: '#374151' }}>{message}</p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onCancel}>Hủy</button>
          <button className="btn btn-danger" onClick={onConfirm}>Xóa</button>
        </div>
      </div>
    </div>
  );
}

function CategoriesManager() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const loadData = () => {
    setLoading(true);
    fetchCategories()
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const openCreate = () => {
    setEditing(null);
    setName('');
    setModalOpen(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setName(cat.name);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      if (editing) {
        await adminUpdateCategory(editing.id, { name });
      } else {
        await adminCreateCategory({ name });
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      alert(err.response?.data?.msg || 'Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id, catName) => {
    setConfirm({ id, message: `Xóa danh mục "${catName}"? Các bài viết thuộc danh mục này sẽ không bị xóa.` });
  };

  const doDelete = async () => {
    if (!confirm) return;
    try {
      await adminDeleteCategory(confirm.id);
      showToast('Đã xóa danh mục thành công!');
      setConfirm(null);
      loadData();
    } catch (err) {
      showToast('Xóa thất bại: ' + (err.response?.data?.msg || err.message));
      setConfirm(null);
    }
  };

  if (loading) {
    return <div className="admin-loading"><Loader2 size={24} className="spin-icon" /> Đang tải...</div>;
  }

  return (
    <div>
      {toast && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
          background: toast.includes('thất bại') ? '#FEF2F2' : '#F0FDF4',
          color: toast.includes('thất bại') ? '#DC2626' : '#16A34A',
          border: `1px solid ${toast.includes('thất bại') ? '#FCA5A5' : '#86EFAC'}`,
          borderRadius: '8px', padding: '12px 20px', fontSize: '14px', fontWeight: 600,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>{toast}</div>
      )}
      {confirm && (
        <ConfirmDialog
          message={confirm.message}
          onConfirm={doDelete}
          onCancel={() => setConfirm(null)}
        />
      )}
      <div className="admin-page-header">
        <h1 className="admin-page-title">Quản lý danh mục</h1>
        <p className="admin-page-subtitle">Tạo và quản lý các danh mục tin tức.</p>
      </div>

      <div className="admin-table-wrapper">
        <div className="admin-table-header">
          <h3 className="admin-table-title">Danh mục ({categories.length})</h3>
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={16} /> Thêm danh mục
          </button>
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên</th>
              <th>Slug</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr><td colSpan="5" className="empty-state"><p>Chưa có danh mục nào</p></td></tr>
            ) : (
              categories.map(cat => (
                <tr key={cat.id}>
                  <td>{cat.id}</td>
                  <td><strong>{cat.name}</strong></td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{cat.slug}</td>
                  <td>{cat.created_at ? new Date(cat.created_at).toLocaleDateString('vi-VN') : '—'}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn btn-sm btn-outline" onClick={() => openEdit(cat)} title="Sửa">
                        <Pencil size={14} />
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(cat.id, cat.name)} title="Xóa">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <h3 className="modal-title">{editing ? 'Sửa danh mục' : 'Thêm danh mục mới'}</h3>
              <button className="modal-close" onClick={() => setModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="admin-form-field">
                  <label>Tên danh mục</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="VD: Công nghệ, Thể thao..."
                    required
                    autoFocus
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><Loader2 size={16} className="spin-icon" /> Đang lưu...</> : editing ? 'Cập nhật' : 'Tạo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CategoriesManager;
