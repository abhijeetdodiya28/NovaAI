// backend/models/user.js
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        username: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String },          // will be null for Google users
        googleId: { type: String }           // set only for Google accounts
    },
    { timestamps: true }
);

userSchema.pre("save", async function (next) {
    // Only hash if password field is set and modified
    if (!this.isModified("password") || !this.password) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

export default mongoose.model("User", userSchema);
