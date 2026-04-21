import { useContext } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthProvider";
 
const NAV_CONFIG = {
  admin: [
    {
      group: "Overview",
      items: [
        { to: "/admin/dashboard", label: "Dashboard", icon: "grid" },
        { to: "/admin/analytics", label: "Analytics", icon: "bar-chart" },
        { to: "/admin/audit-logs", label: "Audit Logs", icon: "file-text" },
      ],
    },
    {
      group: "Properties",
      items: [
        { to: "/admin/AllProperties", label: "All Properties", icon: "home" },
        { to: "/admin/sales", label: "Sales", icon: "tag" },
        { to: "/admin/rentals", label: "Rentals", icon: "key" },
      ],
    },
    {
      group: "People",
      items: [
        { to: "/admin/agents", label: "Agents", icon: "users" },
        { to: "/admin/clients", label: "Clients", icon: "user" },
        { to: "/admin/leads", label: "Leads", icon: "target" },
      ],
    },
    {
      group: "Operations",
      items: [
        { to: "/admin/contracts", label: "Contracts", icon: "file" },
        { to: "/admin/payments", label: "Payments", icon: "credit-card" },
        { to: "/admin/maintenance", label: "Maintenance", icon: "tool" },
        { to: "/admin/notifications", label: "Notifications", icon: "bell" },
      ],
    },
    {
      group: "System",
      items: [
        { to: "/admin/background-jobs", label: "Background Jobs", icon: "cpu" },
        { to: "/admin/settings", label: "Settings", icon: "settings" },
      ],
    },
  ],
 
  agent: [
    {
      group: "Overview",
      items: [
        { to: "/agent", label: "Dashboard", icon: "grid" },
        { to: "/agent/my-stats", label: "My Performance", icon: "trending-up" },
      ],
    },
    {
      group: "Listings",
      items: [
        { to: "/agent/properties", label: "Properties", icon: "home" },
        { to: "/agent/sales", label: "Sale Listings", icon: "tag" },
        { to: "/agent/rentals", label: "Rental Listings", icon: "key" },
      ],
    },
    {
      group: "Clients",
      items: [
        { to: "/agent/leads", label: "My Leads", icon: "target" },
        { to: "/agent/clients", label: "My Clients", icon: "users" },
        { to: "/agent/applications", label: "Applications", icon: "clipboard" },
      ],
    },
    {
      group: "Contracts & Finance",
      items: [
        { to: "/agent/contracts", label: "Contracts", icon: "file" },
        { to: "/agent/payments", label: "Payments", icon: "credit-card" },
        { to: "/agent/maintenance", label: "Maintenance", icon: "tool" },
      ],
    },
    {
      group: "Tools",
      items: [
        { to: "/agent/ai-assistant", label: "AI Assistant", icon: "cpu" },
        { to: "/agent/notifications", label: "Notifications", icon: "bell" },
      ],
    },
  ],
 
  client: [
    {
      group: "Explore",
      items: [
        { to: "/client/dashboard", label: "Home", icon: "grid" },
        { to: "/client/browseproperties", label: "Browse Properties", icon: "search" },
        { to: "/client/saved", label: "Saved Properties", icon: "heart" },
      ],
    },
    {
      group: "My Activity",
      items: [
        { to: "/client/myapplications", label: "My Applications", icon: "clipboard" },
        { to: "/client/mycontracts", label: "My Contracts", icon: "file" },
        { to: "/client/mypayments", label: "My Payments", icon: "credit-card" },

      ],
    },
    {
      group: "Support",
      items: [
        { to: "/client/maintenance", label: "Maintenance Requests", icon: "tool" },
        { to: "/client/ai-assistant", label: "AI Assistant", icon: "cpu" },
        { to: "/client/notifications", label: "Notifications", icon: "bell" },
      ],
    },
  ],
};
 
