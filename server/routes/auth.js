const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const db = require('../db');

// 登录
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.json({ code:400, message: '用户名和密码不能为空' });
        }
        const hash = crypto.createHash('sha256');
        hash.update(username + password);
        const credentialHash = hash.digest('hex');
        const row = await new Promise((resolve, reject) => {
            db.get(
                "SELECT * FROM users WHERE username = ? AND user_map = ?",
                [username, credentialHash],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });
        if (!row) {
            return res.json({code:401, message: '用户名或密码错误' });
        }
        const token = await new Promise((resolve, reject) => {
            jwt.sign(
                { username },
                'Request',
                { expiresIn: '1h' },
                (err, token) => {
                    if (err) reject(err);
                    else resolve(token);
                }
            );
        });
        return res.json({ 
            code:200,
            message: '登录成功', 
            token 
        });
    } catch (error) {
        console.error('Login error:', error);
        const status = error instanceof jwt.JsonWebTokenError ? 401 : 500;
        return res.status(status).json({ 
            message: status === 401 
                ? 'Invalid token' 
                : 'Internal server error' 
        });
    }
});

// 注册
router.post('/register', async (req, res) => {
    try {
        const { username, password, email, code } = req.body;
        if (!username || !password || !email || !code) {
            return res.json({ code: 400, message: '请填写完整信息' });
        }
        const existingUser = await new Promise((resolve, reject) => {
            db.get(
                "SELECT * FROM users WHERE username = ?",
                [username],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });
        if (existingUser) {
            return res.json({ code: 409, message: '用户名已存在' });
        }
        const verificationRow = await new Promise((resolve, reject) => {
            db.get(
                "SELECT * FROM verification_codes WHERE email = ? AND code = ?",
                [email, code],
                (err, row) => {
                    if (err) reject(err);
                    else{ 
                        db.run("DELETE FROM verification_codes WHERE email = ? AND code = ?", [email, code]);
                        resolve(row);
                    }
                }
            );
        });
        if(!verificationRow || verificationRow.email!=email){
            return res.json({ code: 400, message: '验证码错误' });
        }
        const hash = crypto.createHash('sha256');
        hash.update(username + password);
        const credentialHash = hash.digest('hex');
        await new Promise((resolve, reject) => {
            db.run(
                "INSERT INTO users (email,username, user_map, Permissions) VALUES (?, ?, ?, 1)",
                [email,username, credentialHash],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });
        return res.json({ code: 201, message: '注册成功' });
    } catch (error) {
        console.error('Registration error:', error);
        return res.json({ code: 500, message: '服务器内部错误' });
    }
});

// token校验
router.all('/token', async (req, res) => {
    let token = '';
    if (req.headers['authorization']) {
        const parts = req.headers['authorization'].split(' ');
        if (parts.length === 2 && parts[0] === 'Bearer') {
            token = parts[1];
        } else {
            token = req.headers['authorization'];
        }
    } else if (req.body && req.body.token) {
        token = req.body.token;
    }
    if (!token) {
        return res.json({ code: 401, message: '未提供token' });
    }
    jwt.verify(token, 'Request', (err, decoded) => {
        if (err) {
            return res.json({ code: 401, message: 'token无效' });
        }
        res.json({ code: 200, message: 'token有效', user: decoded });
    });
});

// 退出登录
router.post('/logout', (req, res) => {
    // 前端只需清除本地token，后端可返回成功提示
    res.json({ code: 200, message: '已退出登录' });
});

module.exports = router;
