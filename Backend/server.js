import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import medicineRoutes from './routes/medicineRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
import reminderRoutes from './routes/reminderRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads folder exists safely (support Vercel read-only filesystem)
const uploadsDir = process.env.VERCEL ? path.join('/tmp', 'uploads') : path.join(__dirname, 'uploads');
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
} catch (e) {
  console.warn('[MEDISCAN UPLOADS WARNING] Could not create uploads folder:', e.message);
}

const app = express();

// Disable ETags and caching for API endpoints to force 200 OK with fresh data
app.disable('etag');

app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Middleware
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(cors());
app.use(morgan('dev'));

// Ensure DB connection is active before processing requests
app.use(async (req, res, next) => {
  if (req.path === '/api/health' || req.path === '/health') {
    return next();
  }
  try {
    await connectDB();
  } catch (err) {
    console.error('[MEDISCAN DB REQUEST MIDDLEWARE ERR]', err.message);
  }

  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database connection currently unavailable. Please verify your MongoDB Atlas connection string (MONGO_URI) and Network IP Access.'
    });
  }

  next();
});

// Static uploads directory
app.use('/uploads', express.static(uploadsDir));

// Healthcheck Routes
const healthHandler = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'MEDISCAN API Server is operational',
    timestamp: new Date().toISOString()
  });
};
app.get('/api/health', healthHandler);
app.get('/health', healthHandler);

// API Routes (Mounted with /api prefix and root prefix for Vercel Serverless compatibility)
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/medicines', medicineRoutes);
app.use('/medicines', medicineRoutes);

app.use('/api/history', historyRoutes);
app.use('/history', historyRoutes);

app.use('/api/reminders', reminderRoutes);
app.use('/reminders', reminderRoutes);

app.use('/api/admin', adminRoutes);
app.use('/admin', adminRoutes);

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error(`[MEDISCAN SERVER ERROR] ${err.stack}`);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = parseInt(process.env.PORT || '5001', 10);

if (!process.env.VERCEL) {
  connectDB().catch((err) => {
    console.warn('[MEDISCAN INITIAL DB CONNECT WARN]', err.message);
  });

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n========================================================`);
    console.log(` [MEDISCAN SERVER] Running on http://127.0.0.1:${PORT}`);
    console.log(` Healthcheck: http://127.0.0.1:${PORT}/api/health`);
    console.log(`========================================================\n`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n[PORT CONFLICT ERROR] Port ${PORT} is already in use by another process.`);
      console.error(`To resolve this issue, please terminate the process occupying port ${PORT} or restart nodemon.\n`);
    } else {
      console.error(`[SERVER LISTEN ERROR] ${err.message}`);
    }
  });
}

process.on('unhandledRejection', (err) => {
  console.error(`[UNHANDLED REJECTION] ${err.message}`);
});

export default app;
