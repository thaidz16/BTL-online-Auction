import { useState } from 'react';

// Ô nhập mật khẩu có icon con mắt để ẩn/hiện. Nhận mọi prop input bình thường
// (placeholder, required, onChange...) và tự lo phần toggle hiển thị.
const PasswordInput = ({ style, ...inputProps }) => {
    const [visible, setVisible] = useState(false);

    return (
        <div style={{ position: 'relative', width: '100%' }}>
            <input
                type={visible ? 'text' : 'password'}
                {...inputProps}
                style={{ ...style, width: '100%', paddingRight: '42px', boxSizing: 'border-box' }}
            />
            <button
                type="button"
                onClick={() => setVisible(v => !v)}
                aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    color: '#777'
                }}
            >
                {visible ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.5 18.5 0 0 1 5.06-5.94M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                )}
            </button>
        </div>
    );
};

export default PasswordInput;