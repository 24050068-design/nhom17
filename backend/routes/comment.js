const router = require("express").Router();
const ctrl = require("../controllers/commentController");
const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

// Public - get comments by post
router.get("/:post_id", ctrl.getCommentsByPost);

// User - create comment
router.post("/", auth, ctrl.createComment);

// User - get own comments
router.get("/my/list", auth, ctrl.getMyComments);

// User - like/report
router.post("/like/:id", auth, ctrl.toggleLike);
router.post("/report/:id", auth, ctrl.reportComment);

// Admin
router.get("/admin/all", auth, admin, ctrl.getAllCommentsAdmin);
router.delete("/:id", auth, admin, ctrl.deleteComment);

module.exports = router;
