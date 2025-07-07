const User = require("../models/user");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const logger = require("../config/logger");

const generateCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

//1. Register User with Email Verification
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, address, image } = req.body;
    if (!name || !email || !password || !phone || !address) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const verificationCode = generateCode();

    const user = await User.create({
      name,
      email,
      password,
      role: "renter",
      phone,
      address,
      image,
      isVerified: false,
      verificationCode,
      verificationCodeExpires: Date.now() + 15 * 60 * 1000, // 15 mins
    });

    await sendEmail({
      to: user.email,
      subject: "To-Let | Verify your Email",
      html: `<p>Hello ${user.name},</p>
             <p>Your verification code is: <strong>${verificationCode}</strong></p>
             <p>This code will expire in 15 minutes.</p>`,
    });

    res.status(201).json({
      message:
        "Registration successful. Check your email for verification code.",
      userId: user._id,
      email: user.email,
    });
  } catch (err) {
    logger.error("Auth Register Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

//2. Verify Email
exports.verifyEmail = async (req, res) => {
  const { email, code } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || !user.verificationCode || user.verificationCode !== code) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    if (user.verificationCodeExpires < Date.now()) {
      return res.status(400).json({ message: "Verification code expired" });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;

    await user.save();

    res.json({
      message: "Email verified successfully",
      token: generateToken(user),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    logger.error("Verify Email Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

//3. Login User (Only if Verified)
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email and Password required" });
    }
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    if (!user.isVerified) {
      return res
        .status(403)
        .json({ message: "Please verify your email first" });
    }
    res
      .cookie("token", generateToken(user), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Only HTTPS in production
        sameSite: "Strict",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      })
      .json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
  } catch (err) {
    logger.error("Auth Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

//4. Forgot Password - Send Code
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const resetCode = generateCode();
    user.resetCode = resetCode;
    user.resetCodeExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    await sendEmail({
      to: user.email,
      subject: "Reset Password - To-Let",
      html: `<p>Hello ${user.name},</p>
             <p>Your reset code is: <strong>${resetCode}</strong></p>
             <p>It will expire in 15 minutes.</p>`,
    });

    res.json({ message: "Reset code sent to your email." });
  } catch (err) {
    logger.error("Forgot Password Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

//5. Reset Password
exports.resetPassword = async (req, res) => {
  const { email, code, newPassword } = req.body;
  try {
    const user = await User.findOne({ email });
    if (
      !user ||
      user.resetCode !== code ||
      user.resetCodeExpires < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid or expired reset code" });
    }

    user.password = newPassword;
    user.resetCode = undefined;
    user.resetCodeExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    logger.error("Reset Password Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
