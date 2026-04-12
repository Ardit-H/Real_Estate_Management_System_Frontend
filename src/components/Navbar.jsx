import { useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <div style={styles.navbar}>

            <button
                onClick={() => navigate("/dashboard")}
                style={{
                    ...styles.btn,
                    background: isActive("/dashboard") ? "#3b82f6" : "#1f2937"
                }}
            >
                Home
            </button>

            <button
                onClick={() => navigate("/properties")}
                style={{
                    ...styles.btn,
                    background: isActive("/properties") ? "#3b82f6" : "#1f2937"
                }}
            >
                Properties
            </button>

            <button
                onClick={() => navigate("/profile")}
                style={{
                    ...styles.btn,
                    background: isActive("/profile") ? "#3b82f6" : "#1f2937"
                }}
            >
                Profile
            </button>

        </div>
    );
}

const styles = {
    navbar: {
        display: "flex",
        justifyContent: "center",
        gap: "10px",
        padding: "15px",
        background: "#111827",
    },

    btn: {
        padding: "10px 15px",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        color: "white",
        transition: "0.2s",
    },
};