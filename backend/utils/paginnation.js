const page = req.query.page || 1;
const limit = 10;
const offset = (page - 1) * limit;

db.query(
  "SELECT * FROM posts LIMIT ? OFFSET ?",
  [limit, offset],
  (err, results) => {
    res.json(results);
  }
);