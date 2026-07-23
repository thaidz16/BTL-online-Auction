import { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

let nextRowId = 1;
const newSpecRow = () => ({ id: nextRowId++, key: '', value: '' });

const SellPage = () => {
    const [formData, setFormData] = useState({ name: '', description: '', image: '', condition_tag: '' });
    // Danh sách thông số kỹ thuật do người bán tự nhập (dạng cặp key - value, thêm/xoá được)
    const [specRows, setSpecRows] = useState([newSpecRow()]);
    const navigate = useNavigate();

    const handleSpecChange = (id, field, value) => {
        setSpecRows(prev => prev.map(row => row.id === id ? { ...row, [field]: value } : row));
    };

    const addSpecRow = () => {
        setSpecRows(prev => [...prev, newSpecRow()]);
    };

    const removeSpecRow = (id) => {
        setSpecRows(prev => prev.filter(row => row.id !== id));
    };

    const handleSell = async (e) => {
        e.preventDefault();
        try {
            const specifications = {};
            specRows.forEach(row => {
                const key = row.key.trim();
                const value = row.value.trim();
                if (key && value) {
                    specifications[key] = value;
                }
            });

            const payload = {
                ...formData,
                specifications: Object.keys(specifications).length > 0 ? specifications : null
            };

            const token = localStorage.getItem('token');
            const res = await api.post('/assets', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(res.data.message);
            navigate('/');
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

                    <div>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
                            Thông số kỹ thuật <span style={{ fontWeight: 'normal', color: '#888', fontSize: '13px' }}>(không bắt buộc)</span>:
                        </label>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {specRows.map((row) => (
                                <div key={row.id} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <input
                                        type="text"
                                        placeholder="Tên thông số (VD: CPU)"
                                        value={row.key}
                                        onChange={e => handleSpecChange(row.id, 'key', e.target.value)}
                                        style={{ flex: '1', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Giá trị (VD: Intel Core i7)"
                                        value={row.value}
                                        onChange={e => handleSpecChange(row.id, 'value', e.target.value)}
                                        style={{ flex: '1.4', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeSpecRow(row.id)}
                                        title="Xoá dòng này"
                                        style={{ padding: '10px 14px', backgroundColor: '#f5f5f5', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer', color: '#b71c1c', fontWeight: 'bold' }}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={addSpecRow}
                            style={{ marginTop: '10px', padding: '8px 14px', backgroundColor: '#fff', border: '1px dashed #b71c1c', color: '#b71c1c', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            + Thêm thông số
                        </button>
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
