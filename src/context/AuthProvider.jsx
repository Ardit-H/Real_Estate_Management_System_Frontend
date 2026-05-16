import { useState, createContext } from "react";
import api from "../api/axios";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem("user_info");
        return saved ? JSON.parse(saved) : null;
    });

    const [impersonating, setImpersonating] = useState(() => {
        const saved = localStorage.getItem("impersonating");
        return saved ? JSON.parse(saved) : null;
    });

    const [loading, setLoading] = useState(false);
    const [error,   setError]   = useState(null);

    // ───────── LOGIN ─────────
    const login = async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const res  = await api.post("/api/auth/login", { email, password });
            const data = res.data;

            // schema_name = "tenant_rose_1" → e ruajmë si tenantSlug
            const userInfo = {
                id:         data.user_id,
                email:      data.email,
                fullName:   data.full_name,
                role:       data.role?.toLowerCase(),
                tenantId:   data.tenant_id,
                tenantName: data.tenant_name,
                tenantSlug: data.schema_name,   // ← e shtova
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
                email:      form.email,
                password:   form.password,
                firstName:  form.firstName,
                lastName:   form.lastName,
                role:       form.role,
                tenantSlug: form.tenantSlug,
                tenantName: form.tenantName,
                inviteToken: form.inviteToken || null
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
            if (refreshToken) await api.post("/api/auth/logout", { refreshToken });
        } catch (_) {}
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user_info");
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user_info");
        localStorage.removeItem("impersonating");
        setUser(null);
        setImpersonating(null);
        window.location.href = "/";
    };

    // ───────── REFRESH TOKEN ─────────
    const refreshToken = async () => {
        try {
            const token = localStorage.getItem("refresh_token");
            const res   = await api.post("/api/auth/refresh", { refreshToken: token });
            localStorage.setItem("access_token",  res.data.access_token);
            localStorage.setItem("refresh_token", res.data.refresh_token);
            return res.data;
        } catch (err) {
            logout();
            return null;
        }
    };

    // ───────── IMPERSONATION ─────────
    const startImpersonation = async (userId) => {
        try {
            const { data } = await api.post(`/api/admin/impersonate/${userId}`);

            localStorage.setItem("admin_token",     localStorage.getItem("access_token"));
            localStorage.setItem("admin_user_info", localStorage.getItem("user_info"));

            localStorage.setItem("access_token", data.token);

            const impersonatedUser = {
                id:       userId,
                email:    data.email,
                role:     data.role?.toLowerCase(),
                fullName: data.full_name || data.email?.split("@")[0],
            };

            localStorage.setItem("user_info",     JSON.stringify(impersonatedUser));
            localStorage.setItem("impersonating", JSON.stringify({
                email: data.email,
                role:  data.role,
            }));

            setUser(impersonatedUser);
            setImpersonating({ email: data.email, role: data.role });

            const role = data.role?.toLowerCase();
            if (role === "agent")       window.location.href = "/agent";
            else if (role === "client") window.location.href = "/client/clientdashboard";
            else                        window.location.href = "/";

        } catch (err) {
            setError(err.response?.data?.message || "Impersonation failed");
        }
    };

    const exitImpersonation = async () => {
        try { await api.post("/api/admin/impersonate/exit"); } catch (_) {}

        const adminToken    = localStorage.getItem("admin_token");
        const adminUserInfo = localStorage.getItem("admin_user_info");

        localStorage.setItem("access_token", adminToken);
        localStorage.setItem("user_info",    adminUserInfo);

        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user_info");
        localStorage.removeItem("impersonating");

        setUser(JSON.parse(adminUserInfo));
        setImpersonating(null);
        window.location.href = "/admin";
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            register,
            logout,
            refreshToken,
            loading,
            error,
            isAuthenticated: !!user,
            impersonating,
            startImpersonation,
            exitImpersonation,
        }}>
            {children}
        </AuthContext.Provider>
    );
}