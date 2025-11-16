import React, { createContext, useState, useEffect, useCallback, useContext } from "react";
import { MyContext } from "./MyContext";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);

    const { resetContext } = useContext(MyContext);

    useEffect(() => {
        const savedToken = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");

        if (savedToken && savedUser && savedUser !== "undefined") {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
        }
    }, []);

    const login = useCallback((data) => {
        resetContext();  // CLEAR OLD USER’S STATE

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        setToken(data.token);
        setUser(data.user);
    }, [resetContext]);

    const logout = useCallback(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setToken(null);
        setUser(null);

        resetContext(); // CLEAR EVERYTHING
    }, [resetContext]);

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
