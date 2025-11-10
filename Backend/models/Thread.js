import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const MessageSchema = new mongoose.Schema({
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const ThreadSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    threadId: { type: String, unique: true, default: uuidv4 },
    title: { type: String, default: "New Chat" },
    messages: [MessageSchema]
}, { timestamps: true });

export default mongoose.model("Thread", ThreadSchema);
