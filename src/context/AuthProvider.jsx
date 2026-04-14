import { useState, createContext } from "react";
import { users as initialUsers } from "../mocks/users";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [users, setUsers] = useState(initialUsers);

    const login = (username, password) => {
        const found = users.find(
            (u) => u.username === username && u.password === password
        );

        if (!found) return false;

        setUser(found);
        return found;
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