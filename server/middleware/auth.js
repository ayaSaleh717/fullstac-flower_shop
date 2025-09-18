import jwt from 'jsonwebtoken';
import User from '../models/users.model.js';

// Protect routes - user must be authenticated
export const protect = async (req, res, next) => {
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return next();
  }

  let token;

  // Get token from header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      if (!token) {
        return res.status(401).json({ 
          success: false,
          message: 'No token provided' 
        });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded token:', decoded);

      // Get user from the token - support both id and _id in the payload
      const userId = decoded.id || decoded._id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token format: missing user ID',
          tokenPayload: decoded
        });
      }

      req.user = await User.findById(userId).select('-password');

      if (!req.user) {
        return res.status(401).json({ 
          success: false,
          message: 'User not found' 
        });
      }

      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized, token failed',
        error: error.message 
      });
    }
  } else {
    return res.status(401).json({ 
      success: false,
      message: 'Not authorized, no token' 
    });
  }
};

// Admin middleware
export const admin = (req, res, next) => {
  if (req.user && req.user.userType === 'admin') {
    next();
  } else {
    res.status(403).json({ 
      success: false,
      message: 'Not authorized as an admin' 
    });
  }
};