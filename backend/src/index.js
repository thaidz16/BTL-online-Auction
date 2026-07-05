require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const morgan = require('morgan');

// Khởi tạo kết nối DB
const db = require('./config/db');

// 1. KHỞI TẠO APP (Phải có cái này đầu tiên)
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", 
    methods: ["GET", "POST"]
  }
});

// 2. MIDDLEWARES (Xử lý request trước khi vào Route)
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Gắn socket io vào request để các controller gọi được realtime
app.use((req, res, next) => {
  req.io = io;
  next();
});

// 3. KHAI BÁO ROUTES (Bắt buộc phải nằm dưới app = express())
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const categoryRoutes = require('./routes/category.routes');
const assetRoutes = require('./routes/asset.routes');
const auctionRoutes = require('./routes/auction.routes');
// const bidRoutes = require('./routes/bid.routes');
// const notificationRoutes = require('./routes/notification.routes');
// const dashboardRoutes = require('./routes/dashboard.routes');\

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/auctions', auctionRoutes);
// app.use('/api/bids', bidRoutes);
// app.use('/api/notifications', notificationRoutes);
// app.use('/api/dashboard', dashboardRoutes);

// 4. TEST ROUTE
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Backend is running!' });
});

// 5. SOCKET.IO EVENTS
io.on('connection', (socket) => {
  console.log('⚡ User connected:', socket.id);

  socket.on('place_bid', (data) => {
    console.log('Có người đặt giá:', data);
    io.emit('new_bid_update', data);
  });
});

// 6. KHỞI ĐỘNG SERVER
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server chạy cực cháy tại cổng ${PORT}`);
});