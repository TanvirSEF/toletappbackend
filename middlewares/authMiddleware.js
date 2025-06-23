const jwt = require('jsonwebtoken');
const User = require('../models/user');

const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("✅ Decoded user ID:", decoded.userId); // 👈

      const userFromDb = await User.findById(decoded.userId);
      console.log("🔍 User from DB:", userFromDb); // 👈

      if (!userFromDb) {
        return res.status(404).json({ message: 'User not found' });
      }

      req.user = userFromDb;
      next();
    } catch (error) {
      console.error("❌ Token error:", error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = protect;
