const router = require("express").Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  toggleBookmark,
  getBookmarks
} = require("../controllers/bookmarkController");

router.post("/:postId", authMiddleware, toggleBookmark);
router.get("/", authMiddleware, getBookmarks);

module.exports = router;