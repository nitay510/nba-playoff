// server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 1) For any route that requires a logged-in user
exports.requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token; // We assume the JWT is in an httpOnly cookie named "token"
    if (!token) {
      return res.status(401).json({ msg: 'Unauthorized - No token provided' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET); 
    // decoded => { userId: <MongoDB ID>, iat: <timestamp>, exp: <timestamp> }

    // Attach user object to req (we'll fetch from DB or store minimal data)
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ msg: 'User not found' });
    }

    req.user = user; // so we can access user._id, user.username, etc.
    next();
  } catch (error) {
    return res.status(401).json({ msg: 'Invalid token' });
  }
};

// 2) For routes that only the admin can access
exports.requireAdmin = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ msg: 'Unauthorized - No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Fetch the user from DB
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ msg: 'User not found' });
    }

    // Check role
    if (user.role !== 'admin') {
      return res.status(403).json({ msg: 'Forbidden - Admin only' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ msg: 'Invalid token' });
  }
};
