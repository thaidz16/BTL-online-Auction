import { useEffect, useState } from 'react';
import api from '../services/api';

const HomePage = () => {
    const [assets, setAssets] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const res = await api.get('/assets');
            console.log("Du lieu tai san:", res.data);
            setAssets(res.data.data);
        };
        fetchData();
    }, []);

    return (
        <div>
            <h1>Danh sách đấu giá</h1>
            {Array.isArray(assets) && assets.map(asset => (
    <div key={asset.id} style={{ border: '1px solid #ccc', margin: '10px' }}>
        <h3>{asset.name}</h3>
        <p>{asset.description}</p>
    </div>
))}
        </div>
    );
};
export default HomePage;