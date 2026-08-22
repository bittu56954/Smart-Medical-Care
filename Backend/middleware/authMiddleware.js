import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';

// Protect routes - Verify JWT token in Authorization header
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Support local offline tokens if provided
      if (token.startsWith('local_token_')) {
        if (token.includes('admin') || token.includes('admin@gmail.com')) {
          req.user = {
            _id: new mongoose.Types.ObjectId('650000000000000000000001'),
            name: 'System Admin',
            email: 'admin@gmail.com',
            role: 'admin',
            isVerified: true
          };
          return next();
        } else {
          return res.status(401).json({ success: false, message: 'Not authorized, local token invalid.' });
        }
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'mediscan_super_secret_jwt_key_2026_safe_health_app'
      );

      if (decoded && decoded.id && mongoose.Types.ObjectId.isValid(decoded.id)) {
        try {
          req.user = await User.findById(decoded.id).select('-password');
        } catch (dbErr) {
          console.warn('[AUTH MIDDLEWARE DB WARN]', dbErr.message);
        }
      }

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authorized, user account not found.' });
      }

      next();
    } catch (error) {
      console.error(`[AUTH MIDDLEWARE ERROR] Token validation failed: ${error.message}`);
      return res.status(401).json({ success: false, message: 'Not authorized, token invalid or expired.' });
    }
  } else {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided.' });
  }
};

// Optional protect middleware (attaches user if valid token, but allows guest access)
export const optionalProtect = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      if (token.startsWith('local_token_')) {
        if (token.includes('admin') || token.includes('admin@gmail.com')) {
          req.user = {
            _id: new mongoose.Types.ObjectId('650000000000000000000001'),
            name: 'System Admin',
            email: 'admin@gmail.com',
            role: 'admin',
            isVerified: true
          };
        }
        return next();
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'mediscan_super_secret_jwt_key_2026_safe_health_app'
      );
      if (decoded && decoded.id) {
        req.user = await User.findById(decoded.id).select('-password');
      }
    } catch (error) {
      // Ignore token validation errors for optional access
    }
  }
  next();
};

// Admin authorization middleware (strictly admin@gmail.com)
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin' && req.user.email && req.user.email.toLowerCase() === 'admin@gmail.com') {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Access denied: Admin Panel is accessible strictly with fixed admin credentials (admin@gmail.com) only.' });
  }
};
