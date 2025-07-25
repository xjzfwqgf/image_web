const express = require('express');
const router = express.Router();
const db = require('../db');

// 点赞
router.post('/like', (req, res) => {
  const { img_uuid, user_id, username } = req.body;
  if (!img_uuid || !user_id || !username) {
    return res.json({ code: 400, message: '参数不完整' });
  }
  db.get('SELECT Permissions FROM users WHERE username = ?', [user_id], (err, row) => {
    if (err || !row) return res.json({ code: 403, message: '用户不存在' });
    if (row.Permissions < 1) return res.json({ code: 403, message: '访客无法点赞' });
    db.get('SELECT * FROM likes WHERE img_uuid = ? AND user_id = ?', [img_uuid, user_id], (err, row) => {
      if (row) return res.json({ code: 409, message: '您已点赞过' });
      db.run('INSERT INTO likes (img_uuid, user_id, username) VALUES (?, ?, ?)', [img_uuid, user_id, username], function (err) {
        if (err) return res.json({ code: 500, message: '数据库错误' });
        res.json({ code: 201, message: '点赞成功' });
      });
    });
  });
});

// 取消点赞
router.post('/unlike', (req, res) => {
  const body = req.body || {};
  const { img_uuid, user_id } = body;
  if (!img_uuid || !user_id) return res.json({ code: 400, message: '参数不完整' });
  db.run('DELETE FROM likes WHERE img_uuid = ? AND username = ?', [img_uuid, user_id], function (err) {
    if (err) return res.json({ code: 500, message: '数据库错误' });
    res.json({ code: 200, message: '已取消点赞' });
  });
});

// 获取点赞数
router.get('/likes', (req, res) => {
  const { img_uuid } = req.query;
  if (!img_uuid) return res.json({ code: 400, message: '缺少图片ID' });
  db.get('SELECT COUNT(*) as count FROM likes WHERE img_uuid = ?', [img_uuid], (err, row) => {
    if (err) return res.json({ code: 500, message: '数据库错误' });
    res.json({ code: 200, count: row.count });
  });
});

// 判断用户是否已点赞某图片
router.get('/likes/check', (req, res) => {
  const { img_uuid, user_id } = req.query;
  if (!img_uuid || !user_id) return res.json({ code: 400, message: '参数不完整' });
  db.get('SELECT * FROM likes WHERE img_uuid = ? AND username = ?', [img_uuid, user_id], (err, row) => {
    if (err) return res.json({ code: 500, message: '数据库错误' });
    res.json({ code: 200, liked: !!row });
  });
});

module.exports = router;
