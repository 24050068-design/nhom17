// Migration: tạo bảng newspaper_orders
const db = require('./config/db');

const sql = `
CREATE TABLE IF NOT EXISTS \`newspaper_orders\` (
  \`id\`            int          NOT NULL AUTO_INCREMENT,
  \`full_name\`     varchar(150) NOT NULL,
  \`email\`         varchar(150) DEFAULT NULL,
  \`phone\`         varchar(20)  NOT NULL,
  \`province\`      varchar(100) DEFAULT NULL,
  \`address\`       varchar(255) DEFAULT NULL,
  \`payment_method\` varchar(100) DEFAULT NULL,
  \`invoice\`       tinyint(1)   DEFAULT 0,
  \`invoice_company\` varchar(200) DEFAULT NULL,
  \`invoice_tax\`   varchar(50)  DEFAULT NULL,
  \`invoice_address\` text DEFAULT NULL,
  \`items\`         json         NOT NULL COMMENT 'Chi tiet don hang JSON',
  \`total_amount\`  decimal(12,0) NOT NULL DEFAULT 0,
  \`status\`        enum('pending','confirmed','delivering','completed','cancelled') NOT NULL DEFAULT 'pending',
  \`note\`          text DEFAULT NULL,
  \`user_id\`       int DEFAULT NULL COMMENT 'Neu da dang nhap',
  \`created_at\`    datetime DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\`    datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`idx_orders_status\` (\`status\`),
  KEY \`idx_orders_phone\`  (\`phone\`),
  KEY \`idx_orders_user\`   (\`user_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
`;

(async () => {
  try {
    await db.promise().query(sql);
    console.log('✅ Tạo bảng newspaper_orders thành công!');
  } catch (err) {
    console.error('❌ Lỗi:', err.message);
  }
  process.exit(0);
})();
