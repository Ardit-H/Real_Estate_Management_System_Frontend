import { useState } from "react";
import { useAuth } from "../context/useAuth.jsx";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = () => {
        const ok = login(username, password);

        if (ok) navigate("/dashboard");
        else alert("Wrong credentials");
    };

    return (
        <div style={styles.wrapper}>

            <div style={styles.card}>

                {/* HEADER */}
                <h1 style={styles.title}>Login</h1>

                <p style={styles.subtitle}>
                    Welcome back! Please enter your details.
                </p>

                {/* INPUTS */}
                <input
                    style={styles.input}
                    placeholder="Username"
                    onChange={(e) => setUsername(e.target.value)}
                />

                <input
                    style={styles.input}
                    type="password"
                    placeholder="Password"
                    onChange={(e) => setPassword(e.target.value)}
                />

                {/* FORGOT PASSWORD */}
                <div style={styles.forgotRow}>
                    <span></span>

                    <a href="#" style={styles.forgot}>
                        Forgot password?
                    </a>
                </div>

                {/* BUTTON */}
                <button style={styles.button} onClick={handleLogin}>
                    Login
                </button>

            </div>
        </div>
    );
}

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
};