import { useState, createContext } from "react";
import { users } from "../mocks/users";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
    const [user, setUser] = useState(null);

    const login = (username, password) => {
        const found = users.find(
            (u) => u.username === username && u.password === password
        );

        if (!found) return false;

        setUser(found);
        return found;
    };

    const logout = () => {
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}