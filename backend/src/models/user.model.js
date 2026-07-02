const db = require('../config/db');

const UserModel = {
    findByEmail: async (email) => {
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    },
    create: async (userData) => {
        const { fullname, email, password } = userData;
        const [result] = await db.execute(
            'INSERT INTO users (fullname, email, password) VALUES (?, ?, ?)',
            [fullname, email, password]
        );
        return result.insertId;
    }
};

module.exports = UserModel;