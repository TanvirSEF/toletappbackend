// utils/sendNotification.js
const Notification = require("../models/notification");
const logger = require("../config/logger");

const sendNotification = async ({ userId, type, message, link, io }) => {
  try {
    const notification = await Notification.create({
      user: userId,
      type,
      message,
      link,
    });

    // Emit real-time notification to user via socket.io
    if (io) {
      io.to(userId.toString()).emit("new_notification", notification);
    }

    return notification;
  } catch (error) {
    logger.error("Notification Error:", error.message);
  }
};

module.exports = sendNotification;
