const express = require("express");
const router = express.Router();

const protect = require("../middlewares/authMiddleware");
const {
  sendMessage,
  getMessagesByConversation,
} = require("../controllers/messageController");

// Send a message in a conversation
router.post("/", protect, sendMessage);

// Get all messages in a conversation
router.get("/:conversationId", protect, getMessagesByConversation);

module.exports = router;
