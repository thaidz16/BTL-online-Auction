require('dotenv').config();
const express = require('express');
const db = require('./config/db'); 
const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const morgan = require('morgan');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] }
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev')); 
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Test Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Backend is running!' });
});

// Socket.IO Logic
io.on('connection', (socket) => {
  console.log('⚡ User connected:', socket.id);
  socket.on('disconnect', () => console.log('❌ User disconnected:', socket.id));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server chạy cực cháy tại cổng ${PORT}`);
});