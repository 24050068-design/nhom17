const router = require("express").Router();
const ctrl = require("../controllers/postController");
const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

// Public routes
router.get("/", ctrl.getPosts);
router.get("/admin/all", auth, admin, ctrl.getAllPostsAdmin);
router.get("/admin/stats", auth, admin, ctrl.getDashboardStats);
router.get("/:id", ctrl.getPostDetail);

// Admin routes
router.post("/", auth, admin, ctrl.createPost);
router.post("/admin/clone/:id", auth, admin, ctrl.clonePost);
router.post("/admin/bulk-status", auth, admin, ctrl.bulkUpdateStatus);
router.post("/admin/bulk-delete", auth, admin, ctrl.bulkDelete);
router.put("/:id", auth, admin, ctrl.updatePost);
router.delete("/:id", auth, admin, ctrl.deletePost);

// User routes
router.post("/like/:postId", auth, ctrl.likePost);
router.post("/rate/:postId", auth, ctrl.ratePost);

module.exports = router;