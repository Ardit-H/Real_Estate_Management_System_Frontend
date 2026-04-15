import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthProvider";

export default function Login() {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

const handleLogin = async () => {
    setError("");

    try {
        const user = await login(email, password);
console.log("USER FROM BACKEND:", user);
        if (!user) {
            setError("Invalid email or password");
            return;
        }

        if (user.role === "admin") navigate("/admin");
        else if (user.role === "agent") navigate("/agent");
        else navigate("/client");

    } catch (err) {
        console.log("LOGIN ERROR:", err);
        setError("Server error. Try again.");
    }
};

    return ( <div style={styles.page}>
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Welcome Back 👋</h2>
                <p style={styles.subtitle}>Login to your account</p>

                <div style={styles.form}>
                    <input
                        style={styles.input}
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <input
                        style={styles.input}
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <button style={styles.button} onClick={handleLogin}>
                        Login
                    </button>

                    
                    {error && <div style={styles.error}>{error}</div>}

                    <Link to="/register" style={styles.link}>
                        No account yet? Register now.
                    </Link>
                </div>
            </div>
        </div>
        </div>
    );
}

const styles = {
     page: {
    width: "100%",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#5a5f3a",
     },
    container: {
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#5a5f3a",
    },
    card: {
        width: "350px",
        padding: "30px",
        background: "#5a5f3a",
        borderRadius: "12px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
        textAlign: "center",
    },
    title: {
        marginBottom: "5px",
        color: "#ffffff",
    },
    subtitle: {
        color: "#e5e7eb",
        marginBottom: "20px",
        fontSize: "14px",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "10px",
    },
    input: {
        padding: "10px",
        borderRadius: "8px",
        border: "1px solid #a3a380",
        outline: "none",
        background: "#ffffff",
        color: "#5a5f3a",
    },
    button: {
        padding: "10px",
        background: "#a3a380",
        color: "#1f1f1f",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        marginTop: "10px",
    },
    error: {
        color: "#ff6b6b",
        fontSize: "13px",
        marginTop: "8px",
    },
    link: {
        marginTop: "10px",
        fontSize: "13px",
        color: "#ffffff",
        textDecoration: "none",
    },
};