const ROLE_META = {
  admin: { label: "Administrator", color: "#6366f1", bg: "#eef2ff" },
  agent: { label: "Agent", color: "#0ea5e9", bg: "#f0f9ff" },
  client: { label: "Client", color: "#10b981", bg: "#ecfdf5" },
};
 
function getInitials(fullName) {
  if (!fullName) return "??";
  return fullName
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}
 
const Icon = ({ name, size = 16 }) => {
  const icons = {
    grid: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
    home: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
    tag: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
      </svg>
    ),
    key: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="7.5" cy="15.5" r="5.5"/><path d="M21 2 10.58 12.42M13 7l3 3M18 2l3 3-6 6-3-3"/>
      </svg>
    ),
    users: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    user: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
    target: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
      </svg>
    ),
    file: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
      </svg>
    ),
    "credit-card": (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
    tool: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
      </svg>
    ),
    bell: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
    ),
    cpu: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/>
        <line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/>
        <line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/>
        <line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/>
        <line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>
      </svg>
    ),
    settings: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    ),
    "bar-chart": (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>
      </svg>
    ),
    "file-text": (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
    "trending-up": (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
      </svg>
    ),
    clipboard: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
      </svg>
    ),
    search: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    ),
    heart: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
    "chevron-left": (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6"/>
      </svg>
    ),
    building: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2"/><line x1="9" y1="22" x2="9" y2="16"/>
        <line x1="15" y1="22" x2="15" y2="16"/><rect x="9" y="16" width="6" height="6"/>
        <line x1="9" y1="7" x2="9.01" y2="7"/><line x1="15" y1="7" x2="15.01" y2="7"/>
        <line x1="9" y1="11" x2="9.01" y2="11"/><line x1="15" y1="11" x2="15.01" y2="11"/>
      </svg>
    ),
  };
  return icons[name] || null;
};
 
export default function Sidebar({ role = "admin", collapsed = false }) {
  const { user } = useContext(AuthContext);
  const location = useLocation();
 
  // Roli aktiv: prefero atë nga user, përndryshe nga prop
  const activeRole = user?.role || role;
  const nav = NAV_CONFIG[activeRole] || NAV_CONFIG.admin;
  const meta = ROLE_META[activeRole] || ROLE_META.admin;
 
  const displayName = user?.fullName || "—";
  const initials = getInitials(user?.fullName);
 
  return (
    <aside className={`sidebar ${collapsed ? "sidebar--collapsed" : ""}`}>
      {/* Logo */}
      <div className="sidebar__brand">
        <div className="sidebar__logo">
          <Icon name="building" size={20} />
        </div>
        {!collapsed && (
          <div className="sidebar__brand-text">
            <span className="sidebar__brand-name">PropManager</span>
            <span className="sidebar__role-badge" style={{ background: meta.bg, color: meta.color }}>
              {meta.label}
            </span>
          </div>
        )}
      </div>
 
      {/* Nav */}
      <nav className="sidebar__nav">
        {nav.map((group) => (
          <div key={group.group} className="sidebar__group">
            {!collapsed && (
              <span className="sidebar__group-label">{group.group}</span>
            )}
            {group.items.map((item) => {
              const active =
                location.pathname === item.to ||
                location.pathname.startsWith(item.to + "/");
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`sidebar__link ${active ? "sidebar__link--active" : ""}`}
                  title={collapsed ? item.label : undefined}
                >
                  <span className="sidebar__link-icon">
                    <Icon name={item.icon} size={16} />
                  </span>
                  {!collapsed && (
                    <span className="sidebar__link-label">{item.label}</span>
                  )}
                  {active && !collapsed && <span className="sidebar__link-dot" />}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>
 
      {/* User footer */}
      {!collapsed && (
        <div className="sidebar__footer">
          <div className="sidebar__avatar" style={{ background: meta.bg, color: meta.color }}>
            {initials}
          </div>
          <div className="sidebar__user-info">
            <span className="sidebar__user-name">{displayName}</span>
            <span className="sidebar__user-role">{meta.label}</span>
          </div>
        </div>
      )}
    </aside>
  );
}
 