// context/AuthContext.jsx
import React, { createContext, useState, useEffect, useCallback, useContext } from "react";
import { MyContext } from "./MyContext";
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);

    const { resetContext } = useContext(MyContext);

    // Check if user is already logged in
    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (storedToken && storedUser && storedUser !== "undefined") {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const login = useCallback((data) => {
        if (!data?.token || !data?.user) {
            console.error("Invalid login data:", data);
            return;
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);

        if (resetContext) resetContext();
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);

        if (resetContext) resetContext();

    }, []);

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
