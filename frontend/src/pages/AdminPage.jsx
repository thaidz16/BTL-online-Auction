import { useEffect, useState } from 'react';
import api from '../services/api';

const AdminPage = () => {
    const [deposits, setDeposits] = useState([]);

    useEffect(() => {
        api.get('/admin/pending-deposits').then(res => setDeposits(res.data.data));
    }, []);

    const handleApprove = async (d) => {
        await api.post('/admin/approve-deposit', { deposit_id: d.id, user_id: d.user_id, amount: d.amount });
        alert("Đã duyệt!");
        window.location.reload();
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>TRANG QUẢN TRỊ - DUYỆT NẠP TIỀN</h2>
            {deposits.map(d => (
                <div key={d.id} style={{ border: '1px solid #ddd', margin: '10px', padding: '10px' }}>
                    User: {d.user_email} | Số tiền: {d.amount} 
                    <button onClick={() => handleApprove(d)}>DUYỆT</button>
                </div>
            ))}
        </div>
    );
};
export default AdminPage;