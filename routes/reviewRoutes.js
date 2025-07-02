const express = require("express");
const router = express.Router();
const { createReview, getReviewsByProperty } = require("../controllers/reviewController");
const protect = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");

router.post("/:propertyId", protect, authorize("renter"), createReview);
router.get("/:propertyId", getReviewsByProperty);

module.exports = router;
