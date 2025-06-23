const Property = require("../models/property");

// Create Property (Owner Only)
exports.createProperty = async (req, res) => {
  try {
    const property = await Property.create({
      title: req.body.title,
      description: req.body.description,
      address: req.body.address,
      price: req.body.price,
      size: req.body.size,
      image: req.body.image,
      owner: req.user.userId
    });

    res.status(201).json(property);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Public Property List (Contact Hide)
exports.getAllProperties = async (req, res) => {
  try {
    const properties = await Property.find({ isAvailable: true })
      .populate("owner", "name address");  // Only name & address shown

    res.json(properties);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Owner's own properties
exports.getMyProperties = async (req, res) => {
  try {
    const properties = await Property.find({ owner: req.user._id });
    res.json(properties);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Update Property (Owner Only)
exports.updateProperty = async (req, res) => {
  try {
    let property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: "Property not found" });

    if (property.owner.toString() !== req.user._id) {
      return res.status(401).json({ message: "Not authorized to update" });
    }

    property = await Property.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(property);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete Property (Owner Only)
exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: "Property not found" });

    if (property.owner.toString() !== req.user._id) {
      return res.status(401).json({ message: "Not authorized to delete" });
    }

    await property.remove();
    res.json({ message: "Property deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
