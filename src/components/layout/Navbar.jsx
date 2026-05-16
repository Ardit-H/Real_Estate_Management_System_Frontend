import { useState, useRef, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthProvider";
import api from "../../api/axios";
import "./navbar.css";

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

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const BreadcrumbIcon = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>);
const MenuIcon       = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>);
const BellIcon       = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>);
const SearchIcon     = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>);
const ChevronIcon    = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>);
const LogoutIcon     = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>);
const ProfileIcon    = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>);

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
  const { user, logout, impersonating, exitImpersonation } = useContext(AuthContext);
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
      {/* ── IMPERSONATION BANNER ── */}
      {impersonating && (
        <div style={{
          background: "linear-gradient(90deg, #7f1d1d, #991b1b)",
          borderBottom: "1px solid rgba(248,113,113,0.3)",
          color: "#fecaca",
          padding: "8px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          fontSize: 13,
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 500,
          letterSpacing: "0.2px",
        }}>
          <span>⚠️</span>
          <span>
            You are acting as <strong style={{ color: "#fca5a5" }}>{impersonating.email}</strong>
            <span style={{ opacity: 0.6, marginLeft: 6 }}>({impersonating.role})</span>
          </span>
          <button
            onClick={exitImpersonation}
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(248,113,113,0.4)",
              color: "#fca5a5",
              borderRadius: 8,
              padding: "4px 14px",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              transition: "all 0.15s",
            }}
          >
            Exit Impersonation
          </button>
        </div>
      )}
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