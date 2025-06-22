// Framework Express
import express from "express";

// Librării externe
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// Rute definite
import userRoutes from "./routes/users.js";
import authRoutes from "./routes/auths.js";
import tweetRoutes from "./routes/tweets.js";
import conversationRoutes from "./routes/conversations.js";
import messageRoutes from "./routes/messages.js";
import commentRoutes from "./routes/comments.js";

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

// Obține __dirname în ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware-uri
app.use(cookieParser());
app.use(express.json());

// Rute API
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/tweets", tweetRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/comments", commentRoutes);

// Creare server HTTP
const server = http.createServer(app);

// Inițializare socket.io
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Mapare userId -> socket.id
const users = new Map();

// Socket.io events
io.on("connection", (socket) => {
  console.log("🔌 Socket connected:", socket.id);

  // Când un user se conectează
  socket.on("addUser", (userId) => {
    users.set(userId, socket.id);
    console.log("🟢 User online:", userId);
  });

  // Trimitere mesaj între useri
  socket.on("sendMessage", (data) => {
    const { senderId, receiverId } = data;

    const senderSocket = users.get(senderId);
    const receiverSocket = users.get(receiverId);

    if (senderSocket) {
      io.to(senderSocket).emit("receiveMessage", data);
    }

    if (receiverSocket) {
      io.to(receiverSocket).emit("receiveMessage", data);
    }
  });

  // La deconectare
  socket.on("disconnect", () => {
    for (const [userId, socketId] of users.entries()) {
      if (socketId === socket.id) {
        users.delete(userId);
        console.log("❌ User offline:", userId);
        break;
      }
    }
  });

  socket.on("typing", ({ senderName, receiverId, conversationId }) => {
    socket.broadcast.emit("typing", { senderName, conversationId });
  });
  

});
//
// Servire fișiere statice din React în producție
if (process.env.NODE_ENV === "production") {
  console.log("🔧 Production mode: serving static files from client/build");
  console.log("🔧 Current directory:", __dirname);
  
  // Try multiple possible paths for the client build
  const possiblePaths = [
    path.join(__dirname, "../client/build"),
    path.join(__dirname, "../../client/build"),
    path.join(__dirname, "client/build"),
    path.join(process.cwd(), "client/build")
  ];
  
  let clientBuildPath = null;
  for (const testPath of possiblePaths) {
    if (fs.existsSync(testPath)) {
      clientBuildPath = testPath;
      console.log("✅ Found client build at:", clientBuildPath);
      break;
    }
  }
  
  if (clientBuildPath) {
    // Serve static files from React build
    app.use(express.static(clientBuildPath));
    
    // Catch-all route for client-side routing (only for non-API routes)
    app.get("*", (req, res, next) => {
      // Skip API routes
      if (req.path.startsWith('/api/')) {
        return next();
      }
      res.sendFile(path.join(clientBuildPath, "index.html"));
    });
  } else {
    console.log("❌ Could not find client build directory. Tried paths:", possiblePaths);
  }
}

// Pornire server
const port = process.env.PORT || 8000;
server.listen(port, () => {
  connect();
  console.log(`🚀 Server running on port ${port}`);
});
