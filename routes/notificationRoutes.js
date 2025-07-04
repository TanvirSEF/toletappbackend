const express = require("express");
const router = express.Router();
const protect = require("../middlewares/authMiddleware");
const {
  getUserNotifications,
  markAsRead,
  getUnreadCount,
} = require("../controllers/notificationController");

router.get("/", protect, getUserNotifications);
router.put("/:id/read", protect, markAsRead);
router.get("/unread-count", protect, getUnreadCount);

module.exports = router;
