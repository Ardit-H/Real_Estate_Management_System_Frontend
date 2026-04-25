import { Routes, Route } from "react-router-dom";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AgentDashboard from "../pages/agent/AgentDashboard";
import ClientDashboard from "../pages/client/ClientDashboard";
import PropertiesList from "../pages/shared/PropertiesList";
import AdminProperties from "../pages/admin/AllProperties";
import ClientPropeties from "../pages/client/BrowseProperties";
import AgentProperties from "../pages/agent/Properties";
import SalesAdminModule from "../pages/admin/AdminSales";
import AdminRentals from "../pages/admin/Rentals";
import AdminRentalApplications from "../pages/admin/RentalApplications";
import AdminContracts from "../pages/admin/Contracts";
import AdminPayments from "../pages/admin/Payments";

import AgentSales from "../pages/agent/AgentSales";
import AgentProfile from "../pages/agent/AgentProfile";
import AgentLeads from "../pages/agent/AgentLeads";
import ClientLeads from "../pages/client/ClientLeads";
import AdminLeads from "../pages/admin/AdminLeads";
import AgentRentalApplications from "../pages/agent/RentalApplications";
import AgentRentals from "../pages/agent/Rentals";
import AgentPayments from "../pages/agent/Payments";
import AgentContracts from "../pages/agent/Contracts";

import ClientContrats from "../pages/client/MyContracts";
import ClientPayments from "../pages/client/MyPayments";
import ClientApplications from "../pages/client/MyApplications";

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
    <Route path="/client/myapplications" element={<ClientLeads/>}/>
    
    


    {/* ROLE DASHBOARDS */}
    <Route path="/admin" element={<AdminDashboard />} />
    <Route path="/admin/allproperties" element={<AdminProperties/>} />
    <Route path="/admin/sales" element={<SalesAdminModule/>} />
    <Route path="/admin/rentals" element={<AdminRentals/>} />
    <Route path="/admin/applications" element={<AdminRentalApplications/>} />
    <Route path="/admin/contracts" element={<AdminContracts/>} />
    <Route path="/admin/payments" element={<AdminPayments/>} />
    
    <Route path="/agent" element={<AgentDashboard />} />
    <Route path="/client" element={<ClientDashboard />} />

    {/* PUBLIC / AGENT */}
     <Route path="/agent/properties" element={<AgentProperties />} />
    <Route path="/agent/sales" element={<AgentSales />} />

    <Route path="/agent/profile" element={<AgentProfile />} />
    <Route path="/agent/leads" element={<AgentLeads />} />
    <Route path="/agent/rentals" element={<AgentRentals />} />
    <Route path="/agent/applications" element={<AgentRentalApplications />} />
    <Route path="/agent/payments" element={<AgentPayments />} />
    <Route path="/agent/contracts" element={<AgentContracts />} />
    <Route path="/client/leads" element={<ClientLeads />} />
    <Route path="/admin/leads"  element={<AdminLeads />} />
</Routes>
    );
}