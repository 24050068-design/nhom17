const mysql = require('mysql2/promise');

const dbConfig = {
  host: '127.0.0.1',
  user: 'root',
  password: '24050068@Phong',
  database: 'blog_database',
  port: 3306
};

async function run() {
  const c = await mysql.createConnection(dbConfig);
  try {
    const q1 = await c.query("UPDATE posts SET content = REPLACE(content, '<p>', '')");
    const q2 = await c.query("UPDATE posts SET content = REPLACE(content, '</p>', '\\n\\n')");
    const q3 = await c.query("UPDATE posts SET content = REPLACE(content, '<h3>', '\\n--- ')");
    const q4 = await c.query("UPDATE posts SET content = REPLACE(content, '</h3>', ' ---\\n\\n')");
    console.log('Fixed DB HTML tags successfully', q1[0].affectedRows);
  } catch(e) {
    console.log('Error:', e);
  } finally {
    await c.end();
  }
}
run();
