const Booking = require("../models/booking");
const Property = require("../models/property");
const sendNotification = require("../utils/sendNotification");

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

    await sendNotification({
      userId: property.owner._id,
      type: "booking",
      message: `${req.user.name} has requested to book your property.`,
      link: `/bookings/all`,
    });

    res.status(201).json({ message: "Booking successful", booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ renter: req.user._id })
      .populate("property")
      .populate("owner", "name email phone");

    const visibleContacts = bookings.map((b) => {
      const obj = b.toObject();

      // Hide owner contact info if not revealed yet
      if (!b.isContactRevealed) {
        delete obj.owner.phone;
        delete obj.owner.email;
        delete obj.owner.name;
        obj.ownerContact = "Hidden until booking is confirmed";
      } else {
        obj.ownerContact = {
          name: b.owner.name,
          phone: b.owner.phone,
          email: b.owner.email,
        };
      }

      return obj;
    });

    res.json(visibleContacts);
  } catch (err) {
    console.error("Get My Bookings Error:", err);
    res.status(500).json({ message: "Server Error" });
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

exports.confirmBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Check if current user is the owner or admin
    if (
      req.user.role !== "admin" &&
      booking.owner.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    booking.status = "confirmed";
    booking.isContactRevealed = true;
    await booking.save();
    await sendNotification({
      userId: booking.renter,
      type: "booking",
      message: `Your booking has been confirmed.`,
      link: `/bookings/my`,
    });
    await sendEmail({
      to: renter.email,
      subject: "Booking Confirmed",
      html: `<p>Dear ${renter.name},</p>
         <p>Your booking for the property <strong>${property.title}</strong> has been <b>confirmed</b>.</p>`,
    });
    res.json({ message: "Booking confirmed", booking });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (
      req.user.role !== "admin" &&
      booking.owner.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    booking.status = "cancelled";
    booking.isContactRevealed = false;

    await booking.save();

    res.json({ message: "Booking cancelled", booking });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
