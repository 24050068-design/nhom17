const router = require("express").Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  getNotifications,
  markAsRead
} = require("../controllers/notificationController");

router.get("/", authMiddleware, getNotifications);
router.put("/:id", authMiddleware, markAsRead);

module.exports = router;