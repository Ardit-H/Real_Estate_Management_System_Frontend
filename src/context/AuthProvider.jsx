import { useState, createContext } from "react";
import api from "../api/axios";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem("user_info");
        return saved ? JSON.parse(saved) : null;
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // ───────── LOGIN ─────────
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

        } finally {
            setLoading(false);
        }
    };

    // ───────── REGISTER ─────────
    const register = async (form) => {
        setLoading(true);
        setError(null);

        try {
            const payload = {
                email: form.email,
                password: form.password,
                firstName: form.firstName,
                lastName: form.lastName,
                role: form.role, // already ADMIN/AGENT/CLIENT
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

// ───────── LOGOUT ─────────
    const logout = async () => {
    try {
        const refreshToken = localStorage.getItem("refresh_token");

        if (refreshToken) {
            await api.post("/api/auth/logout", { refreshToken });
        }
    } catch (_) {}

    // CLEAN STATE
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_info");

    setUser(null);

    // force redirect (shmang blank state)
    window.location.href = "/";
};

    // ───────── REFRESH TOKEN ─────────
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
            {children}
        </AuthContext.Provider>
    );
}