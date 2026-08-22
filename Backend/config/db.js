import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { ensureAdminAccount } from './adminInit.js';

dotenv.config();

// Disable buffering so queries fail immediately with clear errors if disconnected
mongoose.set('bufferCommands', false);

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (mongoose.connection.readyState === 1) {
    cached.conn = mongoose.connection;
    return cached.conn;
  }

  if (cached.promise) {
    try {
      cached.conn = await cached.promise;
      return cached.conn;
    } catch (e) {
      cached.promise = null;
    }
  }

  let primaryUri = process.env.MONGO_URI || 'mongodb+srv://krbittu803110_db_user:dPU9R7yWn6z813GU@cluster0.j2vupm7.mongodb.net/india';
  const timeoutMs = 7000;

  primaryUri = primaryUri.replace(/([?&])serverSelectionTimeoutMS=\d+/g, '').replace(/([?&])connectTimeoutMS=\d+/g, '');
  primaryUri += (primaryUri.includes('?') ? '&' : '?') + `serverSelectionTimeoutMS=${timeoutMs}&connectTimeoutMS=${timeoutMs}`;

  const opts = {
    serverSelectionTimeoutMS: timeoutMs,
    connectTimeoutMS: timeoutMs,
    socketTimeoutMS: 15000,
    maxPoolSize: 10,
    minPoolSize: 0,
    bufferCommands: false
  };

  cached.promise = (async () => {
    try {
      console.log(`[MEDISCAN DB] Connecting to MongoDB Atlas...`);
      const conn = await mongoose.connect(primaryUri, opts);
      console.log(`[MEDISCAN DB] Connected to MongoDB Atlas: ${conn.connection.host}`);
      
      ensureAdminAccount().catch((err) => {
        console.warn('[MEDISCAN DB ADMIN INIT WARN]', err.message);
      });

      return conn;
    } catch (err) {
      console.error(`[MEDISCAN DB ERR] Connection failed: ${err.message}`);
      cached.promise = null;
      throw err;
    }
  })();

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (err) {
    cached.promise = null;
    throw err;
  }
};

export default connectDB;



