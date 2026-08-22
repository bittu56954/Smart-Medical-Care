import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { ensureAdminAccount } from './adminInit.js';

dotenv.config();

mongoose.set('bufferCommands', true);

let cachedConn = null;
let cachedPromise = null;
let memoryServerInstance = null;

const connectDB = async () => {
  if (cachedConn && mongoose.connection.readyState === 1) {
    return cachedConn;
  }

  if (mongoose.connection.readyState === 1) {
    cachedConn = mongoose.connection;
    return cachedConn;
  }

  if (cachedPromise) {
    return cachedPromise;
  }

  cachedPromise = (async () => {
    let primaryUri = process.env.MONGO_URI || 'mongodb+srv://krbittu803110_db_user:dPU9R7yWn6z813GU@cluster0.j2vupm7.mongodb.net/india';
    
    // Set 10s connection timeout for reliable connection establishment on Vercel and local environments
    const timeoutMs = 10000;

    // Strip any existing timeout query params so timeoutMs is strictly enforced
    primaryUri = primaryUri.replace(/([?&])serverSelectionTimeoutMS=\d+/g, '').replace(/([?&])connectTimeoutMS=\d+/g, '');
    primaryUri += (primaryUri.includes('?') ? '&' : '?') + `serverSelectionTimeoutMS=${timeoutMs}&connectTimeoutMS=${timeoutMs}`;

    const connectionOpts = {
      serverSelectionTimeoutMS: timeoutMs,
      connectTimeoutMS: timeoutMs,
      socketTimeoutMS: timeoutMs,
      maxPoolSize: 10,
      minPoolSize: 0,
      bufferCommands: true
    };

    try {
      console.log(`[MEDISCAN DB] Connecting to Primary Database...`);
      const conn = await mongoose.connect(primaryUri, connectionOpts);
      cachedConn = conn;
      console.log(`[MEDISCAN DB] Successfully Connected to Primary Database: ${conn.connection.host}`);
      
      // Ensure admin account exists
      ensureAdminAccount().catch((err) => {
        console.warn('[MEDISCAN DB ADMIN INIT WARN]', err.message);
      });

      return conn;
    } catch (primaryErr) {
      console.warn(`[MEDISCAN DB WARN] Primary Atlas DB connection failed: ${primaryErr.message}`);
      try {
        if (mongoose.connection.readyState !== 0) {
          await mongoose.disconnect();
        }
      } catch (discErr) {}

      if (!process.env.VERCEL) {
        try {
          console.log(`[MEDISCAN DB] Starting In-Memory Database Fallback...`);
          const { MongoMemoryServer } = await import('mongodb-memory-server');
          if (!memoryServerInstance) {
            memoryServerInstance = await MongoMemoryServer.create();
          }
          const mongoUri = memoryServerInstance.getUri();
          const conn = await mongoose.connect(mongoUri);
          cachedConn = conn;
          console.log(`[MEDISCAN DB] Connected to In-Memory Database Fallback: ${conn.connection.host}`);
          await ensureAdminAccount();
          return conn;
        } catch (fallbackErr) {
          console.error(`[MEDISCAN DB FALLBACK ERR] ${fallbackErr.message}`);
        }
      }
      cachedPromise = null;
      if (process.env.VERCEL) {
        return null;
      }
      throw primaryErr;
    }
  })().catch((err) => {
    cachedPromise = null;
    if (process.env.VERCEL) {
      return null;
    }
    throw err;
  });

  return cachedPromise;
};

export default connectDB;


