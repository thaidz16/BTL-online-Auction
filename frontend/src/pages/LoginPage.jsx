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
            localStorage.setItem('token', res.data.token); // Lưu token
            alert('Đăng nhập thành công!');
            navigate('/'); // Chuyển về trang chủ
        } catch (err) {
            alert('Sai tài khoản hoặc mật khẩu!');
        }
    };

    return (
        <form onSubmit={handleLogin}>
            <input type="email" placeholder="Email" onChange={e => setEmail(e.target.value)} />
            <input type="password" placeholder="Mật khẩu" onChange={e => setPassword(e.target.value)} />
            <button type="submit">Đăng nhập</button>
        </form>
    );
};
export default LoginPage;