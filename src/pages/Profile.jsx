import { useAuth } from "../context/useAuth.jsx";
import { useNavigate } from "react-router-dom";

export default function Profile() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div>
            <h1>Profile</h1>

            <p>Username: {user?.username}</p>
            <p>Role: {user?.role}</p>

            <button style={styles.logout} onClick={handleLogout}>
                Logout
            </button>
        </div>
    );
}

const styles = {
    logout: {
        marginTop: "30px",
        padding: "12px 20px",
        border: "none",
        borderRadius: "8px",
        background: "#ef4444",
        color: "white",
        cursor: "pointer",
    },
};