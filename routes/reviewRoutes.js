const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { createReview, getReviewsByProperty } = require("../controllers/reviewController");
const protect = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");

router.post(
  "/:propertyId",
  protect,
  authorize("renter"),
  [
    body("rating", "Rating must be a number between 1 and 5").isFloat({ min: 1, max: 5 }),
    body("comment", "Comment is required").not().isEmpty(),
  ],
  createReview
);
router.get("/:propertyId", getReviewsByProperty);

module.exports = router;
