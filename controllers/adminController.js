const User = require("../models/user");
const jwt = require("jsonwebtoken");

// Create Admin User Controller
exports.createAdminUser = async (req, res) => {
  try {
    const { name, email, password, phone, address, image } = req.body;

    if (!name || !email || !password || !phone || !address || !image) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: "admin",
      phone,
      address,
      image,
    });

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      image: user.image,
      token,
    });
  } catch (err) {
    logger.error("Create Admin User Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};
