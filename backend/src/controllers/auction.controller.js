const db = require('../config/db');

const AuctionController = {
    createSession: async (req, res) => {
        try {
            const { asset_id, start_price, step_price, start_time, end_time } = req.body;
            const [result] = await db.execute(
                `INSERT INTO auction_sessions (asset_id, start_price, current_price, step_price, start_time, end_time, status) 
                 VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')`,
                [asset_id, start_price, start_price, step_price, start_time, end_time]
            );
            res.status(201).json({ success: true, session_id: result.insertId });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Lỗi server!' });
        }
    },

    placeBid: async (req, res) => {
        const { session_id, bid_amount } = req.body;
        const userId = req.user.id;
        
        const amountToBid = parseFloat(bid_amount);

        if (!amountToBid || amountToBid <= 0) {
            return res.status(400).json({ success: false, message: 'Giá đặt không hợp lệ!' });
        }

        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            const [session] = await connection.execute(
                'SELECT current_price, status FROM auction_sessions WHERE id = ? FOR UPDATE', 
                [session_id]
            );
            
            if (session.length === 0 || session[0].status !== 'ACTIVE') {
                throw new Error('Phiên không tồn tại hoặc đã kết thúc!');
            }

            const currentPrice = parseFloat(session[0].current_price);

            if (amountToBid <= currentPrice) {
                throw new Error('Giá đặt phải lớn hơn giá hiện tại!');
            }

            const [user] = await connection.execute(
                'SELECT balance FROM users WHERE id = ? FOR UPDATE', 
                [userId]
            );
            
            const currentBalance = parseFloat(user[0].balance || 0);

            if (currentBalance < amountToBid) {
                throw new Error('Số dư không đủ!');
            }

            const [previousBid] = await connection.execute(
                'SELECT user_id, amount FROM bids WHERE session_id = ? ORDER BY amount DESC LIMIT 1 FOR UPDATE',
                [session_id]
            );

            if (previousBid.length > 0) {
                const prevUserId = previousBid[0].user_id;
                const prevAmount = parseFloat(previousBid[0].amount);

                await connection.execute(
                    'UPDATE users SET balance = balance + ? WHERE id = ?', 
                    [prevAmount, prevUserId]
                );
            }

            await connection.execute(
                'UPDATE users SET balance = balance - ? WHERE id = ?', 
                [amountToBid, userId]
            );
            
            await connection.execute(
                'INSERT INTO bids (session_id, user_id, amount) VALUES (?, ?, ?)', 
                [session_id, userId, amountToBid]
            );
            
            await connection.execute(
                'UPDATE auction_sessions SET current_price = ? WHERE id = ?', 
                [amountToBid, session_id]
            );

            await connection.commit();
            
            req.io.emit('new_bid_update', { 
                session_id: session_id,
                amount: amountToBid 
            });

            res.status(200).json({ success: true, message: 'Đấu giá thành công!' });
        } catch (error) {
            await connection.rollback();
            res.status(400).json({ success: false, message: error.message });
        } finally {
            connection.release();
        }
    }
};

module.exports = AuctionController;