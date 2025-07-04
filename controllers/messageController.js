const Message = require("../models/message");
const Conversation = require("../models/conversation");
const sendNotification = require("../utils/sendNotification");

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

    // Real-time push via Socket.io
    const io = req.app.get("io");
    const onlineUsers = req.app.get("onlineUsers");
    const receiverSocketId = onlineUsers.get(receiverId.toString());

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("new_notification", {
        type: "message",
        from: senderId,
        message: `You have a new message.`,
        link: `/messages/${conversationId}`,
      });
    }

    // DB Notification
    await sendNotification({
      userId: receiverId,
      type: "message",
      message: `You have a new message.`,
      link: `/messages/${conversationId}`,
    });
    await sendEmail({
      to: receiverId.email,
      subject: "📩 New Message in To-Let",
      html: `<p>You have received a new message. <a href="https://yourapp.com/messages/${conversationId}">View Message</a></p>`,
    });

    res.status(201).json(message);
  } catch (err) {
    console.error("Send Message Error:", err);
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
      .sort({ sentAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error("Get Messages Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.markMessagesAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.includes(userId)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Message.updateMany(
      { conversation: conversationId, sender: { $ne: userId }, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({ message: "Messages marked as read" });
  } catch (err) {
    console.error("Mark as read error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getUnreadMessageCount = async (req, res) => {
  try {
    const userId = req.user._id;

    const count = await Message.countDocuments({
      isRead: false,
      sender: { $ne: userId },
      conversation: {
        $in: await Conversation.find({ participants: userId }).distinct("_id"),
      },
    });

    res.json({ unreadCount: count });
  } catch (err) {
    console.error("Unread count error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};
