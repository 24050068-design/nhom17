/**
 * Script tạo lại tài khoản admin
 * Usage: node scripts/seed-admin.js
 *
 * Thông tin admin:
 *   username : admin
 *   email    : admin@gmail.com
 *   password : admin123
 *   role_id  : 1  (1=admin, 2=user)
 */

require("dotenv").config();
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");

const db = mysql.createConnection({
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "blog_database",
  port: 3306,
});

const ADMIN = {
  username: "admin",
  email: "admin@gmail.com",
  password: "admin123",
  full_name: "Admin",
  role_id: 1, // 1 = admin
};

db.connect((err) => {
  if (err) {
    console.error("❌ Không kết nối được DB:", err.message);
    process.exit(1);
  }
  console.log("✅ Kết nối MySQL thành công");

  const hashedPassword = bcrypt.hashSync(ADMIN.password, 10);
  console.log(`🔐 Hash password cho "${ADMIN.password}": ${hashedPassword}`);

  // Xóa tài khoản admin cũ (nếu có) theo username HOẶC email
  db.query(
    "DELETE FROM users WHERE username = ? OR email = ?",
    [ADMIN.username, ADMIN.email],
    (err, deleteResult) => {
      if (err) {
        console.error("❌ Lỗi khi xóa admin cũ:", err.message);
        db.end();
        process.exit(1);
      }
      console.log(`🗑️  Đã xóa ${deleteResult.affectedRows} bản ghi admin cũ`);

      // Chèn admin mới
      db.query(
        `INSERT INTO users (username, email, password, full_name, role_id)
         VALUES (?, ?, ?, ?, ?)`,
        [
          ADMIN.username,
          ADMIN.email,
          hashedPassword,
          ADMIN.full_name,
          ADMIN.role_id,
        ],
        (err, insertResult) => {
          if (err) {
            console.error("❌ Lỗi khi tạo admin:", err.message);
            db.end();
            process.exit(1);
          }

          console.log("✅ Tạo tài khoản admin thành công!");
          console.log("─".repeat(40));
          console.log(`  ID       : ${insertResult.insertId}`);
          console.log(`  Username : ${ADMIN.username}`);
          console.log(`  Email    : ${ADMIN.email}`);
          console.log(`  Password : ${ADMIN.password}`);
          console.log(`  Role ID  : ${ADMIN.role_id}  (1=admin, 2=user)`);
          console.log("─".repeat(40));

          // Xác minh bằng cách đọc lại từ DB
          db.query(
            "SELECT id, username, email, full_name, role_id, created_at FROM users WHERE username = ?",
            [ADMIN.username],
            (err, rows) => {
              if (!err && rows.length > 0) {
                console.log("📋 Bản ghi trong DB:");
                console.table(rows);
              }
              db.end();
              console.log("🚀 Hoàn tất! Bạn có thể đăng nhập bằng:");
              console.log(`   Username : ${ADMIN.username}`);
              console.log(`   Password : ${ADMIN.password}`);
            }
          );
        }
      );
    }
  );
});
