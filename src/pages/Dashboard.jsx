import { useAuth } from "../context/useAuth.jsx";

export default function Dashboard() {
    const { user } = useAuth();

    return (
        <div>
            <h1>Dashboard</h1>
            <p>Welcome {user?.username}</p>
        </div>
    );
}