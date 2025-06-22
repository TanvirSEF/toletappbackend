const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middlewares/authMiddleware");
const {
  createProperty,
  getAllProperties,
  getMyProperties,
  updateProperty,
  deleteProperty
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

module.exports = router;
