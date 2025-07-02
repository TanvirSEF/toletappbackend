const rateLimit = require("express-rate-limit");

// Limit login attempts
exports.loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per windowMs
  message: {
    message: "Too many login attempts. Please try again after 15 minutes.",
  },
});

// Limit general API usage (optional for public routes)
exports.apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100,
  message: {
    message: "Too many requests from this IP, please slow down.",
  },
});
