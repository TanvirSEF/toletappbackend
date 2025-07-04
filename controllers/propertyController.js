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
      owner: req.user._id
    });

    res.status(201).json(property);
  } catch (err) {
    console.error(err);
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

    let sortOption = { date: -1 };
    if (sort === "priceLowToHigh") sortOption = { price: 1 };
    else if (sort === "priceHighToLow") sortOption = { price: -1 };
    const properties = await Property.aggregate([
      {
        $addFields: {
          numericSize: {
            $toInt: {
              $arrayElemAt: [
                { $split: ["$size", " "] },
                0
              ]
            }
          }
        }
      },
      {
        $match: {
          ...query,
          ...(minSize || maxSize ? {
            numericSize: {
              ...(minSize ? { $gte: parseInt(minSize) } : {}),
              ...(maxSize ? { $lte: parseInt(maxSize) } : {})
            }
          } : {})
        }
      },
      { $sort: sortOption }
    ]);

    res.json(properties);
  } catch (err) {
    console.error("Filter Error:", err);
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

    if (property.owner.toString() !== req.user._id.toString()) {
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

    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized to delete" });
    }

    await Property.findByIdAndDelete(req.params.id);
    res.json({ message: "Property deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Controller
exports.uploadPropertyImagesController = async (req, res) => {
  const propertyId = req.params.id;

  try {
    const imageUrls = req.files.map((file) => file.path);

    const property = await Property.findByIdAndUpdate(
      propertyId,
      { $push: { images: { $each: imageUrls } } },
      { new: true }
    );

    res.json({ message: "Images uploaded", images: property.images });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ message: "Failed to upload images" });
  }
};

