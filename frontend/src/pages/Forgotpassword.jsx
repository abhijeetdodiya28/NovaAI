import React, { useState } from "react";
import { apiFetch } from "./api.js";
import { Link } from "react-router-dom"; // Import Link for navigation
import logo from '../assets/logo.png'; // Make sure the path is correct

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setLoading(true);
        try {
            const data = await apiFetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            // Using the actual message from the server or a friendly default
            setMessage(data.message || "Check your email for a password reset link.");
            setEmail("");
        } catch (error) {
            setMessage(error.message);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        // Changed gradient to Slate/Gray for consistency
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1E293B] to-[#0A0D14] px-4">
            {/* Changed card background and border to match Login/Signup */}
            <div className="bg-[#2C3E50] shadow-2xl rounded-xl p-8 w-full max-w-sm border border-[#42556A]">

                {/* Logo Section */}
                <div className="flex justify-center mb-6">
                    <img
                        src={logo}
                        alt="Logo"
                        className="w-20 h-20 object-contain"
                    />
                </div>

                <h2 className="text-3xl font-extrabold text-white text-center mb-4 tracking-wide">
                    Forgot Password
                </h2>

                <p className="text-gray-300 text-center mb-6 text-sm">
                    Enter your email to receive a password reset link.
                </p>

                {/* Status Message */}
                {message && (
                    <p className="text-center mb-4 text-[#10B981] text-sm font-medium">
                        {message}
                    </p>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Input styles updated for consistency */}
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-[#42556A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981] transition shadow-md placeholder-gray-400 text-white bg-[#1F2937] text-sm"
                    />

                    {/* Button styles updated for consistency (Emerald Green, centered text) */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`
                            w-full py-3 mt-6 rounded-lg font-bold transition shadow-xl transform hover:scale-[1.02] text-white flex justify-center
                            ${loading
                                ? "bg-gray-600 cursor-not-allowed"
                                : "bg-[#059669] hover:bg-[#10B981]"
                            }
                        `}
                    >
                        {loading ? "Sending..." : "Send Reset Link"}
                    </button>
                </form>


                {/* Back to Login Link */}
                <div className="text-center mt-6">
                    <Link
                        to="/login"
                        // Updated text color to match the accent theme
                        className="font-semibold text-sm text-[#10B981] hover:text-[#059669] hover:underline transition"
                    >
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;