import { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
    // State lưu thông tin form
    const [formData, setFormData] = useState({ fullname: '', email: '', password: '' });
    // State lưu mã OTP người dùng nhập
    const [otp, setOtp] = useState('');
    // Quản lý xem đang ở bước nào (1: Điền info, 2: Nhập OTP)
    const [step, setStep] = useState(1); 
    
    const navigate = useNavigate();

    // Xử lý khi bấm nút "Đăng Ký"
    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/register', formData);
            alert(res.data.message);
            setStep(2); // Thành công thì chuyển sang form nhập OTP
        } catch (err) {
            alert(err.response?.data?.message || 'Lỗi đăng ký!');
        }
    };

    // Xử lý khi bấm nút "Xác thực OTP"
    const handleVerify = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/verify-otp', { email: formData.email, otp });
            alert(res.data.message);
            navigate('/login'); // Xác thực xong đẩy về trang Đăng nhập
        } catch (err) {
            alert(err.response?.data?.message || 'Mã OTP sai!');
        }
    };

    return (
        <div style={{ backgroundColor: '#f5f5f5', minHeight: '90vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
                
                {step === 1 ? (
                    // ---------------- FORM BƯỚC 1: ĐĂNG KÝ ----------------
                    <form onSubmit={handleRegister}>
                        <h2 style={{ textAlign: 'center', color: '#b71c1c', marginBottom: '30px' }}>ĐĂNG KÝ TÀI KHOẢN</h2>
                        <input type="text" placeholder="Họ và tên" required style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #ccc' }} onChange={e => setFormData({...formData, fullname: e.target.value})} />
                        <input type="email" placeholder="Email (dùng để nhận OTP)" required style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #ccc' }} onChange={e => setFormData({...formData, email: e.target.value})} />
                        <input type="password" placeholder="Mật khẩu" required style={{ width: '100%', padding: '12px', marginBottom: '25px', borderRadius: '6px', border: '1px solid #ccc' }} onChange={e => setFormData({...formData, password: e.target.value})} />
                        <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#b71c1c', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>TẠO TÀI KHOẢN</button>
                    </form>
                ) : (
                    // ---------------- FORM BƯỚC 2: NHẬP OTP ----------------
                    <form onSubmit={handleVerify}>
                        <h2 style={{ textAlign: 'center', color: '#2e7d32', marginBottom: '10px' }}>XÁC THỰC EMAIL</h2>
                        <p style={{ textAlign: 'center', color: '#555', marginBottom: '20px', fontSize: '14px' }}>
                            Mã OTP 6 số đã được gửi tới <b>{formData.email}</b>. Vui lòng kiểm tra hộp thư (cả thư mục Spam).
                        </p>
                        <input type="text" placeholder="Nhập mã OTP..." required maxLength="6" style={{ width: '100%', padding: '12px', marginBottom: '25px', borderRadius: '6px', border: '1px solid #ccc', textAlign: 'center', fontSize: '20px', letterSpacing: '5px' }} onChange={e => setOtp(e.target.value)} />
                        <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#2e7d32', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>XÁC NHẬN OTP</button>
                    </form>
                )}

            </div>
        </div>
    );
};

export default RegisterPage;