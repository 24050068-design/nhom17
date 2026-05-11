const db = require("../config/db");

// GET all categories
exports.getCategories = (req, res) => {
  db.query("SELECT * FROM categories ORDER BY name ASC", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
};

// CREATE category
exports.createCategory = (req, res) => {
  const { name } = req.body;

  if (!name) return res.status(400).json({ msg: "Thiếu tên danh mục" });

  const slug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();

  db.query(
    "INSERT INTO categories (name, slug) VALUES (?, ?)",
    [name, slug],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ msg: "Tạo danh mục thành công", categoryId: result.insertId });
    }
  );
};

// UPDATE category
exports.updateCategory = (req, res) => {
  const id = req.params.id;
  const { name } = req.body;

  if (!name) return res.status(400).json({ msg: "Thiếu tên danh mục" });

  const slug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();

  db.query(
    "UPDATE categories SET name = ?, slug = ? WHERE id = ?",
    [name, slug, id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ msg: "Cập nhật danh mục thành công" });
    }
  );
};

// DELETE category
exports.deleteCategory = async (req, res) => {
  const id = req.params.id;
  try {
    // Set category_id = NULL cho các bài viết thuộc danh mục này
    await db.promise().query("UPDATE posts SET category_id = NULL WHERE category_id = ?", [id]);
    // Xóa danh mục
    await db.promise().query("DELETE FROM categories WHERE id = ?", [id]);
    res.json({ msg: "Xóa danh mục thành công" });
  } catch (err) {
    console.error("DELETE CATEGORY ERROR:", err);
    res.status(500).json({ msg: "Xóa thất bại", error: err.message });
  }
};