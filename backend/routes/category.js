const router = require("express").Router();
const ctrl = require("../controllers/categoryController");
const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

// Public
router.get("/", ctrl.getCategories);

// Admin
router.post("/", auth, admin, ctrl.createCategory);
router.put("/:id", auth, admin, ctrl.updateCategory);
router.delete("/:id", auth, admin, ctrl.deleteCategory);

module.exports = router;