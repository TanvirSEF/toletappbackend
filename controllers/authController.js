const User = require("../models/user");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const logger = require("../config/logger");

// Token generate function
const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, address, image } = req.body;

    if (!name || !email || !password || !phone || !address) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Role assign only for renter during registration
    const user = await User.create({
      name,
      email,
      password,
      role: "renter",
      phone,
      address,
      image,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user),
      phone: user.phone,
      address: user.address,
      image: user.image,
    });

    await sendEmail({
      to: user.email,
      subject: "🎉 Welcome to To-Let!",
      html: `<p>Hello ${user.name},</p>
         <p>Thanks for registering on To-Let. Let your rental journey begin!</p>`,
    });
  } catch (err) {
    logger.error("Auth Register Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and Password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user),
    });
  } catch (err) {
    logger.error("Auth Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
