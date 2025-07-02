const Review = require("../models/review");
const Booking = require("../models/booking");

// Renter creates review
exports.createReview = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { rating, comment } = req.body;
    const renterId = req.user._id;

    // Check if booking is confirmed
    const booking = await Booking.findOne({
      property: propertyId,
      renter: renterId,
      status: "confirmed",
    });

    if (!booking) {
      return res.status(403).json({ message: "You must confirm booking to review" });
    }

    const review = await Review.create({
      property: propertyId,
      renter: renterId,
      rating,
      comment,
    });

    res.status(201).json(review);
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).json({ message: "You already reviewed this property" });
    } else {
      res.status(500).json({ message: "Server error" });
    }
  }
};

// Get all reviews for a property
exports.getReviewsByProperty = async (req, res) => {
  try {
    const reviews = await Review.find({ property: req.params.propertyId })
      .populate("renter", "name image");

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
