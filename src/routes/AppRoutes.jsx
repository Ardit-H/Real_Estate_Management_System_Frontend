import { Routes, Route } from "react-router-dom";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AgentDashboard from "../pages/agent/AgentDashboard";
import ClientDashboard from "../pages/client/ClientDashboard";
import PropertiesList from "../pages/shared/PropertiesList";
import ClientPropeties from "../pages/client/BrowseProperties";
import AgentProperties from "../pages/agent/Properties";
import AgentPropeties from "../pages/agent/Properties";

import AgentSales from "../pages/agent/AgentSales";
import AgentProfile from "../pages/agent/AgentProfile";
import AgentLeads from "../pages/agent/AgentLeads";

export default function AppRoutes() {
    return (
<Routes>
    {/* AUTH */}
    <Route path="/" element={<Login />} />
    <Route path="/register" element={<Register />} />

    {/* PUBLIC / CLIENT */}
    <Route path="/client/properties" element={<PropertiesList />} />
    <Route path="/client/browseproperties" element={<ClientPropeties />} />

    {/* ROLE DASHBOARDS */}
    <Route path="/admin" element={<AdminDashboard />} />
    
    <Route path="/agent" element={<AgentDashboard />} />
    <Route path="/client" element={<ClientDashboard />} />

    {/* PUBLIC / AGENT */}
     <Route path="/agent/properties" element={<AgentPropeties />} />
    <Route path="/agent/sales" element={<AgentSales />} />

    <Route path="/agent/profile"     element={<AgentProfile />} />
<Route path="/agent/leads"       element={<AgentLeads />} />
</Routes>
    );
}