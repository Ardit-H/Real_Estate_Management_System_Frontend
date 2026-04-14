import { useState, createContext } from "react";
import { users as initialUsers } from "../mocks/users";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [users, setUsers] = useState(initialUsers);

    const login = (email, password) => {
        const user = users.find(
            (u) => u.email === email && u.password === password
        );

        return user || null;
    };

    // 🆕 REGISTER
    const register = (username, password, role = "client") => {
        const exists = users.find((u) => u.username === username);

        if (exists) return false;

        const newUser = {
            id: users.length + 1,
            username,
            password,
            role,
        };

        setUsers([...users, newUser]);
        return true;
    };

    const logout = () => {
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}