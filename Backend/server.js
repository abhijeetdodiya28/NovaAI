import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import passport from "passport";

import authRouter from "./routes/auth.js";

import chatRoutes from "./routes/chat.js";
import "./middleware/googleAuth.js";
import protectedRoutes from "./routes/protected.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 7000;

// ------------------- MIDDLEWARES -------------------
const allowedOrigins = [
    "http://localhost:5173",
    "https://nova-ai-pi.vercel.app",
];

app.use(
    cors({
        origin: (origin, callback) => {
            console.log("Origin request:", origin); // Debug log

            if (!origin) return callback(null, true); // Allow server-to-server requests

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(new Error("CORS blocked: " + origin));
        },
        credentials: true,
    })
);


app.use(express.json());
app.use(passport.initialize());

// ------------------- ROUTES -------------------
// app.use("/api/reset-password", resetPasswordRoute);
app.use("/api/auth", authRouter);
app.use("/api", protectedRoutes);
app.use("/api", chatRoutes);

// ------------------- DATABASE & SERVER START -------------------
const startServer = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Connected to Database");
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    } catch (error) {
        console.error("Database connection failed:", error.message);
    }
};

startServer();
