import { Link } from 'react-router-dom';

const Navbar = () => {
    // Kiểm tra xem user có token không (đã đăng nhập chưa)
    const isLoggedIn = !!localStorage.getItem('token');
    
    // Lấy role từ kho ra. Dùng || '' để lỡ chưa đăng nhập nó không bị lỗi
    const role = localStorage.getItem('role') || ''; 

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role'); // Nhớ xóa cả role khi đăng xuất
        window.location.href = '/';
    };

    return (
        <nav style={{ backgroundColor: '#b71c1c', color: 'white', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            
            {/* Cụm Logo & Tên sàn */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'white', textDecoration: 'none', fontSize: '26px', fontWeight: '900', letterSpacing: '1px' }}>
                    <img src="/logo-navbar.png" alt="Logo Sàn" style={{ height: '60px', width: 'auto' }} />
                    PHENIKAA AUCTION
                </Link>
                <span style={{ fontSize: '14px', borderLeft: '2px solid white', paddingLeft: '15px', opacity: 0.9 }}>
                    Sàn Đấu Giá Trực Tuyến
                </span>
            </div>

            {/* Cụm Menu Phải */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ fontWeight: 'bold', fontSize: '18px', backgroundColor: 'white', color: '#b71c1c', padding: '5px 15px', borderRadius: '20px', marginRight: '10px' }}>
                    📞 0961.590.214
                </span>
                
                {/* NHỮNG NÚT NÀY CHỈ HIỆN KHI ĐÃ ĐĂNG NHẬP (USER HOẶC ADMIN ĐỀU THẤY) */}
                {isLoggedIn && (
                    <>
                        <Link to="/history" style={{ color: 'white', textDecoration: 'none', fontWeight: '500' }}>Lịch sử</Link>
                        <Link to="/wallet" style={{ color: 'white', textDecoration: 'none', fontWeight: '500' }}>Ví tiền</Link>
                        <Link to="/sell" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold', border: '1px dashed white', padding: '4px 10px', borderRadius: '6px' }}>
                            + Đăng bán
                        </Link>
                    </>
                )}

                {/* NÚT NÀY CHỈ HIỆN KHI LÀ ADMIN (Dùng toLowerCase để xử lý vụ chữ hoa/thường) */}
                {role.toLowerCase() === 'admin' && (
                    <Link to="/admin" style={{ color: 'white', backgroundColor: '#333', padding: '6px 15px', borderRadius: '20px', textDecoration: 'none', fontWeight: 'bold', marginLeft: '10px' }}>
                        ⚙️ Quản trị
                    </Link>
                )}
                
                <div style={{ display: 'flex', gap: '10px', marginLeft: '15px' }}>
                    {isLoggedIn ? (
                        <button onClick={handleLogout} style={{ color: '#b71c1c', background: 'white', padding: '8px 20px', borderRadius: '6px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
                            Đăng xuất
                        </button>
                    ) : (
                        <>
                            <Link to="/login" style={{ color: '#b71c1c', textDecoration: 'none', background: 'white', padding: '8px 20px', borderRadius: '6px', fontWeight: 'bold' }}>Đăng nhập</Link>
                            <Link to="/register" style={{ color: 'white', textDecoration: 'none', border: '1px solid white', padding: '8px 20px', borderRadius: '6px', fontWeight: 'bold' }}>Đăng ký</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;