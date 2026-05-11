const db = require("../config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// REGISTER
exports.register = (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ msg: "Thiếu dữ liệu" });
  }

  db.query(
    "SELECT * FROM users WHERE username = ? OR email = ?",
    [username, email],
    (err, r) => {
      if (err) return res.status(500).json(err);

      if (r.length > 0) {
        return res.status(400).json({ msg: "User hoặc email đã tồn tại" });
      }

      const hashed = bcrypt.hashSync(password, 10);

      db.query(
        "INSERT INTO users (username, email, password, role_id) VALUES (?, ?, ?, ?)",
        [username, email, hashed, 2],
        (err, result) => {
          if (err) return res.status(500).json(err);
          res.json({ msg: "Đăng ký thành công", userId: result.insertId });
        }
      );
    }
  );
};

// LOGIN
exports.login = (req, res) => {
  const { username, password } = req.body;

  db.query(
    "SELECT id, username, email, full_name, avatar_url, role_id, password FROM users WHERE username = ? OR email = ?",
    [username, username],
    (err, r) => {
      if (err) return res.status(500).json(err);

      if (r.length === 0)
        return res.status(400).json({ msg: "Sai tài khoản" });

      const user = r[0];

      const isMatch = bcrypt.compareSync(password, user.password);

      if (!isMatch)
        return res.status(400).json({ msg: "Sai mật khẩu" });

      const token = jwt.sign(
        { id: user.id, role_id: user.role_id },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Return user info (without password)
      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          full_name: user.full_name,
          avatar_url: user.avatar_url,
          role_id: user.role_id
        }
      });
    }
  );
};

// GET ME - lấy thông tin user đang đăng nhập
exports.getMe = (req, res) => {
  db.query(
    "SELECT id, username, email, full_name, avatar_url, role_id, created_at FROM users WHERE id = ?",
    [req.user.id],
    (err, r) => {
      if (err) return res.status(500).json(err);
      if (r.length === 0) return res.status(404).json({ msg: "Không tìm thấy user" });
      res.json(r[0]);
    }
  );
};

// LOGOUT
exports.logout = (req, res) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ msg: "Thiếu token" });
  }

  const token = req.headers.authorization.split(" ")[1];

  db.query("INSERT INTO token_blacklist (token) VALUES (?)", [token], () => {
    res.json({ msg: "Đăng xuất thành công" });
  });
};