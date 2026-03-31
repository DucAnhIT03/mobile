/**
 * Script xoá video seeded cũ để cho seeder chèn lại 100 video mới
 * Chạy: node reset_videos.js
 */
const mysql = require('mysql2/promise');

async function main() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'mobileapp_chat',
  });

  // Đếm video hiện tại
  const [countRows] = await conn.query("SELECT COUNT(*) as cnt FROM posts WHERE type = 'video'");
  console.log(`📊 Hiện có ${countRows[0].cnt} video trong database`);

  // Xoá tất cả video interactions trước (foreign key)
  const [delInteractions] = await conn.query("DELETE FROM video_interactions");
  console.log(`🗑️  Đã xoá ${delInteractions.affectedRows} video interactions`);

  // Xoá tất cả video posts
  const [delPosts] = await conn.query("DELETE FROM posts WHERE type = 'video'");
  console.log(`🗑️  Đã xoá ${delPosts.affectedRows} video posts`);

  // Xoá user interests (sẽ tự tạo lại từ thuật toán)
  const [delInterests] = await conn.query("DELETE FROM user_interests");
  console.log(`🗑️  Đã xoá ${delInterests.affectedRows} user interests`);

  console.log('\n✅ Database đã sạch! Restart backend server để seeder tự chèn 100 video mới.');
  
  await conn.end();
}

main().catch(e => {
  console.error('❌ Lỗi:', e.message);
  process.exit(1);
});
