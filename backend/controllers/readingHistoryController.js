const db = require("../config/db");

// thêm lịch sử
exports.addReadingHistory = (req, res) => {
  const userId = req.user.id;
  const postId = req.body.postId || req.body.post_id || req.params.postId;

  if (!postId) return res.status(400).json({ msg: "Thiếu postId" });

  db.query(
    "INSERT INTO reading_history (user_id, post_id, read_at) VALUES (?, ?, NOW()) ON DUPLICATE KEY UPDATE read_at = NOW()",
    [userId, postId],
    (err, result) => {
      if (err) {
        console.log("HISTORY ERROR:", err);
        return res.status(500).json(err);
      }

      res.json({ msg: "Đã lưu lịch sử" });
    }
  );
};

// lấy lịch sử
exports.getReadingHistory = (req, res) => {
  const userId = req.user.id;
  const sql = `
    SELECT h.id as history_id, h.read_at, p.*
    FROM reading_history h
    JOIN posts p ON h.post_id = p.id
    WHERE h.user_id = ?
    ORDER BY h.read_at DESC
  `;

  db.query(sql, [userId], (err, result) => {
      if (err) {
        console.log("GET HISTORY ERROR:", err);
        return res.status(500).json(err);
      }

      res.json(result);
    }
  );
};