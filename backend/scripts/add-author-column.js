const db = require('./config/db');

db.query(
  'ALTER TABLE posts ADD COLUMN author_name_custom VARCHAR(255) DEFAULT NULL',
  (err) => {
    if (err && err.code === 'ER_DUP_FIELDNAME') {
      console.log('Column author_name_custom already exists');
    } else if (err) {
      console.log('Error:', err.message);
    } else {
      console.log('Column author_name_custom added successfully');
    }
    process.exit();
  }
);
