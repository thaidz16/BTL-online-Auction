import { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
    const [formData, setFormData] = useState({ fullname: '', email: '', phone: '', password: '' });
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/register', formData);
            alert(res.data.message);
            navigate('/login');
        } catch (err) {
            alert(err.response?.data?.message || 'Đăng ký thất bại!');
        }
    };

    return (
        <div style={{ backgroundColor: '#f5f5f5', minHeight: '90vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <form onSubmit={handleRegister} style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
                <h2 style={{ textAlign: 'center', color: '#b71c1c', marginBottom: '30px' }}>ĐĂNG KÝ TÀI KHOẢN</h2>
                <input type="text" placeholder="Họ và tên" required style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #ccc' }} onChange={e => setFormData({...formData, fullname: e.target.value})} />
                <input type="email" placeholder="Email" required style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #ccc' }} onChange={e => setFormData({...formData, email: e.target.value})} />
                <input type="text" placeholder="Số điện thoại" required style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #ccc' }} onChange={e => setFormData({...formData, phone: e.target.value})} />
                <input type="password" placeholder="Mật khẩu" required style={{ width: '100%', padding: '12px', marginBottom: '25px', borderRadius: '6px', border: '1px solid #ccc' }} onChange={e => setFormData({...formData, password: e.target.value})} />
                <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#b71c1c', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>ĐĂNG KÝ NGAY</button>
            </form>
        </div>
    );
};

export default RegisterPage;