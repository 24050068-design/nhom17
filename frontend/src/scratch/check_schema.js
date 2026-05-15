const db = require('../backend/config/db.js');

db.query('DESCRIBE posts', (err, results) => {
  if (err) console.error(err);
  console.log('--- POSTS ---');
  console.table(results);
  
  db.query('DESCRIBE categories', (err, results) => {
    if (err) console.error(err);
    console.log('--- CATEGORIES ---');
    console.table(results);
    
    db.end();
  });
});
