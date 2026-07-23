import React, { useState, useEffect } from 'react';
import socket from '../services/socket';

const BidTest = () => {
    const [bids, setBids] = useState([]);
    const [amount, setAmount] = useState('');

    useEffect(() => {
        socket.on('new_bid_update', (data) => {
            setBids((prev) => {
                const updatedBids = [...prev, data];
                
                return updatedBids.sort((a, b) => Number(b.amount) - Number(a.amount));
            });
        });

        return () => socket.off('new_bid_update'); 
    }, []);

    const handlePlaceBid = () => {
        if (!amount || Number(amount) <= 0) {
            alert("Giá đặt phải lớn hơn 0 nhé!");
            return;
        }
        socket.emit('place_bid', { 
            session_id: 1, 
            user_id: 1, 
            amount: Number(amount) 
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
            
            <h4>Lịch sử nhảy giá (Đã sắp xếp tự động):</h4>
            <ul>
                {bids.map((bid, index) => (
                    <li key={index} style={{ fontWeight: index === 0 ? 'bold' : 'normal', color: index === 0 ? 'green' : 'black' }}>
                        User vừa đặt: {bid.amount.toLocaleString('vi-VN')} VNĐ
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default BidTest;