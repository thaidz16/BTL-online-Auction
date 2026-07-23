import { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import CountdownTimer from '../components/CountdownTimer';

const WishlistPage = () => {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/wishlist')
            .then(res => setAssets(res.data.data || []))
            .catch(err => console.error("Lỗi lấy mục yêu thích:", err))
            .finally(() => setLoading(false));
    }, []);

    const handleRemove = async (e, id) => {
        e.stopPropagation();
        try {
            await api.delete(`/wishlist/${id}`);
            setAssets(prev => prev.filter(a => a.id !== id));
        } catch (error) {
            alert('Lỗi khi bỏ yêu thích!');
        }
    };

    return (
        <div style={{ backgroundColor: '#f5f5f5', minHeight: '90vh', padding: '40px 20px' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <h1 style={{ color: '#333', borderBottom: '3px solid #b71c1c', display: 'inline-block', paddingBottom: '10px', marginBottom: '30px' }}>
                    MỤC YÊU THÍCH
                </h1>

                {loading ? (
                    <p>Đang tải...</p>
                ) : assets.length === 0 ? (
                    <p>Bạn chưa lưu tài sản nào. Bấm vào biểu tượng trái tim trên trang chủ để lưu!</p>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px' }}>
                        {assets.map(asset => (
                            <div
                                key={asset.id}
                                onClick={() => navigate(`/product/${asset.id}`)}
                                style={{ backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', cursor: 'pointer' }}
                            >
                                <div style={{ position: 'relative', width: '100%', height: '200px' }}>
                                    <img
                                        src={asset.image}
                                        alt={asset.name}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://placehold.co/600x400/ececec/999999?text=Phenikaa+Auction';
                                        }}
                                    />
                                    <button
                                        onClick={(e) => handleRemove(e, asset.id)}
                                        style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', color: 'white', cursor: 'pointer' }}
                                        title="Bỏ khỏi mục yêu thích"
                                    >
                                        ✕
                                    </button>
                                </div>
                                <div style={{ padding: '15px' }}>
                                    <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem', color: '#222' }}>{asset.name}</h3>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span style={{ color: '#777', fontSize: '0.9rem' }}>Giá hiện tại:</span>
                                        <span style={{ fontWeight: 900, color: '#b71c1c' }}>
                                            {Number(asset.current_price || 0).toLocaleString('vi-VN')} đ
                                        </span>
                                    </div>
                                    {asset.end_time && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: '#777', fontSize: '0.9rem' }}>Còn lại:</span>
                                            <CountdownTimer endTime={asset.end_time} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WishlistPage;