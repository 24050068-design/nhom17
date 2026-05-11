const router = require("express").Router();
const upload = require("../middleware/upload");
const auth = require("../middleware/authMiddleware");
const { uploadImage } = require("../controllers/uploadController");

router.post("/", auth, upload.single("image"), uploadImage);

module.exports = router;