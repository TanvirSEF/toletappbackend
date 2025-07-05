const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const protect = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");
const { uploadPropertyImages } = require("../middlewares/upload");
const {
  createProperty,
  getAllProperties,
  getMyProperties,
  updateProperty,
  deleteProperty,
  addPropertyImages,
} = require("../controllers/propertyController");

// Public Route - All Properties
router.get("/", getAllProperties);

// Owner's own properties
router.get("/my-properties", protect, authorize("owner"), getMyProperties);

// Owner Create Property
router.post(
  "/",
  protect,
  authorize("owner"),
  uploadPropertyImages.array("images", 5), // Add this middleware
  [
    body("title", "Title is required").not().isEmpty(),
    body("description", "Description is required").not().isEmpty(),
    body("address", "Address is required").not().isEmpty(),
    body("price", "Price is required").isNumeric(),
    body("size", "Size is required").not().isEmpty(),
  ],
  createProperty
);

// Owner Update Property
router.put(
  "/:id",
  protect,
  authorize("owner"),
  [
    body("title", "Title is required").optional().not().isEmpty(),
    body("description", "Description is required").optional().not().isEmpty(),
    body("address", "Address is required").optional().not().isEmpty(),
    body("price", "Price is required").optional().isNumeric(),
    body("size", "Size is required").optional().isNumeric(),
  ],
  updateProperty
);

// Owner Delete Property
router.delete("/:id", protect, authorize("owner"), deleteProperty);

// Add Images to Property
router.post(
  "/:id/images",
  protect,
  authorize("owner"),
  uploadPropertyImages.array("images", 5),
  addPropertyImages
);



module.exports = router;
