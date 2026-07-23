import { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import PasswordInput from '../components/PasswordInput';

const ForgotPasswordPage = () => {
    const [step, setStep] = useState(1); // 1: nhập email, 2: nhập OTP + mật khẩu mới
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const navigate = useNavigate();

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/forgot-password', { email });
            alert(res.data.message || 'Đã gửi mã OTP, vui lòng kiểm tra email!');
            setStep(2);
        } catch (err) {
            alert(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại!');
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            alert('Mật khẩu phải từ 8 ký tự, gồm ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt!');
            return;
        }

        try {
            const res = await api.post('/auth/reset-password', { email, otp, newPassword });
            alert(res.data.message || 'Đặt lại mật khẩu thành công!');
            navigate('/login');
        } catch (err) {
            alert(err.response?.data?.message || 'Mã OTP không đúng hoặc đã hết hạn!');
        }
    };

    return (
        <div style={{ backgroundColor: '#f5f5f5', minHeight: '90vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>

                {step === 1 ? (
                    <form onSubmit={handleRequestOtp}>
                        <h2 style={{ textAlign: 'center', color: '#b71c1c', marginBottom: '10px' }}>QUÊN MẬT KHẨU</h2>
                        <p style={{ textAlign: 'center', color: '#555', marginBottom: '20px', fontSize: '14px' }}>
                            Nhập email tài khoản của bạn, hệ thống sẽ gửi mã OTP để đặt lại mật khẩu.
                        </p>
                        <input
                            type="email" placeholder="Email" required
                            style={{ width: '100%', padding: '12px', marginBottom: '25px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                            onChange={e => setEmail(e.target.value)}
                        />
                        <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#b71c1c', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                            GỬI MÃ OTP
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword}>
                        <h2 style={{ textAlign: 'center', color: '#2e7d32', marginBottom: '10px' }}>ĐẶT LẠI MẬT KHẨU</h2>
                        <p style={{ textAlign: 'center', color: '#555', marginBottom: '20px', fontSize: '14px' }}>
                            Mã OTP đã được gửi tới <b>{email}</b>. Vui lòng kiểm tra hộp thư (cả thư mục Spam).
                        </p>
                        <input
                            type="text" placeholder="Nhập mã OTP..." required maxLength="6"
                            style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #ccc', textAlign: 'center', fontSize: '20px', letterSpacing: '5px', boxSizing: 'border-box' }}
                            onChange={e => setOtp(e.target.value)}
                        />
                        <div style={{ marginBottom: '25px' }}>
                            <PasswordInput
                                placeholder="Mật khẩu mới" required
                                style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc' }}
                                onChange={e => setNewPassword(e.target.value)}
                            />
                        </div>
                        <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#2e7d32', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                            ĐẶT LẠI MẬT KHẨU
                        </button>
                    </form>
                )}

            </div>
        </div>
    );
};

export default ForgotPasswordPage;