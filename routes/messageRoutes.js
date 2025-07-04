const express = require("express");
const router = express.Router();

const protect = require("../middlewares/authMiddleware");
const {
  sendMessage,
  getMessagesByConversation,
  markMessagesAsRead,
  getUnreadMessageCount,
} = require("../controllers/messageController");

// Send a message in a conversation
router.post("/", protect, sendMessage);

// Get all messages in a conversation
router.get("/:conversationId", protect, getMessagesByConversation);
router.put("/:conversationId/read", protect, markMessagesAsRead);
router.get("/unread/count", protect, getUnreadMessageCount);

module.exports = router;
