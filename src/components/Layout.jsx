import { useNavigate } from "react-router-dom";

export default function Layout({ children }) {
    const navigate = useNavigate();

    return (
        <div style={styles.wrapper}>

            {/* TOP NAVBAR */}
            <div style={styles.navbar}>
                <button style={styles.navBtn} onClick={() => navigate("/dashboard")}>
                    Home
                </button>

                <button style={styles.navBtn} onClick={() => navigate("/properties")}>
                    Properties
                </button>

                <button style={styles.navBtn} onClick={() => navigate("/profile")}>
                    Profile
                </button>
            </div>

            {/* CONTENT */}
            <div style={styles.content}>
                {children}
            </div>
        </div>
    );
}

const styles = {
    wrapper: {
        minHeight: "100vh",
        background: "#0f172a",
        color: "white",
    },

    navbar: {
        display: "flex",
        gap: "10px",
        padding: "15px",
        background: "#111827",
        justifyContent: "center",
    },

    navBtn: {
        padding: "10px 15px",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        background: "#1f2937",
        color: "white",
    },

    content: {
        padding: "30px",
    },
};