import { useState } from "react";
import { AuthContext } from "./AuthContext.jsx";

const MOCK_USERS = [
    { id: 1, username: "admin", password: "1234", role: "admin" },
    { id: 2, username: "user", password: "1234", role: "user" },
];

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const login = (username, password) => {
        const foundUser = MOCK_USERS.find(
            (u) => u.username === username && u.password === password
        );

        if (!foundUser) {
            return { success: false };
        }

        setUser(foundUser);
        setRole(foundUser.role);
        setIsAuthenticated(true);

        return { success: true };
    };

    const logout = () => {
        setUser(null);
        setRole(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                role,
                isAuthenticated,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};