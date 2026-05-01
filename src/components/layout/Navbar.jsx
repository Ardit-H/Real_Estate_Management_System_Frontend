import { useState, useRef, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthProvider";
import api from "../../api/axios";

// ─── Constants ────────────────────────────────────────────────────────────────
const C = {
  dark:    "#1a1714",
  dark2:   "#211d19",
  dark3:   "#2a2420",
  gold:    "#c9b87a",
  goldL:   "#e8d9a0",
  goldD:   "#8a7d5e",
  border:  "rgba(201,184,122,0.14)",
  borderL: "rgba(201,184,122,0.08)",
  text:    "#f5f0e8",
  textSub: "rgba(245,240,232,0.55)",
  textMut: "rgba(245,240,232,0.28)",
  surface: "rgba(255,255,255,0.03)",
  hover:   "rgba(201,184,122,0.07)",
};

const ROLE_META = {
  admin:  { label: "Administrator", color: "#a78bfa", bg: "rgba(167,139,250,0.15)", dot: "#a78bfa" },
  agent:  { label: "Agent",         color: "#38bdf8", bg: "rgba(56,189,248,0.15)",  dot: "#38bdf8" },
  client: { label: "Client",        color: "#34d399", bg: "rgba(52,211,153,0.15)",  dot: "#34d399" },
};

const TYPE_CFG = {
  INFO:     { icon: "ℹ️",  color: "#60a5fa" },
  SUCCESS:  { icon: "✅",  color: "#34d399" },
  WARNING:  { icon: "⚠️",  color: "#fbbf24" },
  ERROR:    { icon: "❌",  color: "#f87171" },
  REMINDER: { icon: "🔔",  color: "#c084fc" },
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  .nb-root * { box-sizing: border-box; }
  .nb-root {
    position: sticky; top: 0; z-index: 200;
    width: 100%;
    background: rgba(22,18,15,0.92);
    backdrop-filter: blur(20px) saturate(160%);
    -webkit-backdrop-filter: blur(20px) saturate(160%);
    border-bottom: 1px solid rgba(201,184,122,0.12);
    font-family: 'DM Sans', system-ui, sans-serif;
    box-shadow: 0 4px 32px rgba(0,0,0,0.36);
  }

  .nb-inner {
    display: flex; align-items: center;
    padding: 0 24px; height: 58px; gap: 16px;
  }

  /* Menu button */
  .nb-menu-btn {
    width: 34px; height: 34px; border-radius: 9px;
    border: 1px solid rgba(201,184,122,0.12);
    background: rgba(255,255,255,0.03);
    color: rgba(245,240,232,0.5);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all 0.17s ease; flex-shrink: 0;
  }
  .nb-menu-btn:hover { background: rgba(201,184,122,0.08); color: #c9b87a; border-color: rgba(201,184,122,0.22); }

  /* Breadcrumb */
  .nb-breadcrumb {
    display: flex; align-items: center; gap: 4px;
    flex-shrink: 0;
  }
  .nb-bc-item { display: flex; align-items: center; gap: 4px; }
  .nb-bc-sep  { color: rgba(245,240,232,0.2); display: flex; }
  .nb-bc-link { font-size: 12px; color: rgba(245,240,232,0.35); font-weight: 400; }
  .nb-bc-current {
    font-size: 12.5px; color: rgba(245,240,232,0.75); font-weight: 500;
    font-family: 'Cormorant Garamond', serif;
  }

  /* Search */
  .nb-search {
    flex: 1; max-width: 380px; margin: 0 auto;
    display: flex; align-items: center; gap: 8px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(201,184,122,0.10);
    border-radius: 10px; padding: 0 12px; height: 36px;
    transition: all 0.2s ease;
  }
  .nb-search:focus-within {
    background: rgba(255,255,255,0.06);
    border-color: rgba(201,184,122,0.28);
    box-shadow: 0 0 0 3px rgba(201,184,122,0.07);
  }
  .nb-search-icon { color: rgba(245,240,232,0.22); flex-shrink: 0; }
  .nb-search input {
    flex: 1; border: none; background: transparent; outline: none;
    font-size: 13px; color: rgba(245,240,232,0.7);
    font-family: 'DM Sans', sans-serif;
  }
  .nb-search input::placeholder { color: rgba(245,240,232,0.22); }
  .nb-search-kbd {
    font-size: 10px; color: rgba(245,240,232,0.2);
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 5px; padding: 2px 6px; flex-shrink: 0; font-family: monospace;
  }

  /* Right zone */
  .nb-right { display: flex; align-items: center; gap: 8px; margin-left: auto; }

  /* Icon button */
  .nb-icon-btn {
    position: relative;
    width: 36px; height: 36px; border-radius: 10px;
    border: 1px solid rgba(201,184,122,0.10);
    background: rgba(255,255,255,0.03);
    color: rgba(245,240,232,0.45);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all 0.17s ease;
  }
  .nb-icon-btn:hover { background: rgba(201,184,122,0.08); color: #c9b87a; border-color: rgba(201,184,122,0.2); }

  /* Badge */
  .nb-badge {
    position: absolute; top: -4px; right: -4px;
    min-width: 18px; height: 18px; padding: 0 4px;
    background: linear-gradient(135deg, #dc2626, #b91c1c);
    color: #fff; border-radius: 20px;
    font-size: 9.5px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    border: 2px solid #16120f;
    font-family: 'DM Sans', sans-serif;
    animation: nb-badge-pop 0.3s cubic-bezier(0.34,1.56,0.64,1);
  }
  @keyframes nb-badge-pop { from{transform:scale(0)} to{transform:scale(1)} }

  /* Dropdown */
  .nb-dropdown {
    position: absolute; top: calc(100% + 10px); right: 0;
    width: 300px;
    background: #1e1a16;
    border: 1px solid rgba(201,184,122,0.14);
    border-radius: 14px;
    box-shadow: 0 24px 64px rgba(0,0,0,0.55), 0 0 0 1px rgba(0,0,0,0.2);
    overflow: hidden;
    animation: nb-drop 0.2s cubic-bezier(0.16,1,0.3,1);
    z-index: 300;
  }
  @keyframes nb-drop { from{opacity:0;transform:translateY(-8px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }

  .nb-drop-header {
    padding: 14px 16px 12px;
    border-bottom: 1px solid rgba(201,184,122,0.08);
    background: rgba(255,255,255,0.02);
  }
  .nb-drop-header-row {
    display: flex; align-items: center; justify-content: space-between;
  }
  .nb-drop-title {
    font-size: 12px; font-weight: 600;
    color: rgba(245,240,232,0.5);
    text-transform: uppercase; letter-spacing: 0.8px;
  }
  .nb-drop-action {
    font-size: 11.5px; color: #c9b87a; background: none; border: none;
    cursor: pointer; font-family: 'DM Sans', sans-serif; font-weight: 500;
    transition: opacity 0.15s; padding: 0;
  }
  .nb-drop-action:hover { opacity: 0.7; }

  /* Notification items */
  .nb-notif-item {
    display: flex; align-items: flex-start; gap: 11px;
    padding: 12px 16px;
    border-bottom: 1px solid rgba(201,184,122,0.06);
    cursor: pointer; transition: background 0.15s;
  }
  .nb-notif-item:hover { background: rgba(201,184,122,0.05); }
  .nb-notif-item:last-child { border-bottom: none; }
  .nb-notif-item.unread { background: rgba(201,184,122,0.04); border-left: 2px solid rgba(201,184,122,0.35); }
  .nb-notif-item.unread:hover { background: rgba(201,184,122,0.08); }

  .nb-notif-icon {
    width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center; font-size: 15px;
    background: rgba(255,255,255,0.05); margin-top: 1px;
  }
  .nb-notif-dot {
    width: 6px; height: 6px; border-radius: 50%; background: #c9b87a;
    flex-shrink: 0; margin-top: 6px;
  }
  .nb-notif-title  { font-size: 13px; font-weight: 500; color: rgba(245,240,232,0.85); margin: 0 0 3px; line-height: 1.4; }
  .nb-notif-msg    { font-size: 11.5px; color: rgba(245,240,232,0.38); margin: 0 0 4px; line-height: 1.5; }
  .nb-notif-time   { font-size: 11px; color: rgba(201,184,122,0.5); }

  .nb-drop-footer {
    padding: 10px 16px;
    border-top: 1px solid rgba(201,184,122,0.08);
    background: rgba(255,255,255,0.01);
    text-align: center;
  }
  .nb-view-all {
    font-size: 12.5px; font-weight: 500; color: #c9b87a;
    background: none; border: none; cursor: pointer;
    font-family: 'DM Sans', sans-serif; transition: opacity 0.15s;
    width: 100%; padding: 4px 0;
  }
  .nb-view-all:hover { opacity: 0.7; }

  /* Loading / Empty */
  .nb-notif-empty {
    padding: 28px 16px; text-align: center;
    color: rgba(245,240,232,0.28); font-size: 13px;
  }
  .nb-notif-empty .icon { font-size: 28px; margin-bottom: 8px; }

  /* Profile button */
  .nb-profile-btn {
    display: flex; align-items: center; gap: 9px;
    padding: 5px 10px 5px 5px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(201,184,122,0.12);
    border-radius: 11px; cursor: pointer; transition: all 0.17s ease;
  }
  .nb-profile-btn:hover { background: rgba(201,184,122,0.07); border-color: rgba(201,184,122,0.22); }

  .nb-avatar {
    width: 30px; height: 30px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 11.5px; font-weight: 700;
    background: linear-gradient(135deg, #c9b87a22, #c9b87a44);
    border: 1px solid rgba(201,184,122,0.25);
    color: #c9b87a; flex-shrink: 0;
    font-family: 'DM Sans', sans-serif; letter-spacing: 0.3px;
  }
  .nb-profile-info { display: flex; flex-direction: column; align-items: flex-start; min-width: 0; }
  .nb-profile-name { font-size: 13px; font-weight: 500; color: rgba(245,240,232,0.82); white-space: nowrap; max-width: 120px; overflow: hidden; text-overflow: ellipsis; }
  .nb-profile-role { font-size: 10.5px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
  .nb-chevron      { color: rgba(245,240,232,0.25); display: flex; }

  /* Profile dropdown */
  .nb-profile-dropdown { width: 240px; }
  .nb-profile-meta     { padding: 14px 16px 12px; border-bottom: 1px solid rgba(201,184,122,0.08); background: rgba(255,255,255,0.02); }
  .nb-profile-meta-name  { font-size: 14px; font-weight: 700; color: rgba(245,240,232,0.88); margin: 0 0 3px; font-family: 'Cormorant Garamond', serif; }
  .nb-profile-meta-email { font-size: 11.5px; color: rgba(245,240,232,0.35); margin: 0; }

  .nb-menu-item {
    display: flex; align-items: center; gap: 9px;
    padding: 10px 16px; width: 100%;
    background: none; border: none; cursor: pointer;
    font-size: 13px; color: rgba(245,240,232,0.6);
    font-family: 'DM Sans', sans-serif; font-weight: 400;
    transition: all 0.15s; text-align: left;
  }
  .nb-menu-item:hover { background: rgba(201,184,122,0.06); color: rgba(245,240,232,0.88); }
  .nb-menu-item svg   { flex-shrink: 0; color: rgba(245,240,232,0.3); }
  .nb-menu-item:hover svg { color: #c9b87a; }
  .nb-menu-item.danger { color: rgba(248,113,113,0.7); }
  .nb-menu-item.danger:hover { background: rgba(220,38,38,0.08); color: #f87171; }
  .nb-menu-item.danger svg { color: rgba(248,113,113,0.4); }
  .nb-menu-item.danger:hover svg { color: #f87171; }

  .nb-divider { height: 1px; background: rgba(201,184,122,0.08); margin: 4px 0; }

  /* Spinner */
  @keyframes nb-spin { to { transform: rotate(360deg); } }
  .nb-spinner {
    width: 18px; height: 18px; margin: 0 auto;
    border: 2px solid rgba(201,184,122,0.15);
    border-top-color: #c9b87a;
    border-radius: 50%; animation: nb-spin 0.7s linear infinite;
  }

  /* Role dot */
  .nb-role-dot {
    width: 6px; height: 6px; border-radius: 50%;
    display: inline-block; margin-right: 5px;
  }
`;

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const BreadcrumbIcon = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>);
const MenuIcon       = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>);
const BellIcon       = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>);
const SearchIcon     = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>);
const ChevronIcon    = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>);
const LogoutIcon     = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>);
const ProfileIcon    = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>);
const SettingsIcon   = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>);

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getInitials(n) {
  if (!n) return "??";
  return n.trim().split(" ").filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join("");
}

function useBreadcrumb() {
  if (typeof window === "undefined") return ["Dashboard"];
  return window.location.pathname.split("/").filter(Boolean)
    .map(p => p.charAt(0).toUpperCase() + p.slice(1).replace(/-/g, " "));
}

const fmtRel = (d) => {
  if (!d) return "";
  const diff  = Date.now() - new Date(d).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return "Just now";
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

// ═══════════════════════════════════════════════════════════════════════════════
export default function Navbar({ role = "admin", onToggleSidebar }) {
  const { user, logout } = useContext(AuthContext);
  const [dropdownOpen, setDropdownOpen]   = useState(false);
  const [notifOpen, setNotifOpen]         = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [notifLoading, setNotifLoading]   = useState(false);

  const dropdownRef = useRef(null);
  const notifRef    = useRef(null);
  const navigate    = useNavigate();
  const breadcrumb  = useBreadcrumb();

  const activeRole   = (user?.role?.toLowerCase()) || role;
  const meta         = ROLE_META[activeRole] || ROLE_META.admin;
  const displayName  = user?.fullName || "—";
  const initials     = getInitials(user?.fullName);
  const displayEmail = user?.email || "";

  // ── Fetch unread count ────────────────────────────────────
  const fetchUnreadCount = useCallback(async () => {
    try {
      const r = await api.get("/api/notifications/unread/count");
      setUnreadCount(r.data.unread_count ?? 0);
    } catch {}
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    const iv = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(iv);
  }, [fetchUnreadCount]);

  // ── Fetch unread list (kur hapet panel) ──────────────────
  const fetchUnread = useCallback(async () => {
    setNotifLoading(true);
    try {
      const r = await api.get("/api/notifications/unread");
      setNotifications(Array.isArray(r.data) ? r.data.slice(0, 5) : []);
    } catch {}
    finally { setNotifLoading(false); }
  }, []);

  useEffect(() => { if (notifOpen) fetchUnread(); }, [notifOpen, fetchUnread]);

  // ── Outside click ─────────────────────────────────────────
  useEffect(() => {
    const h = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
      if (notifRef.current    && !notifRef.current.contains(e.target))    setNotifOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleMarkOne = async (id) => {
    try {
      await api.patch(`/api/notifications/${id}/read`);
      setNotifications(p => p.filter(n => n.id !== id));
      setUnreadCount(c => Math.max(0, c - 1));
    } catch {}
  };

  const handleMarkAll = async () => {
    try {
      await api.patch("/api/notifications/read-all");
      setNotifications([]); setUnreadCount(0);
    } catch {}
  };

  const goNotifs = () => { setNotifOpen(false); setDropdownOpen(false); navigate(`/${activeRole}/notifications`); };
  const handleLogout = async () => { await logout(); };

  return (
    <>
      <style>{CSS}</style>
      <header className="nb-root">
        {/* Gold top line accent */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: `linear-gradient(90deg,transparent,${C.gold}50 30%,${C.gold}50 70%,transparent)`, pointerEvents: "none" }} />

        <div className="nb-inner">

          {/* ── LEFT ── */}
          <button className="nb-menu-btn" onClick={onToggleSidebar} aria-label="Toggle sidebar">
            <MenuIcon />
          </button>

          <nav className="nb-breadcrumb">
            {breadcrumb.map((part, i) => (
              <span key={i} className="nb-bc-item">
                {i > 0 && <span className="nb-bc-sep"><BreadcrumbIcon /></span>}
                <span className={i === breadcrumb.length - 1 ? "nb-bc-current" : "nb-bc-link"}>{part}</span>
              </span>
            ))}
          </nav>

          {/* ── SEARCH ── */}
          <div className="nb-search">
            <span className="nb-search-icon"><SearchIcon /></span>
            <input
              type="text"
              placeholder="Search properties, clients, contracts..."
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            <span className="nb-search-kbd">⌘K</span>
          </div>

          {/* ── RIGHT ── */}
          <div className="nb-right">

            {/* Notifications bell */}
            <div style={{ position: "relative" }} ref={notifRef}>
              <button className="nb-icon-btn" onClick={() => setNotifOpen(p => !p)} aria-label="Notifications">
                <BellIcon />
                {unreadCount > 0 && (
                  <span className="nb-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
                )}
              </button>

              {notifOpen && (
                <div className="nb-dropdown" style={{ width: 320 }}>
                  {/* Header */}
                  <div className="nb-drop-header">
                    <div className="nb-drop-header-row">
                      <span className="nb-drop-title">
                        Notifications
                        {unreadCount > 0 && (
                          <span style={{ marginLeft: 6, background: "rgba(220,38,38,0.2)", color: "#f87171", padding: "1px 6px", borderRadius: 20, fontSize: 10, fontWeight: 700 }}>
                            {unreadCount} new
                          </span>
                        )}
                      </span>
                      {unreadCount > 0 && (
                        <button className="nb-drop-action" onClick={handleMarkAll}>Mark all read</button>
                      )}
                    </div>
                  </div>

                  {/* Items */}
                  {notifLoading ? (
                    <div className="nb-notif-empty">
                      <div className="nb-spinner" />
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="nb-notif-empty">
                      <div className="icon">✨</div>
                      You're all caught up!
                    </div>
                  ) : (
                    <div style={{ maxHeight: 280, overflowY: "auto" }}>
                      {notifications.map(n => {
                        const tc = TYPE_CFG[n.type] || TYPE_CFG.INFO;
                        return (
                          <div key={n.id} className="nb-notif-item unread"
                            onClick={() => { handleMarkOne(n.id); if (n.action_url) navigate(n.action_url); }}>
                            <div className="nb-notif-icon" style={{ background: `${tc.color}18` }}>
                              {tc.icon}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p className="nb-notif-title">{n.title}</p>
                              {n.message && (
                                <p className="nb-notif-msg">
                                  {n.message.length > 55 ? n.message.slice(0, 55) + "…" : n.message}
                                </p>
                              )}
                              <span className="nb-notif-time">{fmtRel(n.created_at)}</span>
                            </div>
                            <div className="nb-notif-dot" style={{ marginTop: 4, flexShrink: 0 }} />
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="nb-drop-footer">
                    <button className="nb-view-all" onClick={goNotifs}>
                      View all notifications →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div style={{ width: 1, height: 22, background: "rgba(201,184,122,0.1)", flexShrink: 0 }} />

            {/* Profile */}
            <div style={{ position: "relative" }} ref={dropdownRef}>
              <button className="nb-profile-btn" onClick={() => setDropdownOpen(p => !p)}>
                <div className="nb-avatar">{initials}</div>
                <div className="nb-profile-info">
                  <span className="nb-profile-name">{displayName}</span>
                  <span className="nb-profile-role" style={{ color: meta.color }}>
                    <span className="nb-role-dot" style={{ background: meta.dot }} />
                    {meta.label}
                  </span>
                </div>
                <span className="nb-chevron"><ChevronIcon /></span>
              </button>

              {dropdownOpen && (
                <div className="nb-dropdown nb-profile-dropdown">
                  {/* User meta */}
                  <div className="nb-profile-meta">
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <div className="nb-avatar" style={{ width: 36, height: 36, fontSize: 13 }}>{initials}</div>
                      <div>
                        <p className="nb-profile-meta-name">{displayName}</p>
                        <p className="nb-profile-meta-email">{displayEmail}</p>
                      </div>
                    </div>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: meta.bg, color: meta.color, padding: "3px 10px", borderRadius: 20, fontSize: 10.5, fontWeight: 600, letterSpacing: "0.3px" }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: meta.dot, display: "inline-block" }} />
                      {meta.label}
                    </span>
                  </div>

                  {/* Menu items */}
                  <div style={{ padding: "6px 0" }}>
                    <button className="nb-menu-item" onClick={() => { setDropdownOpen(false); navigate(`/${activeRole}/profile`); }}>
                      <ProfileIcon /> My Profile
                    </button>
                    <button className="nb-menu-item" onClick={goNotifs}>
                      <BellIcon /> Notifications
                      {unreadCount > 0 && (
                        <span style={{ marginLeft: "auto", background: "rgba(220,38,38,0.2)", color: "#f87171", borderRadius: 20, padding: "1px 7px", fontSize: 10, fontWeight: 700 }}>
                          {unreadCount}
                        </span>
                      )}
                    </button>
                    <button className="nb-menu-item" onClick={() => { setDropdownOpen(false); navigate(`/${activeRole}/settings`); }}>
                      <SettingsIcon /> Settings
                    </button>
                  </div>

                  <div className="nb-divider" />

                  <div style={{ padding: "6px 0 8px" }}>
                    <button className="nb-menu-item danger" onClick={handleLogout}>
                      <LogoutIcon /> Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </header>
    </>
  );
}