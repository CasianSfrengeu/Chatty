// Framework Express
import express from "express";

// Librării externe
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

// Rute definite
import userRoutes from "./routes/users.js";
import authRoutes from "./routes/auths.js";
import tweetRoutes from "./routes/tweets.js";
import conversationRoutes from "./routes/conversations.js";
import messageRoutes from "./routes/messages.js";

// Server HTTP și socket.io
import http from "http";
import { Server } from "socket.io";

// Inițializare aplicație Express
const app = express();
dotenv.config();

// Conectare la MongoDB
const connect = () => {
  mongoose.set("strictQuery", false);
  mongoose
    .connect(process.env.MONGO)
    .then(() => {
      console.log("✅ Connected to MongoDB database");
    })
    .catch((err) => {
      throw err;
    });
};

// Middleware-uri
app.use(cookieParser());
app.use(express.json());

// Rute API
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/tweets", tweetRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);

// Server HTTP separat pentru Express + Socket.io
const server = http.createServer(app);

// Inițializare Socket.io
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // adresa frontendului
    credentials: true,
  },
});

// Socket.io events
io.on("connection", (socket) => {
  console.log("🔌 Socket connected:", socket.id);

  // Mesaj trimis
  socket.on("sendMessage", ({ senderId, receiverId, text, conversationId }) => {
    io.emit("receiveMessage", {
      senderId,
      receiverId,
      text,
      conversationId,
      createdAt: new Date(),
    });
  });

  // Deconectare
  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
  });
});

// Pornire server
server.listen(8000, () => {
  connect();
  console.log("🚀 Server running on port 8000");
});
