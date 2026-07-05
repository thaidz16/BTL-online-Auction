import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import socket from '../services/socket';

const AssetDetailPage = () => {
    const { id } = useParams(); // Lấy ID từ URL
    const [asset, setAsset] = useState(null);
    const [currentPrice, setCurrentPrice] = useState(0);
    const [bidAmount, setBidAmount] = useState('');

    useEffect(() => {
        // 1. Lấy thông tin tài sản
        api.get(`/assets/${id}`).then(res => {
            setAsset(res.data);
            setCurrentPrice(res.data.current_price);
        });

        // 2. Nghe giá nhảy realtime
        socket.on('new_bid_update', (data) => {
            if(data.session_id == id) setCurrentPrice(data.amount);
        });

        return () => socket.off('new_bid_update');
    }, [id]);

    const handleBid = () => {
        socket.emit('place_bid', { session_id: id, amount: bidAmount });
    };

    if (!asset) return <div>Đang tải...</div>;

    return (
        <div>
            <h1>{asset.name}</h1>
            <h2>Giá hiện tại: {currentPrice} VNĐ</h2>
            <input type="number" value={bidAmount} onChange={e => setBidAmount(e.target.value)} />
            <button onClick={handleBid}>Đặt giá</button>
        </div>
    );
};
export default AssetDetailPage;