const express = require("express");
const router = express.Router();

const protect = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");
const {
  startConversation,
  getUserConversations,
} = require("../controllers/conversationController");

// Start a new conversation after booking confirmation
router.post("/", protect, startConversation);

// Get all conversations of logged-in user
router.get("/", protect, getUserConversations);

module.exports = router;
