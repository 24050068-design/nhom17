const db = require("../config/db");

const adminMiddleware = (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ msg: "Chưa đăng nhập" });
  }

  db.query(
    "SELECT role_id FROM users WHERE id = ?",
    [req.user.id],
    (err, result) => {
      if (err) return res.status(500).json({ msg: "Lỗi server" });
      if (!result || result.length === 0) {
        return res.status(404).json({ msg: "Không tìm thấy user" });
      }
      if (result[0].role_id !== 1) {
        return res.status(403).json({ msg: "Bạn không có quyền admin" });
      }
      next();
    }
  );
};

module.exports = adminMiddleware;
