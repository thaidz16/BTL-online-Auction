import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import AccountMenu from './AccountMenu';

const Navbar = () => {
    const isLoggedIn = !!localStorage.getItem('token');
    const role = localStorage.getItem('role') || ''; 

    const [currentLang, setCurrentLang] = useState('vi');
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        const term = searchTerm.trim();
        navigate(term ? `/?q=${encodeURIComponent(term)}` : '/');
    };

    useEffect(() => {
        if (document.cookie.includes('googtrans=/vi/en')) {
            setCurrentLang('en');
        } else {
            setCurrentLang('vi');
        }

        if (!window.googleTranslateElementInit) {
            window.googleTranslateElementInit = () => {
                new window.google.translate.TranslateElement({
                    pageLanguage: 'vi',
                    includedLanguages: 'en,vi'
                }, 'google_translate_element');
            };

            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
            script.async = true;
            document.body.appendChild(script);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        window.location.href = '/';
    };

    const handleLanguageChange = (e) => {
        const lang = e.target.value;
        setCurrentLang(lang);
        
        if (lang === 'vi') {
            document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
            window.location.reload();
            return;
        }

        document.cookie = `googtrans=/vi/${lang}; path=/`;
        document.cookie = `googtrans=/vi/${lang}; path=/; domain=${window.location.hostname}`;
        
        const googleSelect = document.querySelector('.goog-te-combo'); 
        
        if (googleSelect) {
            googleSelect.value = lang; 
            googleSelect.dispatchEvent(new Event('change'));
        } else {
            window.location.reload();
        }
    };

    return (
        <nav style={{ backgroundColor: '#b71c1c', color: 'white', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'white', textDecoration: 'none', fontSize: '26px', fontWeight: '900', letterSpacing: '1px' }}>
                    <img src="/logo-navbar.png" alt="Logo Sàn" style={{ height: '60px', width: 'auto' }} />
                    PHENIKAA AUCTION
                </Link>
                <span style={{ fontSize: '14px', borderLeft: '2px solid white', paddingLeft: '15px', opacity: 0.9 }}>
                    Sàn Đấu Giá Trực Tuyến
                </span>
            </div>

            {/* THANH TÌM KIẾM Ở GIỮA NAVBAR */}
            <form onSubmit={handleSearchSubmit} style={{ flex: '1', maxWidth: '420px', margin: '0 20px', display: 'flex' }}>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm kiếm sản phẩm đấu giá..."
                    style={{
                        flex: 1,
                        padding: '10px 16px',
                        border: 'none',
                        borderRadius: '20px 0 0 20px',
                        outline: 'none',
                        fontSize: '14px'
                    }}
                />
                <button
                    type="submit"
                    style={{
                        padding: '10px 18px',
                        border: 'none',
                        borderRadius: '0 20px 20px 0',
                        backgroundColor: '#8e0000',
                        color: 'white',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    🔍
                </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ fontWeight: 'bold', fontSize: '18px', backgroundColor: 'white', color: '#b71c1c', padding: '5px 15px', borderRadius: '20px', marginRight: '10px' }}>
                    📞 0961.590.214
                </span>

                {/* GỘP Lịch sử / Ví tiền / Yêu thích / Đăng bán / Quản trị vào 1 menu tài khoản */}
                {isLoggedIn && <AccountMenu role={role} />}

                <select 
                    value={currentLang}
                    onChange={handleLanguageChange}
                    style={{
                        backgroundColor: '#fff',
                        color: '#b71c1c',
                        border: 'none',
                        borderRadius: '20px',
                        padding: '6px 12px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        outline: 'none',
                        marginLeft: '10px',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                    }}
                >
                    <option value="vi">🇻🇳 Tiếng Việt</option>
                    <option value="en">🇬🇧 English</option>
                </select>

                <div id="google_translate_element"></div>

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