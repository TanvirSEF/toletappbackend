const Notification = require("../models/notification");

const sendNotification = async ({ userId, type, message, link }) => {
  try {
    const notification = new Notification({
      user: userId,
      type,
      message,
      link,
    });
    await notification.save();
  } catch (error) {
    console.error("Notification Error:", error.message);
  }
};

module.exports = sendNotification;
