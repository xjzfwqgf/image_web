const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./users.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

function optimizeDB() {
  db.run("PRAGMA journal_mode = WAL;");
  db.run("PRAGMA synchronous = OFF;");
  db.run("PRAGMA cache_size = -10000;");
  db.run("PRAGMA temp_store = MEMORY;");
}
function createTable() {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    uuid TEXT PRIMARY KEY,
    username TEXT,
    email TEXT,
    user_map TEXT,
    Permissions INTEGER DEFAULT 1
  );`);
  db.run(`CREATE TABLE IF NOT EXISTS img_info (
    img_uuid INTEGER PRIMARY KEY,
    img_name TEXT,
    img_path TEXT,
    img_size INTEGER,
    img_type TEXT,
    user_id INTEGER,
    maker_name TEXT,
    make_time DATETIME DEFAULT CURRENT_TIMESTAMP
  );`);
  db.run(`CREATE TABLE IF NOT EXISTS comments (
    comment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    img_uuid INTEGER,
    user_id INTEGER,
    username TEXT,
    content TEXT,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP
  );`);
  db.run(`CREATE TABLE IF NOT EXISTS likes (
    like_id INTEGER PRIMARY KEY AUTOINCREMENT,
    img_uuid INTEGER,
    user_id INTEGER,
    username TEXT,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP
  );`);
  db.run(`CREATE TABLE IF NOT EXISTS verification_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    code TEXT NOT NULL
  )`)
}

optimizeDB();
createTable();

module.exports = db;
