const db = require("../config/db");

// Helper: tạo slug từ tiếng Việt
function createSlug(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d").replace(/Đ/g, "D")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// LIST + PAGINATION (public)
exports.getPosts = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const categoryId = req.query.category_id;

  let sql = `
    SELECT p.*, c.name as category_name, u.username as author_name
    FROM posts p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN users u ON p.author_id = u.id
    WHERE p.status = 'published'
  `;
  const params = [];

  if (categoryId) {
    sql += " AND p.category_id = ?";
    params.push(categoryId);
  }

  sql += " ORDER BY p.created_at DESC LIMIT ? OFFSET ?";
  params.push(limit, offset);

  db.query(sql, params, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
};

// DETAIL + VIEW +1 (public)
exports.getPostDetail = (req, res) => {
  const id = req.params.id;

  db.query("UPDATE posts SET views = views + 1 WHERE id = ?", [id]);

  db.query(
    `SELECT p.*, c.name as category_name, u.username as author_name
     FROM posts p
     LEFT JOIN categories c ON p.category_id = c.id
     LEFT JOIN users u ON p.author_id = u.id
     WHERE p.id = ?`,
    [id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      if (!result || result.length === 0) {
        return res.status(404).json({ msg: "Bài viết không tồn tại" });
      }
      res.json(result[0]);
    }
  );
};

// ─── ADMIN: GET ALL POSTS (kể cả draft) với filter ──────────────────
exports.getAllPostsAdmin = (req, res) => {
  const { category_id, from_date, to_date, search, search_by } = req.query;

  let sql = `
    SELECT p.*,
           c.name as category_name,
           COALESCE(u.username, 'Không rõ') as author_name,
           COALESCE(u.full_name, u.username, 'Không rõ') as author_full_name
    FROM posts p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN users u ON p.author_id = u.id
    WHERE 1=1
  `;
  const params = [];

  if (category_id) { sql += ' AND p.category_id = ?'; params.push(category_id); }
  if (from_date)   { sql += ' AND DATE(p.created_at) >= ?'; params.push(from_date); }
  if (to_date)     { sql += ' AND DATE(p.created_at) <= ?'; params.push(to_date); }
  if (search && search_by) {
    if (search_by === 'id')     { sql += ' AND p.id = ?'; params.push(parseInt(search) || 0); }
    if (search_by === 'title')  { sql += ' AND p.title LIKE ?'; params.push('%' + search + '%'); }
    if (search_by === 'author') { sql += ' AND u.username LIKE ?'; params.push('%' + search + '%'); }
  }

  sql += ' ORDER BY p.created_at DESC';

  db.query(sql, params, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
};

// CREATE (admin)
exports.createPost = (req, res) => {
  const { title, content, category_id, thumbnail, status, author_id, description, image_caption, friendly_url, friendly_title, meta_description, meta_keyword, source, display_order } = req.body;
  const finalAuthorId = author_id ? parseInt(author_id) : req.user.id;
  const slug = friendly_url ? friendly_url : (createSlug(title) + "-" + Date.now());
  const postStatus = status || "draft";

  db.query(
    `INSERT INTO posts (title, content, description, category_id, slug, author_id, thumbnail, image_caption, status, friendly_title, meta_description, meta_keyword, source, display_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [title, content || '', description || null, category_id || null, slug, finalAuthorId, thumbnail || null, image_caption || null, postStatus, friendly_title || null, meta_description || null, meta_keyword || null, source || null, display_order || 0],
    (err, result) => {
      if (err) {
        console.log("INSERT ERROR:", err);
        return res.status(500).json(err);
      }
      res.json({ msg: "Tạo bài viết thành công", postId: result.insertId });
    }
  );
};

// UPDATE (admin)
exports.updatePost = (req, res) => {
  const id = req.params.id;
  const { title, content, description, category_id, thumbnail, image_caption, status, author_id, friendly_url, friendly_title, meta_description, meta_keyword, source, display_order } = req.body;

  let sql = "UPDATE posts SET ";
  const fields = [];
  const params = [];

  if (title !== undefined) { fields.push("title = ?"); params.push(title); }
  if (title !== undefined) { fields.push("slug = ?"); params.push(friendly_url || (createSlug(title) + "-" + id)); }
  if (content !== undefined) { fields.push("content = ?"); params.push(content); }
  if (description !== undefined) { fields.push("description = ?"); params.push(description || null); }
  if (category_id !== undefined) { fields.push("category_id = ?"); params.push(category_id || null); }
  if (thumbnail !== undefined) { fields.push("thumbnail = ?"); params.push(thumbnail || null); }
  if (image_caption !== undefined) { fields.push("image_caption = ?"); params.push(image_caption || null); }
  if (status !== undefined) { fields.push("status = ?"); params.push(status); }
  if (author_id !== undefined && author_id) { fields.push("author_id = ?"); params.push(parseInt(author_id)); }
  if (friendly_title !== undefined) { fields.push("friendly_title = ?"); params.push(friendly_title || null); }
  if (meta_description !== undefined) { fields.push("meta_description = ?"); params.push(meta_description || null); }
  if (meta_keyword !== undefined) { fields.push("meta_keyword = ?"); params.push(meta_keyword || null); }
  if (source !== undefined) { fields.push("source = ?"); params.push(source || null); }
  if (display_order !== undefined) { fields.push("display_order = ?"); params.push(display_order || 0); }

  if (fields.length === 0) {
    return res.status(400).json({ msg: "Không có dữ liệu để cập nhật" });
  }

  sql += fields.join(", ") + " WHERE id = ?";
  params.push(id);

  db.query(sql, params, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ msg: "Cập nhật thành công" });
  });
};

// DELETE (admin) - cascade xóa các bản ghi liên quan
exports.deletePost = async (req, res) => {
  const id = req.params.id;
  try {
    // Xóa các bảng phụ thuộc trước
    await db.promise().query("DELETE FROM comments WHERE post_id = ?", [id]);
    await db.promise().query("DELETE FROM bookmarks WHERE post_id = ?", [id]).catch(() => {});
    await db.promise().query("DELETE FROM reading_history WHERE post_id = ?", [id]).catch(() => {});
    await db.promise().query("DELETE FROM post_ratings WHERE post_id = ?", [id]).catch(() => {});
    // Xóa bài viết
    await db.promise().query("DELETE FROM posts WHERE id = ?", [id]);
    res.json({ msg: "Xóa bài viết thành công" });
  } catch (err) {
    console.error("DELETE POST ERROR:", err);
    res.status(500).json({ msg: "Xóa thất bại", error: err.message });
  }
};

// CLONE POST (admin)
exports.clonePost = async (req, res) => {
  const id = req.params.id;
  try {
    const [rows] = await db.promise().query('SELECT * FROM posts WHERE id = ?', [id]);
    if (!rows || rows.length === 0) return res.status(404).json({ msg: 'Bài viết không tồn tại' });
    const orig = rows[0];
    const newSlug = createSlug(orig.title) + '-copy-' + Date.now();
    const newTitle = '[Copy] ' + orig.title;
    const [result] = await db.promise().query(
      `INSERT INTO posts (title, content, description, category_id, slug, author_id, thumbnail, image_caption, status, friendly_title, meta_description, meta_keyword, source, display_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?, ?, ?, ?)`,
      [newTitle, orig.content, orig.description, orig.category_id, newSlug, req.user.id, orig.thumbnail, orig.image_caption, orig.friendly_title, orig.meta_description, orig.meta_keyword, orig.source, orig.display_order || 0]
    );
    res.json({ msg: 'Nhân bản thành công', postId: result.insertId });
  } catch (err) {
    console.error('CLONE ERROR:', err);
    res.status(500).json({ msg: 'Nhân bản thất bại', error: err.message });
  }
};

// BULK STATUS (admin) — body: { ids: [1,2,3], status: 'published'|'draft' }
exports.bulkUpdateStatus = async (req, res) => {
  const { ids, status } = req.body;
  if (!ids || !ids.length) return res.status(400).json({ msg: 'Không có bài viết được chọn' });
  if (!['published', 'draft'].includes(status)) return res.status(400).json({ msg: 'Trạng thái không hợp lệ' });
  try {
    await db.promise().query('UPDATE posts SET status = ? WHERE id IN (?)', [status, ids]);
    res.json({ msg: `Đã cập nhật ${ids.length} bài viết` });
  } catch (err) {
    res.status(500).json({ msg: 'Cập nhật thất bại', error: err.message });
  }
};

// BULK DELETE (admin) — body: { ids: [1,2,3] }
exports.bulkDelete = async (req, res) => {
  const { ids } = req.body;
  if (!ids || !ids.length) return res.status(400).json({ msg: 'Không có bài viết được chọn' });
  try {
    await db.promise().query('DELETE FROM comments WHERE post_id IN (?)', [ids]);
    await db.promise().query('DELETE FROM bookmarks WHERE post_id IN (?)', [ids]).catch(() => {});
    await db.promise().query('DELETE FROM reading_history WHERE post_id IN (?)', [ids]).catch(() => {});
    await db.promise().query('DELETE FROM post_ratings WHERE post_id IN (?)', [ids]).catch(() => {});
    await db.promise().query('DELETE FROM posts WHERE id IN (?)', [ids]);
    res.json({ msg: `Đã xóa ${ids.length} bài viết` });
  } catch (err) {
    res.status(500).json({ msg: 'Xóa thất bại', error: err.message });
  }
};

// LIKE POST (placeholder)
exports.likePost = (req, res) => {
  res.json({ msg: "like ok" });
};

// RATE POST (placeholder)
exports.ratePost = (req, res) => {
  res.json({ msg: "rate ok" });
};

// ─── ADMIN: DASHBOARD STATS ──────────────────────────────
exports.getDashboardStats = (req, res) => {
  const queries = {
    totalPosts: "SELECT COUNT(*) as count FROM posts",
    publishedPosts: "SELECT COUNT(*) as count FROM posts WHERE status = 'published'",
    draftPosts: "SELECT COUNT(*) as count FROM posts WHERE status = 'draft'",
    totalUsers: "SELECT COUNT(*) as count FROM users",
    totalComments: "SELECT COUNT(*) as count FROM comments",
    totalViews: "SELECT COALESCE(SUM(views), 0) as count FROM posts",
    totalCategories: "SELECT COUNT(*) as count FROM categories",
    recentPosts: `SELECT p.id, p.title, p.status, p.views, p.created_at, u.username as author_name
                  FROM posts p LEFT JOIN users u ON p.author_id = u.id
                  ORDER BY p.created_at DESC LIMIT 5`,
  };

  const stats = {};
  const keys = Object.keys(queries);
  let done = 0;

  keys.forEach(key => {
    db.query(queries[key], (err, result) => {
      if (err) {
        stats[key] = key === "recentPosts" ? [] : 0;
      } else {
        stats[key] = key === "recentPosts" ? result : result[0].count;
      }
      done++;
      if (done === keys.length) {
        res.json(stats);
      }
    });
  });
};