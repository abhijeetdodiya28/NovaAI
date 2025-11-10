import React, { useContext, useState } from "react";
import { apiFetch } from "./api.js";
import { AuthContext } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import logo from '../assets/logo.png'; // Import the logo

const Login = () => {
    const [form, setForm] = useState({ email: "", password: "" });
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = await apiFetch("/auth/login", {
                method: "POST",
                body: JSON.stringify(form),
            });
            //save token for future api..
            localStorage.setItem("token", data.token);

            // update global context auth..
            login(data);


            navigate("/chat");
        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = "http://localhost:7000/api/auth/google";
    };

    const handleSignupRedirect = () => {
        navigate("/signup");
    };

    const handleResetPassword = () => {
        window.location.href = "http://localhost:5173/forgot-password";
    }

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
                    Login
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-[#42556A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981] transition shadow-md placeholder-gray-400 text-white bg-[#1F2937] text-sm"
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-[#42556A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981] transition shadow-md placeholder-gray-400 text-white bg-[#1F2937] text-sm"
                    />
                    <button
                        type="submit"
                        className="w-full bg-[#059669] hover:bg-[#10B981] text-white py-3 mt-6 rounded-lg font-bold transition shadow-xl transform hover:scale-[1.02] flex justify-center"
                    >
                        Login
                    </button>
                </form>

                <div className="my-5 flex items-center justify-center">
                    <hr className="w-full border-t border-[#42556A]" />
                    <span className="mx-4 text-sm font-medium text-gray-400">OR</span>
                    <hr className="w-full border-t border-[#42556A]" />
                </div>

                {/* Social Button */}
                <button
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center border border-[#42556A] py-3 rounded-lg hover:bg-[#3E5266] transition shadow-md text-white font-medium text-sm"
                >
                    <img
                        src="https://www.svgrepo.com/show/475656/google-color.svg"
                        alt="Google"
                        className="w-5 h-5 mr-3"
                    />
                    Login with Google
                </button>

                {/* Link/Action Section */}
                <div className="mt-6 flex flex-col items-center space-y-3">
                    {/* Sign up Link */}
                    <p className="text-center text-gray-300 text-sm">
                        Don't have an account?
                        <a
                            href="#"
                            onClick={(e) => { e.preventDefault(); handleSignupRedirect(); }}
                            className="inline-block px-4 py-2 bg-transparent border border-[#10B981] text-[#10B981] rounded-lg font-semibold hover:bg-[#10B981] hover:text-white transition transform hover:scale-105 ml-2 text-xs"
                        >
                            Sign up
                        </a>
                    </p>

                    {/* Forgot Password Link */}
                    <p className="text-center text-gray-300 text-sm">
                        Forgot your password?
                        <a
                            href="#"
                            onClick={(e) => { e.preventDefault(); handleResetPassword(); }}
                            className="inline-block px-4 py-2 bg-transparent border border-[#10B981] text-[#10B981] rounded-lg font-semibold hover:bg-[#10B981] hover:text-white transition transform hover:scale-105 ml-2 text-xs"
                        >
                            Reset Password
                        </a>
                    </p>
                </div>

            </div>
        </div>
    );
};

export default Login;