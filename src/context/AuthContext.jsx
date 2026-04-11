import { createContext, useState } from "react";

// 1. Create Context
export const AuthContext = createContext();

// 2. Mock users (si database e vogël)
const MOCK_USERS = [
    { id: 1, username: "admin", password: "1234", role: "admin" },
    { id: 2, username: "user", password: "1234", role: "user" },
];

export const AuthProvider = ({ children }) => {
    // 3. STATE (kërkesat e detyrës)
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // 4. LOGIN (fake login - professional)
    const login = (username, password) => {
        const foundUser = MOCK_USERS.find(
            (u) => u.username === username && u.password === password
        );

        if (!foundUser) {
            return {
                success: false,
                message: "Invalid credentials",
            };
        }

        setUser({
            id: foundUser.id,
            username: foundUser.username,
        });

        setRole(foundUser.role);
        setIsAuthenticated(true);

        return {
            success: true,
            message: "Login successful",
            user: foundUser,
        };
    };

    // 5. LOGOUT
    const logout = () => {
        setUser(null);
        setRole(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider
            value={{
                // state
                user,
                role,
                isAuthenticated,

                // functions
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};