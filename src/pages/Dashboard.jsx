import { useAuth } from "../context/useAuth.jsx";

export default function Dashboard() {
    const { user } = useAuth();

    return (
        <div>
            <h1>Dashboard</h1>
            {/* fullName nga backend, username si fallback */}
            <p>Welcome {user?.fullName || user?.username}</p>
        </div>
    );
}
