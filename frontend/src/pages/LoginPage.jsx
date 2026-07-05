import { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/login', { email, password });
            
            // 1. Lưu token để xác thực
            localStorage.setItem('token', res.data.token);
            
            // 2. Load lại trang để Navbar nhận diện token mới và chuyển sang "Đăng xuất"
            alert('Đăng nhập thành công!');
            window.location.reload(); 
            navigate('/');
        } catch (err) {
            alert(err.response?.data?.message || 'Sai tài khoản hoặc mật khẩu!');
        }
    };

    return (
        <div style={{ backgroundColor: '#f5f5f5', minHeight: '90vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <form onSubmit={handleLogin} style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
                <h2 style={{ textAlign: 'center', color: '#b71c1c', marginBottom: '30px' }}>ĐĂNG NHẬP HỆ THỐNG</h2>
                <input type="email" placeholder="Email" required style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #ccc' }} onChange={e => setEmail(e.target.value)} />
                <input type="password" placeholder="Mật khẩu" required style={{ width: '100%', padding: '12px', marginBottom: '25px', borderRadius: '6px', border: '1px solid #ccc' }} onChange={e => setPassword(e.target.value)} />
                <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#b71c1c', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>ĐĂNG NHẬP</button>
            </form>
        </div>
    );
};

export default LoginPage;