import React, { useEffect, useState } from 'react';
import { Trash2, Shield, ShieldOff, Loader2, AlertTriangle, X } from 'lucide-react';
import { adminGetAllUsers, adminUpdateUserRole, adminDeleteUser } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
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

function UsersManager() {
  const { user: currentUser } = useAuth();
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [confirm, setConfirm]   = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast]       = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const loadData = () => {
    setLoading(true);
    adminGetAllUsers()
      .then(data => setUsers(Array.isArray(data) ? data : []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const handleToggleRole = async (userId, currentRole, username) => {
    const newRole = currentRole === 1 ? 2 : 1;
    const action = newRole === 1 ? 'cấp quyền Admin' : 'hạ xuống User';
    if (!window.confirm(`Bạn chắc chắn muốn ${action} cho "${username}"?`)) return;
    try {
      await adminUpdateUserRole(userId, newRole);
      showToast('Cập nhật quyền thành công!');
      loadData();
    } catch (err) {
      showToast('Lỗi: ' + (err.response?.data?.msg || err.message));
    }
  };

  const askDelete = (userId, username) => {
    setConfirm({ id: userId, message: `Xóa tài khoản "${username}"? Tất cả bình luận, bookmark của họ sẽ bị xóa.` });
  };

  const doDelete = async () => {
    if (!confirm) return;
    setDeleting(true);
    try {
      await adminDeleteUser(confirm.id);
      showToast('Đã xóa người dùng thành công!');
      setConfirm(null);
      loadData();
    } catch (err) {
      showToast('Xóa thất bại: ' + (err.response?.data?.msg || err.message));
      setConfirm(null);
    } finally {
      setDeleting(false);
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
          background: toast.includes('thất bại') || toast.includes('Lỗi') ? '#FEF2F2' : '#F0FDF4',
          color: toast.includes('thất bại') || toast.includes('Lỗi') ? '#DC2626' : '#16A34A',
          border: `1px solid ${toast.includes('thất bại') || toast.includes('Lỗi') ? '#FCA5A5' : '#86EFAC'}`,
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
        <h1 className="admin-page-title">Quản lý người dùng</h1>
        <p className="admin-page-subtitle">Xem danh sách, thay đổi quyền và quản lý tài khoản người dùng.</p>
      </div>

      <div className="admin-table-wrapper">
        <div className="admin-table-header">
          <h3 className="admin-table-title">Người dùng ({users.length})</h3>
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên đăng nhập</th>
              <th>Email</th>
              <th>Quyền</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan="6" className="empty-state"><p>Chưa có người dùng nào</p></td></tr>
            ) : (
              users.map(u => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>
                    <strong>{u.username}</strong>
                    {u.id === currentUser?.id && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-primary)', marginLeft: '0.4rem' }}>(bạn)</span>
                    )}
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`badge ${u.role_id === 1 ? 'badge-blue' : 'badge-green'}`}>
                      {u.role_id === 1 ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td>{new Date(u.created_at).toLocaleDateString('vi-VN')}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className={`btn btn-sm ${u.role_id === 1 ? 'btn-outline' : 'btn-primary'}`}
                        onClick={() => handleToggleRole(u.id, u.role_id, u.username)}
                        title={u.role_id === 1 ? 'Hạ xuống User' : 'Nâng lên Admin'}
                        disabled={u.id === currentUser?.id}
                      >
                        {u.role_id === 1 ? <ShieldOff size={14} /> : <Shield size={14} />}
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => askDelete(u.id, u.username)}
                        title="Xóa"
                        disabled={u.id === currentUser?.id || deleting}
                      >
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
    </div>
  );
}

export default UsersManager;
