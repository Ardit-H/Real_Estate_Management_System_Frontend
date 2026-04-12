import { useState } from "react";
import { AuthContext } from "./AuthContext.jsx";
import api from "../api/axiosConfig.js";

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        // Lexo nga localStorage nëse ekziston (persist pas refresh)
        const saved = localStorage.getItem("user_info");
        return saved ? JSON.parse(saved) : null;
    });

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

        } finally {
            setLoading(false);
        }
    };

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
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
