import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Loader2, AlertTriangle } from 'lucide-react';
import { adminGetAllPosts, adminCreatePost, adminUpdatePost, adminDeletePost, fetchCategories, adminGetAllUsers } from '../../services/api';
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

function PostsManager() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [form, setForm] = useState({
    title: '', content: '', category_id: '',
    author_name: '', author_id: '',
    thumbnail: '', status: 'draft'
  });
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const loadData = () => {
    setLoading(true);
    Promise.all([adminGetAllPosts(), fetchCategories(), adminGetAllUsers()])
      .then(([postsData, catsData, usersData]) => {
        setPosts(Array.isArray(postsData) ? postsData : []);
        setCategories(Array.isArray(catsData) ? catsData : []);
        setUsers(Array.isArray(usersData) ? usersData : []);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const openCreate = () => {
    setEditingPost(null);
    setForm({ title: '', content: '', category_id: '', author_name: '', author_id: '', thumbnail: '', status: 'draft' });
    setModalOpen(true);
  };

  const openEdit = (post) => {
    setEditingPost(post);
    setForm({
      title: post.title || '',
      content: post.content || '',
      category_id: post.category_id || '',
      author_name: post.author_name && post.author_name !== 'Không rõ' ? post.author_name : '',
      author_id: post.author_id || '',
      thumbnail: post.thumbnail || post.thumbnail_url || '',
      status: post.status || 'draft',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.content) return alert('Vui lòng nhập tiêu đề và nội dung');

    setSaving(true);
    try {
      const payload = {
        ...form,
        category_id: form.category_id ? parseInt(form.category_id) : null,
        author_id: form.author_id ? parseInt(form.author_id) : undefined,
        author_name_custom: form.author_name.trim() || undefined,
      };

      if (editingPost) {
        await adminUpdatePost(editingPost.id, payload);
      } else {
        await adminCreatePost(payload);
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      alert(err.response?.data?.msg || 'Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id, title) => {
    setConfirm({ id, message: `Xóa bài viết "${title}"? Thao tác này không thể hoàn tác.` });
  };

  const doDelete = async () => {
    if (!confirm) return;
    try {
      await adminDeletePost(confirm.id);
      showToast('Đã xóa bài viết thành công!');
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
      {/* Toast */}
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
      {/* Confirm */}
      {confirm && (
        <ConfirmDialog
          message={confirm.message}
          onConfirm={doDelete}
          onCancel={() => setConfirm(null)}
        />
      )}
      <div className="admin-page-header">
        <h1 className="admin-page-title">Quản lý bài viết</h1>
        <p className="admin-page-subtitle">Tạo, chỉnh sửa và quản lý tất cả bài viết trên website.</p>
      </div>

      <div className="admin-table-wrapper">
        <div className="admin-table-header">
          <h3 className="admin-table-title">Danh sách bài viết ({posts.length})</h3>
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={16} /> Tạo bài viết
          </button>
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tiêu đề</th>
              <th>Danh mục</th>
              <th>Tác giả</th>
              <th>Trạng thái</th>
              <th>Lượt xem</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 ? (
              <tr><td colSpan="8" className="empty-state"><p>Chưa có bài viết nào</p></td></tr>
            ) : (
              posts.map(post => (
                <tr key={post.id}>
                  <td>{post.id}</td>
                  <td><span className="text-truncate">{post.title}</span></td>
                  <td>{post.category_name || '—'}</td>
                  <td>
                    {post.author_name && post.author_name !== 'Không rõ' ? (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        background: '#EFF6FF', color: '#1D4ED8',
                        borderRadius: '20px', padding: '3px 10px 3px 6px',
                        fontSize: '12px', fontWeight: 600
                      }}>
                        <span style={{
                          width: '20px', height: '20px', borderRadius: '50%',
                          background: '#1D4ED8', color: 'white',
                          fontSize: '10px', fontWeight: 700,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {post.author_name[0].toUpperCase()}
                        </span>
                        {post.author_name}
                      </span>
                    ) : (
                      <span style={{ color: '#94A3B8', fontSize: '13px' }}>—</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${post.status === 'published' ? 'badge-green' : 'badge-yellow'}`}>
                      {post.status === 'published' ? 'Xuất bản' : 'Nháp'}
                    </span>
                  </td>
                  <td>{post.views}</td>
                  <td>{new Date(post.created_at).toLocaleDateString('vi-VN')}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn btn-sm btn-outline" onClick={() => openEdit(post)} title="Sửa">
                        <Pencil size={14} />
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(post.id, post.title)} title="Xóa">
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
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingPost ? 'Sửa bài viết' : 'Tạo bài viết mới'}</h3>
              <button className="modal-close" onClick={() => setModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="admin-form-field">
                  <label>Tiêu đề *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    placeholder="Nhập tiêu đề bài viết"
                    required
                  />
                </div>
                <div className="admin-form-field">
                  <label>Nội dung *</label>
                  <textarea
                    value={form.content}
                    onChange={e => setForm({ ...form, content: e.target.value })}
                    placeholder="Nhập nội dung bài viết..."
                    rows={8}
                    required
                  />
                </div>
                <div className="admin-form-field">
                  <label>Danh mục</label>
                  <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })}>
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="admin-form-field">
                  <label>Tác giả <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: 400 }}>(tỹ điền tự do hoặc để trống)</span></label>
                  <input
                    type="text"
                    value={form.author_name}
                    onChange={e => setForm({ ...form, author_name: e.target.value })}
                    placeholder="VD: Nguyễn Văn A, Phóng viên VDKP..."
                  />
                </div>
                <div className="admin-form-field">
                  <label>URL hình ảnh thumbnail</label>
                  <input
                    type="text"
                    value={form.thumbnail}
                    onChange={e => setForm({ ...form, thumbnail: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className="admin-form-field">
                  <label>Trạng thái</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="draft">Bản nháp</option>
                    <option value="published">Xuất bản ngay</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><Loader2 size={16} className="spin-icon" /> Đang lưu...</> : editingPost ? 'Cập nhật' : 'Tạo bài viết'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PostsManager;
