const { body, validationResult } = require("express-validator");
const express = require("express");
const router = express.Router();
const { loginLimiter } = require("../middlewares/rateLimitMiddleware");
const { registerUser, loginUser } = require("../controllers/authController");

router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // If validation passes, call the controller
    return registerUser(req, res, next);
  }
);


router.post(
  "/login",
  loginLimiter,
  [
    body("email").isEmail().withMessage("Invalid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    return loginUser(req, res, next);
  }
);


module.exports = router;
