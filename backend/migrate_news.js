require('dotenv').config();
const mysql = require('mysql2/promise');

async function migrate() {
  let conn;
  try {
    conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'blog_database',
      multipleStatements: true
    });

    console.log('✅ Kết nối database thành công');

    const alterCols = [
      { col: 'description',      sql: "ADD COLUMN `description` TEXT DEFAULT NULL COMMENT 'Mô tả ngắn' AFTER `content`" },
      { col: 'image_caption',    sql: "ADD COLUMN `image_caption` VARCHAR(500) DEFAULT NULL COMMENT 'Ghi chú ảnh' AFTER `thumbnail`" },
      { col: 'friendly_title',   sql: "ADD COLUMN `friendly_title` VARCHAR(300) DEFAULT NULL COMMENT 'SEO title' AFTER `slug`" },
      { col: 'meta_description', sql: "ADD COLUMN `meta_description` VARCHAR(500) DEFAULT NULL COMMENT 'Meta description' AFTER `friendly_title`" },
      { col: 'meta_keyword',     sql: "ADD COLUMN `meta_keyword` VARCHAR(500) DEFAULT NULL COMMENT 'Meta keywords' AFTER `meta_description`" },
      { col: 'source',           sql: "ADD COLUMN `source` VARCHAR(200) DEFAULT NULL COMMENT 'Nguồn bài viết' AFTER `meta_keyword`" },
      { col: 'display_order',    sql: "ADD COLUMN `display_order` INT NOT NULL DEFAULT 0 COMMENT 'Thứ tự hiển thị' AFTER `source`" },
    ];

    // Check existing columns
    const [cols] = await conn.query(`SHOW COLUMNS FROM posts`);
    const existingCols = cols.map(c => c.Field);

    for (const { col, sql } of alterCols) {
      if (existingCols.includes(col)) {
        console.log(`  ⏭  Cột "${col}" đã tồn tại, bỏ qua.`);
      } else {
        await conn.query(`ALTER TABLE posts ${sql}`);
        console.log(`  ✅ Thêm cột "${col}" thành công.`);
      }
    }

    console.log('\n🎉 Migration hoàn thành!');
  } catch (err) {
    console.error('❌ Migration thất bại:', err.message);
    process.exit(1);
  } finally {
    if (conn) conn.end();
  }
}

migrate();
