import { useEffect, useState } from 'react';
import api from '../services/api';

const WalletPage = () => {
    const [wallet, setWallet] = useState({ balance: 0 });

    useEffect(() => {
        const fetchWallet = async () => {
            const res = await api.get('/user/profile');
            setWallet(res.data.data);
        };
        fetchWallet();
    }, []);

    return (
        <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ background: '#b71c1c', color: 'white', padding: '30px', borderRadius: '15px', textAlign: 'center', marginBottom: '30px' }}>
                <h2 style={{ margin: 0 }}>SỐ DƯ VÍ CỦA BẠN</h2>
                <h1 style={{ fontSize: '3rem', margin: '10px 0' }}>
                    {Number(wallet.balance || 0).toLocaleString('vi-VN')} đ
                </h1>
            </div>
            
            <div style={{ background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <h3>Nạp tiền vào ví</h3>
                <p>Chuyển khoản qua Techcombank: 0961590214</p>
                <input type="number" placeholder="Số tiền muốn nạp" style={{ width: '100%', padding: '10px', margin: '10px 0' }} />
                <button style={{ width: '100%', padding: '10px', background: '#2e7d32', color: 'white', border: 'none', borderRadius: '5px' }}>XÁC NHẬN ĐÃ CHUYỂN KHOẢN</button>
            </div>
        </div>
    );
};
export default WalletPage;