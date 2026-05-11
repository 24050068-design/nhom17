const db = require("../config/db");

let lastComment = {};

// CREATE comment
exports.createComment = (req, res) => {
  const { content, postId, parentId } = req.body;
  const userId = req.user.id;

  if (!content || !postId) {
    return res.status(400).json({ msg: "Thiếu dữ liệu" });
  }

  const now = Date.now();

  if (lastComment[userId] && now - lastComment[userId] < 5000) {
    return res.status(429).json({ msg: "Bạn đang gửi quá nhanh, vui lòng chờ 5 giây" });
  }

  db.query(
    "INSERT INTO comments (content, post_id, user_id, parent_id) VALUES (?, ?, ?, ?)",
    [content, postId, userId, parentId || null],
    (err, result) => {
      if (err) {
        console.log("INSERT ERROR:", err);
        return res.status(500).json(err);
      }

      lastComment[userId] = now;

      // Gửi notification cho chủ bài viết
      db.query("SELECT author_id FROM posts WHERE id = ?", [postId], (err2, r) => {
        if (r && r.length > 0) {
          const postOwnerId = r[0].author_id;
          if (postOwnerId && postOwnerId !== userId) {
            db.query(
              "INSERT INTO notifications (user_id, type, message) VALUES (?, ?, ?)",
              [postOwnerId, "comment", "Có người đã bình luận bài viết của bạn"]
            );
          }
        }
      });

      res.json({ msg: "Bình luận thành công", commentId: result.insertId });
    }
  );
};

// GET comments by post (public) - tree structure
exports.getCommentsByPost = (req, res) => {
  const postId = req.params.post_id || req.params.postId;

  db.query(
    `SELECT c.*, u.username, u.avatar_url
     FROM comments c
     LEFT JOIN users u ON c.user_id = u.id
     WHERE c.post_id = ?
     ORDER BY c.created_at ASC`,
    [postId],
    (err, result) => {
      if (err) return res.status(500).json(err);

      const buildTree = (comments, parentId = null) => {
        return comments
          .filter(c => c.parent_id === parentId)
          .map(c => ({
            ...c,
            children: buildTree(comments, c.id)
          }));
      };

      const tree = buildTree(result);
      res.json(tree);
    }
  );
};

// GET MY comments - current logged-in user's comments
exports.getMyComments = (req, res) => {
  const userId = req.user.id;
  db.query(
    `SELECT c.id, c.content, c.created_at, c.post_id,
            p.title as post_title
     FROM comments c
     LEFT JOIN posts p ON c.post_id = p.id
     WHERE c.user_id = ?
     ORDER BY c.created_at DESC
     LIMIT 50`,
    [userId],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
    }
  );
};

// GET all comments (admin)
exports.getAllCommentsAdmin = (req, res) => {
  db.query(
    `SELECT c.*, u.username, p.title as post_title
     FROM comments c
     LEFT JOIN users u ON c.user_id = u.id
     LEFT JOIN posts p ON c.post_id = p.id
     ORDER BY c.created_at DESC`,
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
    }
  );
};

// DELETE comment (admin) - cascade
exports.deleteComment = async (req, res) => {
  const id = req.params.id;
  try {
    // Xóa likes của comment này
    await db.promise().query("DELETE FROM likes WHERE comment_id = ?", [id]).catch(() => {});
    // Xóa các reply (child comments)
    const [children] = await db.promise().query("SELECT id FROM comments WHERE parent_id = ?", [id]);
    for (const child of children) {
      await db.promise().query("DELETE FROM likes WHERE comment_id = ?", [child.id]).catch(() => {});
      await db.promise().query("DELETE FROM comments WHERE id = ?", [child.id]);
    }
    // Xóa comment chính
    await db.promise().query("DELETE FROM comments WHERE id = ?", [id]);
    res.json({ msg: "Xóa bình luận thành công" });
  } catch (err) {
    console.error("DELETE COMMENT ERROR:", err);
    res.status(500).json({ msg: "Xóa thất bại", error: err.message });
  }
};

// TOGGLE LIKE
exports.toggleLike = (req, res) => {
  const userId = req.user.id;
  const commentId = req.params.id;

  db.query(
    "SELECT * FROM likes WHERE user_id = ? AND comment_id = ?",
    [userId, commentId],
    (err, r) => {
      if (err) return res.status(500).json(err);

      if (r.length > 0) {
        db.query(
          "DELETE FROM likes WHERE user_id = ? AND comment_id = ?",
          [userId, commentId],
          () => res.json({ liked: false })
        );
      } else {
        db.query(
          "INSERT INTO likes (user_id, comment_id) VALUES (?, ?)",
          [userId, commentId],
          () => {
            // Notification cho chủ comment
            db.query("SELECT user_id FROM comments WHERE id = ?", [commentId], (err2, r2) => {
              if (r2 && r2.length > 0 && r2[0].user_id !== userId) {
                db.query(
                  "INSERT INTO notifications (user_id, type, message) VALUES (?, ?, ?)",
                  [r2[0].user_id, "like", "Có người đã thích bình luận của bạn"]
                );
              }
            });
            res.json({ liked: true });
          }
        );
      }
    }
  );
};

// REPORT comment
exports.reportComment = (req, res) => {
  const userId = req.user.id;
  const commentId = req.params.id;
  const { reason } = req.body;

  if (!reason) return res.status(400).json({ msg: "Vui lòng nhập lý do" });

  db.query(
    "INSERT INTO comment_reports (user_id, comment_id, reason) VALUES (?, ?, ?)",
    [userId, commentId, reason],
    (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({ msg: "Bạn đã báo cáo bình luận này rồi" });
        }
        return res.status(500).json(err);
      }
      res.json({ msg: "Báo cáo thành công" });
    }
  );
};