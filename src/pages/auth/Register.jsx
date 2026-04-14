import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthProvider";

export default function Register() {
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const [first_name, setFirstName] = useState("");
    const [last_name, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("client");
    const [tenant_id] = useState(1);

    const [error, setError] = useState("");

    const handleRegister = () => {
        const ok = register({
            email,
            password,
            role,
            first_name,
            last_name,
            tenant_id
        });

        if (!ok) {
            setError("User already exists");
            return;
        }

        alert("Registered successfully!");

        if (role === "admin") navigate("/admin");
        else if (role === "agent") navigate("/agent");
        else navigate("/client");
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Create Account ✨</h2>
                <p style={styles.subtitle}>Fill your details to register</p>

                <div style={styles.form}>

                    <input
                        style={styles.input}
                        placeholder="First Name"
                        onChange={(e) => setFirstName(e.target.value)}
                    />

                    <input
                        style={styles.input}
                        placeholder="Last Name"
                        onChange={(e) => setLastName(e.target.value)}
                    />

                    <input
                        style={styles.input}
                        type="email"
                        placeholder="Email"
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <input
                        style={styles.input}
                        type="password"
                        placeholder="Password"
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <select
                        style={styles.input}
                        onChange={(e) => setRole(e.target.value)}
                    >
                        <option value="client">Client</option>
                        <option value="agent">Agent</option>
                        <option value="admin">Admin</option>
                    </select>

                    <button style={styles.button} onClick={handleRegister}>
                        Register
                    </button>

                    {error && <p style={styles.error}>{error}</p>}

                    <p style={styles.bottomText}>
                        Already have an account?{" "}
                        <Link to="/" style={styles.link}>
                            Login
                        </Link>
                    </p>

                </div>
            </div>
        </div>
    );
}
const styles = {
    container: {
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#5a5f3a",
    },
    card: {
        width: "450px",
        padding: "30px",
        background: "#5a5f3a",
        borderRadius: "12px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
        color: "white",
        textAlign: "center",
    },
    title: {
        color: "#ffffff",
        marginBottom: "5px",
    },
    subtitle: {
        color: "#e5e7eb",
        marginBottom: "15px",
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
        background: "#5a5f3a",
        color: "#ffffff",
        outline: "none",
    },
    button: {
        marginTop: "10px",
        padding: "10px",
        background: "#a3a380",
        color: "#1f1f1f",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
    },
    error: {
        color: "#ff6b6b",
        fontSize: "13px",
    },
    bottomText: {
        marginTop: "10px",
        fontSize: "13px",
        color: "#e5e7eb",
    },
    link: {
        color: "#ffffff",
        textDecoration: "none",
        fontWeight: "bold",
    },
};