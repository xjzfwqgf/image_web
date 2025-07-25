// 主文件
const express = require("express");
const app = express();
const post = 80;
const cors = require("cors");
const path = require("path");
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

// 路由模块导入
const authRouter = require('./routes/auth');
const imageRouter = require('./routes/image');
const commentRouter = require('./routes/comment');
const likeRouter = require('./routes/like');
const db = require('./db');

// https访问
// const options = {
//   key: fs.readFileSync('./cert/private.key'),
//   cert: fs.readFileSync('./cert/certificate.crt')
// };

/*https.createServer(options, app)*/app.listen(post, () => {
  console.log(`HTTPS Server is running on http://localhost:${post}`);
});
app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 分类路由
app.use('/auth', authRouter);
app.use('/image', imageRouter);
app.use('/comment', commentRouter);
app.use('/like', likeRouter);
// 兼容所有旧路径，主路由挂载所有业务路由
app.use('/', authRouter);
app.use('/', imageRouter);
app.use('/', commentRouter);
app.use('/', likeRouter);

// 邮件验证码接口（未迁移，保留）
const transporter = nodemailer.createTransport({
    host: 'smtp.qq.com',
    port: 587,
    secure: false,
    auth: {
        user: 'huanuo_web@foxmail.com',
        pass: 'kquojwjzckwxdfab'
    }
});
app.get('/getemail', (req, res) => {
    const { email } = req.query;
    if (!email) {
        return res.json({ code: 400, message: '邮箱不能为空' });
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const mailOptions = {
        from: 'huanuo_web@foxmail.com',
        to: email,
        subject: '验证码',
        text: `您的验证码是：${code}`
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            return res.json({ code: 500, message: '邮件发送失败' });
        }
        db.run("INSERT INTO verification_codes (email, code) VALUES (?, ?)", [email, code]);
        res.json({ code: 200, message: '验证码已发送' });
    });
});

