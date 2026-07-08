require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const morgan = require('morgan');

const db = require('./config/db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use((req, res, next) => {
  req.io = io;
  next();
});

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const categoryRoutes = require('./routes/category.routes');
const assetRoutes = require('./routes/asset.routes');
const auctionRoutes = require('./routes/auction.routes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/auctions', auctionRoutes);

app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Backend is running!' });
});

io.on('connection', (socket) => {
  console.log('⚡ User connected:', socket.id);

  socket.on('place_bid', (data) => {
    console.log('Có người đặt giá:', data);
    io.emit('new_bid_update', data);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server chạy cực cháy tại cổng ${PORT}`);
});