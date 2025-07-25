CREATE TABLE users (
    uuid INTEGER PRIMARY KEY,
    username TEXT,
    email TEXT,
    hx TEXT
);

CREATE TABLE img_info (
    img_uuid INTEGER PRIMARY KEY,
    maker_name TEXT,
    img_name TEXT,
    img_path TEXT,
    img_size INTEGER,
    img_type TEXT,
    user_id INTEGER,
);