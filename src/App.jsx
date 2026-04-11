import { useContext, useState } from "react";
import { AuthContext } from "./context/AuthContext.jsx";

function App() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("App must be used within AuthProvider");
    }

    const { login, isAuthenticated, user, role, logout } = context;

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = () => {
        login(username, password);
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "linear-gradient(135deg, #1f1f2e, #2c2c3a)",
                fontFamily: "Arial",
            }}
        >
            <div
                style={{
                    width: "420px",
                    padding: "40px",
                    borderRadius: "16px",
                    background: "#ffffff10",
                    backdropFilter: "blur(10px)",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
                    color: "white",
                    textAlign: "center",
                }}
            >
                <h1 style={{ marginBottom: "10px", fontSize: "24px" }}>
                    🏡 Real Estate Management System
                </h1>

                <p style={{ color: "#bbb", marginBottom: "25px" }}>
                    Login to access dashboard
                </p>

                {!isAuthenticated ? (
                    <>
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "12px",
                                marginBottom: "15px",
                                borderRadius: "8px",
                                border: "none",
                                outline: "none",
                            }}
                        />

                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "12px",
                                marginBottom: "20px",
                                borderRadius: "8px",
                                border: "none",
                                outline: "none",
                            }}
                        />

                        <button
                            onClick={handleLogin}
                            style={{
                                width: "100%",
                                padding: "12px",
                                borderRadius: "8px",
                                border: "none",
                                background: "#4f46e5",
                                color: "white",
                                fontWeight: "bold",
                                cursor: "pointer",
                                marginBottom: "20px",
                            }}
                        >
                            Login
                        </button>

                        <hr style={{ border: "0.5px solid #ffffff30" }} />

                        <p style={{ marginTop: "15px" }}>Quick Access</p>

                        <div style={{ display: "flex", gap: "10px" }}>
                            <button
                                onClick={() => login("admin", "1234")}
                                style={{
                                    flex: 1,
                                    padding: "10px",
                                    borderRadius: "8px",
                                    border: "none",
                                    cursor: "pointer",
                                    background: "#22c55e",
                                    color: "white",
                                }}
                            >
                                Admin
                            </button>

                            <button
                                onClick={() => login("user", "1234")}
                                style={{
                                    flex: 1,
                                    padding: "10px",
                                    borderRadius: "8px",
                                    border: "none",
                                    cursor: "pointer",
                                    background: "#f59e0b",
                                    color: "white",
                                }}
                            >
                                User
                            </button>
                        </div>
                    </>
                ) : (
                    <div>
                        <h2>Welcome {user?.username}</h2>
                        <p>Role: {role}</p>

                        <button
                            onClick={logout}
                            style={{
                                marginTop: "20px",
                                padding: "10px 20px",
                                borderRadius: "8px",
                                border: "none",
                                background: "#ef4444",
                                color: "white",
                                cursor: "pointer",
                            }}
                        >
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;