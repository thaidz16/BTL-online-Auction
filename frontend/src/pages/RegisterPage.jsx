import { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
    const [formData, setFormData] = useState({ fullname: '', email: '', password: '' });
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1); 
    
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();

        const { password } = formData;
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        
        if (!passwordRegex.test(password)) {
            alert('Mật khẩu phải từ 8 ký tự, gồm ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt!');
            return;
        }

        try {
            const res = await api.post('/auth/register', formData);
            if (res.status === 200 || res.status === 201) {
                alert(res.data.message || 'Đăng ký thành công! Vui lòng kiểm tra email để lấy mã OTP.');
                setStep(2);
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Lỗi đăng ký, vui lòng thử lại!');
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/verify-otp', { email: formData.email, otp });
            if (res.status === 200 || res.status === 201) {
                alert(res.data.message || 'Xác thực thành công!');
                navigate('/login');
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Mã OTP không chính xác!');
        }
    };

    return (
        <div style={{ backgroundColor: '#f5f5f5', minHeight: '90vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
                
                {step === 1 ? (
                    <form onSubmit={handleRegister}>
                        <h2 style={{ textAlign: 'center', color: '#b71c1c', marginBottom: '30px' }}>ĐĂNG KÝ TÀI KHOẢN</h2>
                        <input type="text" placeholder="Họ và tên" required style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #ccc' }} onChange={e => setFormData({...formData, fullname: e.target.value})} />
                        <input type="email" placeholder="Email (dùng để nhận OTP)" required style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #ccc' }} onChange={e => setFormData({...formData, email: e.target.value})} />
                        <input type="password" placeholder="Mật khẩu" required style={{ width: '100%', padding: '12px', marginBottom: '25px', borderRadius: '6px', border: '1px solid #ccc' }} onChange={e => setFormData({...formData, password: e.target.value})} />
                        <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#b71c1c', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>TẠO TÀI KHOẢN</button>
                    </form>
                ) : (
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