const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const socketio = require("socket.io");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require('hpp');
const cookieParser = require("cookie-parser");

const logger = require("./config/logger");

dotenv.config();

const app = express();
app.use(cookieParser());
const server = http.createServer(app);


// Setup Socket.io
const io = socketio(server, {
  cors: {
    origin: "*", // Replace with frontend URL in production
    methods: ["GET", "POST"],
  },
});

// Share io across app
app.set("io", io);

// Middleware
app.use(cors());
app.use(express.json());
app.use(hpp()); // Prevent HTTP Parameter Pollution
app.use(express.urlencoded({ extended: true }));
app.use(helmet()); // Security headers
app.use(mongoSanitize()); // Prevent NoSQL injection

// Routes
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const conversationRoutes = require("./routes/conversationRoutes");
const messageRoutes = require("./routes/messageRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

app.use("/api/notifications", notificationRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.send("Welcome to the ToLet App API with Socket.io!");
});

// MongoDB Connection
const connectDB = require("./config/db");
connectDB();

// Socket.io Real-time Handlers
io.on("connection", (socket) => {
  logger.info(`🔌 User connected: ${socket.id}`);

  // User joins their own room for personal notifications
  socket.on("join_user_room", (userId) => {
    if (userId) {
      socket.join(userId.toString());
      logger.info(`User ${userId} joined their personal room.`);
    }
  });

  // User joins a conversation room
  socket.on("join_conversation_room", (conversationId) => {
    if (conversationId) {
      socket.join(conversationId.toString());
      logger.info(`User ${socket.id} joined conversation ${conversationId}`);
    }
  });

  // User leaves a conversation room
  socket.on("leave_conversation_room", (conversationId) => {
    if (conversationId) {
      socket.leave(conversationId.toString());
      logger.info(`User ${socket.id} left conversation ${conversationId}`);
    }
  });


  socket.on("disconnect", () => {
    logger.info(`User disconnected: ${socket.id}`);
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
