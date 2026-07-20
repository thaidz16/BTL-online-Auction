import { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import CountdownTimer from '../components/CountdownTimer';
import HeroBanner from '../components/HeroBanner';

const mockCategories = [
    { id: 1, name: 'Điện tử', icon: '💻' },
    { id: 2, name: 'Phương tiện', icon: '🏍️' },
    { id: 3, name: 'Đồ cổ', icon: '🏺' },
    { id: 4, name: 'Trang sức', icon: '💍' },
    { id: 5, name: 'Bất động sản', icon: '🏠' },
    { id: 6, name: 'Thanh lý', icon: '📦' },
];

const mockTrends = [
    'Laptop sinh viên', 'Xe máy cũ', 'iPhone 15 Pro Max', 'Tai nghe chống ồn', 'Đồng hồ cơ'
];

const HomePage = () => {
    const [assets, setAssets] = useState([]);
    const [likedItems, setLikedItems] = useState([]);
    const navigate = useNavigate();

    const toggleLike = (e, id) => {
        e.stopPropagation();
        if (likedItems.includes(id)) {
            setLikedItems(likedItems.filter(itemId => itemId !== id));
        } else {
            setLikedItems([...likedItems, id]);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/assets');
                setAssets(res.data.data || res.data); 
            } catch (error) {
                console.error("Lỗi lấy dữ liệu:", error);
            }
        };
        fetchData();
    }, []);

    return (
        <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', padding: '40px 20px' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                
                <HeroBanner />

                <div style={{ marginBottom: '40px', marginTop: '30px' }}>
                    <h2 style={{ fontSize: '1.5rem', color: '#333', marginBottom: '20px' }}>Danh mục phổ biến</h2>
                    <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '10px' }}>
                        {mockCategories.map(category => (
                            <div 
                                key={category.id} 
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    minWidth: '100px',
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <div style={{ 
                                    width: '70px', 
                                    height: '70px', 
                                    backgroundColor: '#fff', 
                                    borderRadius: '50%', 
                                    display: 'flex', 
                                    justifyContent: 'center', 
                                    alignItems: 'center',
                                    fontSize: '30px',
                                    boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                                    marginBottom: '10px',
                                    border: '1px solid #eaeaea'
                                }}>
                                    {category.icon}
                                </div>
                                <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#555' }}>{category.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ marginBottom: '50px' }}>
                    <h2 style={{ fontSize: '1.5rem', color: '#333', marginBottom: '15px' }}>Xu hướng tìm kiếm</h2>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                        {mockTrends.map((trend, index) => (
                            <span 
                                key={index}
                                style={{
                                    backgroundColor: '#fff',
                                    color: '#b71c1c',
                                    padding: '8px 16px',
                                    borderRadius: '20px',
                                    fontSize: '0.9rem',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    border: '1px solid #f8bbd0',
                                    transition: 'all 0.2s',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.03)'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#b71c1c';
                                    e.currentTarget.style.color = '#fff';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#fff';
                                    e.currentTarget.style.color = '#b71c1c';
                                }}
                            >
                                🔍 {trend}
                            </span>
                        ))}
                    </div>
                </div>

                <h1 style={{ color: '#333', borderBottom: '3px solid #b71c1c', display: 'inline-block', paddingBottom: '10px', marginBottom: '30px' }}>
                    TÀI SẢN ĐANG ĐẤU GIÁ
                </h1>

                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                    gap: '25px' 
                }}>
                    {Array.isArray(assets) && assets.map(asset => {
                        const isLiked = likedItems.includes(asset.id);
                        const mockBids = asset.bidCount || Math.floor(Math.random() * 50) + 10;

                        return (
                            <div 
                                key={asset.id} 
                                onClick={() => navigate(`/product/${asset.id}`)}
                                style={{ 
                                    backgroundColor: '#fff', 
                                    borderRadius: '12px', 
                                    overflow: 'hidden', 
                                    boxShadow: '0 4px 15px rgba(0,0,0,0.08)', 
                                    display: 'flex', 
                                    flexDirection: 'column',
                                    transition: 'transform 0.2s',
                                    cursor: 'pointer' 
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <div style={{ position: 'relative', width: '100%', height: '220px' }}>
                                    <img 
                                        src={asset.image} 
                                        alt={asset.name} 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://placehold.co/600x400/ececec/999999?text=Phenikaa+Auction'; 
                                        }}
                                    />
                                    <div style={{ position: 'absolute', bottom: '10px', left: '10px', backgroundColor: 'rgba(0,0,0,0.65)', color: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', backdropFilter: 'blur(4px)' }}>
                                        🔨 {mockBids} Lượt đấu giá
                                    </div>
                                </div>
                                
                                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                        <span style={{
                                            backgroundColor: '#fff3e0',
                                            color: '#e65100',
                                            padding: '5px 12px',
                                            borderRadius: '20px',
                                            fontSize: '0.8rem',
                                            fontWeight: 'bold',
                                            border: '1px solid #ffe0b2'
                                        }}>
                                            🔥 {asset.condition_tag || 'Đang cập nhật'}
                                        </span>
                                        
                                        <button 
                                            onClick={(e) => toggleLike(e, asset.id)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            <svg width="22" height="22" viewBox="0 0 24 24" fill={isLiked ? "#ff4757" : "none"} stroke={isLiked ? "#ff4757" : "#888"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'all 0.2s ease' }}>
                                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                            </svg>
                                        </button>
                                    </div>

                                    <h3 style={{ fontSize: '1.2rem', margin: '0 0 15px 0', color: '#222', height: '55px', overflow: 'hidden' }}>
                                        {asset.name}
                                    </h3>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
                                        <span style={{ color: '#777', fontSize: '0.9rem' }}>💲 Giá hiện tại:</span>
                                        <span style={{ fontWeight: '900', color: '#b71c1c', fontSize: '1.1rem' }}>
                                            {Number(asset.current_price || 0).toLocaleString('vi-VN')} đ
                                        </span>
                                    </div>
                                    
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
                                        <span style={{ color: '#777', fontSize: '0.9rem' }}>⏱️ Còn lại:</span>
                                        <CountdownTimer endTime={asset.end_time} />
                                    </div>
                                    
                                    <div 
                                        onClick={(e) => {
                                            e.stopPropagation(); 
                                            navigate(`/asset/${asset.id}`);
                                        }}
                                        style={{ 
                                            marginTop: 'auto', 
                                            textAlign: 'center', 
                                            background: '#b71c1c', 
                                            color: 'white', 
                                            padding: '12px', 
                                            borderRadius: '6px', 
                                            fontWeight: 'bold',
                                            textTransform: 'uppercase',
                                            transition: 'background 0.3s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.stopPropagation(); 
                                            e.target.style.backgroundColor = '#9b1414';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.stopPropagation();
                                            e.target.style.backgroundColor = '#b71c1c';
                                        }}
                                    >
                                        Tham gia đấu giá ⚡
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default HomePage;