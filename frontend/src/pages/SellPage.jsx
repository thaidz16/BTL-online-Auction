import { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

let nextRowId = 1;
const newSpecRow = () => ({ id: nextRowId++, key: '', value: '' });

// Nhãn trạng thái hiển thị cho từng tin đăng của người bán
const getStatusBadge = (asset) => {
    if (asset.status === 'PENDING') {
        return { text: '⏳ Chờ duyệt', bg: '#fff3e0', color: '#e65100' };
    }
    if (asset.status === 'REJECTED') {
        return { text: '❌ Bị từ chối', bg: '#fdecea', color: '#c62828' };
    }
    // status === 'APPROVED' -> xem thêm trạng thái phiên đấu giá
    if (asset.session_status === 'ACTIVE') {
        return { text: '🔥 Đang đấu giá', bg: '#e8f5e9', color: '#2e7d32' };
    }
    if (asset.session_status === 'CLOSED') {
        return { text: '✅ Đã bán thành công', bg: '#e3f2fd', color: '#1565c0' };
    }
    if (asset.session_status === 'FAILED') {
        return { text: '⚠️ Hết hạn, không ai đặt giá', bg: '#f5f5f5', color: '#616161' };
    }
    return { text: 'Đang xử lý', bg: '#f5f5f5', color: '#616161' };
};

const SellPage = () => {
    const [formData, setFormData] = useState({ name: '', description: '', image: '', condition_tag: '' });
    // Danh sách thông số kỹ thuật do người bán tự nhập (dạng cặp key - value, thêm/xoá được)
    const [specRows, setSpecRows] = useState([newSpecRow()]);
    const navigate = useNavigate();

    // Danh sách tin đăng của chính người bán, để họ tự quản lý / xoá
    const [myAssets, setMyAssets] = useState([]);
    const [loadingMine, setLoadingMine] = useState(true);

    const fetchMyAssets = () => {
        setLoadingMine(true);
        api.get('/assets/mine')
            .then(res => setMyAssets(res.data.data || []))
            .catch(err => console.error('Lỗi lấy tin đăng của tôi:', err))
            .finally(() => setLoadingMine(false));
    };

    useEffect(() => {
        fetchMyAssets();
    }, []);

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
            fetchMyAssets();
            setFormData({ name: '', description: '', image: '', condition_tag: '' });
            setSpecRows([newSpecRow()]);
        } catch (err) {
            alert(err.response?.data?.message || 'Lỗi khi đăng bán!');
        }
    };

    // Huỷ / xoá 1 tin đăng.
    // - Nếu chưa ai đặt giá: xoá được luôn (VD người bán đổi ý, không muốn bán nữa).
    // - Nếu đã có người đặt giá / đấu giá thành công: backend sẽ chặn và báo cần liên hệ quản trị viên,
    //   để tránh xoá mất giao dịch đã hợp lệ với người mua.
    const handleDeleteAsset = async (asset) => {
        const confirmMsg = asset.session_status === 'CLOSED'
            ? `Sản phẩm "${asset.name}" đã đấu giá thành công. Bạn chắc chắn muốn xoá tin này khỏi hệ thống?`
            : `Bạn chắc chắn muốn xoá/huỷ tin đăng "${asset.name}"?`;

        if (!window.confirm(confirmMsg)) return;

        try {
            const res = await api.delete(`/assets/${asset.id}`);
            alert(res.data.message);
            setMyAssets(prev => prev.filter(a => a.id !== asset.id));
        } catch (err) {
            alert(err.response?.data?.message || 'Lỗi khi xoá tin đăng!');
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
                        <input type="text" required value={formData.name} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>

                    <div>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Mô tả chi tiết:</label>
                        <textarea rows="4" required value={formData.description} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} onChange={e => setFormData({...formData, description: e.target.value})} />
                    </div>

                    <div>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Link ảnh (URL):</label>
                        <input type="text" placeholder="https://..." required value={formData.image} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} onChange={e => setFormData({...formData, image: e.target.value})} />
                    </div>

                    <div>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Tình trạng (VD: Hàng lướt 99%):</label>
                        <input type="text" required value={formData.condition_tag} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} onChange={e => setFormData({...formData, condition_tag: e.target.value})} />
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

            {/* DANH SÁCH TIN ĐĂNG CỦA CHÍNH NGƯỜI BÁN - có thể xoá/huỷ tại đây */}
            <div style={{ maxWidth: '900px', margin: '30px auto 0', backgroundColor: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                <h2 style={{ color: '#b71c1c', borderBottom: '2px solid #b71c1c', paddingBottom: '10px', marginBottom: '20px' }}>
                    TIN ĐĂNG CỦA TÔI
                </h2>

                {loadingMine ? (
                    <p style={{ color: '#777' }}>Đang tải danh sách tin đăng...</p>
                ) : myAssets.length === 0 ? (
                    <p style={{ color: '#777' }}>Bạn chưa đăng bán sản phẩm nào.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {myAssets.map(asset => {
                            const badge = getStatusBadge(asset);
                            return (
                                <div key={asset.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '15px', padding: '15px', border: '1px solid #eee', borderRadius: '8px', flexWrap: 'wrap' }}>
                                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flex: 1, minWidth: '250px' }}>
                                        <img
                                            src={asset.image}
                                            alt={asset.name}
                                            style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px' }}
                                            onError={(e) => { e.target.src = 'https://placehold.co/60x60/ececec/999999?text=?'; }}
                                        />
                                        <div>
                                            <div style={{ fontWeight: 'bold' }}>{asset.name}</div>
                                            <span style={{ display: 'inline-block', marginTop: '4px', fontSize: '12px', fontWeight: 'bold', padding: '3px 10px', borderRadius: '12px', backgroundColor: badge.bg, color: badge.color }}>
                                                {badge.text}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleDeleteAsset(asset)}
                                        style={{ padding: '8px 16px', backgroundColor: '#fff', border: '1px solid #b71c1c', color: '#b71c1c', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap' }}
                                    >
                                        🗑 Xoá tin đăng
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SellPage;