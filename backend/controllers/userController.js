const db = require("../config/db");
const bcrypt = require("bcryptjs");

// GET all users (admin)
exports.getAllUsers = (req, res) => {
  db.query(
    "SELECT id, username, email, full_name, avatar_url, gender, birthday, phone, address, role_id, created_at, updated_at FROM users ORDER BY created_at DESC",
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
    }
  );
};

// GET user by id
exports.getUserById = (req, res) => {
  const id = req.params.id;
  db.query(
    "SELECT id, username, email, full_name, avatar_url, gender, birthday, phone, address, role_id, created_at FROM users WHERE id = ?",
    [id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      if (!result || result.length === 0) {
        return res.status(404).json({ msg: "Không tìm thấy người dùng" });
      }
      res.json(result[0]);
    }
  );
};

// UPDATE user role (admin)
exports.updateUserRole = (req, res) => {
  const id = req.params.id;
  const { role_id } = req.body;

  if (![1, 2].includes(role_id)) {
    return res.status(400).json({ msg: "Role không hợp lệ (1=admin, 2=user)" });
  }

  db.query(
    "UPDATE users SET role_id = ? WHERE id = ?",
    [role_id, id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ msg: "Cập nhật quyền thành công" });
    }
  );
};

// DELETE user (admin) - cascade
exports.deleteUser = async (req, res) => {
  const id = req.params.id;

  if (parseInt(id) === req.user.id) {
    return res.status(400).json({ msg: "Không thể xóa chính bạn" });
  }

  try {
    // Xóa dữ liệu liên quan trước
    await db.promise().query("DELETE FROM comments WHERE user_id = ?", [id]).catch(() => {});
    await db.promise().query("DELETE FROM bookmarks WHERE user_id = ?", [id]).catch(() => {});
    await db.promise().query("DELETE FROM reading_history WHERE user_id = ?", [id]).catch(() => {});
    await db.promise().query("DELETE FROM post_ratings WHERE user_id = ?", [id]).catch(() => {});
    await db.promise().query("DELETE FROM notifications WHERE user_id = ?", [id]).catch(() => {});
    await db.promise().query("DELETE FROM likes WHERE user_id = ?", [id]).catch(() => {});
    // Cập nhật bài viết do user tạo (giữ lại bài, chỉ null author)
    await db.promise().query("UPDATE posts SET author_id = NULL WHERE author_id = ?", [id]).catch(() => {});
    // Xóa user
    await db.promise().query("DELETE FROM users WHERE id = ?", [id]);
    res.json({ msg: "Xóa người dùng thành công" });
  } catch (err) {
    console.error("DELETE USER ERROR:", err);
    res.status(500).json({ msg: "Xóa thất bại", error: err.message });
  }
};

// GET ME - current logged-in user info
exports.getMe = (req, res) => {
  db.query(
    "SELECT id, username, email, full_name, avatar_url, gender, birthday, phone, address, role_id, created_at FROM users WHERE id = ?",
    [req.user.id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      if (!result || result.length === 0) {
        return res.status(404).json({ msg: "Không tìm thấy user" });
      }
      res.json(result[0]);
    }
  );
};

// PUT ME - update own profile (SCRUM-33)
exports.updateMe = async (req, res) => {
  const { username, email, full_name, avatar_url, gender, birthday, phone, address, current_password, new_password } = req.body;
  const userId = req.user.id;

  try {
    // Nếu đổi mật khẩu → xác minh mật khẩu hiện tại
    if (new_password) {
      const [rows] = await db.promise().query("SELECT password FROM users WHERE id = ?", [userId]);
      if (!rows.length) return res.status(404).json({ msg: "Không tìm thấy user" });
      const match = await bcrypt.compare(current_password || '', rows[0].password);
      if (!match) return res.status(400).json({ msg: "Mật khẩu hiện tại không đúng" });
      const hashed = await bcrypt.hash(new_password, 10);
      await db.promise().query(
        "UPDATE users SET username=?, email=?, full_name=?, avatar_url=?, gender=?, birthday=?, phone=?, address=?, password=? WHERE id=?",
        [username, email, full_name || null, avatar_url || null, gender || null, birthday || null, phone || null, address || null, hashed, userId]
      );
    } else {
      await db.promise().query(
        "UPDATE users SET username=?, email=?, full_name=?, avatar_url=?, gender=?, birthday=?, phone=?, address=? WHERE id=?",
        [username, email, full_name || null, avatar_url || null, gender || null, birthday || null, phone || null, address || null, userId]
      );
    }
    const [updated] = await db.promise().query(
      "SELECT id, username, email, full_name, avatar_url, gender, birthday, phone, address, role_id FROM users WHERE id=?",
      [userId]
    );
    res.json({ msg: "Cập nhật thành công", user: updated[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Lỗi server" });
  }
};
