const nodemailer = require("nodemailer");
const logger = require("../config/logger");

const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,      // Your Gmail or SendGrid email
        pass: process.env.EMAIL_PASS       // App password or API key
      }
    });

    const mailOptions = {
      from: `"To-Let App" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    logger.info("Email sent to", to);
  } catch (error) {
    logger.error("Email send failed:", error.message);
  }
};

module.exports = sendEmail;
