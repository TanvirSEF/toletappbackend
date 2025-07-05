const Conversation = require("../models/conversation");
const Booking = require("../models/booking");
const logger = require("../config/logger");

// Start new conversation (only if booking is confirmed)
exports.startConversation = async (req, res) => {

  const  bookingId = req.body.bookingId;
  const userId = req.user._id;

  if (!bookingId) {
    return res.status(400).json({ message: "bookingId is required" });
  }

  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.status !== "confirmed") {
      return res.status(403).json({ message: "Chat not allowed until booking is confirmed" });
    }
    

    // Only renter or owner can initiate conversation
    if (
      booking.renter.toString() !== userId.toString() &&
      booking.owner.toString() !== userId.toString()
    ) {
      return res.status(403).json({ message: "Unauthorized to start conversation" });
    }

    // Check if conversation already exists
    const existing = await Conversation.findOne({ booking: bookingId });
    if (existing) return res.json(existing);

    const conversation = await Conversation.create({
      participants: [booking.renter, booking.owner],
      property: booking.property,
      booking: booking._id
    });

    res.status(201).json(conversation);
  } catch (err) {
    logger.error("Start Conversation Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get all conversations of current user (for inbox)
exports.getUserConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id
    })
      .populate("participants", "name email role")
      .populate("property")
      .populate("booking");

    res.json(conversations);
  } catch (err) {
    logger.error("Fetch Conversations Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};
