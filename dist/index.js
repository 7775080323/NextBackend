"use strict";
// import express from "express";
// import http from "http";
// import { Server } from "socket.io";
// import cors from "cors";
// import mongoose from "mongoose";
// import userRoutes from "./routes/user.routes";
// import dotenv from "dotenv";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// dotenv.config();
// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:3000", // Allow frontend to connect
//     methods: ["GET", "POST"],
//   },
// });
// // Middleware
// app.use(cors());
// app.use(express.json());
// // Connect MongoDB
// mongoose.connect(process.env.MONGODB_URL as string)
//   .then(() => console.log("MongoDB Connected"))
//   .catch((err) => console.error("MongoDB Connection Error:", err));
// // API Routes
// app.use("/api/user", userRoutes);
// // Test Route
// app.get("/", (req, res) => {
//   res.send("Socket.io Server is running");
// });
// // WebSocket Connection
// io.on("connection", (socket) => {
//   console.log("A user connected:", socket.id);
//   socket.on("sendMessage", (messageData) => {
//     console.log("Received message:", messageData);
//     io.emit("receiveMessage", messageData); // Broadcast to all users
//   });
//   socket.on("disconnect", () => {
//     console.log("User disconnected:", socket.id);
//   });
// });
// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const dotenv_1 = __importDefault(require("dotenv"));
const Message_1 = __importDefault(require("./model/Message"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "http://localhost:3000", // Frontend URL
        methods: ["GET", "POST"],
    },
});
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Connect MongoDB
mongoose_1.default
    .connect(process.env.MONGODB_URL)
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.error("MongoDB Connection Error:", err));
// API Routes
app.use("/api/user", user_routes_1.default);
// Fetch previous messages from MongoDB
app.get("/api/messages", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const messages = yield Message_1.default.find().sort({ createdAt: 1 }); // Oldest first
        res.json(messages);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch messages" });
    }
}));
// WebSocket Connection
io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);
    // Send stored messages when a user connects
    Message_1.default.find()
        .sort({ createdAt: 1 })
        .then((messages) => {
        socket.emit("previousMessages", messages);
    });
    // Handle new message
    socket.on("sendMessage", (messageData) => __awaiter(void 0, void 0, void 0, function* () {
        console.log("Received message:", messageData);
        try {
            const message = new Message_1.default(messageData);
            yield message.save();
            // Send message to all connected clients
            io.emit("receiveMessage", message);
        }
        catch (error) {
            console.error("Error saving message:", error);
        }
    }));
    // Handle delete message event
    socket.on("deleteMessage", (messageId) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            console.log("Deleting message with ID:", messageId); // Debugging log
            const deletedMessage = yield Message_1.default.findByIdAndDelete(messageId);
            if (!deletedMessage) {
                console.error("Message not found!");
                return;
            }
            io.emit("deleteMessage", messageId);
        }
        catch (error) {
            console.error("Error deleting message:", error);
        }
    }));
    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
