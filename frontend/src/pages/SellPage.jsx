import { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const SellPage = () => {
    const [formData, setFormData] = useState({ name: '', description: '', image: '', condition_tag: '' });
    const navigate = useNavigate();

    const handleSell = async (e) => {
        e.preventDefault();
        try {
            // Gắn token vào header (nếu instance api của em chưa tự làm việc này)
            const token = localStorage.getItem('token');
            const res = await api.post('/assets', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(res.data.message);
            navigate('/'); // Đăng xong về trang chủ
        } catch (err) {
            alert(err.response?.data?.message || 'Lỗi khi đăng bán!');
        }
    };

    return (
        <div style={{ backgroundColor: '#f5f5f5', minHeight: '90vh', padding: '40px 20px' }}>
            <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                <h2 style={{ color: '#b71c1c', borderBottom: '2px solid #b71c1c', paddingBottom: '10px', marginBottom: '20px' }}>
                    ĐĂNG BÁN TÀI SẢN
                </h2>
                
                <form onSubmit={handleSell} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Tên tài sản:</label>
                        <input type="text" required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    
                    <div>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Mô tả chi tiết:</label>
                        <textarea rows="4" required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} onChange={e => setFormData({...formData, description: e.target.value})} />
                    </div>

                    <div>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Link ảnh (URL):</label>
                        <input type="text" placeholder="https://..." required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} onChange={e => setFormData({...formData, image: e.target.value})} />
                    </div>

                    <div>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Tình trạng (VD: Hàng lướt 99%):</label>
                        <input type="text" required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} onChange={e => setFormData({...formData, condition_tag: e.target.value})} />
                    </div>

                    <button type="submit" style={{ padding: '12px', backgroundColor: '#b71c1c', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
                        GỬI YÊU CẦU ĐĂNG BÁN
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SellPage;