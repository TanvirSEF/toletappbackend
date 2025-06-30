const express = require("express");
const router = express.Router();
const protect = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/roleMiddleware');
const { createBooking, getMyBookings, getAllBookings, confirmBooking, cancelBooking } = require("../controllers/bookingController");

router.post("/", protect, authorize("renter"), createBooking);
router.get("/my", protect, authorize("renter"), getMyBookings);
router.get("/all", protect, authorize("admin", "owner"), getAllBookings);
router.put("/:id/confirm", protect, authorize("admin", "owner"), confirmBooking);
router.put("/:id/cancel", protect, authorize("admin", "owner"), cancelBooking);


module.exports = router;
