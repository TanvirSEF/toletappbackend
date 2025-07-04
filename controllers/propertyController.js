const Property = require("../models/property");
const { validationResult } = require("express-validator");
const logger = require("../config/logger");

// Create Property (Owner Only)
exports.createProperty = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const imageUrls = req.files ? req.files.map((file) => file.path) : []; // Extract image URLs from req.files

    const property = await Property.create({
      title: req.body.title,
      description: req.body.description,
      address: req.body.address,
      price: req.body.price,
      size: req.body.size,
      images: imageUrls, // Use the extracted image URLs
      owner: req.user._id
    });

    res.status(201).json(property);
  } catch (err) {
    logger.error("Create Property Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.getAllProperties = async (req, res) => {
  try {
    const {
      location,
      minPrice,
      maxPrice,
      minSize,
      maxSize,
      isAvailable,
      sort
    } = req.query;

    const query = {};
    if (location) {
      query.address = { $regex: location, $options: "i" };
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (isAvailable !== undefined) {
      query.isAvailable = isAvailable === "true";
    }

    if (minSize || maxSize) {
      query.size = {};
      if (minSize) query.size.$gte = Number(minSize);
      if (maxSize) query.size.$lte = Number(maxSize);
    }

    let sortOption = { date: -1 };
    if (sort === "priceLowToHigh") sortOption = { price: 1 };
    else if (sort === "priceHighToLow") sortOption = { price: -1 };

    const properties = await Property.find(query).sort(sortOption);

    res.json(properties);
  } catch (err) {
    logger.error("Filter Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// Owner's own properties
exports.getMyProperties = async (req, res) => {
  try {
    const properties = await Property.find({ owner: req.user._id });
    res.json(properties);
  } catch (err) {
    logger.error("Get My Properties Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update Property (Owner Only)
exports.updateProperty = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: "Property not found" });

    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized to update" });
    }

    property = await Property.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(property);
  } catch (err) {
    logger.error("Update Property Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete Property (Owner Only)
exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: "Property not found" });

    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized to delete" });
    }

    await Property.findByIdAndDelete(req.params.id);
    res.json({ message: "Property deleted successfully" });
  } catch (err) {
    logger.error("Delete Property Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Add Images to Existing Property (Owner Only)
exports.addPropertyImages = async (req, res) => {
  const propertyId = req.params.id;

  try {
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Check if the user is the owner of the property
    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized to add images to this property" });
    }

    const imageUrls = req.files ? req.files.map((file) => file.path) : [];

    if (imageUrls.length === 0) {
      return res.status(400).json({ message: "No images provided" });
    }

    property.images.push(...imageUrls);
    await property.save();

    res.json({ message: "Images added successfully", images: property.images });
  } catch (error) {
    logger.error("Add Property Images Error:", error);
    res.status(500).json({ message: "Failed to add images" });
  }
};

