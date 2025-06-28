const Booking = require("../models/booking");
const Property = require("../models/property");

exports.createBooking = async (req, res) => {
  try {
    const { propertyId } = req.body;
    const renterId = req.user._id;

    const property = await Property.findById(propertyId).populate("owner");
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Check if already booked by same renter
    const existingBooking = await Booking.findOne({
      property: propertyId,
      renter: renterId,
    });
    if (existingBooking) {
      return res
        .status(400)
        .json({ message: "You already booked this property" });
    }

    const commissionRate = 0.05;
    const commissionAmount = property.price * commissionRate;

    const booking = await Booking.create({
      property: propertyId,
      renter: renterId,
      owner: property.owner._id,
      amount: property.price,
      commission: commissionAmount,
    });

    res.status(201).json({ message: "Booking successful", booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ renter: req.user._id }).populate([
      { path: "property" },
      { path: "owner", select: "-password" },
    ]);
    res.json(bookings);
  } catch (err) {
  console.error("Booking fetch error:", err);
  res.status(500).json({ message: "Server Error", error: err.message });
}
};

// Admin or Owner can see all
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate(
      "property renter owner",
      "-password"
    );
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};
