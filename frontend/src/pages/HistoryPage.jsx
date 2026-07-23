import { useEffect, useState } from 'react';
import api from '../services/api';

const HistoryPage = () => {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        api.get('/users/bid-history')
            .then(res => setHistory(res.data.data || []))
            .catch(err => console.log('Lỗi lấy lịch sử:', err));
    }, []);

    return (
        <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', padding: '40px 20px' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto', backgroundColor: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                <h2 style={{ color: '#b71c1c', borderBottom: '2px solid #b71c1c', paddingBottom: '10px', marginBottom: '20px' }}>
                    LỊCH SỬ ĐẶT GIÁ CỦA BẠN
                </h2>
                
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#b71c1c', color: 'white', textAlign: 'left' }}>
                            <th style={{ padding: '15px', border: '1px solid #ddd' }}>STT</th>
                            <th style={{ padding: '15px', border: '1px solid #ddd' }}>Tên Tài Sản</th>
                            <th style={{ padding: '15px', border: '1px solid #ddd' }}>Giá Đã Đặt</th>
                            <th style={{ padding: '15px', border: '1px solid #ddd' }}>Thời Gian</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.length === 0 ? (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#777' }}>Bạn chưa tham gia đấu giá tài sản nào.</td>
                            </tr>
                        ) : (
                            history.map((item, index) => (
                                <tr key={item.id} style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                                    <td style={{ padding: '15px', border: '1px solid #ddd' }}>{index + 1}</td>
                                    <td style={{ padding: '15px', border: '1px solid #ddd', fontWeight: 'bold' }}>{item.asset_name}</td>
                                    <td style={{ padding: '15px', border: '1px solid #ddd', color: '#b71c1c', fontWeight: 'bold' }}>{Number(item.amount).toLocaleString('vi-VN')} đ</td>
                                    <td style={{ padding: '15px', border: '1px solid #ddd', color: '#555' }}>{new Date(item.created_at).toLocaleString('vi-VN')}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default HistoryPage;