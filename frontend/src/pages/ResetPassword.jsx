import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiFetch } from "./api.js";
import logo from "../assets/logo.png";
import { Eye, EyeOff } from "lucide-react";

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        if (password !== confirmPassword) {
            setMessage("Passwords do not match");
            setLoading(false);
            return;
        }

        try {
            const res = await apiFetch(`/auth/reset-password`, {
                method: "POST",
                body: JSON.stringify({ token, password }),
            });

            if (res.success) {
                setMessage("Password reset successful! Redirecting to login...");
                setTimeout(() => navigate("/login"), 3000);
            } else {
                setMessage(res.error || res.message || "Something went wrong");
            }
        } catch (err) {
            setMessage(err?.error || err?.message || "Server error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1E293B] to-[#0A0D14] px-4">
            <div className="bg-[#2C3E50] shadow-2xl rounded-xl p-8 w-full max-w-sm border border-[#42556A]">
                <div className="flex justify-center mb-6">
                    <img src={logo} alt="Logo" className="w-20 h-20 object-contain" />
                </div>

                <h2 className="text-3xl font-extrabold text-white text-center mb-8 tracking-wide">
                    Reset Password
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="New password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 pr-10 border border-[#42556A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981] transition shadow-md placeholder-gray-400 text-white bg-[#1F2937] text-sm"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    <div className="relative">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 pr-10 border border-[#42556A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981] transition shadow-md placeholder-gray-400 text-white bg-[#1F2937] text-sm"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

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
                        {loading ? "Resetting..." : "Reset Password"}
                    </button>
                </form>

                {message && (
                    <p
                        className={`text-center mt-4 text-sm font-medium ${message.includes("successful")
                            ? "text-[#10B981]"
                            : "text-red-400"
                            }`}
                    >
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;
