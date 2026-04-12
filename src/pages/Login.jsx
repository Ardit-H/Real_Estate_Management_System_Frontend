import { useState } from "react";
import { useAuth } from "../context/useAuth.jsx";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const { login, loading, error } = useAuth();
    const navigate = useNavigate();

    // email në vend të username (backend pret email)
    const [email,    setEmail]    = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        const ok = await login(email, password);
        if (ok) navigate("/dashboard");
    };

    // Lejo Enter key
    const handleKeyDown = (e) => {
        if (e.key === "Enter") handleLogin();
    };

    return (
        <div style={styles.wrapper}>
            <div style={styles.card}>

                {/* HEADER — i njëjtë */}
                <h1 style={styles.title}>Login</h1>
                <p style={styles.subtitle}>
                    Welcome back! Please enter your details.
                </p>

                {/* ERROR nga backend */}
                {error && (
                    <div style={styles.errorBox}>
                        {error}
                    </div>
                )}

                {/* INPUTS — email në vend të username */}
                <input
                    style={styles.input}
                    placeholder="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={handleKeyDown}
                />

                <input
                    style={styles.input}
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                />

                {/* FORGOT PASSWORD — i njëjtë */}
                <div style={styles.forgotRow}>
                    <span></span>
                    <a href="#" style={styles.forgot}>
                        Forgot password?
                    </a>
                </div>

                {/* BUTTON — shfaq loading */}
                <button
                    style={{
                        ...styles.button,
                        opacity: loading ? 0.7 : 1,
                        cursor:  loading ? "not-allowed" : "pointer",
                    }}
                    onClick={handleLogin}
                    disabled={loading}
                >
                    {loading ? "Duke u kyçur..." : "Login"}
                </button>

            </div>
        </div>
    );
}

// Stilet janë IDENTIKE me versionin origjinal
const styles = {
    wrapper: {
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#0f172a",
        fontFamily: "Arial",
    },
    card: {
        width: "380px",
        padding: "40px",
        background: "#111827",
        borderRadius: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
    },
    title: {
        color: "white",
        textAlign: "center",
        fontSize: "28px",
        marginBottom: "5px",
    },
    subtitle: {
        color: "#94a3b8",
        textAlign: "center",
        fontSize: "14px",
        marginBottom: "15px",
    },
    input: {
        padding: "12px",
        borderRadius: "10px",
        border: "none",
        outline: "none",
        background: "#1f2937",
        color: "white",
    },
    forgotRow: {
        display: "flex",
        justifyContent: "flex-end",
        marginTop: "5px",
    },
    forgot: {
        fontSize: "12px",
        color: "#60a5fa",
        textDecoration: "none",
        cursor: "pointer",
    },
    button: {
        marginTop: "10px",
        padding: "12px",
        borderRadius: "10px",
        border: "none",
        background: "#3b82f6",
        color: "white",
        fontWeight: "bold",
        cursor: "pointer",
    },
    errorBox: {
        background: "#450a0a",
        color: "#fca5a5",
        padding: "10px 14px",
        borderRadius: "8px",
        fontSize: "13px",
        textAlign: "center",
    },
};
