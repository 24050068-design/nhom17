require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("./config/passport");

require("./config/db");

const app = express();

app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));

// Session cần cho Passport OAuth
app.use(session({
  secret: process.env.JWT_SECRET || 'fallback_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // true nếu dùng HTTPS
}));
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/auth", require("./routes/oauth"));   // OAuth: Google, Facebook, Zalo
app.use("/api/auth", require("./routes/auth"));
app.use("/api/posts", require("./routes/post"));
app.use("/api/categories", require("./routes/category"));
app.use("/api/comments", require("./routes/comment"));
app.use("/api/upload", require("./routes/upload"));
app.use("/api/bookmarks", require("./routes/bookmark"));
app.use("/api/notifications", require("./routes/notification"));
app.use("/api/ratings", require("./routes/rating"));
app.use("/api/reading-history", require("./routes/readingHistory"));
app.use("/api/users", require("./routes/users"));
app.use("/api/orders", require("./routes/orders"));


app.get("/api/stats", (req, res) => {
  const db = require("./config/db");
  const sql = `
    SELECT 
      (SELECT COUNT(*) FROM posts) AS posts,
      (SELECT COUNT(*) FROM users) AS users,
      (SELECT COUNT(*) FROM categories) AS categories
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0]);
  });
});

app.get("/api", (req, res) => {
  res.send("API OK");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
