import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import AssetDetailPage from './pages/AssetDetailPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import RegisterPage from './pages/RegisterPage';
import HistoryPage from './pages/HistoryPage';
import WalletPage from './pages/WalletPage';
import SellPage from './pages/SellPage';
import ProductDetailPage from './pages/ProductDetailPage';

function App() {
  const isLoggedIn = !!localStorage.getItem('token');
  return (
    <BrowserRouter>
      <Navbar />
      <ToastContainer position="bottom-right" autoClose={3000} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={isLoggedIn ? <Navigate to="/" /> : <LoginPage />} />
        <Route path="/asset/:id" element={<AssetDetailPage />} /> 
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/sell" element={<SellPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;