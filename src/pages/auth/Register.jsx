import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthProvider";

export default function Register() {
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("client");

    // ── SLUG GENERATOR (OPTION 2) ─────────────────────────────
    const generateSlug = (name) =>
        name
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "");

    // ── REGISTER HANDLER ──────────────────────────────────────
    const handleRegister = async () => {
        const tenantSlug = generateSlug(companyName);
        const tenantName = companyName;

        const res = await register({
            email,
            password,
            firstName,
            lastName,
            role, // admin / agent / client
            tenantSlug,
            tenantName,
        });

        if (!res) {
            alert("Register failed");
            return;
        }

        alert("Registered successfully!");

        // redirect based on role
        if (role === "admin") navigate("/admin");
        else if (role === "agent") navigate("/agent");
        else navigate("/client");
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Create Account ✨</h2>
                <p style={styles.subtitle}>
                    Register your company and account
                </p>

                <div style={styles.form}>
                    <input
                        style={styles.input}
                        placeholder="Company Name"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                    />

                    <input
                        style={styles.input}
                        placeholder="First Name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                    />

                    <input
                        style={styles.input}
                        placeholder="Last Name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                    />

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

                    <select
                        style={styles.input}
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                    >
                        <option value="client">Client</option>
                        <option value="agent">Agent</option>
                        <option value="admin">Admin</option>
                    </select>

                    <button style={styles.button} onClick={handleRegister}>
                        Register
                    </button>

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

// ── STYLES ────────────────────────────────────────────────
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
        background: "#ffffff",
        color: "#5a5f3a",
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