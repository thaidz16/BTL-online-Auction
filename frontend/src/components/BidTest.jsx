import React, { useState, useEffect } from 'react';
import socket from '../services/socket';

const BidTest = () => {
    const [bids, setBids] = useState([]);
    const [amount, setAmount] = useState('');

    useEffect(() => {
        // Lắng nghe xem có ai vừa đặt giá mới không
        socket.on('new_bid_update', (data) => {
            setBids((prev) => [...prev, data]);
        });

        return () => socket.off('new_bid_update'); // Dọn dẹp khi tắt component
    }, []);

    const handlePlaceBid = () => {
        // Gửi sự kiện 'place_bid' lên Server
        socket.emit('place_bid', { 
            session_id: 1, 
            user_id: 1, 
            amount: amount 
        });
        setAmount('');
    };

    return (
        <div style={{ padding: '20px', border: '1px solid #ccc' }}>
            <h3>🔥 Đấu giá Realtime</h3>
            <input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                placeholder="Nhập giá đấu"
            />
            <button onClick={handlePlaceBid}>Đặt giá ngay</button>
            
            <h4>Lịch sử nhảy giá:</h4>
            <ul>
                {bids.map((bid, index) => (
                    <li key={index}>User vừa đặt: {bid.amount} VNĐ</li>
                ))}
            </ul>
        </div>
    );
};

export default BidTest;