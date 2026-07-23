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
const wishlistRoutes = require('./routes/wishlist.routes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/wishlist', wishlistRoutes);

app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

io.on('connection', (socket) => {
  socket.on('disconnect', () => {
  });
});

const closeExpiredAuctionSessions = async () => {
  try {
    const [expiredSessions] = await db.execute(
      `SELECT id, asset_id FROM auction_sessions WHERE status = 'ACTIVE' AND end_time <= NOW()`
    );

    for (const session of expiredSessions) {
      let winnerId = null;
      try {
        const [topBid] = await db.execute(
          `SELECT user_id FROM bids WHERE session_id = ? ORDER BY amount DESC, created_at DESC LIMIT 1`,
          [session.id]
        );
        if (topBid.length > 0) winnerId = topBid[0].user_id;
      } catch (bidErr) {}

      if (winnerId) {
        await db.execute(
          `UPDATE auction_sessions SET status = 'CLOSED', winner_id = ? WHERE id = ?`,
          [winnerId, session.id]
        );
      } else {
        await db.execute(`UPDATE auction_sessions SET status = 'FAILED' WHERE id = ?`, [session.id]);
      }
    }
  } catch (error) {}
};

setInterval(closeExpiredAuctionSessions, 60 * 1000);
closeExpiredAuctionSessions();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {});


