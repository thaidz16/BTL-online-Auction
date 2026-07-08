const mysql = require('mysql2/promise');
require('dotenv').config();
console.log("DEBUG DB_HOST:", process.env.DB_HOST);
console.log("DEBUG DB_PORT:", process.env.DB_PORT);

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: {
  rejectUnauthorized: false,
  requestCert: true
}
});

pool.getConnection()
    .then(() => console.log('🛢️ Kết nối MySQL thành công!'))
    .catch((err) => console.error('Lỗi kết nối DB:', err));

module.exports = pool;