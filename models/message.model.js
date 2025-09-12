import mongoose from "mongoose";

const messageSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone_number: { type: String },
    subject: { type: String },
    message: { type: String, required: true },
    status: {
        read: { type: Boolean, default: false },
        unread_count: { type: Number, default: 1 }
    },
    priority: { type: String, required: true }
}, { timestamps: true });

messageSchema.index({ createdAt: -1 });

const Message = mongoose.model("messages", messageSchema);
export default Message;