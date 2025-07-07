const express = require("express");
const { body, validationResult } = require("express-validator");
const router = express.Router();

const {
  registerUser,
  loginUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const { loginLimiter } = require("../middlewares/rateLimitMiddleware");

//Custom Validation Middleware
const validate = (validations) => [
  ...validations,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

//Register Route
router.post(
  "/register",
  validate([
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
    body("phone").notEmpty().withMessage("Phone is required"),
    body("address").notEmpty().withMessage("Address is required"),
  ]),
  registerUser
);

//Login Route
router.post(
  "/login",
  loginLimiter,
  validate([
    body("email").isEmail().withMessage("Invalid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ]),
  loginUser
);

//Email Verification
router.post(
  "/verify-email",
  validate([
    body("email").isEmail().withMessage("Valid email is required"),
    body("code").isLength({ min: 6, max: 6 }).withMessage("Code must be 6 digits"),
  ]),
  verifyEmail
);

//Forgot Password (Send Code)
router.post(
  "/forgot-password",
  validate([
    body("email").isEmail().withMessage("Valid email is required"),
  ]),
  forgotPassword
);

//Reset Password (Verify Code + Set New)
router.post(
  "/reset-password",
  validate([
    body("email").isEmail().withMessage("Valid email is required"),
    body("code").isLength({ min: 6, max: 6 }).withMessage("Code must be 6 digits"),
    body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters"),
  ]),
  resetPassword
);

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});


module.exports = router;
