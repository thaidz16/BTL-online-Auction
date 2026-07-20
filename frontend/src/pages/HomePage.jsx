import { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import CountdownTimer from '../components/CountdownTimer';
import HeroBanner from '../components/HeroBanner';

const HomePage = () => {
    const [assets, setAssets] = useState([]);
    const [likedItems, setLikedItems] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAssets = async () => {
            try {
                const response = await api.get('/assets');
                const actualData = response.data.data || response.data;
                
                if (Array.isArray(actualData)) {
                    setAssets(actualData);
                } else {
                    console.error(actualData);
                    setAssets([]); 
                }
            } catch (error) {
                console.error(error);
                setAssets([]);
            }
        };
        fetchAssets();
    }, []);

    const toggleLike = (id) => {
        setLikedItems(prev =>
            prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
        );
    };

    const categories = [
        { id: 1, name: 'Điện tử', icon: '💻' },
        { id: 2, name: 'Đồng hồ', icon: '⌚' },
        { id: 3, name: 'Trang sức', icon: '💎' },
        { id: 4, name: 'Đồ cổ', icon: '🏺' },
        { id: 5, name: 'Túi xách', icon: '👜' },
        { id: 6, name: 'Giày dép', icon: '👟' },
    ];

    const trends = [
        { id: 1, name: 'MacBook Pro M3', searches: '+1.2k lượt tìm' },
        { id: 2, name: 'Rolex Submariner', searches: '+850 lượt tìm' },
        { id: 3, name: 'iPhone 15 Pro Max', searches: '+3.4k lượt tìm' },
        { id: 4, name: 'Zippo cổ', searches: '+500 lượt tìm' },
    ];

    return (
        <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', padding: '40px 20px' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <HeroBanner />

                <div style={{ backgroundColor: '#fff', padding: '20px 25px', borderRadius: '12px', marginBottom: '25px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <h2 style={{ fontSize: '18px', marginBottom: '20px', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '24px' }}>🔥</span> Danh mục phổ biến
                    </h2>
                    <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '10px' }}>
                        {categories.map(cat => (
                            <div key={cat.id} style={{ minWidth: '130px', textAlign: 'center', cursor: 'pointer', padding: '20px 15px', border: '1px solid #eaeaea', borderRadius: '10px', transition: 'all 0.2s', backgroundColor: '#fafafa' }}>
                                <div style={{ fontSize: '32px', marginBottom: '12px' }}>{cat.icon}</div>
                                <div style={{ fontSize: '14px', fontWeight: '600', color: '#444' }}>{cat.name}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ backgroundColor: '#fff', padding: '20px 25px', borderRadius: '12px', marginBottom: '45px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <h2 style={{ fontSize: '18px', marginBottom: '20px', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '24px' }}>📈</span> Xu hướng tìm kiếm
                    </h2>
                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                        {trends.map(trend => (
                            <div key={trend.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', border: '1px solid #eaeaea', borderRadius: '30px', cursor: 'pointer', backgroundColor: '#fafafa', transition: 'all 0.2s' }}>
                                <span style={{ fontWeight: '600', color: '#333', fontSize: '15px' }}>{trend.name}</span>
                                <span style={{ fontSize: '13px', color: '#888' }}>{trend.searches}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <h1 style={{ color: '#333', borderBottom: '3px solid #b71c1c', display: 'inline-block', paddingBottom: '10px', marginBottom: '30px', fontSize: '22px' }}>
                    TÀI SẢN ĐANG ĐẤU GIÁ
                </h1>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                    {assets.map((item) => {
                        const isLiked = likedItems.includes(item.id);
                        const mockBids = Math.floor(Math.random() * 50) + 10;
                        const price = item.starting_price || 0;
                        const imageUrl = item.image_url || 'https://via.placeholder.com/300';
                        const name = item.name || 'Tài sản đang cập nhật';

                        return (
                            <div key={item.id || Math.random()} style={{ backgroundColor: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 3px 10px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s' }}>
                                <div style={{ position: 'relative' }}>
                                    <img src={imageUrl} alt={name} style={{ width: '100%', height: '220px', objectFit: 'cover' }} />
                                </div>
                                
                                <div style={{ padding: '18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                        <span style={{ backgroundColor: '#fff3cd', color: '#856404', padding: '5px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>
                                            Tịch thu hải quan
                                        </span>
                                        
                                        <button 
                                            onClick={() => item.id && toggleLike(item.id)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill={isLiked ? "#ff4757" : "none"} stroke={isLiked ? "#ff4757" : "#888"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'all 0.2s ease' }}>
                                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                            </svg>
                                        </button>
                                    </div>

                                    <h3 style={{ fontSize: '17px', margin: '0 0 12px 0', color: '#222', flex: 1, lineHeight: '1.4' }}>{name}</h3>
                                    
                                    <div style={{ marginBottom: '12px' }}>
                                        <span style={{ color: '#b71c1c', fontSize: '20px', fontWeight: '900' }}>
                                            {price.toLocaleString()} VNĐ
                                        </span>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', fontSize: '14px', color: '#555' }}>
                                        <span>🔨 Lượt đấu giá: <strong style={{ color: '#222' }}>{item.bidCount || mockBids}</strong></span>
                                    </div>

                                    {item.end_time && <CountdownTimer endTime={item.end_time} />}

                                    <button 
                                        onClick={() => item.id && navigate(`/product/${item.id}`)}
                                        style={{ width: '100%', padding: '12px', backgroundColor: '#b71c1c', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', marginTop: '18px', transition: 'background-color 0.2s' }}
                                    >
                                        Tham gia đấu giá
                                    </button>
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