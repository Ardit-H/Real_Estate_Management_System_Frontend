import { useContext } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthProvider";
import "./sidebar.css";

const NAV_CONFIG = {
  admin: [
    { group: "Overview", items: [
      { to: "/admin",       label: "Dashboard",        emoji: "◼" },
    ]},
    { group: "Properties", items: [
      { to: "/admin/AllProperties",   label: "All Properties",   emoji: "🏢" },
      { to: "/admin/sales",           label: "Sales",            emoji: "💰" },
      { to: "/admin/rentals",         label: "Rentals",          emoji: "🔑" },
      { to: "/admin/applications", label: "Rental Applications", emoji: "📋" },
    ]},
    { group: "People", items: [
      { to: "/admin/agents",          label: "Agents",           emoji: "🤝" },
      { to: "/admin/clients",         label: "Clients",          emoji: "👤" },
      { to: "/admin/leads",           label: "Leads",            emoji: "🎯" },
    ]},
    { group: "Operations", items: [
      { to: "/admin/contracts",       label: "Contracts",        emoji: "📄" },
      { to: "/admin/payments",        label: "Payments",         emoji: "💳" },
      { to: "/admin/maintenance",     label: "Maintenance",      emoji: "🔧" },
      { to: "/admin/notifications",   label: "Notifications",    emoji: "🔔" },
    ]},
    { group: "System", items: [
      { to: "/admin/background-jobs", label: "Background Jobs",  emoji: "⚙️" },
      { to: "/admin/ai/agents", label: "AI Agent Analysis", emoji: "🤖" },
    ]},
  ],
  agent: [
    { group: "Overview", items: [
      { to: "/agent",                 label: "Dashboard",        emoji: "◼" },
      { to: "/agent/my-stats",        label: "My Performance",   emoji: "📈" },
    ]},
    { group: "Listings", items: [
      { to: "/agent/properties",      label: "Properties",       emoji: "🏢" },
      { to: "/agent/sales",           label: "Sale Listings",    emoji: "💰" },
      { to: "/agent/rentals",         label: "Rental Listings",  emoji: "🔑" },
    ]},
    { group: "Clients", items: [
      { to: "/agent/leads",           label: "My Leads",         emoji: "🎯" },
      { to: "/agent/clients",         label: "My Clients",       emoji: "👥" },
      { to: "/agent/applications",    label: "Rental Applications",     emoji: "📋" },
      { to: "/agent/sale-applications",    label: "Sale Applications",     emoji: "📋" },
    ]},
    { group: "Finance", items: [
      { to: "/agent/contracts",       label: "Contracts",        emoji: "📄" },
      { to: "/agent/payments",        label: "Payments",         emoji: "💳" },
      { to: "/agent/maintenance",     label: "Maintenance",      emoji: "🔧" },
    ]},
    { group: "Tools", items: [
      { to: "/agent/notifications",   label: "Notifications",    emoji: "🔔" },
    ]},
  ],
  client: [
    { group: "Explore", items: [
      { to: "/client/clientdashboard",        label: "Home",          emoji: "◼" },
      { to: "/client/browseproperties", label: "Browse Properties",  emoji: "🔍" },
      { to: "/client/savedproperties",  label: "Saved Properties",   emoji: "❤️" },
      { to: "/client/agents", label: "Our Agents", emoji: "🤝" },
    ]},
    { group: "My Activity", items: [
      { to: "/client/myapplications",   label: "My Requests",    emoji: "📋" },
      { to: "/client/mycontracts",      label: "My Contracts",       emoji: "📄" },
      { to: "/client/mypayments",       label: "My Payments",        emoji: "💳" },
      { to: "/client/mysalecontracts", label: "My Purchases",     emoji: "🏠" },
      { to: "/client/mysalepayments",  label: "Purchase Payments", emoji: "💰" },
    ]},
    { group: "Support", items: [
      { to: "/client/maintenance",      label: "Maintenance",        emoji: "🔧" },
      { to: "/client/notifications",    label: "Notifications",      emoji: "🔔" },
    ]},
  ],
};

const ROLE_META = {
  admin:  { label: "Administrator", accent: "#c9b87a", tag: "Admin"  },
  agent:  { label: "Agent",         accent: "#7eb8a4", tag: "Agent"  },
  client: { label: "Client",        accent: "#a4c4b0", tag: "Client" },
};

function getInitials(name) {
  if (!name) return "?";
  return name.trim().split(" ").filter(Boolean).slice(0,2).map(w=>w[0].toUpperCase()).join("");
}

export default function Sidebar({ role = "admin", collapsed = false }) {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const activeRole  = user?.role || role;
  const nav         = NAV_CONFIG[activeRole] || NAV_CONFIG.admin;
  const meta        = ROLE_META[activeRole]  || ROLE_META.admin;
  const displayName = user?.fullName || "—";
  const initials    = getInitials(user?.fullName);

  // Apply CSS variables based on collapsed state
  const sidebarStyle = {
    "--sb-width": collapsed ? "58px" : "218px",
    "--sb-brand-padding": collapsed ? "18px 0" : "17px 15px",
    "--sb-brand-justify": collapsed ? "center" : "flex-start",
    "--sb-link-justify": collapsed ? "center" : "flex-start",
  };

  return (
    <aside className="sb" style={sidebarStyle}>
      <div className="sb-top-bar"/>
      <div className="sb-body">

        <div className="sb-brand">
          <div className="sb-logo-box">🏡</div>
          {!collapsed && (
            <div>
              <div className="sb-brand-name">PropManager</div>
              <div className="sb-role-tag" style={{color:meta.accent,marginTop:3}}>{meta.tag}</div>
            </div>
          )}
        </div>

        <nav className="sb-nav">
          {nav.map(group => (
            <div key={group.group} className="sb-group">
              {!collapsed && <span className="sb-group-label">{group.group}</span>}
              {group.items.map(item => {
                const active = location.pathname===item.to || location.pathname.startsWith(item.to+"/");
                return (
                  <NavLink key={item.to} to={item.to} title={collapsed?item.label:undefined}
                    className={`sb-link${active?" active":""}`}>
                    <span className="sb-em">{item.emoji}</span>
                    {!collapsed && <span className="sb-lbl">{item.label}</span>}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {!collapsed && (
          <div className="sb-footer">
            <div className="sb-avatar">{initials}</div>
            <div style={{flex:1,minWidth:0}}>
              <span className="sb-uname">{displayName}</span>
              <span className="sb-urole">{meta.label}</span>
            </div>
            {logout && <button className="sb-logout" onClick={logout} title="Sign out">🚪</button>}
          </div>
        )}

      </div>
    </aside>
  );
}