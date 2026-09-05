/**
 * server.js — LOCAL DEVELOPMENT ONLY
 * Wraps the Express app with http.Server + Socket.io and starts listening.
 * On Vercel, api/index.js is used directly instead.
 */
import 'dotenv/config';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import User from './models/User.js';
import app from './api/index.js';

// ─── Seed Superadmin ──────────────────────────────────────────────────────────
const seedSuperAdmin = async () => {
  try {
    const count = await User.countDocuments();
    if (count === 0) {
      await User.create({
        name: process.env.SEED_ADMIN_NAME,
        email: process.env.SEED_ADMIN_EMAIL,
        password: process.env.SEED_ADMIN_PASSWORD,
        role: 'superadmin',
      });
      console.log(`🌱 Superadmin seeded: ${process.env.SEED_ADMIN_EMAIL}`);
    } else {
      console.log(`ℹ️  Database already has ${count} user(s), skipping seed.`);
    }
  } catch (err) {
    console.error('Seed error:', err.message);
  }
};

mongoose.connection.once('open', async () => {
  await seedSuperAdmin();
});

// ─── HTTP Server + Socket.io ──────────────────────────────────────────────────
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: ['https://big-eth-finance.vercel.app', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  },
});

// Attach io to every request
app.use((req, _res, next) => {
  req.io = io;
  next();
});

io.on('connection', (socket) => {
  console.log(`⚡ Client connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

httpServer.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} already in use.`);
    process.exit(1);
  }
  throw err;
});

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
