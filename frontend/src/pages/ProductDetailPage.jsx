import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import CountdownTimer from '../components/CountdownTimer';

const ProductDetailPage = () => {
    const { id } = useParams(); 
    const navigate = useNavigate();
    const [asset, setAsset] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);

        const fetchAssetDetail = async () => {
            try {
                const res = await api.get(`/assets/${id}`);
                setAsset(res.data.data || res.data);
            } catch (error) {
                console.error("Lỗi lấy chi tiết sản phẩm:", error);
                alert("Không tìm thấy sản phẩm hoặc lỗi máy chủ!");
            } finally {
                setLoading(false);
            }
        };

        fetchAssetDetail();
    }, [id]);

    if (loading) {
        return (
            <div style={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <h2 style={{ color: '#b71c1c' }}>⏳ Đang tải thông tin tài sản...</h2>
            </div>
        );
    }

    if (!asset) {
        return (
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
                <h2>Tài sản không tồn tại!</h2>
                <button onClick={() => navigate(-1)} style={{ padding: '10px 20px', cursor: 'pointer' }}>Quay lại</button>
            </div>
        );
    }

    // HÀM CHUYỂN ĐỔI CHUỖI JSON SANG OBJECT AN TOÀN (ANTI-CRASH)
    const getSpecs = () => {
        // Không còn dữ liệu mẫu (mock) cứng nữa: nếu người bán không nhập thông số
        // thì đơn giản là không có gì để hiển thị (khớp với AssetDetailPage.jsx).
        if (!asset.specifications) {
            return null;
        }
        try {
            // Nếu database lưu dạng JSON Object rồi thì trả về luôn, nếu là string thì parse ra
            return typeof asset.specifications === 'string' 
                ? JSON.parse(asset.specifications) 
                : asset.specifications;
        } catch (e) {
            console.error("Lỗi parse JSON thông số kỹ thuật:", e);
            return null;
        }
    };

    const specs = getSpecs();

    return (
        <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', padding: '40px 20px' }}>
            <div style={{ maxWidth: '1100px', margin: '0 auto', backgroundColor: '#fff', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                
                <button onClick={() => navigate(-1)} style={{ marginBottom: '25px', padding: '10px 20px', cursor: 'pointer', backgroundColor: '#e0e0e0', color: '#333', border: 'none', borderRadius: '6px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    ⬅ Quay lại
                </button>

                {/* KHU VỰC THÔNG TIN CHÍNH */}
                <div style={{ display: 'flex', gap: '50px', flexWrap: 'wrap' }}>
                    
                    <div style={{ flex: '1', minWidth: '350px' }}>
                        <img 
                            src={asset.image} 
                            alt={asset.name} 
                            style={{ width: '100%', height: 'auto', borderRadius: '8px', border: '1px solid #eee', objectFit: 'cover' }} 
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://placehold.co/600x400/ececec/999999?text=Phenikaa+Auction';
                            }}
                        />
                    </div>

                    <div style={{ flex: '1', minWidth: '350px', display: 'flex', flexDirection: 'column' }}>
                        <h1 style={{ fontSize: '28px', color: '#222', marginBottom: '15px', lineHeight: '1.4' }}>{asset.name}</h1>
                        
                        <span style={{ display: 'inline-block', backgroundColor: '#fff3e0', color: '#e65100', padding: '6px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold', width: 'fit-content', border: '1px solid #ffe0b2', marginBottom: '20px' }}>
                            🔥 {asset.condition_tag || 'Tình trạng: Đang cập nhật'}
                        </span>
                        
                        <div style={{ backgroundColor: '#fafafa', padding: '25px', borderRadius: '8px', marginBottom: '25px', borderLeft: '5px solid #b71c1c' }}>
                            <p style={{ fontSize: '15px', color: '#666', marginBottom: '8px' }}>Giá hiện tại:</p>
                            <h2 style={{ color: '#b71c1c', fontSize: '36px', margin: '0' }}>
                                {Number(asset.current_price || 0).toLocaleString('vi-VN')} VNĐ
                            </h2>
                        </div>

                        <div style={{ backgroundColor: '#e8f5e9', padding: '15px 25px', borderRadius: '8px', border: '1px solid #c8e6c9', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#2e7d32', fontWeight: 'bold', fontSize: '16px' }}>⏳ Thời gian còn lại:</span>
                            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1b5e20' }}>
                                <CountdownTimer endTime={asset.end_time} />
                            </div>
                        </div>

                        <button 
                            onClick={() => navigate(`/asset/${asset.id}`)}
                            style={{ padding: '18px', backgroundColor: '#b71c1c', color: 'white', fontSize: '18px', fontWeight: '900', border: 'none', borderRadius: '8px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(183, 28, 28, 0.3)', textTransform: 'uppercase', transition: 'background 0.3s' }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#9b1414'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = '#b71c1c'}
                        >
                            THAM GIA PHÒNG ĐẤU GIÁ
                        </button>
                        <p style={{ textAlign: 'center', marginTop: '15px', fontSize: '13px', color: '#777' }}>
                            🔒 Kết nối mã hóa an toàn đầu cuối
                        </p>
                    </div>
                </div>

                {/* PHẦN DƯỚI: MÔ TẢ & THÔNG SỐ KỸ THUẬT */}
                <div style={{ marginTop: '50px', paddingTop: '30px', borderTop: '2px solid #eee', display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
                    
                    {/* MÔ TẢ TÀI SẢN (CHIẾM 60% CHIỀU RỘNG) */}
                    <div style={{ flex: '1.5', minWidth: '350px' }}>
                        <h3 style={{ color: '#333', fontSize: '22px', borderLeft: '4px solid #b71c1c', paddingLeft: '10px', marginBottom: '20px' }}>
                            Chi tiết sản phẩm
                        </h3>
                        <div style={{ color: '#444', lineHeight: '1.8', fontSize: '16px', backgroundColor: '#fafafa', padding: '20px', borderRadius: '8px', border: '1px solid #eaeaea', minHeight: '150px' }}>
                            {asset.description || 'Chưa có mô tả chi tiết cho tài sản này.'}
                        </div>
                    </div>

                    {/* BẢNG THÔNG SỐ KỸ THUẬT ĐỘNG (CHIẾM 40% CHIỀU RỘNG) */}
                    {specs && (
                        <div style={{ flex: '1', minWidth: '300px' }}>
                            <h3 style={{ color: '#333', fontSize: '22px', borderLeft: '4px solid #b71c1c', paddingLeft: '10px', marginBottom: '20px' }}>
                                Thông số kỹ thuật
                            </h3>
                            <div style={{ border: '1px solid #eaeaea', borderRadius: '8px', overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '15px' }}>
                                    <tbody>
                                        {Object.entries(specs).map(([key, value], index) => (
                                            <tr 
                                                key={key} 
                                                style={{ 
                                                    backgroundColor: index % 2 === 0 ? '#fff' : '#fafafa',
                                                    borderBottom: '1px solid #eaeaea' 
                                                }}
                                            >
                                                <td style={{ padding: '12px 15px', fontWeight: 'bold', color: '#555', width: '40%', borderRight: '1px solid #eaeaea' }}>
                                                    {key}
                                                </td>
                                                <td style={{ padding: '12px 15px', color: '#333' }}>
                                                    {value}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                </div>

            </div>
        </div>
    );
};

export default ProductDetailPage;