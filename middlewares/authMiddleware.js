const jwt = require('jsonwebtoken');
const User = require('../models/user');
const logger = require("../config/logger");

const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const userFromDb = await User.findById(decoded.userId);

      if (!userFromDb) {
        return res.status(404).json({ message: 'User not found' });
      }

      req.user = userFromDb;
      next();
    } catch (error) {
      logger.error("Token error:", error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = protect;
