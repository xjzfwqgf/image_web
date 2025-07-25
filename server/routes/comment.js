const express = require('express');
const router = express.Router();
const db = require('../db');

// 发表评论
router.post('/comment', (req, res) => {
  const body = req.body || {};
  const { img_uuid, user_id, username, content } = body;
  if (!img_uuid || !user_id || !username || !content) {
    return res.json({ code: 400, message: '参数不完整' });
  }
  // 兼容 user_id 实际为 username
  db.get('SELECT Permissions FROM users WHERE username = ?', [user_id], (err, row) => {
    if (err || !row) return res.json({ code: 403, message: '用户不存在', err: err ,row: row });
    if (row.Permissions < 1) return res.json({ code: 403, message: '访客无法评论' });
    db.run(
      'INSERT INTO comments (img_uuid, user_id, username, content) VALUES (?, ?, ?, ?)',
      [img_uuid, user_id, username, content],
      function (err) {
        if (err) return res.json({ code: 500, message: '数据库错误' });
        res.json({ code: 201, message: '评论成功', comment_id: this.lastID });
      }
    );
  });
});

// 获取评论列表
router.get('/comments', (req, res) => {
  const { img_uuid } = req.query;
  if (!img_uuid) return res.json({ code: 400, message: '缺少图片ID' });
  db.all('SELECT * FROM comments WHERE img_uuid = ? ORDER BY create_time DESC', [img_uuid], (err, rows) => {
    if (err) return res.json({ code: 500, message: '数据库错误' });
    res.json({ code: 200, comments: rows });
  });
});

module.exports = router;
