require('dotenv').config();
const mysql = require('mysql2/promise');

(async () => {
  const c = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'mobileapp_chat',
  });
  const [result] = await c.query("DELETE FROM posts WHERE media IS NULL OR media = '' OR media = '[]'");
  console.log('Deleted broken posts:', result.affectedRows);
  const [rows] = await c.query('SELECT COUNT(*) as cnt FROM posts');
  console.log('Remaining posts:', rows[0].cnt);
  await c.end();
})();
