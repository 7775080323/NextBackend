
import mongoose, { Document, Model, Schema } from "mongoose";

interface IMessage extends Document {
  content: string;
  sender: string;
  createdAt: Date;
}

const messageSchema: Schema = new Schema({
  content: { type: String, required: true },
  sender: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Message: Model<IMessage> = mongoose.model<IMessage>("Message", messageSchema);

export default Message;

