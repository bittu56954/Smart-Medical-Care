import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { ensureAdminAccount } from './adminInit.js';

dotenv.config();

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
    if (!primaryUri.includes('serverSelectionTimeoutMS')) {
      primaryUri += (primaryUri.includes('?') ? '&' : '?') + 'serverSelectionTimeoutMS=10000&connectTimeoutMS=10000';
    }

    const connectionOpts = {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 10000,
      maxPoolSize: 10,
      minPoolSize: 0
    };

    try {
      console.log(`[MEDISCAN DB] Connecting to Primary Database...`);
      const conn = await mongoose.connect(primaryUri, connectionOpts);
      cachedConn = conn;
      console.log(`[MEDISCAN DB] Successfully Connected to Primary Database: ${conn.connection.host}`);
      
      if (!process.env.VERCEL) {
        ensureAdminAccount().catch((err) => {
          console.warn('[MEDISCAN DB ADMIN INIT WARN]', err.message);
        });
      }

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
      throw primaryErr;
    }
  })().catch((err) => {
    cachedPromise = null;
    throw err;
  });

  return cachedPromise;
};

export default connectDB;


