import React, { useContext, useState } from "react";
import { apiFetch } from "./api.js";
import { AuthContext } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import logo from '../assets/logo.png'; // Make sure the path is correct

const Signup = () => {
    const [form, setForm] = useState({ username: "", email: "", password: "" });
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChanges = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = await apiFetch("/auth/signup", {
                method: "POST",
                body: JSON.stringify(form),
            });

            // save the token for new user..

            localStorage.setItem("token", data.token);
            login(data);
            navigate("/chat");
        } catch (error) {
            alert(error.message);
            console.error(error);
        }
    };

    const handleGoogleSignup = () => {
        window.location.href = "http://localhost:7000/api/auth/google";
    };

    const handleLoginRedirect = () => {
        navigate("/login");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1E293B] to-[#0A0D14] px-4">
            <div className="bg-[#2C3E50] shadow-2xl rounded-xl p-8 w-full max-w-sm border border-[#42556A]">

                {/* Logo section */}
                <div className="flex justify-center mb-6">
                    <img
                        src={logo}
                        alt="Logo"
                        className="w-20 h-20 object-contain"
                    />
                </div>

                <h2 className="text-3xl font-extrabold text-white text-center mb-8 tracking-wide">
                    Create Your Account
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <input
                        name="username"
                        placeholder="Username"
                        onChange={handleChanges}
                        required
                        className="w-full px-4 py-3 border border-[#42556A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981] transition shadow-md placeholder-gray-400 text-white bg-[#1F2937] text-sm"
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        onChange={handleChanges}
                        required
                        className="w-full px-4 py-3 border border-[#42556A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981] transition shadow-md placeholder-gray-400 text-white bg-[#1F2937] text-sm"
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        onChange={handleChanges}
                        required
                        className="w-full px-4 py-3 border border-[#42556A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981] transition shadow-md placeholder-gray-400 text-white bg-[#1F2937] text-sm"
                    />
                    {/* Primary Button: Emerald Green - Now explicitly centered if needed, though w-full makes it fill available space */}
                    <button
                        type="submit"
                        className="w-full bg-[#059669] hover:bg-[#10B981] text-white py-3 mt-6 rounded-lg font-bold transition shadow-xl transform hover:scale-[1.02] block mx-auto" // Added block mx-auto for explicit centering if parent allows
                    >
                        Sign Up
                    </button>
                </form>

                <div className="my-5 flex items-center justify-center">
                    <hr className="w-full border-t border-[#42556A]" />
                    <span className="mx-4 text-sm font-medium text-gray-400">OR</span>
                    <hr className="w-full border-t border-[#42556A]" />
                </div>

                {/* Social Button: Lighter background on hover */}
                <button
                    onClick={handleGoogleSignup}
                    className="w-full flex items-center justify-center border border-[#42556A] py-3 rounded-lg hover:bg-[#3E5266] transition shadow-md text-white font-medium text-sm"
                >
                    <img
                        src="https://www.svgrepo.com/show/475656/google-color.svg"
                        alt="Google"
                        className="w-5 h-5 mr-3"
                    />
                    Sign up with Google
                </button>

                {/* Footer Link - Changed to an 'a' tag styled like a button */}
                <p className="text-center text-gray-300 mt-6 text-sm">
                    Already have an account?{" "}
                    {/* Changed to an <a> tag that looks like a button */}
                    <a
                        href="#" // Use # for demonstration, navigate will handle actual route
                        onClick={(e) => { e.preventDefault(); handleLoginRedirect(); }}
                        className="inline-block px-4 py-2 bg-transparent border border-[#10B981] text-[#10B981] rounded-lg font-semibold hover:bg-[#10B981] hover:text-white transition transform hover:scale-105 ml-2"
                    >
                        Login
                    </a>
                </p>
            </div>
        </div>
    );
};

export default Signup;