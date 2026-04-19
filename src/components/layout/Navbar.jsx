import { useState, useRef, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthProvider";
 
const ROLE_META = {
  admin: { label: "Administrator", color: "#6366f1", bg: "#eef2ff" },
  agent: { label: "Agent", color: "#0ea5e9", bg: "#f0f9ff" },
  client: { label: "Client", color: "#10b981", bg: "#ecfdf5" },
};
 
const BreadcrumbIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);
 
const MenuIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);
 
const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);
 
const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
 
const ChevronIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
 
const LogoutIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
 
const ProfileIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
 
// Merr inicalet nga fullName — "Argjend Morina" → "AM"
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
 
function useBreadcrumb() {
  if (typeof window === "undefined") return ["Dashboard"];
  const parts = window.location.pathname.split("/").filter(Boolean);
  return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1).replace(/-/g, " "));
}
 
export default function Navbar({ role = "admin", onToggleSidebar }) {
  const { user, logout } = useContext(AuthContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();
  const breadcrumb = useBreadcrumb();
 
  // Përdor rolin nga user nëse ekziston, përndryshe nga prop
  const activeRole = user?.role || role;
  const meta = ROLE_META[activeRole] || ROLE_META.admin;
 
  const displayName = user?.fullName || "—";
  const initials = getInitials(user?.fullName);
  const displayEmail = user?.email || "";
 
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
 
  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };
 
  const mockNotifications = [
    { id: 1, text: "New lead assigned to you", time: "2m ago", unread: true },
    { id: 2, text: "Contract #1042 requires signature", time: "1h ago", unread: true },
    { id: 3, text: "Maintenance request completed", time: "3h ago", unread: false },
  ];
 
  return (
    <header className="navbar">
      {/* Left */}
      <div className="navbar__left">
        <button className="navbar__menu-btn" onClick={onToggleSidebar} aria-label="Toggle sidebar">
          <MenuIcon />
        </button>
        <nav className="navbar__breadcrumb" aria-label="Breadcrumb">
          {breadcrumb.map((part, i) => (
            <span key={i} className="navbar__breadcrumb-item">
              {i > 0 && <span className="navbar__breadcrumb-sep"><BreadcrumbIcon /></span>}
              <span className={i === breadcrumb.length - 1 ? "navbar__breadcrumb-current" : "navbar__breadcrumb-link"}>
                {part}
              </span>
            </span>
          ))}
        </nav>
      </div>
 
      {/* Center search */}
      <div className={`navbar__search ${searchFocused ? "navbar__search--focused" : ""}`}>
        <SearchIcon />
        <input
          type="text"
          placeholder="Search properties, clients, contracts..."
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          className="navbar__search-input"
        />
        <span className="navbar__search-kbd">⌘K</span>
      </div>
 
      {/* Right */}
      <div className="navbar__right">
        {/* Notifications */}
        <div className="navbar__notif-wrap" ref={notifRef}>
          <button
            className="navbar__icon-btn"
            onClick={() => setNotifOpen((p) => !p)}
            aria-label="Notifications"
          >
            <BellIcon />
            <span className="navbar__notif-badge">2</span>
          </button>
 
          {notifOpen && (
            <div className="navbar__dropdown navbar__notif-panel">
              <div className="navbar__dropdown-header">
                <span>Notifications</span>
                <button className="navbar__dropdown-action">Mark all read</button>
              </div>
              {mockNotifications.map((n) => (
                <div key={n.id} className={`navbar__notif-item ${n.unread ? "navbar__notif-item--unread" : ""}`}>
                  {n.unread && <span className="navbar__notif-dot" />}
                  <div className="navbar__notif-content">
                    <p className="navbar__notif-text">{n.text}</p>
                    <span className="navbar__notif-time">{n.time}</span>
                  </div>
                </div>
              ))}
              <div className="navbar__dropdown-footer">
                <button className="navbar__dropdown-action">View all notifications</button>
              </div>
            </div>
          )}
        </div>
 
        {/* Profile */}
        <div className="navbar__profile-wrap" ref={dropdownRef}>
          <button
            className="navbar__profile-btn"
            onClick={() => setDropdownOpen((p) => !p)}
          >
            <span className="navbar__avatar" style={{ background: meta.bg, color: meta.color }}>
              {initials}
            </span>
            <span className="navbar__profile-info">
              <span className="navbar__profile-name">{displayName}</span>
              <span className="navbar__profile-role" style={{ color: meta.color }}>{meta.label}</span>
            </span>
            <ChevronIcon />
          </button>
 
          {dropdownOpen && (
            <div className="navbar__dropdown">
              <div className="navbar__dropdown-header">
                <strong>{displayName}</strong>
                <span>{displayEmail}</span>
              </div>
              <button className="navbar__dropdown-item" onClick={() => navigate(`/${activeRole}/profile`)}>
                <ProfileIcon /> My Profile
              </button>
              <button className="navbar__dropdown-item" onClick={() => navigate(`/${activeRole}/settings`)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
                Settings
              </button>
              <div className="navbar__dropdown-divider" />
              <button className="navbar__dropdown-item navbar__dropdown-item--danger" onClick={handleLogout}>
                <LogoutIcon /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
 