import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";
import userRoutes from "./routes/user.routes";
import dotenv from "dotenv";
import Message from "./model/Message";

dotenv.config();

const app = express();
const server = http.createServer(app);


// Middleware
app.use(cors({
  origin: "https://next-front-esr3elw4d-manali-songires-projects.vercel.app",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));
const io = new Server(server, {
  cors: {
    origin: "process.env.CLIENT_ORIGIN",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors({
  origin: "https://next-front-esr3elw4d-manali-songires-projects.vercel.app",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json());

// Connect MongoDB
mongoose
  .connect(process.env.MONGODB_URL as string)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// API Routes
app.use("/api/user", userRoutes);

// Fetch previous messages from MongoDB
app.get("/api/messages", async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: 1 }); // Oldest first
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// WebSocket Connection
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Send stored messages when a user connects
  Message.find()
    .sort({ createdAt: 1 })
    .then((messages: any) => {
      socket.emit("previousMessages", messages);
    });

  // Handle new message
  socket.on("sendMessage", async (messageData) => {
    console.log("Received message:", messageData);

    try {
      const message = new Message(messageData);
      await message.save();

      // Send message to all connected clients
      io.emit("receiveMessage", message);
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });

  // Handle delete message event
  socket.on("deleteMessage", async (messageId) => {
    try {
      console.log("Deleting message with ID:", messageId); // Debugging log
  
      const deletedMessage = await Message.findByIdAndDelete(messageId);
  
      if (!deletedMessage) {
        console.error("Message not found!");
        return;
      }
  
      io.emit("deleteMessage", messageId);
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  });
  

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
