const Notification = require("../models/notification");
const logger = require("../config/logger");

exports.getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    logger.error("Get User Notifications Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification || notification.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: "Notification not found or unauthorized" });
    }

    notification.isRead = true;
    await notification.save();
    res.json({ message: "Notification marked as read" });
  } catch (err) {
    logger.error("Mark As Read Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user._id,
      isRead: false,
    });
    res.json({ count });
  } catch (err) {
    logger.error("Unread Count Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};
