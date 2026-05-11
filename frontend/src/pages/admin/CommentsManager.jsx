import React, { useEffect, useState } from 'react';
import { Trash2, Loader2, MessageSquare, AlertTriangle, X } from 'lucide-react';
import { adminGetAllComments, adminDeleteComment } from '../../services/api';
import './Admin.css';

/* ── Reusable Confirm Dialog ── */
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

function CommentsManager() {
  const [comments, setComments]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [confirm, setConfirm]     = useState(null); // { id, message }
  const [deleting, setDeleting]   = useState(false);
  const [toast, setToast]         = useState('');

  const loadData = () => {
    setLoading(true);
    adminGetAllComments()
      .then(data => setComments(Array.isArray(data) ? data : []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const askDelete = (id) => {
    setConfirm({ id, message: 'Bạn chắc chắn muốn xóa bình luận này?' });
  };

  const doDelete = async () => {
    if (!confirm) return;
    setDeleting(true);
    try {
      await adminDeleteComment(confirm.id);
      setToast('Đã xóa bình luận thành công!');
      setConfirm(null);
      loadData();
    } catch (err) {
      setToast('Xóa thất bại: ' + (err.response?.data?.msg || err.message));
      setConfirm(null);
    } finally {
      setDeleting(false);
      setTimeout(() => setToast(''), 3000);
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

      {/* Confirm Dialog */}
      {confirm && (
        <ConfirmDialog
          message={confirm.message}
          onConfirm={doDelete}
          onCancel={() => setConfirm(null)}
        />
      )}

      <div className="admin-page-header">
        <h1 className="admin-page-title">Quản lý bình luận</h1>
        <p className="admin-page-subtitle">Xem và quản lý tất cả bình luận trên website.</p>
      </div>

      <div className="admin-table-wrapper">
        <div className="admin-table-header">
          <h3 className="admin-table-title">Bình luận ({comments.length})</h3>
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nội dung</th>
              <th>Người dùng</th>
              <th>Bài viết</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {comments.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-state">
                  <MessageSquare size={32} />
                  <p>Chưa có bình luận nào</p>
                </td>
              </tr>
            ) : (
              comments.map(c => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>
                    <span className="text-truncate" style={{ maxWidth: '300px' }}>
                      {c.content}
                    </span>
                  </td>
                  <td>{c.username || '—'}</td>
                  <td>
                    <span className="text-truncate" style={{ maxWidth: '180px', fontSize: '0.85rem' }}>
                      {c.post_title || `#${c.post_id}`}
                    </span>
                  </td>
                  <td>{new Date(c.created_at).toLocaleDateString('vi-VN')}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => askDelete(c.id)}
                      title="Xóa bình luận"
                      disabled={deleting}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CommentsManager;
