const express = require("express");
const router = express.Router();

const protect = require("../middlewares/authMiddleware");
const {
  sendMessage,
  getMessagesByConversation,
  getUnreadMessageCount,
  markMessageAsSeen,
} = require("../controllers/messageController");

// Send a message in a conversation
router.post("/", protect, sendMessage);

// Get all messages in a conversation
router.get("/:conversationId", protect, getMessagesByConversation);
router.get("/unread/count", protect, getUnreadMessageCount);

// Mark a message as seen
router.put("/:messageId/seen", protect, markMessageAsSeen);

module.exports = router;