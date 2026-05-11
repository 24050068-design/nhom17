exports.uploadImage = (req, res) => {
  console.log("FILE:", req.file);
  console.log("BODY:", req.body);

  if (!req.file) {
    return res.status(400).json({ msg: "Không có file" });
  }

  res.json({
    message: "Upload thành công",
    url: req.file.path
  });
};