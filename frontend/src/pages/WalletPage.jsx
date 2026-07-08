import { useEffect, useState } from 'react';
import api from '../services/api';

const WalletPage = () => {
    const [wallet, setWallet] = useState({ balance: 0, email: '' });
    const [depositAmount, setDepositAmount] = useState(0);

    useEffect(() => {
        const fetchWallet = async () => {
            try {
                // Nhớ gửi token khi gọi API profile
                const token = localStorage.getItem('token');
                const res = await api.get('/user/profile', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setWallet(res.data.data);
            } catch (error) {
                console.error("Lỗi lấy thông tin ví", error);
            }
        };
        fetchWallet();
    }, []);

    // Logic tạo link QR động: 
    // Format: https://img.vietqr.io/image/<BANK_ID>-<ACCOUNT_NO>-<TEMPLATE>.png?amount=<AMOUNT>&addInfo=<CONTENT>&accountName=<NAME>
    const qrCodeUrl = `https://img.vietqr.io/image/TCB-0961590214-compact2.png?amount=${depositAmount}&addInfo=NAP%20${wallet.email}&accountName=CHU%20QUOC%20THAI`;

    const handleConfirmDeposit = async () => {
        if (depositAmount < 50000) {
            alert("Số tiền nạp tối thiểu là 50.000đ");
            return;
        }
        // Gọi API POST /user/deposit để lưu lệnh nạp tiền vào DB (chờ admin duyệt)
        alert("Đã gửi yêu cầu nạp tiền! Vui lòng đợi Admin duyệt lệnh.");
    };

    return (
        <div style={{ backgroundColor: '#f5f5f5', minHeight: '90vh', padding: '40px 20px' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                
                {/* Cột 1: Thông tin số dư */}
                <div style={{ flex: '1', minWidth: '300px' }}>
                    <div style={{ background: '#b71c1c', color: 'white', padding: '30px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                        <h2 style={{ margin: 0, fontSize: '1.2rem', opacity: 0.9 }}>SỐ DƯ KHẢ DỤNG</h2>
                        <h1 style={{ fontSize: '2.5rem', margin: '15px 0' }}>
                            {Number(wallet.balance || 0).toLocaleString('vi-VN')} đ
                        </h1>
                        <p style={{ margin: 0, fontSize: '0.9rem' }}>Tài khoản: {wallet.email}</p>
                    </div>
                </div>

                {/* Cột 2: Form nạp tiền & QR Code */}
                <div style={{ flex: '2', minWidth: '300px', background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                    <h2 style={{ color: '#333', borderBottom: '2px solid #eee', paddingBottom: '10px', marginTop: 0 }}>NẠP TIỀN VÀO VÍ</h2>
                    
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Nhập số tiền cần nạp:</label>
                        <input 
                            type="number" 
                            placeholder="Ví dụ: 500000" 
                            style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1.1rem' }} 
                            onChange={(e) => setDepositAmount(e.target.value)}
                        />
                    </div>

                    {depositAmount > 0 ? (
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', background: '#f9f9f9', padding: '15px', borderRadius: '8px', border: '1px dashed #ccc' }}>
                            {/* Ảnh QR sinh tự động */}
                            <img src={qrCodeUrl} alt="QR Thanh toán" style={{ width: '180px', borderRadius: '8px' }} />
                            
                            <div>
                                <h4 style={{ margin: '0 0 10px 0', color: '#b71c1c' }}>Quét mã QR qua App Ngân hàng</h4>
                                <p style={{ margin: '5px 0' }}>Ngân hàng: <b>Techcombank</b></p>
                                <p style={{ margin: '5px 0' }}>Chủ TK: <b>CHU QUOC THAI</b></p>
                                <p style={{ margin: '5px 0' }}>Số TK: <b>0961590214</b></p>
                                <p style={{ margin: '5px 0', color: '#e65100' }}>Nội dung CK: <b>NAP {wallet.email}</b></p>
                            </div>
                        </div>
                    ) : (
                        <p style={{ color: '#777', fontStyle: 'italic' }}>Vui lòng nhập số tiền để tạo mã QR thanh toán.</p>
                    )}

                    <button 
                        onClick={handleConfirmDeposit}
                        style={{ width: '100%', padding: '12px', background: '#2e7d32', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '20px', fontSize: '1.1rem' }}>
                        TÔI ĐÃ CHUYỂN KHOẢN
                    </button>
                </div>

            </div>
        </div>
    );
};

export default WalletPage;