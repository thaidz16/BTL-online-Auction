import { Link } from 'react-router-dom';

const Navbar = () => {
    const role = localStorage.getItem('role');
    const isLoggedIn = !!localStorage.getItem('token');

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.reload();
    };

    return (
        <nav style={{ backgroundColor: '#b71c1c', color: 'white', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '26px', fontWeight: '900', letterSpacing: '1px' }}>PHENIKAA AUCTION</Link>
                <span style={{ fontSize: '14px', borderLeft: '2px solid white', paddingLeft: '15px', opacity: 0.9 }}>Sàn Đấu Giá Trực Tuyến</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <span style={{ fontWeight: 'bold', fontSize: '18px', backgroundColor: 'white', color: '#b71c1c', padding: '5px 15px', borderRadius: '20px' }}>📞 0961.590.214</span>
                <Link to="/history" style={{ color: 'white', textDecoration: 'none', fontWeight: '500' }}>Lịch sử đấu giá</Link>
                <Link to="/wallet" style={{ color: 'white', textDecoration: 'none', fontWeight: '500' }}>Ví tiền</Link>
                {role === 'admin' && (
    <Link to="/admin" style={{ color: 'white', backgroundColor: '#333', padding: '5px 15px', borderRadius: '20px', textDecoration: 'none', fontWeight: 'bold' }}>
        ⚙️ Quản trị
    </Link>
)}
                <div style={{ display: 'flex', gap: '10px', marginLeft: '10px' }}>
                    {isLoggedIn ? (
                        <button onClick={handleLogout} style={{ color: '#b71c1c', background: 'white', padding: '8px 20px', borderRadius: '6px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Đăng xuất</button>
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