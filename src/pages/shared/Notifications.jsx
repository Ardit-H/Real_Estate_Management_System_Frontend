import { useState, useEffect, useCallback } from "react";
import MainLayout from "../../components/layout/Layout";
import api from "../../api/axios";

// ─── Constants ────────────────────────────────────────────────────────────────
const TYPE_CFG = {
  INFO:     { color: "#2563eb", bg: "#eff6ff", icon: "ℹ️",  label: "Info"    },
  SUCCESS:  { color: "#059669", bg: "#ecfdf5", icon: "✅",  label: "Success" },
  WARNING:  { color: "#d97706", bg: "#fffbeb", icon: "⚠️",  label: "Warning" },
  ERROR:    { color: "#dc2626", bg: "#fef2f2", icon: "❌",  label: "Error"   },
  REMINDER: { color: "#7c3aed", bg: "#f5f3ff", icon: "🔔",  label: "Reminder"},
};

const C = {
  dark: "#1a1714", gold: "#c9b87a", goldL: "#e8d9a0",
  border: "#e8e2d6", surface: "#faf7f2", muted: "#9a8c6e",
  text: "#1a1714", textMut: "#b0a890", textSub: "#6b6340",
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
  .nt*{box-sizing:border-box}
  .nt{font-family:'DM Sans',system-ui,sans-serif;background:#f2ede4;min-height:100vh}
  .nt-btn{transition:all .17s ease;cursor:pointer;font-family:'DM Sans',sans-serif;border:none}
  .nt-btn:hover{opacity:.85;transform:translateY(-1px)}
  .nt-card{background:#faf7f2;border:1.5px solid #e8e2d6;border-radius:14px;box-shadow:0 2px 16px rgba(20,16,10,.06);overflow:hidden}
  .nt-row{transition:background .15s;cursor:pointer}
  .nt-row:hover{background:#f5f0e8!important}
  .nt-unread{background:#fff8ee!important;border-left:3px solid #c9b87a!important}
  .nt-unread:hover{background:#f5ead8!important}
  @keyframes nt-fade-up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes nt-scale-in{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}
  @keyframes nt-toast{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  @keyframes nt-spin{to{transform:rotate(360deg)}}
  @keyframes nt-pulse{0%,100%{opacity:.35}50%{opacity:.8}}
  .nt-card{animation:nt-fade-up .35s ease both}
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDT = (d) => {
  if (!d) return "—";
  const diff  = Date.now() - new Date(d).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return "Just now";
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7)   return `${days}d ago`;
  return new Date(d).toLocaleDateString("en-GB");
};

// ─── Shared UI ────────────────────────────────────────────────────────────────
function Toast({ msg, type = "success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{ position: "fixed", bottom: 26, right: 26, zIndex: 9999, background: C.dark, color: type === "error" ? "#f09090" : "#90c8a8", padding: "11px 18px", borderRadius: 12, fontSize: 13, boxShadow: "0 10px 36px rgba(0,0,0,.32)", border: `1px solid ${type === "error" ? "rgba(240,128,128,.15)" : "rgba(144,200,168,.15)"}`, fontFamily: "'DM Sans',sans-serif", animation: "nt-toast .2s ease", display: "flex", alignItems: "center", gap: 8 }}>
      {type === "error" ? "⚠️" : "✅"} {msg}
    </div>
  );
}

function Loader() {
  return (
    <div style={{ textAlign: "center", padding: "52px 0" }}>
      <div style={{ width: 28, height: 28, margin: "0 auto", border: "2.5px solid #e8e2d6", borderTop: `2.5px solid ${C.gold}`, borderRadius: "50%", animation: "nt-spin .7s linear infinite" }} />
    </div>
  );
}

function Empty({ icon, text, sub }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px", color: C.textMut }}>
      <div style={{ fontSize: 44, marginBottom: 12 }}>{icon}</div>
      <p style={{ fontSize: 16, fontWeight: 700, color: C.textSub, margin: "0 0 6px", fontFamily: "'Cormorant Garamond',Georgia,serif" }}>{text}</p>
      {sub && <p style={{ fontSize: 13, margin: 0, color: C.textMut }}>{sub}</p>}
    </div>
  );
}

function Pager({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end", padding: "14px 18px" }}>
      <button className="nt-btn" disabled={page === 0} onClick={() => onChange(page - 1)} style={{ padding: "6px 14px", borderRadius: 9, border: "1.5px solid #e4ddd0", background: "transparent", color: C.textSub, fontSize: 13, opacity: page === 0 ? .4 : 1 }}>Prev</button>
      <span style={{ fontSize: 12.5, color: C.muted, padding: "0 8px" }}>{page + 1} / {totalPages}</span>
      <button className="nt-btn" disabled={page >= totalPages - 1} onClick={() => onChange(page + 1)} style={{ padding: "6px 14px", borderRadius: 9, border: "1.5px solid #e4ddd0", background: "transparent", color: C.textSub, fontSize: 13, opacity: page >= totalPages - 1 ? .4 : 1 }}>Next</button>
    </div>
  );
}

// ─── Notification Row ─────────────────────────────────────────────────────────
function NotifRow({ notif, onRead, role }) {
  const tc = TYPE_CFG[notif.type] || TYPE_CFG.INFO;
  const unread = !notif.is_read;

  return (
    <div className={`nt-row ${unread ? "nt-unread" : ""}`}
      onClick={() => { if (unread) onRead(notif.id); if (notif.action_url) window.location.href = notif.action_url; }}
      style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "flex-start", gap: 14 }}>

      {/* Type icon */}
      <div style={{ width: 42, height: 42, borderRadius: 11, background: tc.bg, border: `1.5px solid ${tc.color}28`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0, marginTop: 2 }}>
        {tc.icon}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: unread ? 600 : 500, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 400 }}>{notif.title}</p>
          <span style={{ background: tc.bg, color: tc.color, padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 600, flexShrink: 0 }}>{tc.label}</span>
          {unread && <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.gold, display: "inline-block", flexShrink: 0 }} />}
        </div>
        <p style={{ margin: "0 0 6px", fontSize: 13, color: C.textSub, lineHeight: 1.6 }}>{notif.message}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11.5, color: C.textMut }}>{fmtDT(notif.created_at)}</span>
          {notif.related_entity_type && (
            <span style={{ fontSize: 11, color: C.muted, background: "#f0ece3", padding: "2px 8px", borderRadius: 20 }}>
              {notif.related_entity_type} #{notif.related_entity_id}
            </span>
          )}
          {notif.action_url && (
            <span style={{ fontSize: 11.5, color: C.gold, fontWeight: 500 }}>View →</span>
          )}
        </div>
      </div>

      {/* Read indicator */}
      {!unread && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#e8e2d6", flexShrink: 0, marginTop: 8 }} />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED NOTIFICATIONS PAGE (used by all 3 roles with role prop)
// ═══════════════════════════════════════════════════════════════════════════════
function NotificationsPage({ role }) {
  const [tab, setTab]               = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [page, setPage]             = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toast, setToast]           = useState(null);

  const notify = useCallback((msg, type = "success") => setToast({ msg, type, key: Date.now() }), []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const r = await api.get("/api/notifications/unread/count");
      setUnreadCount(r.data.unread_count ?? 0);
    } catch {}
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === "all") {
        const r = await api.get(`/api/notifications?page=${page}&size=15`);
        setNotifications(r.data.content || []);
        setTotalPages(r.data.totalPages || 0);
      } else {
        const r = await api.get("/api/notifications/unread");
        setNotifications(Array.isArray(r.data) ? r.data : []);
        setTotalPages(1);
      }
    } catch { notify("Error loading notifications", "error"); }
    finally { setLoading(false); }
  }, [tab, page, notify]);

  useEffect(() => { fetchAll(); fetchUnreadCount(); }, [fetchAll, fetchUnreadCount]);

  const handleMarkOne = async (id) => {
    try {
      await api.patch(`/api/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(c => Math.max(0, c - 1));
    } catch { notify("Error", "error"); }
  };

  const handleMarkAll = async () => {
    try {
      const r = await api.patch("/api/notifications/read-all");
      notify(`${r.data.marked} notifications marked as read ✓`);
      fetchAll(); fetchUnreadCount();
    } catch { notify("Error", "error"); }
  };

  const handleDeleteRead = async () => {
    try {
      await api.delete("/api/notifications/read");
      notify("Read notifications deleted ✓");
      fetchAll(); fetchUnreadCount();
    } catch { notify("Error", "error"); }
  };

  const unread    = notifications.filter(n => !n.is_read).length;
  const roleLabel = role === "admin" ? "Admin" : role === "agent" ? "Agent" : "Client";

  return (
    <MainLayout role={role}>
      <style>{CSS}</style>
      <div className="nt">

        {/* ── HERO ── */}
        <div style={{ background: "linear-gradient(160deg,#1a1714 0%,#1e1a14 50%,#241e16 100%)", minHeight: 180, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "36px 32px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,.018) 1px,transparent 1px)", backgroundSize: "22px 22px", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(90deg,transparent,${C.gold} 30%,${C.gold} 70%,transparent)` }} />
          <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
            <p style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 600, color: C.gold, textTransform: "uppercase", letterSpacing: "2.5px" }}>{roleLabel} · Notifications</p>
            <h1 style={{ margin: "0 0 8px", fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "clamp(24px,3vw,36px)", fontWeight: 700, color: "#f5f0e8", letterSpacing: "-0.4px" }}>
              My{" "}
              <span style={{ background: `linear-gradient(90deg,${C.gold},${C.goldL})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Notifications</span>
              {unreadCount > 0 && (
                <span style={{ marginLeft: 14, display: "inline-flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: "50%", background: "#dc2626", color: "#fff", fontSize: 14, fontFamily: "'DM Sans',sans-serif", verticalAlign: "middle" }}>{unreadCount > 99 ? "99+" : unreadCount}</span>
              )}
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: "rgba(245,240,232,.38)" }}>
              {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}` : "You're all caught up"}
            </p>
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div style={{ padding: "24px 28px", maxWidth: 860, margin: "0 auto" }}>

          {/* Stats row */}
          {notifications.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 12, marginBottom: 22 }}>
              {[
                { icon: "🔔", label: "Total",    value: tab === "all" ? (totalPages * 15) : notifications.length, accent: C.gold      },
                { icon: "📭", label: "Unread",   value: unreadCount,                                               accent: "#dc2626"   },
                { icon: "✅", label: "Read",     value: notifications.filter(n => n.is_read).length,               accent: "#059669"   },
                { icon: "⚠️", label: "Warnings", value: notifications.filter(n => n.type === "WARNING" || n.type === "ERROR").length, accent: "#d97706" },
              ].map(s => (
                <div key={s.label} className="nt-card" style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: `${s.accent}18`, border: `1.5px solid ${s.accent}28`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{s.icon}</div>
                  <div>
                    <p style={{ margin: 0, fontSize: 9.5, fontWeight: 600, color: C.textMut, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 2 }}>{s.label}</p>
                    <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.text, fontFamily: "'Cormorant Garamond',Georgia,serif", lineHeight: 1 }}>{s.value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Toolbar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
            {/* Tabs */}
            <div style={{ display: "flex", gap: 2, borderBottom: `1px solid ${C.border}` }}>
              {[{ id: "all", label: "All", icon: "📋" }, { id: "unread", label: "Unread", icon: "🔴", badge: unreadCount }].map(t => (
                <button key={t.id} className="nt-btn" onClick={() => { setTab(t.id); setPage(0); }}
                  style={{ padding: "9px 16px", background: "none", color: tab === t.id ? C.dark : C.muted, fontWeight: tab === t.id ? 600 : 400, fontSize: 13.5, borderBottom: tab === t.id ? `2px solid ${C.gold}` : "2px solid transparent", marginBottom: -1, display: "flex", alignItems: "center", gap: 6 }}>
                  {t.icon} {t.label}
                  {t.badge > 0 && <span style={{ background: "#dc2626", color: "#fff", borderRadius: "50%", width: 18, height: 18, fontSize: 10, display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{t.badge > 99 ? "99+" : t.badge}</span>}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 8 }}>
              {unreadCount > 0 && (
                <button className="nt-btn" onClick={handleMarkAll}
                  style={{ padding: "7px 14px", borderRadius: 9, background: C.surface, border: `1.5px solid ${C.border}`, color: C.textSub, fontSize: 12.5, fontWeight: 500 }}>
                  ✓ Mark all read
                </button>
              )}
              <button className="nt-btn" onClick={handleDeleteRead}
                style={{ padding: "7px 14px", borderRadius: 9, background: "#fef2f2", border: "1.5px solid #fecaca", color: "#dc2626", fontSize: 12.5, fontWeight: 500 }}>
                🗑 Delete read
              </button>
            </div>
          </div>

          {/* Notifications list */}
          <div className="nt-card">
            <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}`, background: "#fdf9f4", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.text, fontFamily: "'Cormorant Garamond',Georgia,serif" }}>
                {tab === "unread" ? "Unread Notifications" : "All Notifications"}
              </p>
              {notifications.length > 0 && (
                <span style={{ background: `${C.gold}22`, color: C.textSub, padding: "2px 9px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{notifications.length}</span>
              )}
            </div>

            {loading ? <Loader /> : notifications.length === 0 ? (
              <Empty
                icon={tab === "unread" ? "✅" : "🔔"}
                text={tab === "unread" ? "No unread notifications" : "No notifications yet"}
                sub={tab === "unread" ? "You're all caught up!" : "Notifications will appear here when there's activity"}
              />
            ) : (
              <>
                {notifications.map(n => (
                  <NotifRow key={n.id} notif={n} onRead={handleMarkOne} role={role} />
                ))}
                <Pager page={page} totalPages={totalPages} onChange={setPage} />
              </>
            )}
          </div>

          {/* Type legend */}
          <div style={{ marginTop: 20, display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            {Object.entries(TYPE_CFG).map(([key, c]) => (
              <span key={key} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: c.bg, color: c.color, padding: "4px 12px", borderRadius: 20, fontSize: 11.5, fontWeight: 500 }}>
                {c.icon} {c.label}
              </span>
            ))}
          </div>
        </div>

        {toast && <Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
      </div>
    </MainLayout>
  );
}

// ─── Three role-specific exports ──────────────────────────────────────────────
export function AgentNotifications()  { return <NotificationsPage role="agent"  />; }
export function AdminNotifications()  { return <NotificationsPage role="admin"  />; }
export function ClientNotifications() { return <NotificationsPage role="client" />; }