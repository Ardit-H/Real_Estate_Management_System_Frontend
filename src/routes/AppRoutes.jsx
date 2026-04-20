import { Routes, Route } from "react-router-dom";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AgentDashboard from "../pages/agent/AgentDashboard";
import ClientDashboard from "../pages/client/ClientDashboard";
import PropertiesList from "../pages/shared/PropertiesList";
import ClientPropeties from "../pages/client/BrowseProperties";
import ClientContrats from "../pages/client/MyContracts";
import ClientPayments from "../pages/client/MyPayments";

export default function AppRoutes() {
    return (
<Routes>
    {/* AUTH */}
    <Route path="/" element={<Login />} />
    <Route path="/register" element={<Register />} />

    {/* PUBLIC / CLIENT */}
    <Route path="/client/properties" element={<PropertiesList />} />
    <Route path="/client/browseproperties" element={<ClientPropeties />} />
    <Route path="/client/mycontracts" element={<ClientContrats/>}/>
    <Route path="/client/mypayments" element={<ClientPayments/>}/>

    {/* ROLE DASHBOARDS */}
    <Route path="/admin" element={<AdminDashboard />} />
    
    <Route path="/agent" element={<AgentDashboard />} />
    <Route path="/client" element={<ClientDashboard />} />
</Routes>
    );
}