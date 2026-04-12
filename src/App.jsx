import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/useAuth.jsx";

import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Properties from "./pages/Properties.jsx";
import Profile from "./pages/Profile.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import Layout from "./components/Layout.jsx";

export default function App() {
    const { isAuthenticated } = useAuth();

    return (
        <Routes>

            {/* ROOT REDIRECT */}
            <Route
                path="/"
                element={
                    isAuthenticated ? (
                        <Navigate to="/dashboard" />
                    ) : (
                        <Navigate to="/login" />
                    )
                }
            />

            {/* PUBLIC */}
            <Route path="/login" element={<Login />} />

            {/* PROTECTED ROUTES */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <Dashboard />
                        </Layout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/profile"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <Profile />
                        </Layout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/properties"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <Properties />
                        </Layout>
                    </ProtectedRoute>
                }
            />

        </Routes>
    );
}