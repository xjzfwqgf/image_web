
// 请将本文件重命名为 generate-config.cjs 再运行：node generate-config.cjs
// 或将 package.json 的 type 改为 commonjs
// 下面为 CommonJS 语法
const fs = require('fs');
const path = require('path');

const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
const config = { apiBaseUrl };

const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

fs.writeFileSync(
  path.join(distDir, 'config.json'),
  JSON.stringify(config, null, 2),
  'utf-8'
);

console.log('config.json 已生成，内容如下:');
console.log(JSON.stringify(config, null, 2));
