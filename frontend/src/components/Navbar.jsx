import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

const Navbar = () => {
    const isLoggedIn = !!localStorage.getItem('token');
    const role = localStorage.getItem('role') || ''; 

    const [currentLang, setCurrentLang] = useState('vi');

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

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ fontWeight: 'bold', fontSize: '18px', backgroundColor: 'white', color: '#b71c1c', padding: '5px 15px', borderRadius: '20px', marginRight: '10px' }}>
                    📞 0961.590.214
                </span>
                
                {isLoggedIn && (
                    <>
                        <Link to="/history" style={{ color: 'white', textDecoration: 'none', fontWeight: '500' }}>Lịch sử</Link>
                        <Link to="/wallet" style={{ color: 'white', textDecoration: 'none', fontWeight: '500' }}>Ví tiền</Link>
                        <Link to="/wishlist" style={{ color: 'white', textDecoration: 'none', fontWeight: '500' }}>♥ Yêu thích</Link>
                        <Link to="/sell" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold', border: '1px dashed white', padding: '4px 10px', borderRadius: '6px' }}>
                            + Đăng bán
                        </Link>
                    </>
                )}

                {role.toLowerCase() === 'admin' && (
                    <Link to="/admin" style={{ color: 'white', backgroundColor: '#333', padding: '6px 15px', borderRadius: '20px', textDecoration: 'none', fontWeight: 'bold', marginLeft: '10px' }}>
                        ⚙️ Quản trị
                    </Link>
                )}
                
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