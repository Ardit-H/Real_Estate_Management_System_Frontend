<<<<<<< Updated upstream
import { useState } from "react";
import { AuthContext } from "./AuthContext.jsx";
import api from "../api/axiosConfig.js";
=======
import { useState, createContext } from "react";
import api from "../api/axios";
>>>>>>> Stashed changes

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        // Lexo nga localStorage nëse ekziston (persist pas refresh)
        const saved = localStorage.getItem("user_info");
        return saved ? JSON.parse(saved) : null;
    });

<<<<<<< Updated upstream
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState(null);

    // ── LOGIN ──────────────────────────────────────────────────
    const login = async (email, password) => {
        setLoading(true);
        setError(null);

        try {
            const res = await api.post("/api/auth/login", { email, password });
            const data = res.data;

            // Ruaj tokens
            localStorage.setItem("access_token",  data.access_token);
            localStorage.setItem("refresh_token", data.refresh_token);

            // Ndërto user object nga response i backend-it
            const userInfo = {
                id:         data.user_id,
                email:      data.email,
                username:   data.email,          // Dashboard e përdor user?.username
                fullName:   data.full_name,
                role:       data.role.toLowerCase(), // "ADMIN" → "admin"
                tenantId:   data.tenant_id,
                tenantName: data.tenant_name,
            };

            localStorage.setItem("user_info", JSON.stringify(userInfo));
            setUser(userInfo);
            return true;

        } catch (err) {
            const msg = err.response?.data?.message || "Kredenciale të gabuara";
            setError(msg);
            return false;
=======
export default function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem("user_info");
        return saved ? JSON.parse(saved) : null;
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    
    const login = async (email, password) => {
        setLoading(true);
        setError(null);

        try {
            const res = await api.post("/api/auth/login", {
                email,
                password,
            });

            const data = res.data;

            const userInfo = {
                id: data.user_id,
                email: data.email,
                fullName: data.full_name,
                role: data.role?.toLowerCase(),
                tenantId: data.tenant_id,
                tenantName: data.tenant_name,
            };

            localStorage.setItem("access_token", data.access_token);
            localStorage.setItem("refresh_token", data.refresh_token);
            localStorage.setItem("user_info", JSON.stringify(userInfo));

            setUser(userInfo);
            return userInfo;

        } catch (err) {
            setError(err.response?.data?.message || "Login failed");
            return null;
>>>>>>> Stashed changes

        } finally {
            setLoading(false);
        }
    };

<<<<<<< Updated upstream
    // ── LOGOUT ─────────────────────────────────────────────────
    const logout = async () => {
        try {
            const refreshToken = localStorage.getItem("refresh_token");
            if (refreshToken) {
                await api.post("/api/auth/logout", { refreshToken });
            }
        } catch (_) {
            // Vazhdo edhe nëse request dështon
        } finally {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            localStorage.removeItem("user_info");
            setUser(null);
        }
    };

    const value = {
        user,
        loading,
        error,
        isAuthenticated: !!user,
        login,
        logout,
=======
    
    const register = async (form) => {
        setLoading(true);
        setError(null);

        try {
            const payload = {
                email: form.email,
                password: form.password,
                firstName: form.firstName,
                lastName: form.lastName,
                role: form.role, 
                tenantSlug: form.tenantSlug,
                tenantName: form.tenantName,
            };

            const res = await api.post("/api/auth/register", payload);

            return res.data;

        } catch (err) {
            setError(err.response?.data?.message || "Register failed");
            return null;

        } finally {
            setLoading(false);
        }
    };

   
    const logout = async () => {
        try {
            const refreshToken = localStorage.getItem("refresh_token");

            if (refreshToken) {
                await api.post("/api/auth/logout", {
                    refreshToken,
                });
            }
        } catch (_) {}

        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user_info");
        setUser(null);
>>>>>>> Stashed changes
    };

    
    const refreshToken = async () => {
        try {
            const refreshToken = localStorage.getItem("refresh_token");

            const res = await api.post("/api/auth/refresh", {
                refreshToken,
            });

            localStorage.setItem("access_token", res.data.access_token);
            localStorage.setItem("refresh_token", res.data.refresh_token);

            return res.data;

        } catch (err) {
            logout();
            return null;
        }
    };

    return (
<<<<<<< Updated upstream
        <AuthContext.Provider value={value}>
=======
        <AuthContext.Provider
            value={{
                user,
                login,
                register,
                logout,
                refreshToken,
                loading,
                error,
                isAuthenticated: !!user,
            }}
        >
>>>>>>> Stashed changes
            {children}
        </AuthContext.Provider>
    );
};
