const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  image: { type: String, default: "" },
  role: { type: String, enum: ["renter", "owner", "admin"], default: "renter" },
   upgradeRequest: {
    type: Boolean,
    default: false,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  date: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Hash password before save
userSchema.pre("save", async function (next) {
  this.updatedAt = Date.now();
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("user", userSchema);
