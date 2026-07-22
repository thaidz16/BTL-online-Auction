import { useEffect, useState, useRef } from 'react';
import api from '../services/api';

const AdminPage = () => {
    const [deposits, setDeposits] = useState([]);
    const [assets, setAssets] = useState([]);
    const [notification, setNotification] = useState(null);
    const ws = useRef(null);

    useEffect(() => {
        fetchData();

        ws.current = new WebSocket('wss://btl-online-auction.onrender.com/ws/admin');

        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            
            if (data.type === 'NEW_DEPOSIT') {
                setDeposits(prev => [data.payload, ...prev]);
                showNotification(`💰 Có yêu cầu nạp tiền mới từ ${data.payload.user_email}!`);
            } else if (data.type === 'NEW_ASSET') {
                setAssets(prev => [data.payload, ...prev]);
                showNotification(`📦 Có tài sản mới chờ duyệt: ${data.payload.name}!`);
            }
        };

        return () => {
            if (ws.current) ws.current.close();
        };
    }, []);

    const fetchData = async () => {
        try {
            const resDeposits = await api.get('/user/admin/pending-deposits');
            setDeposits(resDeposits.data.data);

            const resAssets = await api.get('/assets/pending');
            setAssets(resAssets.data.data);
        } catch (error) {
            console.error(error);
        }
    };

    const showNotification = (msg) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 5000);
    };

    const handleApproveDeposit = async (id, userId, amount) => {
        try {
            await api.post('/user/admin/approve-deposit', { deposit_id: id, user_id: userId, amount });
            alert('Đã duyệt tiền thành công!');
            setDeposits(prev => prev.filter(d => d.id !== id)); 
        } catch (error) {
            alert('Lỗi duyệt tiền');
        }
    };

    const handleApproveAsset = async (id) => {
        try {
            await api.put(`/assets/${id}/status`, { status: 'APPROVED' });
            alert('Đã duyệt sản phẩm lên sàn!');
            setAssets(prev => prev.filter(a => a.id !== id));
        } catch (error) {
            alert('Lỗi duyệt sản phẩm');
        }
    };

    return (
        <div style={{ backgroundColor: '#f5f5f5', minHeight: '90vh', padding: '40px 20px', position: 'relative' }}>
            
            {notification && (
                <div style={{
                    position: 'fixed', top: '20px', right: '20px', backgroundColor: '#4caf50',
                    color: 'white', padding: '15px 20px', borderRadius: '8px', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontWeight: 'bold', zIndex: 9999
                }}>
                    {notification}
                </div>
            )}

            <h1 style={{ textAlign: 'center', color: '#b71c1c', marginBottom: '40px' }}>TRUNG TÂM QUẢN TRỊ HỆ THỐNG</h1>
            
            <div style={{ display: 'flex', gap: '30px', maxWidth: '1200px', margin: '0 auto', flexWrap: 'wrap' }}>
                
                <div style={{ flex: 1, minWidth: '300px', backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ borderBottom: '2px solid #2e7d32', paddingBottom: '10px', color: '#2e7d32' }}>💰 YÊU CẦU NẠP TIỀN</h3>
                    {deposits.length === 0 ? <p>Không có yêu cầu nạp tiền nào.</p> : deposits.map(d => (
                        <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #eee' }}>
                            <div>
                                <div style={{ fontWeight: 'bold' }}>{d.user_email}</div>
                                <div style={{ color: '#b71c1c', fontWeight: 'bold' }}>+{Number(d.amount).toLocaleString('vi-VN')} đ</div>
                            </div>
                            <button onClick={() => handleApproveDeposit(d.id, d.user_id, d.amount)} style={{ background: '#2e7d32', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                                DUYỆT
                            </button>
                        </div>
                    ))}
                </div>

                <div style={{ flex: 1, minWidth: '300px', backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ borderBottom: '2px solid #f57c00', paddingBottom: '10px', color: '#f57c00' }}>📦 TÀI SẢN CHỜ LÊN SÀN</h3>
                    {assets.length === 0 ? <p>Không có tài sản chờ duyệt.</p> : assets.map(a => (
                        <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #eee' }}>
                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                <img src={a.image} alt="ảnh" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px' }} />
                                <div>
                                    <div style={{ fontWeight: 'bold' }}>{a.name}</div>
                                    <div style={{ fontSize: '0.85rem', color: '#777' }}>{a.condition_tag}</div>
                                </div>
                            </div>
                            <button onClick={() => handleApproveAsset(a.id)} style={{ background: '#f57c00', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                                CHO LÊN SÀN
                            </button>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};

export default AdminPage;