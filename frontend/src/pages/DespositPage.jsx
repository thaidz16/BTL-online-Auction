import { useState } from 'react';
import api from '../services/api';

const DepositPage = () => {
    const [amount, setAmount] = useState(0);

    const handleConfirm = async () => {
        try {
            // Gửi yêu cầu nạp tiền lên server
            await api.post('/user/deposit', { amount });
            alert("Yêu cầu nạp tiền đã được gửi! Vui lòng chờ admin xác nhận.");
        } catch (err) {
            alert("Lỗi nạp tiền!");
        }
    };

    return (
        <div style={{ padding: '40px', maxWidth: '500px', margin: '0 auto' }}>
            <h2>NẠP TIỀN VÀO VÍ</h2>
            <div style={{ border: '1px solid #ccc', padding: '20px', textAlign: 'center' }}>
                <p>Chuyển khoản qua ngân hàng:</p>
                <h3>TECHCOMBANK: 0961590214</h3>
                <p>Nội dung: <b>NAP [Email của em]</b></p>
            </div>
            <input type="number" onChange={(e) => setAmount(e.target.value)} placeholder="Nhập số tiền" style={{ width: '100%', margin: '10px 0', padding: '10px' }} />
            <button onClick={handleConfirm} style={{ width: '100%', padding: '10px', background: '#b71c1c', color: 'white', border: 'none' }}>GỬI YÊU CẦU</button>
        </div>
    );
};
export default DepositPage;