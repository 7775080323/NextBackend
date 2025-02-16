import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: { type: String, required: true },
    text: { type: String }, // Optional text (if sending file)
    file: { type: String }, // Optional file URL or base64 string
    status: { 
      type: String, 
      enum: ["sent", "delivered", "read"], 
      default: "sent" 
    }, // Message status
  },
  { timestamps: true } // Automatically adds createdAt & updatedAt
);

const Message = mongoose.model("Message", messageSchema);
export default Message;
