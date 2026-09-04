import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import userRoutes from './routes/userRoutes.js';
import User from './models/User.js';

// ─── Connect Database ────────────────────────────────────────────────────────
connectDB();

// ─── Seed Superadmin (runs only after DB is connected) ───────────────────────
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

// Trigger seed once mongoose connection is fully open
mongoose.connection.once('open', async () => {
  await seedSuperAdmin();
});

// ─── App Setup ───────────────────────────────────────────────────────────────
const app = express();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  },
});

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

// Attach io instance to every request
app.use((req, _res, next) => {
  req.io = io;
  next();
});

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'OK', timestamp: new Date() }));

// ─── Socket.io ───────────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`⚡ Client connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// ─── Start Server ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

httpServer.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Kill the other process and retry.`);
    process.exit(1);
  }
  throw err;
});

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

