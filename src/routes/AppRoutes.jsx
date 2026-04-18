import { Routes, Route } from "react-router-dom";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AgentDashboard from "../pages/agent/AgentDashboard";
import ClientDashboard from "../pages/client/ClientDashboard";
import PropertiesList from "../pages/shared/PropertiesList";
import AdminProperties from "../pages/admin/AllProperties";



export default function AppRoutes() {
    return (
<Routes>
    {/* AUTH */}
    <Route path="/" element={<Login />} />
    <Route path="/register" element={<Register />} />

    {/* PUBLIC / CLIENT */}
    <Route path="/client/properties" element={<PropertiesList />} />

    {/* ROLE DASHBOARDS */}
    <Route path="/admin" element={<AdminDashboard />} />
    <Route path="/admin/allproperties" element={<AdminProperties/>} />
    
    <Route path="/agent" element={<AgentDashboard />} />
    <Route path="/client" element={<ClientDashboard />} />
</Routes>
    );
}