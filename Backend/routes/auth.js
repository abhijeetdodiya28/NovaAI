// routes/auth.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import passport from "passport";
import sendEmail from "../utils/sendEmail.js";

const router = express.Router();


// ------------------- SIGNUP -------------------


router.post("/signup", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser)
            return res.status(400).json({ error: "User already exists" });

        // const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password });
        await newUser.save();

        const token = jwt.sign(
            { id: newUser._id, username: newUser.username, email: newUser.email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.status(201).json({
            success: true,
            token,
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
            },
        });
    } catch (err) {
        console.error("Signup error:", err.message);
        res.status(500).json({ error: "Server error" });
    }
});



// ------------------- LOGIN -------------------
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user._id, username: user.username, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.status(200).json({
            success: true,
            token,
            user: { id: user._id, username: user.username, email: user.email }
        });
    } catch (error) {
        console.error("Login error:", error.message);
        res.status(500).json({ success: false, message: "Login failed" });
    }
});

// ------------------- GOOGLE AUTH -------------------
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
    "/google/callback",
    passport.authenticate("google", { session: false, failureRedirect: "/login" }),
    (req, res) => {
        const user = req.user;

        const token = jwt.sign(
            { id: user._id, username: user.username, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        // For production, use httpOnly cookie instead of query param
        res.redirect(`http://localhost:5173/auth/google/callback?token=${token}`);
    }
);

// ------------- FORGOT PASSWORD ---------------------
router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email is required" });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;

        // console.log(resetLink);
        await sendEmail(user.email, "Password Reset", `Click here to reset: ${resetLink}`);
        res.json({ message: "Password reset link sent to your email" });

    } catch (err) {
        console.error("Forgot password error:", err.message);
        res.status(500).json({ message: "Server error" });
    }
});

// ----------------- RESET PASSWORD --------------------
router.post("/reset-password", async (req, res) => {
    try {
        const { token, password } = req.body;

        if (!password) {
            return res.status(400).json({ success: false, error: "Password is required" });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(400).json({ success: false, error: "Invalid or expired token" });
        }

        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ success: false, error: "User not found" });
        }

        // Assign new password (pre-save hook will hash)
        user.password = password;
        await user.save();

        res.json({ success: true, message: "Password reset successfully" });
    } catch (err) {
        console.error("Reset password error:", err);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

export default router;