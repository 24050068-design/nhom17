const router = require("express").Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
  getReadingHistory,
  addReadingHistory
} = require("../controllers/readingHistoryController");

// lưu lịch sử đọc
router.post("/", authMiddleware, addReadingHistory);

// lấy lịch sử
router.get("/", authMiddleware, getReadingHistory);

module.exports = router;