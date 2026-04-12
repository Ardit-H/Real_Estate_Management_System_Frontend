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

        if (ok) {
            navigate("/dashboard");
        } else {
            alert("Wrong credentials");
        }
    };

    return (
        <div style={styles.wrapper}>
            <div style={styles.card}>

                <h1 style={{ marginBottom: "20px" }}>🏡 Real Estate Login</h1>

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
    },

    card: {
        width: "350px",
        padding: "40px",
        background: "#111827",
        borderRadius: "12px",
        display: "flex",
        flexDirection: "column",
        gap: "15px",
        textAlign: "center",
        color: "white",
    },

    input: {
        padding: "12px",
        borderRadius: "8px",
        border: "none",
        outline: "none",
        fontSize: "16px",
    },

    button: {
        padding: "12px",
        borderRadius: "8px",
        border: "none",
        background: "#3b82f6",
        color: "white",
        fontSize: "16px",
        cursor: "pointer",
    },
};