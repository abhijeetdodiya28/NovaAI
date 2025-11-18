import express from "express";
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import Thread from "../models/Thread.js";
import getOpenAIAPIResponse from "../utils/openai.js";
import authMiddleware from "../middleware/authmiddleware.js";

const router = express.Router();

//  Apply authentication middleware for all chat routes
router.use(authMiddleware);

/**
 * POST /api/thread
 * Create a new empty thread for the authenticated user
 */
router.post("/thread", async (req, res) => {
    try {
        const { title } = req.body;

        const thread = new Thread({
            userId: new mongoose.Types.ObjectId(req.user.id), // Fix: Ensure ObjectId type
            threadId: uuidv4(),
            title: title?.trim() || "New Chat",
            messages: [],
        });

        await thread.save();
        return res.status(201).json(thread);
    } catch (error) {
        console.error("Error creating thread:", error.message);
        return res.status(500).json({ error: "Failed to create thread" });
    }
});

/**
 * GET /api/thread
 * Get all threads for the authenticated user
 */
router.get("/thread", async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);
        const threads = await Thread.find({ userId }).sort({ updatedAt: -1 });

        // format response to include only required info
        const formattedthread = threads.map(t => {
            let cleanTitle = "";

            if (typeof t.title === "string" && t.title.trim().length > 0) {
                cleanTitle = t.title.replace(/undefined/gi, "").trim();
            } else if (t.messages?.[0]?.content) {
                cleanTitle = t.messages[0].content.replace(/undefined/gi, "").slice(0, 50).trim();
            } else {
                cleanTitle = "Untitled Chat";
            }

            return {
                threadId: t.threadId,
                title: cleanTitle || "Untitled Chat",
                messageCount: t.messages?.length || 0,
            };
        });

        res.json(formattedthread);
    } catch (error) {
        console.error("Error fetching threads:", error.message);
        res.status(500).json({ error: "Failed to fetch threads" });
    }
});

/**
 * GET /api/thread/:threadId
 *  Get all messages from a specific thread
 */
router.get("/thread/:threadId", async (req, res) => {
    const { threadId } = req.params;
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);
        const thread = await Thread.findOne({ threadId, userId });

        if (!thread) {
            return res.status(404).json({ error: "Thread not found" });
        }

        const cleanTitle =
            typeof thread.title === "string" && thread.title.trim().length > 0
                ? thread.title.replace(/undefined/gi, "").trim()
                : thread.messages?.[0]?.content?.replace(/undefined/gi, "").slice(0, 50).trim() ||
                "Untitled Chat";

        return res.json({
            threadId: thread.threadId,
            title: cleanTitle || "Untitled Chat",
            messages: Array.isArray(thread.messages) ? thread.messages : [],
        });
    } catch (error) {
        console.error("Error fetching thread:", error.message);
        res.status(500).json({ error: "Failed to fetch thread" });
    }
});



/**
 * DELETE /api/thread/:threadId
 * Delete a thread for the authenticated user
 */
router.delete("/thread/:threadId", async (req, res) => {
    try {
        const { threadId } = req.params;
        const userId = new mongoose.Types.ObjectId(req.user.id);

        const deletedThread = await Thread.findOneAndDelete({ threadId, userId });
        if (!deletedThread) return res.status(404).json({ error: "Thread not found" });

        return res.json({ success: "Thread deleted successfully" });
    } catch (error) {
        console.error("Error deleting thread:", error.message);
        return res.status(500).json({ error: "Failed to delete thread" });
    }
});

/**
 * POST /api/chat
 * Handle sending message, calling OpenAI, storing both user & assistant messages
 */
router.post("/chat", async (req, res) => {
    try {
        let { threadId, message } = req.body;

        if (typeof message !== "string" || !message.trim()) {
            return res.status(400).json({ error: "Message and threadId are required" });
        }

        message = message.trim().replace(/undefined/gi, "");

        const userId = new mongoose.Types.ObjectId(req.user.id);
        let thread = await Thread.findOne({ threadId, userId });

        // Clean title safely before saving
        let title = "New Chat";
        if (message && typeof message === "string" && message.trim().length > 0) {
            title = message.replace(/undefined/gi, "").slice(0, 50).trim();
        }

        // If no existing thread found, create a new one
        if (!thread) {
            thread = new Thread({
                userId,
                threadId,
                title,
                messages: [{ role: "user", content: message }],
            });
        } else {
            thread.messages.push({ role: "user", content: message });
            // update title if not yet set properly
            if (!thread.title || thread.title.includes("undefined")) {
                thread.title = title;
            }
        }

        // Get AI assistant's reply
        const assistantReply = await getOpenAIAPIResponse(message);

        // Save both user and assistant messages
        thread.messages.push({ role: "assistant", content: assistantReply });
        thread.updatedAt = new Date();
        await thread.save();

        res.json({ reply: assistantReply });
    } catch (error) {
        console.error("Error in /chat route:", error.message);
        return res.status(500).json({ error: "Internal server error" });
    }
});


// Update thread title..
router.put("/thread/:threadId", async (req, res) => {
    try {
        const { threadId } = req.params;
        const { title } = req.body;

        if (!title) {
            return res.status(400).json({ error: "Title is required" });
        }
        const userId = new mongoose.Types.ObjectId(req.user.id);

        // Find thread by threadId field (not _id)
        const thread = await Thread.findOneAndUpdate(
            { threadId, userId },
            { title },
            { new: true }
        );

        if (!thread) {
            return res.status(404).json({ error: "Thread not found" });
        }

        res.status(200).json(thread);
    } catch (err) {
        console.error("Error updating thread:", err);
        res.status(500).json({ error: "Server error while updating thread" });
    }
});

export default router;
