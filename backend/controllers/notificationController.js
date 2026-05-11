
const db = require("../config/db");

// GET notifications
exports.getNotifications = (req, res) => {
  const userId = req.user.id;

  db.query(
    "SELECT * FROM notifications WHERE user_id = ?",
    [userId],
    (err, result) => {
      if (err) {
        console.log("NOTI ERROR:", err);
        return res.status(500).json(err);
      }

      res.json(result);
    }
  );
};

// MARK AS READ
exports.markAsRead = (req, res) => {
  const id = req.params.id;

  db.query(
    "UPDATE notifications SET is_read = 1 WHERE id = ?",
    [id],
    (err, result) => {
      if (err) {
        console.log("UPDATE ERROR:", err);
        return res.status(500).json(err);
      }

      res.json({ msg: "Đã đọc" });
    }
  );
};