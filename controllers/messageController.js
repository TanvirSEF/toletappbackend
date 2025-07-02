const Message = require("../models/message");
const Conversation = require("../models/conversation");
const sendNotification = require("../utils/sendNotification");

// Send a message
exports.sendMessage = async (req, res) => {
  const { conversationId, text } = req.body;
  const senderId = req.user._id;

  try {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return res.status(404).json({ message: "Conversation not found" });

    // Only participants can send message
    if (!conversation.participants.includes(senderId)) {
      return res.status(403).json({ message: "Unauthorized to send message" });
    }

    const message = await Message.create({
      conversation: conversation._id,
      sender: senderId,
      text
    });

    res.status(201).json(message);
  } catch (err) {
    console.error("Send Message Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
  await sendNotification({
  userId: receiverId,
  type: "message",
  message: `You have a new message.`,
  link: `/messages/${conversationId}`
});

};

// Get all messages of a conversation
exports.getMessagesByConversation = async (req, res) => {
  try {
    const conversationId = req.params.conversationId;
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return res.status(404).json({ message: "Conversation not found" });

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
