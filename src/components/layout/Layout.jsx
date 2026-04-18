import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import "./layout.css";

export default function Layout({ children, role = "admin" }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className={`layout-root ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <Sidebar role={role} collapsed={sidebarCollapsed} />
      <div className="layout-body">
        <Navbar
          role={role}
          onToggleSidebar={() => setSidebarCollapsed((p) => !p)}
        />
        <main className="layout-main">{children}</main>
      </div>
    </div>
  );
}
