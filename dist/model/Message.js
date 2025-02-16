"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const messageSchema = new mongoose_1.default.Schema({
    sender: { type: String, required: true },
    text: { type: String }, // Optional text (if sending file)
    file: { type: String }, // Optional file URL or base64 string
    status: {
        type: String,
        enum: ["sent", "delivered", "read"],
        default: "sent"
    }, // Message status
}, { timestamps: true } // Automatically adds createdAt & updatedAt
);
const Message = mongoose_1.default.model("Message", messageSchema);
exports.default = Message;
