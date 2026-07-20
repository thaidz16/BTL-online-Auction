import { useState, useEffect } from 'react';

const HeroBanner = () => {
    const banners = [
        "/banner1.png",
        "/banner2.png",
        "/banner3.png"
    ];

    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prevIndex) => 
                prevIndex === banners.length - 1 ? 0 : prevIndex + 1
            );
        }, 4000); 

        return () => clearInterval(timer);
    }, [banners.length]);

    return (
        <div style={{ 
            position: 'relative', 
            width: '100%', 
            height: '350px', 
            borderRadius: '12px', 
            overflow: 'hidden', 
            marginBottom: '40px', 
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)' 
        }}>
            {banners.map((banner, index) => (
                <img 
                    key={index}
                    src={banner} 
                    alt={`Khuyến mãi ${index}`} 
                    style={{ 
                        position: 'absolute', 
                        top: 0, 
                        left: 0, 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover', 
                        opacity: currentIndex === index ? 1 : 0, 
                        transition: 'opacity 0.8s ease-in-out', 
                        zIndex: currentIndex === index ? 1 : 0
                    }}
                />
            ))}

            <div style={{ 
                position: 'absolute', 
                bottom: '15px', 
                width: '100%', 
                display: 'flex', 
                justifyContent: 'center', 
                gap: '10px',
                zIndex: 2 
            }}>
                {banners.map((_, index) => (
                    <div 
                        key={index} 
                        onClick={() => setCurrentIndex(index)}
                        style={{ 
                            width: currentIndex === index ? '30px' : '10px', 
                            height: '10px', 
                            backgroundColor: currentIndex === index ? '#b71c1c' : 'rgba(255,255,255,0.6)', 
                            borderRadius: '5px', 
                            cursor: 'pointer', 
                            transition: 'all 0.3s ease' 
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export default HeroBanner;