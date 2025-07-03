const express = require("express");
const router = express.Router();
const protect = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");
const { uploadPropertyImages } = require("../middlewares/upload");
const {
  createProperty,
  getAllProperties,
  getMyProperties,
  updateProperty,
  deleteProperty,
  uploadPropertyImagesController,
} = require("../controllers/propertyController");

// Public Route - All Properties
router.get("/", getAllProperties);

// Owner's own properties
router.get("/my-properties", protect, authorize("owner"), getMyProperties);

// Owner Create Property
router.post("/", protect, authorize("owner"), createProperty);

// Owner Update Property
router.put("/:id", protect, authorize("owner"), updateProperty);

// Owner Delete Property
router.delete("/:id", protect, authorize("owner"), deleteProperty);
// Route
router.post(
  "/:id/upload-images",
  protect,
  authorize("owner", "admin"),
  uploadPropertyImages.array("images", 5),
  uploadPropertyImagesController
);


module.exports = router;
