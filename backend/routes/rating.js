const router = require("express").Router();
const ctrl = require("../controllers/ratingController");
const auth = require("../middleware/authMiddleware");


router.post("/:postId", auth, ctrl.ratePost);
module.exports = router;