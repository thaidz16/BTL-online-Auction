import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import socket from '../services/socket';
import { toast } from 'react-toastify';

const AssetDetailPage = () => {
    const { id } = useParams(); // Lấy ID tài sản từ trên thanh địa chỉ URL xuống
    const [asset, setAsset] = useState(null);
    const [currentPrice, setCurrentPrice] = useState(0);
    const [bidAmount, setBidAmount] = useState('');

    useEffect(() => {
        // 1. Gọi API lấy chi tiết tài sản (Tạm thời mock dữ liệu nếu Backend chưa có API này)
        // Nếu em chưa viết API GET /assets/:id ở backend thì đoạn này có thể báo lỗi 404, cứ để đó anh xử lý sau.
        api.get(`/assets/${id}`)
            .then(res => {
                const data = res.data.data || res.data; // Phòng hờ API trả về nhiều bọc
                setAsset(data);
                setCurrentPrice(data.current_price || 0);
            })
            .catch(err => console.log("Chưa có API lấy chi tiết tài sản: ", err));

        // 2. Kích hoạt "Siêu năng lực" Realtime lắng nghe giá nhảy
        socket.on('new_bid_update', (data) => {
            // Nếu có người đặt giá cho đúng cái tài sản mình đang xem thì cập nhật giá màn hình
            if (data.session_id == id) {
                setCurrentPrice(data.amount);
                toast.info(`🔥 Có người vừa đặt giá mới: ${data.amount} VNĐ!`);
            }
        });

        // Dọn dẹp khi thoát khỏi trang
        return () => socket.off('new_bid_update');
    }, [id]);

    const handleBid = () => {
        if (!bidAmount) return alert("Nhập giá đi đã bro!");
        
        // Bắn tín hiệu đặt giá lên Server
        socket.emit('place_bid', { session_id: id, amount: bidAmount });
        setBidAmount(''); // Xóa ô nhập sau khi đặt xong
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
            <h2>Phòng Đấu Giá Trực Tuyến 🔴</h2>
            
            <div style={{ padding: '20px', border: '2px solid red', borderRadius: '10px', marginTop: '20px' }}>
                {/* Nếu chưa tải được dữ liệu thì báo Đang tải */}
                {!asset ? <h3>Đang tải dữ liệu... (Hoặc Backend chưa có API GET /assets/:id)</h3> : (
                    <>
                        <h2>Tên sản phẩm: {asset.name}</h2>
                        <p>Mô tả: {asset.description}</p>
                    </>
                )}
                
                <hr />
                
                <h1 style={{ color: 'red' }}>Giá hiện tại: {currentPrice} VNĐ</h1>
                
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <input 
                        type="number" 
                        value={bidAmount} 
                        onChange={e => setBidAmount(e.target.value)} 
                        placeholder="Nhập giá em muốn đấu..."
                        style={{ flex: 1, padding: '10px' }}
                    />
                    <button 
                        onClick={handleBid}
                        style={{ padding: '10px 20px', background: 'green', color: 'white', border: 'none', cursor: 'pointer' }}
                    >
                        🔥 ĐẶT GIÁ
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssetDetailPage;