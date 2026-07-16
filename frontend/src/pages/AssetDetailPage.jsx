import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import socket from '../services/socket';
import { toast } from 'react-toastify';
import CountdownTimer from '../components/CountdownTimer';

const AssetDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // States quản lý dữ liệu
    const [asset, setAsset] = useState(null);
    const [currentPrice, setCurrentPrice] = useState(0);
    const [bidAmount, setBidAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Lịch sử đấu giá Live
    const [bidHistory, setBidHistory] = useState([
        { user: 'Hệ thống', amount: '---', time: 'Phòng đấu giá đã mở' }
    ]);

    const historyEndRef = useRef(null);

    // Tự động cuộn xuống dòng mới nhất trong lịch sử
    useEffect(() => {
        historyEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [bidHistory]);

    // 1. KÉO DỮ LIỆU TÀI SẢN LÚC MỚI VÀO PHÒNG
    useEffect(() => {
        window.scrollTo(0, 0); // Ép cuộn lên đầu

        const fetchAsset = async () => {
            try {
                const res = await api.get(`/assets/${id}`);
                const data = res.data.data || res.data;
                setAsset(data);
                setCurrentPrice(Number(data.current_price || 0));
                setBidAmount(Number(data.current_price || 0) + 50000); // Gợi ý giá tiếp theo (+50k)
            } catch (error) {
                console.error("Lỗi:", error);
            }
        };
        fetchAsset();
    }, [id]);

    // 2. KÍCH HOẠT SIÊU NĂNG LỰC REAL-TIME (SOCKET.IO)
    useEffect(() => {
        socket.on('new_bid_update', (data) => {
            if (data.session_id == id) {
                const newPrice = Number(data.amount);
                setCurrentPrice(newPrice);
                
                // Thêm vào lịch sử live
                setBidHistory(prev => [...prev, { 
                    user: 'Người chơi ẩn danh', 
                    amount: newPrice, 
                    time: new Date().toLocaleTimeString('vi-VN') 
                }]);
                
                // Cập nhật gợi ý giá ở ô Input
                setBidAmount(newPrice + 50000);
                
                toast.info(`🔥 Có người vừa đặt giá: ${newPrice.toLocaleString('vi-VN')} VNĐ!`);
            }
        });

        return () => socket.off('new_bid_update'); // Dọn dẹp socket khi thoát phòng
    }, [id]);

    // Hàm xử lý nút "Ra giá nhanh"
    const handleQuickBid = (amountToAdd) => {
        setBidAmount(currentPrice + amountToAdd);
    };

    // 3. HÀM CHỐT GIÁ BẮN LÊN SERVER
    const handleBidSubmit = async () => {
        if (!bidAmount || isNaN(bidAmount) || bidAmount <= currentPrice) {
            toast.error("Giá đưa ra phải lớn hơn giá hiện tại!");
            return;
        }

        setIsSubmitting(true); // Khóa nút chống spam click

        // Bắn tín hiệu đặt giá qua Socket
        socket.emit('place_bid', { session_id: id, amount: bidAmount });
        
        // Tự update lịch sử của chính mình lên giao diện cho nhanh (Optimistic UI)
        setBidHistory(prev => [...prev, { 
            user: 'Bạn (Vừa ra giá)', 
            amount: bidAmount, 
            time: new Date().toLocaleTimeString('vi-VN') 
        }]);

        // Mở khóa nút sau 1 giây
        setTimeout(() => {
            setIsSubmitting(false);
        }, 1000);
    };

    if (!asset) {
        return (
            <div style={{ backgroundColor: '#121212', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <h2 style={{ color: '#00e676' }}>⏳ Đang kết nối vào phòng đấu giá an toàn...</h2>
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: '#121212', minHeight: '100vh', padding: '20px', color: '#fff', fontFamily: 'monospace, sans-serif' }}>
            
            {/* THANH HEADER PHÒNG */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1e1e1e', padding: '15px 30px', borderRadius: '12px', marginBottom: '20px', borderBottom: '3px solid #b71c1c' }}>
                <h2 style={{ margin: 0, color: '#f5f5f5' }}>🔴 PHÒNG ĐẤU GIÁ LIVE: <span style={{color: '#ff5252'}}>{asset.name}</span></h2>
                <button onClick={() => navigate(-1)} style={{ padding: '10px 20px', backgroundColor: '#333', color: '#fff', border: '1px solid #555', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                    🚪 THOÁT PHÒNG
                </button>
            </div>

            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                
                {/* BẢNG BÊN TRÁI: THÔNG TIN TÀI SẢN */}
                <div style={{ flex: '1', minWidth: '350px', backgroundColor: '#1e1e1e', borderRadius: '12px', padding: '25px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <img 
                        src={asset.image} 
                        alt={asset.name} 
                        style={{ width: '100%', maxWidth: '350px', borderRadius: '8px', border: '2px solid #333', marginBottom: '20px', objectFit: 'cover' }} 
                        onError={(e) => { e.target.src = 'https://placehold.co/600x400/ececec/999999?text=Phenikaa+Auction' }}
                    />
                    
                    <div style={{ width: '100%', backgroundColor: '#2a2a2a', padding: '20px', borderRadius: '8px', textAlign: 'center', marginBottom: '20px', border: '1px solid #444' }}>
                        <p style={{ color: '#aaa', margin: '0 0 10px 0', fontSize: '14px', textTransform: 'uppercase' }}>Giá cao nhất hiện tại</p>
                        <h1 style={{ color: '#00e676', margin: 0, fontSize: '40px', textShadow: '0 0 15px rgba(0, 230, 118, 0.4)' }}>
                            {currentPrice.toLocaleString('vi-VN')} đ
                        </h1>
                    </div>

                    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#3e2723', padding: '15px 20px', borderRadius: '8px', border: '1px solid #5d4037' }}>
                        <span style={{ color: '#ffb300', fontWeight: 'bold' }}>⏳ Thời gian còn lại:</span>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffcc80' }}>
                            <CountdownTimer endTime={asset.end_time} />
                        </div>
                    </div>
                </div>

                {/* BẢNG BÊN PHẢI: BÀN ĐIỀU KHIỂN & LỊCH SỬ LIVE */}
                <div style={{ flex: '1.5', minWidth: '400px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    {/* KHU VỰC RA GIÁ */}
                    <div style={{ backgroundColor: '#1e1e1e', padding: '25px', borderRadius: '12px', border: '1px solid #333' }}>
                        <h3 style={{ marginTop: 0, color: '#f5f5f5', borderBottom: '1px solid #333', paddingBottom: '10px' }}>BÀN ĐIỀU KHIỂN RA GIÁ</h3>
                        
                        {/* Nút ra giá nhanh */}
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                            {[50000, 100000, 500000, 1000000].map(amount => (
                                <button 
                                    key={amount} 
                                    onClick={() => handleQuickBid(amount)}
                                    style={{ flex: 1, padding: '12px 0', backgroundColor: '#2c2c2c', color: '#fff', border: '1px solid #555', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' }}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = '#444'}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = '#2c2c2c'}
                                >
                                    + {(amount / 1000).toLocaleString('vi-VN')}k
                                </button>
                            ))}
                        </div>

                        {/* Ô nhập giá và Nút Submit */}
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <input 
                                type="number" 
                                value={bidAmount} 
                                onChange={(e) => setBidAmount(Number(e.target.value))}
                                style={{ flex: '2', padding: '15px', fontSize: '22px', fontWeight: 'bold', backgroundColor: '#0a0a0a', color: '#00e676', border: '2px solid #555', borderRadius: '8px', outline: 'none' }}
                            />
                            <button 
                                onClick={handleBidSubmit}
                                disabled={isSubmitting}
                                style={{ flex: '1', padding: '15px', fontSize: '18px', fontWeight: '900', backgroundColor: isSubmitting ? '#555' : '#b71c1c', color: 'white', border: 'none', borderRadius: '8px', cursor: isSubmitting ? 'not-allowed' : 'pointer', textTransform: 'uppercase', boxShadow: isSubmitting ? 'none' : '0 4px 15px rgba(183, 28, 28, 0.4)' }}
                            >
                                {isSubmitting ? '⏳ ĐANG XỬ LÝ...' : 'CHỐT GIÁ 🔨'}
                            </button>
                        </div>
                    </div>

                    {/* KHU VỰC LỊCH SỬ LIVE */}
                    <div style={{ backgroundColor: '#1e1e1e', padding: '25px', borderRadius: '12px', flex: 1, display: 'flex', flexDirection: 'column', border: '1px solid #333' }}>
                        <h3 style={{ marginTop: 0, color: '#f5f5f5', borderBottom: '1px solid #333', paddingBottom: '10px' }}>LỊCH SỬ ĐẤU GIÁ (LIVE)</h3>
                        
                        <div style={{ flex: 1, backgroundColor: '#0a0a0a', borderRadius: '8px', padding: '15px', overflowY: 'auto', maxHeight: '300px', border: '1px solid #222' }}>
                            {bidHistory.map((bid, index) => (
                                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px dashed #333', color: bid.user.includes('Bạn') ? '#00e676' : '#bbb', fontWeight: bid.user.includes('Bạn') ? 'bold' : 'normal' }}>
                                    <span>👤 {bid.user}</span>
                                    <span>{typeof bid.amount === 'number' ? bid.amount.toLocaleString('vi-VN') + ' đ' : bid.amount}</span>
                                    <span style={{ fontSize: '12px', color: '#777' }}>{bid.time}</span>
                                </div>
                            ))}
                            <div ref={historyEndRef} /> {/* Neo cuộn */}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AssetDetailPage;