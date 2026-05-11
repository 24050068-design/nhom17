const Bookmark = require("../models/Bookmark");

exports.toggleBookmark = async (req, res) => {
  const { postId } = req.params;

  const existing = await Bookmark.findOne({
    user: req.user.id,
    post: postId
  });

  if (existing) {
    await existing.deleteOne();
    return res.json({ message: "Đã bỏ lưu" });
  }

  await Bookmark.create({
    user: req.user.id,
    post: postId
  });

  res.json({ message: "Đã lưu" });
};

exports.getBookmarks = async (req, res) => {
  const data = await Bookmark.find({ user: req.user.id }).populate("post");
  res.json(data);
};