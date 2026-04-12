import { useState } from "react";
import { AuthContext } from "./AuthContext.jsx";

const USERS = [
    { id: 1, username: "admin", password: "1234", role: "admin" },
    { id: 2, username: "user", password: "1234", role: "user" },
];

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const login = (username, password) => {
        const found = USERS.find(
            (u) => u.username === username && u.password === password
        );

        if (!found) return false;

        setUser(found);
        return true;
    };

    const logout = () => {
        setUser(null);
    };

    const value = {
        user,
        isAuthenticated: !!user,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};