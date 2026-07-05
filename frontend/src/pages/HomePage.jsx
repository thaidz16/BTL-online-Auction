import { useEffect, useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import CountdownTimer from '../components/CountdownTimer';

const HomePage = () => {
    const [assets, setAssets] = useState([]);

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
                <h1 style={{ color: '#333', borderBottom: '3px solid #b71c1c', display: 'inline-block', paddingBottom: '10px', marginBottom: '30px' }}>
                    TÀI SẢN ĐANG ĐẤU GIÁ
                </h1>

                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                    gap: '25px' 
                }}>
                    {Array.isArray(assets) && assets.map(asset => (
                        <div key={asset.id} style={{ 
                            backgroundColor: '#fff', 
                            borderRadius: '12px', 
                            overflow: 'hidden', 
                            boxShadow: '0 4px 15px rgba(0,0,0,0.08)', 
                            display: 'flex', 
                            flexDirection: 'column',
                            transition: 'transform 0.2s'
                        }}>
                            <img 
                                src={asset.image} 
                                alt={asset.name} 
                                style={{ width: '100%', height: '220px', objectFit: 'cover' }} 
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://placehold.co/600x400/ececec/999999?text=Phenikaa+Auction'; 
                                }}
                            />
                            
                            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                <h3 style={{ fontSize: '1.2rem', margin: '0 0 15px 0', color: '#222', height: '55px', overflow: 'hidden' }}>
                                    {asset.name}
                                </h3>
                                
                                <span style={{
                                    display: 'inline-block',
                                    backgroundColor: '#fff3e0',
                                    color: '#e65100',
                                    padding: '5px 12px',
                                    borderRadius: '20px',
                                    fontSize: '0.8rem',
                                    fontWeight: 'bold',
                                    marginBottom: '15px',
                                    width: 'fit-content',
                                    border: '1px solid #ffe0b2'
                                }}>
                                    🔥 {asset.condition_tag || 'Đang cập nhật'}
                                </span>

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
                                
                                <Link to={`/asset/${asset.id}`} style={{ 
                                    marginTop: 'auto', 
                                    textAlign: 'center', 
                                    background: '#b71c1c', 
                                    color: 'white', 
                                    padding: '12px', 
                                    textDecoration: 'none', 
                                    borderRadius: '6px', 
                                    fontWeight: 'bold',
                                    textTransform: 'uppercase'
                                }}>
                                    Tham gia đấu giá ⚡
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HomePage;