const Message = require("../models/message");
const Conversation = require("../models/conversation");
const sendNotification = require("../utils/sendNotification");
const sendEmail = require("../utils/sendEmail");
const User = require("../models/user");
const logger = require("../config/logger");

// Send a message
exports.sendMessage = async (req, res) => {
  const { conversationId, text } = req.body;
  const senderId = req.user._id;

  try {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation)
      return res.status(404).json({ message: "Conversation not found" });

    // Only participants can send message
    if (!conversation.participants.includes(senderId)) {
      return res.status(403).json({ message: "Unauthorized to send message" });
    }

    const message = await Message.create({
      conversation: conversation._id,
      sender: senderId,
      text,
    });

    // Determine receiver
    const receiverId = conversation.participants.find(
      (id) => id.toString() !== senderId.toString()
    );

    const receiver = await User.findById(receiverId);
    const io = req.app.get("io");

    // Emit message to the specific conversation room
    io.to(conversationId.toString()).emit("new_message", message);

    // Send notification to the receiver's personal room
    io.to(receiverId.toString()).emit("new_notification", {
      type: "message",
      message: `You have a new message from ${req.user.name}.`,
      link: `/messages/${conversationId}`,
    });

    // DB Notification
    await sendNotification({
      io,
      userId: receiverId,
      type: "message",
      message: `You have a new message from ${req.user.name}.`,
      link: `/messages/${conversationId}`,
    });

    await sendEmail({
      to: receiver.email,
      subject: "📩 New Message in To-Let",
      html: `<p>You have received a new message. <a href="https://yourapp.com/messages/${conversationId}">View Message</a></p>`,
    });

    res.status(201).json(message);
  } catch (err) {
    logger.error("Send Message Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get all messages of a conversation
exports.getMessagesByConversation = async (req, res) => {
  try {
    const conversationId = req.params.conversationId;
    const conversation = await Conversation.findById(conversationId);
    if (!conversation)
      return res.status(404).json({ message: "Conversation not found" });

    // Only participants can view messages
    if (!conversation.participants.includes(req.user._id)) {
      return res.status(403).json({ message: "Unauthorized to view messages" });
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate("sender", "name email role")
      .populate("seenBy", "name image")
      .sort({ sentAt: 1 });

    res.json(messages);
  } catch (err) {
    logger.error("Get Messages Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.markMessageAsSeen = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Add user to seenBy array if not already there
    if (!message.seenBy.includes(userId)) {
      message.seenBy.push(userId);
      await message.save();
    }

    const io = req.app.get("io");
    io.to(message.conversation.toString()).emit("message_seen", {
      messageId: message._id,
      seenBy: message.seenBy,
    });

    res.json({ message: "Message marked as seen" });
  } catch (err) {
    logger.error("Mark as seen error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getUnreadMessageCount = async (req, res) => {
  try {
    const userId = req.user._id;

    const count = await Message.countDocuments({
      seenBy: { $ne: userId },
      sender: { $ne: userId },
      conversation: {
        $in: await Conversation.find({ participants: userId }).distinct("_id"),
      },
    });

    res.json({ unreadCount: count });
  } catch (err) {
    logger.error("Unread count error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};
