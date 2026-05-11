import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => Promise.reject(error));

// ── Posts (Public) ──────────────────────────────────
export const fetchPosts = (page = 1, limit = 10) =>
  api.get(`/posts?page=${page}&limit=${limit}`).then(r => r.data);

export const fetchPostById = (id) =>
  api.get(`/posts/${id}`).then(r => r.data);

// ── Categories (Public) ─────────────────────────────
export const fetchCategories = () =>
  api.get('/categories').then(r => r.data);

// ── Stats (Public) ──────────────────────────────────
export const fetchPublicStats = () =>
  api.get('/stats').then(r => r.data);

// ── Comments (Public) ───────────────────────────────
export const fetchCommentsByPost = (postId) =>
  api.get(`/comments/${postId}`).then(r => r.data);

export const postComment = (data) =>
  api.post('/comments', data).then(r => r.data);

// ── Auth ────────────────────────────────────────────
export const login = (credentials) =>
  api.post('/auth/login', credentials).then(r => r.data);

export const register = (data) =>
  api.post('/auth/register', data).then(r => r.data);

export const getMe = () =>
  api.get('/auth/me').then(r => r.data);

// ── Admin: Posts ────────────────────────────────────
export const adminGetAllPosts = (params = {}) => {
  const query = new URLSearchParams();
  if (params.category_id) query.set('category_id', params.category_id);
  if (params.from_date) query.set('from_date', params.from_date);
  if (params.to_date) query.set('to_date', params.to_date);
  if (params.search) query.set('search', params.search);
  if (params.search_by) query.set('search_by', params.search_by);
  const qs = query.toString();
  return api.get(`/posts/admin/all${qs ? '?' + qs : ''}`).then(r => r.data);
};

export const adminCreatePost = (data) =>
  api.post('/posts', data).then(r => r.data);

export const adminUpdatePost = (id, data) =>
  api.put(`/posts/${id}`, data).then(r => r.data);

export const adminDeletePost = (id) =>
  api.delete(`/posts/${id}`).then(r => r.data);

export const adminClonePost = (id) =>
  api.post(`/posts/admin/clone/${id}`).then(r => r.data);

export const adminBulkUpdateStatus = (ids, status) =>
  api.post('/posts/admin/bulk-status', { ids, status }).then(r => r.data);

export const adminBulkDelete = (ids) =>
  api.post('/posts/admin/bulk-delete', { ids }).then(r => r.data);

export const adminGetStats = () =>
  api.get('/posts/admin/stats').then(r => r.data);

// ── Admin: Categories ───────────────────────────────
export const adminCreateCategory = (data) =>
  api.post('/categories', data).then(r => r.data);

export const adminUpdateCategory = (id, data) =>
  api.put(`/categories/${id}`, data).then(r => r.data);

export const adminDeleteCategory = (id) =>
  api.delete(`/categories/${id}`).then(r => r.data);

// ── Admin: Users ────────────────────────────────────
export const adminGetAllUsers = () =>
  api.get('/users').then(r => r.data);

export const adminUpdateUserRole = (id, role_id) =>
  api.put(`/users/${id}/role`, { role_id }).then(r => r.data);

export const adminDeleteUser = (id) =>
  api.delete(`/users/${id}`).then(r => r.data);

// ── Admin: Comments ─────────────────────────────────
export const adminGetAllComments = () =>
  api.get('/comments/admin/all').then(r => r.data);

export const adminDeleteComment = (id) =>
  api.delete(`/comments/${id}`).then(r => r.data);

// ── Bookmarks ────────────────────────────────────
export const toggleBookmark = (postId) =>
  api.post(`/bookmarks/${postId}`).then(r => r.data);

export const getBookmarks = () =>
  api.get('/bookmarks').then(r => r.data);

// ── Notifications ─────────────────────────────────
export const getNotifications = () =>
  api.get('/notifications').then(r => r.data);

export const markNotificationRead = (id) =>
  api.put(`/notifications/${id}`).then(r => r.data);

// ── Ratings ───────────────────────────────────────
export const ratePost = (postId, score) =>
  api.post(`/ratings/${postId}`, { score }).then(r => r.data);

// ── Reading History ───────────────────────────────
export const addReadingHistory = (postId) =>
  api.post('/reading-history', { postId }).then(r => r.data);

export const getReadingHistory = () =>
  api.get('/reading-history').then(r => r.data);

// ── My Comments ───────────────────────────
export const getMyComments = () =>
  api.get('/comments/my/list').then(r => r.data);

// ── Profile update ────────────────────────────────
export const updateProfile = (data) =>
  api.put('/users/me', data).then(r => r.data);

export default api;
