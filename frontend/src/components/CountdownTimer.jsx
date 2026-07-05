import { useState, useEffect } from 'react';

const CountdownTimer = ({ endTime }) => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        if (!endTime) {
            setTimeLeft('Đang cập nhật');
            return;
        }

        const calculateTime = () => {
            const difference = +new Date(endTime) - +new Date();
            
            // Nếu hết thời gian đấu giá
            if (difference <= 0) {
                return 'Đã kết thúc 🛑';
            }

            // Tính toán Ngày, Giờ, Phút, Giây còn lại
            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((difference / 1000 / 60) % 60);
            const seconds = Math.floor((difference / 1000) % 60);

            // Định dạng chuỗi hiển thị nhìn cho đẹp và chuyên nghiệp
            let result = '';
            if (days > 0) result += `${days} ngày `;
            
            // padStart(2, '0') để nó hiện dạng 02:05:09 thay vì 2:5:9
            result += `${hours.toString().padStart(2, '0')} giờ : `;
            result += `${minutes.toString().padStart(2, '0')} phút : `;
            result += `${seconds.toString().padStart(2, '0')} giây`;

            return `⏳ ${result}`;
        };

        // Chạy lần đầu tiên để tránh màn hình bị trống 1 giây ban đầu
        setTimeLeft(calculateTime());

        // Cứ mỗi 1 giây (1000ms) thì tính lại thời gian còn lại
        const timer = setInterval(() => {
            setTimeLeft(calculateTime());
        }, 1000);
        return () => clearInterval(timer);
    }, [endTime]);

    return (
        <span style={{ 
            fontWeight: 'bold', 
            color: timeLeft.includes('🛑') ? '#757575' : '#e65100', // Hết giờ thì màu xám, còn giờ thì màu cam rực cháy
            fontSize: '0.95rem' 
        }}>
            {timeLeft}
        </span>
    );
};

export default CountdownTimer;