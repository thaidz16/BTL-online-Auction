import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Menu tài khoản gộp: Lịch sử, Ví tiền, Yêu thích, Đăng bán, Quản trị (nếu là admin)
// Bấm vào nút "Tài khoản" để mở/đóng, giống kiểu menu sổ xuống trong ảnh mẫu.
const AccountMenu = ({ role }) => {
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const isAdmin = (role || '').toLowerCase() === 'admin';

    const menuItemStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 18px',
        color: '#333',
        textDecoration: 'none',
        fontSize: '14px',
        fontWeight: '500',
        borderBottom: '1px solid #f0f0f0',
        whiteSpace: 'nowrap'
    };

    return (
        <div ref={wrapperRef} style={{ position: 'relative' }}>
            <button
                onClick={() => setOpen(prev => !prev)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'rgba(255,255,255,0.15)',
                    border: '1px solid rgba(255,255,255,0.4)',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '14px'
                }}
            >
                👤 Tài khoản {open ? '▲' : '▼'}
            </button>

            {open && (
                <div
                    style={{
                        position: 'absolute',
                        top: 'calc(100% + 10px)',
                        right: 0,
                        backgroundColor: '#fff',
                        borderRadius: '10px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                        minWidth: '220px',
                        overflow: 'hidden',
                        zIndex: 1000
                    }}
                    onClick={() => setOpen(false)}
                >
                    <Link to="/history" style={menuItemStyle}>📜 Lịch sử</Link>
                    <Link to="/wallet" style={menuItemStyle}>💰 Ví tiền</Link>
                    <Link to="/wishlist" style={menuItemStyle}>♥ Yêu thích</Link>
                    <Link to="/sell" style={{ ...menuItemStyle, color: '#b71c1c', fontWeight: 'bold' }}>➕ Đăng bán</Link>
                    {isAdmin && (
                        <Link to="/admin" style={{ ...menuItemStyle, borderBottom: 'none', backgroundColor: '#f5f5f5' }}>
                            ⚙️ Quản trị
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
};

export default AccountMenu;