const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "24050068@Phong",
  database: "blog_database",
  port: 3306,
  charset: "utf8mb4",
  timezone: "+07:00",
});

db.connect(err => {
  if (err) {
    console.log("❌ DB ERROR:", err);
    return;
  }
  console.log("✅ MySQL connected");
  // Đảm bảo encoding UTF-8 cho toàn bộ session
  db.query("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci");
  db.query("SET CHARACTER SET utf8mb4");
});

module.exports = db;