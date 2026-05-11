const router = require("express").Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  toggleBookmark,
  getBookmarks
} = require("../controllers/bookmarkController");

// 👉 GET: lấy danh sách bài đã lưu của một user
router.get("/", authMiddleware, getBookmarks);

// 👉 POST: toggle (thêm/bỏ) bài viết vào danh sách đã lưu
router.post("/:postId", authMiddleware, toggleBookmark);

module.exports = router;