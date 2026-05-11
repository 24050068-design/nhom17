const router = require('express').Router();
const ctrl   = require('../controllers/orderController');
const auth   = require('../middleware/authMiddleware');
const db     = require('../config/db');

// Middleware kiểm tra quyền admin — tra DB để đảm bảo chính xác
const adminOnly = async (req, res, next) => {
  try {
    // Nếu JWT có role_id thì dùng luôn (nhanh hơn)
    if (req.user?.role_id === 1) return next();

    // Không có role_id trong token → tra DB
    const [[row]] = await db.promise().query(
      'SELECT role_id FROM users WHERE id = ?', [req.user?.id]
    );
    if (row?.role_id === 1) return next();

    return res.status(403).json({ msg: 'Chỉ admin mới có quyền này' });
  } catch (err) {
    return res.status(500).json({ msg: 'Lỗi server khi kiểm tra quyền' });
  }
};

// Public — khách hàng đặt báo (không cần đăng nhập)
router.post('/', ctrl.createOrder);

// Admin only
router.get('/',             auth, adminOnly, ctrl.getAllOrders);
router.get('/stats',        auth, adminOnly, ctrl.getOrderStats);
router.get('/:id',          auth, adminOnly, ctrl.getOrderById);
router.patch('/:id/status', auth, adminOnly, ctrl.updateOrderStatus);

module.exports = router;
