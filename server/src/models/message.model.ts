import mongoose from "mongoose";

export const MessageSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const Message = mongoose.model("Message", MessageSchema);
export default Message;