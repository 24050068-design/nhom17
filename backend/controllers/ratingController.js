const db = require("../config/db");

exports.ratePost = async (req, res) => {
  const userId = req.user.id;
  const postId = req.params.postId;
  // Hỗ trợ cả 'score' và 'rating' từ frontend
  const score = req.body.score ?? req.body.rating;

  if (!score || score < 1 || score > 5) {
    return res.status(400).json({ msg: "Điểm đánh giá phải từ 1 đến 5" });
  }

  try {
    // Kiểm tra đã đánh giá chưa
    const [existing] = await db.promise().query(
      "SELECT id FROM post_ratings WHERE user_id = ? AND post_id = ?",
      [userId, postId]
    );

    if (existing.length > 0) {
      // Cập nhật nếu đã tồn tại
      await db.promise().query(
        "UPDATE post_ratings SET score = ? WHERE user_id = ? AND post_id = ?",
        [score, userId, postId]
      );
    } else {
      // Thêm mới
      await db.promise().query(
        "INSERT INTO post_ratings (user_id, post_id, score) VALUES (?, ?, ?)",
        [userId, postId, score]
      );
    }

    // Tính điểm trung bình
    const [[avg]] = await db.promise().query(
      "SELECT AVG(score) as avg_rating, COUNT(*) as total FROM post_ratings WHERE post_id = ?",
      [postId]
    );

    res.json({
      msg: "Đánh giá thành công",
      avg_rating: parseFloat(avg.avg_rating).toFixed(1),
      total: avg.total,
      user_rating: score
    });
  } catch (err) {
    console.error("RATE ERROR:", err);
    res.status(500).json({ msg: "Lỗi server", error: err.message });
  }
};