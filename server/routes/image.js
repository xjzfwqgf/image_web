const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const db = require('../db');

// 图片上传
router.post('/updata', (req, res) => {
    const { img_name, image_maker, img_size, img_type, user_id, image_hx } = req.body;
    if (!img_name || !img_size || !img_type || !user_id || !image_maker || !image_hx) {
        return res.json({ code: 400, message: '请填写完整信息' });
    }
    if (req.headers['content-length'] > 50 * 1024 * 1024) {
        return res.status(413).json({ 
            code: 413, 
            message: '文件太大，请上传小于20MB的图片' 
        });
    }
    // 支持 uuid 或 rowid 校验
    db.get('SELECT Permissions FROM users WHERE username = ?', [user_id], (err, row) => {
        if (err || !row) return res.json({ code: 403, message: '用户不存在' });
        if (row.Permissions < 1) return res.json({ code: 403, message: '访客无法上传图片' });
        let ext = 'png';
        if (img_type && img_type.includes('/')) {
            ext = img_type.split('/')[1];
        }
        const publicPath = path.join(__dirname, '../public', `${img_name}`);
        const base64Data = image_hx.replace(/^data:image\/(png|jpeg|jpg|gif);base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        fs.writeFileSync(publicPath, buffer);
        db.run(
            "INSERT INTO img_info (img_name, img_path, img_size, img_type, user_id, maker_name) VALUES (?, ?, ?, ?, ?, ?)",
            [img_name, publicPath, img_size, img_type, user_id, image_maker],
            function (err) {
                if (err) {
                    console.error('Error inserting image info:', err);
                    return res.json({ code: 500, message: '数据库错误' });
                }
                res.json({ code: 201, message: '图片上传成功', id: this.lastID });
            }
        );
    });
});

// 图片删除
router.post('/delete_image', (req, res) => {
    const { img_uuid } = req.body;
    if (!img_uuid) return res.json({ code: 400, message: '缺少图片ID' });
    db.get('SELECT img_path FROM img_info WHERE img_uuid = ?', [img_uuid], (err, row) => {
        if (err) return res.json({ code: 500, message: '数据库错误' });
        if (!row) return res.json({ code: 404, message: '图片不存在' });
        try {
            if (row.img_path && fs.existsSync(row.img_path)) {
                fs.unlinkSync(row.img_path);
            }
        } catch (e) {}
        db.run('DELETE FROM img_info WHERE img_uuid = ?', [img_uuid], function (err) {
            if (err) return res.json({ code: 500, message: '数据库错误' });
            db.run('DELETE FROM comments WHERE img_uuid = ?', [img_uuid]);
            db.run('DELETE FROM likes WHERE img_uuid = ?', [img_uuid]);
            res.json({ code: 200, message: '图片删除成功' });
        });
    });
});

// 获取图片列表
router.get('/images', (req, res) => {
    db.all('SELECT img_uuid, img_name as name, img_size as size, img_type, user_id, maker_name, img_path, make_time FROM img_info', [], async (err, rows) => {
        if (err) {
            console.error('Error reading img_info:', err);
            return res.status(500).send('Internal Server Error');
        }
        const imagesDir = path.join(__dirname, '../public');
        const results = await Promise.all(rows.map(async row => {
            const filePath = row.img_path || path.join(imagesDir, row.name);
            let width = null;
            let height = null;
            try {
                const metadata = await sharp(filePath).metadata();
                width = metadata.width;
                height = metadata.height;
            } catch (e) {
                // 读取失败，返回默认值
                width = '读取失败';
                height = '读取失败';
            }
            return {
                ...row,
                width,
                height
            };
        }));
        res.json(results);
    });
});

// 获取单张图片
router.get('/image', (req, res) => {
    const { n } = req.query;
    res.sendFile(path.join(__dirname, '../public', `${n}`));
});

module.exports = router;
