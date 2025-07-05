const Booking = require("../models/booking");
const Property = require("../models/property");
const sendNotification = require("../utils/sendNotification");
const sendEmail = require("../utils/sendEmail");
const User = require("../models/user");
const logger = require("../config/logger");

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
    const io = req.app.get("io");
    await sendNotification({
      io,
      userId: property.owner._id,
      type: "booking",
      message: `${req.user.name} has requested to book your property.`,
      link: `/bookings/all`,
    });
    res.status(201).json({ message: "Booking successful", booking });
  } catch (error) {
    logger.error("Create Booking Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.aggregate([
      {
        $match: { renter: req.user._id },
      },
      {
        $lookup: {
          from: "properties",
          localField: "property",
          foreignField: "_id",
          as: "property",
        },
      },
      {
        $unwind: "$property",
      },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
        },
      },
      {
        $unwind: "$owner",
      },
      {
        $project: {
          _id: 1,
          property: 1,
          renter: 1,
          owner: {
            _id: "$owner._id",
            name: {
              $cond: {
                if: "$isContactRevealed",
                then: "$owner.name",
                else: "Hidden",
              },
            },
            email: {
              $cond: {
                if: "$isContactRevealed",
                then: "$owner.email",
                else: "Hidden",
              },
            },
            phone: {
              $cond: {
                if: "$isContactRevealed",
                then: "$owner.phone",
                else: "Hidden",
              },
            },
          },
          amount: 1,
          commission: 1,
          isContactRevealed: 1,
          status: 1,
          createdAt: 1,
        },
      },
    ]);
    res.json(bookings);
  } catch (err) {
    logger.error("Get My Bookings Error:", err);
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
    logger.error("Get All Bookings Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.confirmBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('renter').populate('property');
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
    const io = req.app.get("io");
    await sendNotification({
      io,
      userId: booking.renter._id,
      type: "booking",
      message: `Your booking for ${booking.property.title} has been confirmed.`,
      link: `/bookings/my`,
    });
    await sendEmail({
      to: booking.renter.email,
      subject: "Booking Confirmed",
      html: `<p>Dear ${booking.renter.name},</p>
         <p>Your booking for the property <strong>${booking.property.title}</strong> has been <b>confirmed</b>.</p>`,
    });
    res.json({ message: "Booking confirmed", booking });
  } catch (err) {
    logger.error("Confirm Booking Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('renter').populate('property');

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

    const io = req.app.get("io");
    await sendNotification({
      io,
      userId: booking.renter._id,
      type: "booking",
      message: `Your booking for the property ${booking.property.title} has been cancelled.`,
      link: `/bookings/my`,
    });

    await sendEmail({
      to: booking.renter.email,
      subject: "Booking Cancelled",
      html: `<p>Dear ${booking.renter.name},</p>
         <p>Your booking for the property <strong>${booking.property.title}</strong> has been <b>cancelled</b>.</p>`,
    });

    res.json({ message: "Booking cancelled", booking });
  } catch (err) {
    logger.error("Cancel Booking Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


