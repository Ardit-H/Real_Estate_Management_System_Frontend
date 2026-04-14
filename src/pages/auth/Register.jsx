import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthProvider";

export default function Register() {
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [birthdate, setBirthdate] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("client");
    const [error, setError] = useState("");

    const handleRegister = () => {
        const ok = register(username, password, role, {
            name,
            surname,
            email,
            phone,
            birthdate,
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

                    <input style={styles.input} placeholder="Name" onChange={(e) => setName(e.target.value)} />
                    <input style={styles.input} placeholder="Surname" onChange={(e) => setSurname(e.target.value)} />

                    <input style={styles.input} placeholder="Username" onChange={(e) => setUsername(e.target.value)} />

                    <input style={styles.input} type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />

                    <input style={styles.input} placeholder="Phone Number" onChange={(e) => setPhone(e.target.value)} />

                    <input style={styles.input} type="date" onChange={(e) => setBirthdate(e.target.value)} />

                    <input style={styles.input} type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />

                    <select style={styles.input} onChange={(e) => setRole(e.target.value)}>
                        <option value="client">Client</option>
                        <option value="agent">Agent</option>
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
        background: "#0f172a",
    },
    card: {
        width: "450px",
        padding: "30px",
        background: "#1e293b",
        borderRadius: "12px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
        color: "white",
        textAlign: "center",
    },
    title: {
        color: "#60a5fa",
        marginBottom: "5px",
    },
    subtitle: {
        color: "#94a3b8",
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
        border: "1px solid #334155",
        background: "#0f172a",
        color: "white",
        outline: "none",
    },
    button: {
        marginTop: "10px",
        padding: "10px",
        background: "#2563eb",
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
    },
    error: {
        color: "red",
        fontSize: "13px",
    },
    bottomText: {
        marginTop: "10px",
        fontSize: "13px",
        color: "#94a3b8",
    },
    link: {
        color: "#60a5fa",
        textDecoration: "none",
    },
};