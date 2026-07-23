import { useEffect, useState, useRef } from 'react';
import api from '../services/api';

// Nhãn trạng thái hiển thị cho các tin đã duyệt (dựa theo trạng thái phiên đấu giá)
const getSessionBadge = (asset) => {
    if (asset.session_status === 'ACTIVE') {
        return { text: '🔥 Đang đấu giá', bg: '#e8f5e9', color: '#2e7d32' };
    }
    if (asset.session_status === 'CLOSED') {
        return { text: '✅ Đã bán thành công', bg: '#e3f2fd', color: '#1565c0' };
    }
    if (asset.session_status === 'FAILED') {
        return { text: '⚠️ Hết hạn, không ai đặt giá', bg: '#f5f5f5', color: '#616161' };
    }
    return { text: asset.status, bg: '#f5f5f5', color: '#616161' };
};

const AdminPage = () => {
    const [deposits, setDeposits] = useState([]);
    const [assets, setAssets] = useState([]);
    // Toàn bộ tài sản đã duyệt (đang đấu giá / đã bán / hết hạn) để admin gỡ khỏi sàn khi cần
    const [allAssets, setAllAssets] = useState([]);
    const [loadingAllAssets, setLoadingAllAssets] = useState(true);
    const [notification, setNotification] = useState(null);
    const ws = useRef(null);

    useEffect(() => {
        fetchData();

        ws.current = new WebSocket('wss://btl-online-auction.onrender.com/ws/admin');

        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            
            if (data.type === 'NEW_DEPOSIT') {
                setDeposits(prev => [data.payload, ...prev]);
                showNotification(`💰 Có yêu cầu nạp tiền mới từ ${data.payload.user_email}!`);
            } else if (data.type === 'NEW_ASSET') {
                setAssets(prev => [data.payload, ...prev]);
                showNotification(`📦 Có tài sản mới chờ duyệt: ${data.payload.name}!`);
            }
        };

        return () => {
            if (ws.current) ws.current.close();
        };
    }, []);

    const fetchData = async () => {
        try {
            const resDeposits = await api.get('/users/admin/pending-deposits');
            setDeposits(resDeposits.data.data);

            const resAssets = await api.get('/assets/pending');
            setAssets(resAssets.data.data);

            fetchAllAssets();
        } catch (error) {
            console.error(error);
        }
    };

    const fetchAllAssets = () => {
        setLoadingAllAssets(true);
        api.get('/assets/admin/all')
            .then(res => {
                // Chỉ hiển thị ở khu này những tài sản ĐÃ duyệt (khu bên trên đã lo phần PENDING rồi)
                const approvedOnly = (res.data.data || []).filter(a => a.status === 'APPROVED');
                setAllAssets(approvedOnly);
            })
            .catch(err => console.error('Lỗi lấy danh sách tài sản:', err))
            .finally(() => setLoadingAllAssets(false));
    };

    const showNotification = (msg) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 5000);
    };

    const handleApproveDeposit = async (id, userId, amount) => {
        try {
            await api.post('/user/admin/approve-deposit', { deposit_id: id, user_id: userId, amount });
            alert('Đã duyệt tiền thành công!');
            setDeposits(prev => prev.filter(d => d.id !== id)); 
        } catch (error) {
            alert('Lỗi duyệt tiền');
        }
    };

    const handleApproveAsset = async (id) => {
        const start_price = prompt('Giá khởi điểm (VNĐ):');
        if (start_price === null) return; // Admin bấm Cancel

        const step_price = prompt('Bước giá (VNĐ):');
        if (step_price === null) return;

        const duration_days = prompt('Thời gian đấu giá (số ngày):', '3');
        if (duration_days === null) return;

        try {
            await api.put(`/assets/${id}/status`, {
                status: 'APPROVED',
                start_price: Number(start_price),
                step_price: Number(step_price),
                duration_days: Number(duration_days) || 3
            });
            alert('Đã duyệt sản phẩm lên sàn!');
            setAssets(prev => prev.filter(a => a.id !== id));
            fetchAllAssets();
        } catch (error) {
            alert(error.response?.data?.message || 'Lỗi duyệt sản phẩm');
        }
    };

    // Từ chối tin đăng đang chờ duyệt (VD ảnh mờ, mô tả không hợp lệ...)
    const handleRejectAsset = async (id) => {
        if (!window.confirm('Từ chối tin đăng này?')) return;
        try {
            await api.put(`/assets/${id}/status`, { status: 'REJECTED' });
            alert('Đã từ chối tin đăng!');
            setAssets(prev => prev.filter(a => a.id !== id));
        } catch (error) {
            alert(error.response?.data?.message || 'Lỗi từ chối tin đăng');
        }
    };

    // Xoá hẳn 1 tin đăng (đang chờ duyệt, đang đấu giá, hay đã bán/hết hạn đều xoá được vì admin
    // có toàn quyền - dùng cho trường hợp cần gỡ hẳn khỏi hệ thống)
    const handleDeleteAsset = async (asset, listType) => {
        const confirmMsg = asset.session_status === 'CLOSED'
            ? `Sản phẩm "${asset.name}" đã đấu giá thành công (đã bán). Chắc chắn xoá khỏi hệ thống?`
            : `Chắc chắn xoá tin đăng "${asset.name}"?`;

        if (!window.confirm(confirmMsg)) return;

        try {
            const res = await api.delete(`/assets/${asset.id}`);
            alert(res.data.message);
            if (listType === 'pending') {
                setAssets(prev => prev.filter(a => a.id !== asset.id));
            } else {
                setAllAssets(prev => prev.filter(a => a.id !== asset.id));
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Lỗi khi xoá tin đăng!');
        }
    };

    return (
        <div style={{ backgroundColor: '#f5f5f5', minHeight: '90vh', padding: '40px 20px', position: 'relative' }}>
            
            {notification && (
                <div style={{
                    position: 'fixed', top: '20px', right: '20px', backgroundColor: '#4caf50',
                    color: 'white', padding: '15px 20px', borderRadius: '8px', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontWeight: 'bold', zIndex: 9999
                }}>
                    {notification}
                </div>
            )}

            <h1 style={{ textAlign: 'center', color: '#b71c1c', marginBottom: '40px' }}>TRUNG TÂM QUẢN TRỊ HỆ THỐNG</h1>
            
            <div style={{ display: 'flex', gap: '30px', maxWidth: '1200px', margin: '0 auto', flexWrap: 'wrap' }}>
                
                <div style={{ flex: 1, minWidth: '300px', backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ borderBottom: '2px solid #2e7d32', paddingBottom: '10px', color: '#2e7d32' }}>💰 YÊU CẦU NẠP TIỀN</h3>
                    {deposits.length === 0 ? <p>Không có yêu cầu nạp tiền nào.</p> : deposits.map(d => (
                        <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #eee' }}>
                            <div>
                                <div style={{ fontWeight: 'bold' }}>{d.user_email}</div>
                                <div style={{ color: '#b71c1c', fontWeight: 'bold' }}>+{Number(d.amount).toLocaleString('vi-VN')} đ</div>
                            </div>
                            <button onClick={() => handleApproveDeposit(d.id, d.user_id, d.amount)} style={{ background: '#2e7d32', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                                DUYỆT
                            </button>
                        </div>
                    ))}
                </div>

                <div style={{ flex: 1, minWidth: '300px', backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ borderBottom: '2px solid #f57c00', paddingBottom: '10px', color: '#f57c00' }}>📦 TÀI SẢN CHỜ LÊN SÀN</h3>
                    {assets.length === 0 ? <p>Không có tài sản chờ duyệt.</p> : assets.map(a => (
                        <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #eee', flexWrap: 'wrap', gap: '10px' }}>
                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                <img src={a.image} alt="ảnh" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px' }} />
                                <div>
                                    <div style={{ fontWeight: 'bold' }}>{a.name}</div>
                                    <div style={{ fontSize: '0.85rem', color: '#777' }}>{a.condition_tag}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => handleApproveAsset(a.id)} style={{ background: '#f57c00', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                                    CHO LÊN SÀN
                                </button>
                                <button onClick={() => handleRejectAsset(a.id)} style={{ background: '#fff', color: '#616161', border: '1px solid #ccc', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                                    TỪ CHỐI
                                </button>
                                <button onClick={() => handleDeleteAsset(a, 'pending')} style={{ background: '#fff', color: '#b71c1c', border: '1px solid #b71c1c', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                                    🗑 XOÁ
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

            </div>

            {/* KHU QUẢN LÝ TÀI SẢN ĐÃ LÊN SÀN: đang đấu giá / đã bán / hết hạn - admin gỡ khỏi hệ thống khi cần */}
            <div style={{ maxWidth: '1200px', margin: '30px auto 0', backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                <h3 style={{ borderBottom: '2px solid #b71c1c', paddingBottom: '10px', color: '#b71c1c' }}>
                    🗂 QUẢN LÝ TÀI SẢN ĐÃ LÊN SÀN
                </h3>

                {loadingAllAssets ? (
                    <p>Đang tải danh sách...</p>
                ) : allAssets.length === 0 ? (
                    <p>Chưa có tài sản nào được duyệt lên sàn.</p>
                ) : (
                    allAssets.map(a => {
                        const badge = getSessionBadge(a);
                        return (
                            <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #eee', flexWrap: 'wrap', gap: '10px' }}>
                                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                    <img src={a.image} alt="ảnh" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px' }} />
                                    <div>
                                        <div style={{ fontWeight: 'bold' }}>{a.name}</div>
                                        <span style={{ display: 'inline-block', marginTop: '4px', fontSize: '12px', fontWeight: 'bold', padding: '3px 10px', borderRadius: '12px', backgroundColor: badge.bg, color: badge.color }}>
                                            {badge.text}
                                        </span>
                                    </div>
                                </div>
                                <button onClick={() => handleDeleteAsset(a, 'all')} style={{ background: '#fff', color: '#b71c1c', border: '1px solid #b71c1c', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                                    🗑 Gỡ khỏi hệ thống
                                </button>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default AdminPage;