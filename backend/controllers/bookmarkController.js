const db = require("../config/db");

// 👉 lấy bookmark
exports.getBookmarks = (req, res) => {
  const userId = req.user.id;

  const sql = `
    SELECT b.id as bookmark_id, b.created_at as saved_at, p.*
    FROM bookmarks b
    JOIN posts p ON b.post_id = p.id
    WHERE b.user_id = ?
    ORDER BY b.created_at DESC
  `;

  db.query(sql, [userId], (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
    }
  );
};

// 👉 toggle bookmark
exports.toggleBookmark = (req, res) => {
  const userId = req.user.id;
  const post_id = req.params.postId || req.body.post_id;

  // 👉 CHẶN NULL
  if (!post_id) {
    return res.status(400).json({ msg: "Thiếu post_id" });
  }

  db.query(
    "SELECT * FROM bookmarks WHERE user_id = ? AND post_id = ?",
    [userId, post_id],
    (err, r) => {
      if (err) return res.status(500).json(err);

      if (r.length > 0) {
        db.query(
          "DELETE FROM bookmarks WHERE user_id = ? AND post_id = ?",
          [userId, post_id],
          () => res.json({ msg: "Đã bỏ bookmark" })
        );
      } else {
        db.query(
          "INSERT INTO bookmarks (user_id, post_id) VALUES (?, ?)",
          [userId, post_id],
          (err) => {
            if (err) return res.status(500).json(err);

            res.json({ msg: "Đã bookmark" });
          }
        );
      }
    }
  );
};