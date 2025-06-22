const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  address: { type: String, required: true },
  price: { type: Number, required: true },
  size: { type: String, required: true },
  image: { type: String, default: "" },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  isAvailable: { type: Boolean, default: true },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("property", propertySchema);
