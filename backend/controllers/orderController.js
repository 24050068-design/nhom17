const db = require('../config/db');

// POST /api/orders — tạo đơn hàng mới (public)
exports.createOrder = async (req, res) => {
  const {
    full_name, email, phone, province, address,
    payment_method, invoice, invoice_company, invoice_tax, invoice_address,
    items, total_amount, user_id
  } = req.body;

  if (!full_name || !phone || !items || !total_amount) {
    return res.status(400).json({ msg: 'Thiếu thông tin bắt buộc (họ tên, điện thoại, items, tổng tiền)' });
  }

  try {
    const [result] = await db.promise().query(
      `INSERT INTO newspaper_orders
        (full_name, email, phone, province, address, payment_method, invoice,
         invoice_company, invoice_tax, invoice_address, items, total_amount, user_id)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        full_name, email || null, phone, province || null, address || null,
        payment_method || null, invoice ? 1 : 0,
        invoice_company || null, invoice_tax || null, invoice_address || null,
        JSON.stringify(items), total_amount,
        user_id || null
      ]
    );
    res.status(201).json({ msg: 'Đặt báo thành công', order_id: result.insertId });
  } catch (err) {
    console.error('CREATE ORDER ERROR:', err);
    res.status(500).json({ msg: 'Lỗi server', error: err.message });
  }
};

// GET /api/orders — lấy danh sách đơn (admin only)
exports.getAllOrders = async (req, res) => {
  const { status, search, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  let where = 'WHERE 1=1';
  const params = [];

  if (status) { where += ' AND o.status = ?'; params.push(status); }
  if (search) {
    where += ' AND (o.full_name LIKE ? OR o.phone LIKE ? OR o.email LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s, s);
  }

  try {
    const [rows] = await db.promise().query(
      `SELECT o.*, u.username, u.email as user_email
       FROM newspaper_orders o
       LEFT JOIN users u ON o.user_id = u.id
       ${where}
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );
    const [[{ total }]] = await db.promise().query(
      `SELECT COUNT(*) as total FROM newspaper_orders o ${where}`,
      params
    );
    res.json({ orders: rows, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error('GET ORDERS ERROR:', err);
    res.status(500).json({ msg: 'Lỗi server' });
  }
};

// GET /api/orders/stats — thống kê tổng quan (admin)
exports.getOrderStats = async (req, res) => {
  try {
    const [[stats]] = await db.promise().query(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status='pending'    THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status='confirmed'  THEN 1 ELSE 0 END) as confirmed,
        SUM(CASE WHEN status='delivering' THEN 1 ELSE 0 END) as delivering,
        SUM(CASE WHEN status='completed'  THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status='cancelled'  THEN 1 ELSE 0 END) as cancelled,
        COALESCE(SUM(CASE WHEN status != 'cancelled' THEN total_amount ELSE 0 END), 0) as revenue
      FROM newspaper_orders
    `);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ msg: 'Lỗi server' });
  }
};

// GET /api/orders/:id — chi tiết đơn (admin)
exports.getOrderById = async (req, res) => {
  try {
    const [[order]] = await db.promise().query(
      `SELECT o.*, u.username, u.email as user_email
       FROM newspaper_orders o LEFT JOIN users u ON o.user_id = u.id
       WHERE o.id = ?`,
      [req.params.id]
    );
    if (!order) return res.status(404).json({ msg: 'Không tìm thấy đơn hàng' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ msg: 'Lỗi server' });
  }
};

// PATCH /api/orders/:id/status — cập nhật trạng thái (admin)
exports.updateOrderStatus = async (req, res) => {
  const { status, note } = req.body;
  const valid = ['pending','confirmed','delivering','completed','cancelled'];
  if (!valid.includes(status)) return res.status(400).json({ msg: 'Trạng thái không hợp lệ' });

  try {
    await db.promise().query(
      'UPDATE newspaper_orders SET status=?, note=? WHERE id=?',
      [status, note || null, req.params.id]
    );
    res.json({ msg: 'Cập nhật thành công' });
  } catch (err) {
    res.status(500).json({ msg: 'Lỗi server' });
  }
};
