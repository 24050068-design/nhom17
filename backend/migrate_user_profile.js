// Migration: thêm các cột profile vào bảng users
const db = require('./config/db');

const cols = [
  { name: 'gender',   def: "ENUM('male','female','other') DEFAULT NULL AFTER avatar_url" },
  { name: 'birthday', def: "DATE DEFAULT NULL AFTER gender" },
  { name: 'phone',    def: "VARCHAR(20) DEFAULT NULL AFTER birthday" },
  { name: 'address',  def: "VARCHAR(255) DEFAULT NULL AFTER phone" },
];

(async () => {
  for (const col of cols) {
    try {
      await db.promise().query(`ALTER TABLE users ADD COLUMN ${col.name} ${col.def}`);
      console.log(`✅ Thêm cột '${col.name}' thành công`);
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log(`⚠️  Cột '${col.name}' đã tồn tại, bỏ qua`);
      } else {
        console.error(`❌ Lỗi cột '${col.name}':`, err.message);
      }
    }
  }
  console.log('🎉 Migration hoàn tất!');
  process.exit(0);
})();
