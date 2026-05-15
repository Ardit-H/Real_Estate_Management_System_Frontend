import { useState, useEffect, useContext, useCallback } from "react";
import MainLayout from "../../components/layout/Layout";
import { AuthContext } from "../../context/AuthProvider";
import api from "../../api/axios";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

  .ac-root * { box-sizing: border-box; margin: 0; padding: 0; }
  .ac-root { min-height: 100vh; background: #1a1714; font-family: 'DM Sans', sans-serif; color: #f5f0e8; padding: 32px 36px; }

  .ac-header { margin-bottom: 32px; }
  .ac-eyebrow { font-size: 10.5px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: rgba(201,184,122,0.55); margin-bottom: 6px; }
  .ac-title { font-family: 'Cormorant Garamond', serif; font-size: 34px; font-weight: 700; color: #f5f0e8; line-height: 1.1; }
  .ac-title span { color: #34d399; font-style: italic; }
  .ac-subtitle { font-size: 13px; color: rgba(245,240,232,0.38); margin-top: 6px; font-weight: 300; }

  .ac-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 28px; }
  .ac-stat { background: rgba(255,255,255,0.025); border: 1px solid rgba(201,184,122,0.1); border-radius: 14px; padding: 18px 20px; transition: all 0.2s; }
  .ac-stat:hover { background: rgba(201,184,122,0.05); border-color: rgba(201,184,122,0.2); transform: translateY(-1px); }
  .ac-stat-label { font-size: 10.5px; font-weight: 600; letter-spacing: 1.2px; text-transform: uppercase; color: rgba(245,240,232,0.3); margin-bottom: 8px; }
  .ac-stat-value { font-family: 'Cormorant Garamond', serif; font-size: 28px; font-weight: 700; color: #f5f0e8; line-height: 1; }
  .ac-stat-sub { font-size: 11px; color: rgba(245,240,232,0.3); margin-top: 4px; }

  .ac-toolbar { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
  .ac-search { flex: 1; max-width: 360px; display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.04); border: 1px solid rgba(201,184,122,0.12); border-radius: 10px; padding: 0 14px; height: 40px; transition: all 0.2s; }
  .ac-search:focus-within { border-color: rgba(201,184,122,0.3); background: rgba(255,255,255,0.06); box-shadow: 0 0 0 3px rgba(201,184,122,0.07); }
  .ac-search-icon { color: rgba(245,240,232,0.25); flex-shrink: 0; }
  .ac-search input { flex: 1; border: none; background: transparent; outline: none; font-size: 13px; color: #f5f0e8; font-family: 'DM Sans', sans-serif; }
  .ac-search input::placeholder { color: rgba(245,240,232,0.22); }

  .ac-filter-btn { height: 40px; padding: 0 16px; background: rgba(255,255,255,0.03); border: 1px solid rgba(201,184,122,0.12); border-radius: 10px; color: rgba(245,240,232,0.5); font-size: 12.5px; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.17s; display: flex; align-items: center; gap: 7px; }
  .ac-filter-btn:hover { background: rgba(201,184,122,0.07); color: #c9b87a; border-color: rgba(201,184,122,0.22); }
  .ac-filter-btn.active { background: rgba(201,184,122,0.1); color: #c9b87a; border-color: rgba(201,184,122,0.3); }
  .ac-count { margin-left: auto; font-size: 12px; color: rgba(245,240,232,0.28); }

  .ac-table-wrap { background: rgba(255,255,255,0.02); border: 1px solid rgba(201,184,122,0.1); border-radius: 16px; overflow: hidden; }
  .ac-table { width: 100%; border-collapse: collapse; }
  .ac-table thead tr { border-bottom: 1px solid rgba(201,184,122,0.1); background: rgba(255,255,255,0.02); }
  .ac-table th { padding: 13px 18px; text-align: left; font-size: 10.5px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: rgba(201,184,122,0.5); white-space: nowrap; }
  .ac-table th:last-child { text-align: right; }
  .ac-table tbody tr { border-bottom: 1px solid rgba(201,184,122,0.05); transition: background 0.15s; }
  .ac-table tbody tr:last-child { border-bottom: none; }
  .ac-table tbody tr:hover { background: rgba(201,184,122,0.04); }
  .ac-table td { padding: 16px 18px; vertical-align: middle; }
  .ac-table td:last-child { text-align: right; }

  .ac-client-cell { display: flex; align-items: center; gap: 12px; }
  .ac-avatar { width: 38px; height: 38px; border-radius: 10px; background: linear-gradient(135deg, rgba(52,211,153,0.12), rgba(52,211,153,0.22)); border: 1px solid rgba(52,211,153,0.2); color: #34d399; font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .ac-avatar-img { width: 38px; height: 38px; border-radius: 10px; object-fit: cover; border: 1px solid rgba(52,211,153,0.2); flex-shrink: 0; }
  .ac-client-name { font-family: 'Cormorant Garamond', serif; font-size: 15px; font-weight: 500; color: rgba(245,240,232,0.88); }
  .ac-client-email { font-size: 11.5px; color: rgba(245,240,232,0.32); margin-top: 1px; }

  .ac-badge { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
  .ac-badge-dot { width: 5px; height: 5px; border-radius: 50%; }
  .ac-badge-active { background: rgba(52,211,153,0.12); color: #34d399; }
  .ac-badge-active .ac-badge-dot { background: #34d399; }
  .ac-badge-inactive { background: rgba(248,113,113,0.12); color: #f87171; }
  .ac-badge-inactive .ac-badge-dot { background: #f87171; }

  .ac-type-chip { display: inline-flex; align-items: center; padding: 3px 9px; border-radius: 6px; font-size: 11px; font-weight: 500; background: rgba(201,184,122,0.08); color: rgba(201,184,122,0.7); border: 1px solid rgba(201,184,122,0.12); }

  .ac-actions { display: flex; align-items: center; gap: 8px; justify-content: flex-end; }
  .ac-btn { height: 32px; padding: 0 14px; border-radius: 8px; font-size: 12px; font-family: 'DM Sans', sans-serif; font-weight: 500; cursor: pointer; transition: all 0.17s; display: flex; align-items: center; gap: 6px; border: 1px solid transparent; }
  .ac-btn-ghost { background: rgba(255,255,255,0.04); border-color: rgba(201,184,122,0.12); color: rgba(245,240,232,0.5); }
  .ac-btn-ghost:hover { background: rgba(201,184,122,0.08); border-color: rgba(201,184,122,0.25); color: #c9b87a; }
  .ac-btn-impersonate { background: rgba(52,211,153,0.1); border-color: rgba(52,211,153,0.25); color: #34d399; }
  .ac-btn-impersonate:hover { background: rgba(52,211,153,0.18); border-color: rgba(52,211,153,0.4); }
  .ac-btn-impersonate:disabled { opacity: 0.4; cursor: not-allowed; }

  .ac-empty { padding: 64px 24px; text-align: center; color: rgba(245,240,232,0.28); }
  .ac-empty-icon { font-size: 36px; margin-bottom: 12px; }
  .ac-empty-text { font-size: 14px; }

  @keyframes ac-spin { to { transform: rotate(360deg); } }
  .ac-spinner { width: 20px; height: 20px; margin: 48px auto; border: 2px solid rgba(201,184,122,0.15); border-top-color: #c9b87a; border-radius: 50%; animation: ac-spin 0.7s linear infinite; }

  .ac-modal-overlay { position: fixed; inset: 0; z-index: 500; background: rgba(0,0,0,0.75); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; animation: ac-fade 0.2s ease; }
  @keyframes ac-fade { from{opacity:0} to{opacity:1} }
  .ac-modal { background: #211d19; border: 1px solid rgba(201,184,122,0.15); border-radius: 18px; width: 480px; max-width: 95vw; box-shadow: 0 32px 80px rgba(0,0,0,0.6); animation: ac-up 0.25s cubic-bezier(0.16,1,0.3,1); overflow: hidden; max-height: 90vh; overflow-y: auto; }
  @keyframes ac-up { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  .ac-modal-header { padding: 22px 24px 16px; border-bottom: 1px solid rgba(201,184,122,0.08); background: rgba(255,255,255,0.02); position: sticky; top: 0; z-index: 1; }
  .ac-modal-title { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 700; color: #f5f0e8; margin-bottom: 3px; }
  .ac-modal-sub { font-size: 12px; color: rgba(245,240,232,0.35); }
  .ac-modal-body { padding: 20px 24px; }

  .ac-profile-hero { display: flex; align-items: center; gap: 14px; background: rgba(255,255,255,0.03); border: 1px solid rgba(201,184,122,0.1); border-radius: 14px; padding: 16px; margin-bottom: 18px; }
  .ac-profile-avatar { width: 56px; height: 56px; border-radius: 12px; object-fit: cover; border: 1px solid rgba(52,211,153,0.2); flex-shrink: 0; }
  .ac-profile-avatar-placeholder { width: 56px; height: 56px; border-radius: 12px; background: linear-gradient(135deg, rgba(52,211,153,0.1), rgba(52,211,153,0.22)); border: 1px solid rgba(52,211,153,0.2); color: #34d399; font-size: 18px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .ac-profile-name { font-family: 'Cormorant Garamond', serif; font-size: 18px; font-weight: 700; color: #f5f0e8; }
  .ac-profile-email { font-size: 12px; color: rgba(245,240,232,0.35); margin-top: 2px; }

  .ac-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 18px; }
  .ac-grid-item { background: rgba(255,255,255,0.03); border: 1px solid rgba(201,184,122,0.08); border-radius: 10px; padding: 12px 14px; }
  .ac-grid-item.full { grid-column: 1 / -1; }
  .ac-grid-label { font-size: 10px; font-weight: 600; letter-spacing: 0.8px; text-transform: uppercase; color: rgba(201,184,122,0.45); margin-bottom: 5px; }
  .ac-grid-value { font-size: 13px; color: rgba(245,240,232,0.78); }

  .ac-modal-warn { background: rgba(52,211,153,0.07); border: 1px solid rgba(52,211,153,0.18); border-radius: 10px; padding: 14px 16px; font-size: 13px; color: rgba(245,240,232,0.65); line-height: 1.6; margin-bottom: 18px; }
  .ac-modal-warn strong { color: #34d399; }
  .ac-modal-footer { display: flex; gap: 10px; justify-content: flex-end; padding-top: 4px; }
  .ac-btn-cancel { height: 38px; padding: 0 18px; background: rgba(255,255,255,0.04); border: 1px solid rgba(201,184,122,0.12); border-radius: 10px; color: rgba(245,240,232,0.5); font-size: 13px; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.15s; }
  .ac-btn-cancel:hover { background: rgba(255,255,255,0.07); color: rgba(245,240,232,0.8); }
  .ac-btn-confirm { height: 38px; padding: 0 20px; background: linear-gradient(135deg, rgba(52,211,153,0.18), rgba(52,211,153,0.1)); border: 1px solid rgba(52,211,153,0.35); border-radius: 10px; color: #34d399; font-size: 13px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.15s; }
  .ac-btn-confirm:hover { background: linear-gradient(135deg, rgba(52,211,153,0.26), rgba(52,211,153,0.16)); }
  .ac-btn-confirm:disabled { opacity: 0.4; cursor: not-allowed; }

  .ac-toast { position: fixed; bottom: 28px; right: 28px; z-index: 999; background: #211d19; border: 1px solid rgba(201,184,122,0.2); border-radius: 12px; padding: 14px 18px; display: flex; align-items: center; gap: 10px; box-shadow: 0 16px 40px rgba(0,0,0,0.5); font-size: 13.5px; color: rgba(245,240,232,0.8); max-width: 340px; animation: ac-up 0.3s cubic-bezier(0.16,1,0.3,1); }
  .ac-toast.success { border-color: rgba(52,211,153,0.3); }
  .ac-toast.error   { border-color: rgba(248,113,113,0.3); }
`;

function getFullName(u) {
  if (!u) return "";
  const first = u.first_name || "";
  const last  = u.last_name  || "";
  return `${first} ${last}`.trim() || u.email || "";
}

function getInitials(u) {
  const name = getFullName(u);
  if (!name) return "??";
  return name.trim().split(" ").filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join("");
}

function fmtDate(val) {
  if (!val) return "—";
  return new Date(val).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtBudget(val) {
  if (!val) return null;
  const n = parseFloat(val);
  if (isNaN(n)) return null;
  if (n >= 1000000) return `€${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000)    return `€${(n / 1000).toFixed(0)}K`;
  return `€${n}`;
}

export default function AdminAllClients() {
  const { startImpersonation } = useContext(AuthContext);

  const [clients, setClients]             = useState([]);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState("");
  const [filterActive, setFilterActive]   = useState(null);
  const [viewTarget, setViewTarget]       = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [impersonating, setImpersonating] = useState(false);
  const [togglingId, setTogglingId]       = useState(null);
  const [toast, setToast]                 = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const usersRes = await api.get("/api/users");
      const clientUsers = (usersRes.data || []).filter(
        u => u.role?.toLowerCase() === "client"
      );

      const withProfiles = await Promise.allSettled(
        clientUsers.map(async (u) => {
          try {
            const r = await api.get(`/api/users/clients/${u.id}`, {
              validateStatus: s => s < 500,
            });
            return { ...u, profile: r.status === 200 ? r.data : null };
          } catch {
            return { ...u, profile: null };
          }
        })
      );

      setClients(withProfiles.map(r =>
        r.status === "fulfilled" ? r.value : { ...r.reason, profile: null }
      ));
    } catch {
      showToast("Failed to load clients", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  const filtered = clients.filter(c => {
    const q    = search.toLowerCase();
    const name = getFullName(c).toLowerCase();
    const matchSearch = !q ||
      name.includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.profile?.preferred_city?.toLowerCase().includes(q);
    const matchActive = filterActive === null || c.is_active === filterActive;
    return matchSearch && matchActive;
  });

  const stats = {
    total:       clients.length,
    active:      clients.filter(c => c.is_active).length,
    inactive:    clients.filter(c => !c.is_active).length,
    withProfile: clients.filter(c => c.profile !== null).length,
  };

  const handleImpersonate = async () => {
    if (!confirmTarget) return;
    setImpersonating(true);
    try {
      await startImpersonation(confirmTarget.id);
      showToast(`Now acting as ${confirmTarget.email}`);
      setConfirmTarget(null);
    } catch {
      showToast("Impersonation failed", "error");
    } finally {
      setImpersonating(false);
    }
  };

  const handleToggleActive = async (client) => {
    setTogglingId(client.id);
    try {
      await api.patch(`/api/users/${client.id}/status`, {
        is_active: !client.is_active,
      });
      showToast(
        `${getFullName(client)} ${!client.is_active ? "activated" : "deactivated"} successfully`,
        "success"
      );
      await fetchClients();
    } catch {
      showToast("Failed to update status", "error");
    } finally {
      setTogglingId(null);
    }
  };

  const Avatar = ({ client, size = 38 }) =>
    client.profile?.photo_url ? (
      <img src={client.profile.photo_url} alt="" className="ac-avatar-img" style={{ width: size, height: size }} />
    ) : (
      <div className="ac-avatar" style={{ width: size, height: size, fontSize: size * 0.32 }}>
        {getInitials(client)}
      </div>
    );

  return (
    <MainLayout role="admin">
      <style>{CSS}</style>
      <div className="ac-root">

        {/* ── Header ── */}
        <div className="ac-header">
          <p className="ac-eyebrow">Client Management</p>
          <h1 className="ac-title">All <span>Clients</span></h1>
          <p className="ac-subtitle">View and manage all registered clients in your company</p>
        </div>

        {/* ── Stats ── */}
        <div className="ac-stats">
          {[
            { label: "Total Clients",  value: stats.total,       sub: "registered",         color: "#f5f0e8" },
            { label: "Active",         value: stats.active,      sub: "currently active",   color: "#34d399" },
            { label: "Inactive",       value: stats.inactive,    sub: "deactivated",        color: "#f87171" },
            { label: "With Profile",   value: stats.withProfile, sub: "completed profiles", color: "#c9b87a" },
          ].map(s => (
            <div className="ac-stat" key={s.label}>
              <p className="ac-stat-label">{s.label}</p>
              <p className="ac-stat-value" style={{ color: s.color }}>{s.value}</p>
              <p className="ac-stat-sub">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Toolbar ── */}
        <div className="ac-toolbar">
          <div className="ac-search">
            <span className="ac-search-icon">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email or city..." />
          </div>
          <button className={`ac-filter-btn ${filterActive === true ? "active" : ""}`}
            onClick={() => setFilterActive(p => p === true ? null : true)}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399", display: "inline-block" }} /> Active
          </button>
          <button className={`ac-filter-btn ${filterActive === false ? "active" : ""}`}
            onClick={() => setFilterActive(p => p === false ? null : false)}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f87171", display: "inline-block" }} /> Inactive
          </button>
          <span className="ac-count">{filtered.length} client{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {/* ── Table ── */}
        <div className="ac-table-wrap">
          {loading ? (
            <div className="ac-spinner" />
          ) : filtered.length === 0 ? (
            <div className="ac-empty">
              <div className="ac-empty-icon">🔍</div>
              <div className="ac-empty-text">No clients found</div>
            </div>
          ) : (
            <table className="ac-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Status</th>
                  <th>Preferred City</th>
                  <th>Budget</th>
                  <th>Looking For</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(client => (
                  <tr key={client.id}>
                    <td>
                      <div className="ac-client-cell">
                        <Avatar client={client} size={38} />
                        <div>
                          <div className="ac-client-name">{getFullName(client) || "—"}</div>
                          <div className="ac-client-email">{client.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`ac-badge ${client.is_active ? "ac-badge-active" : "ac-badge-inactive"}`}>
                        <span className="ac-badge-dot" />
                        {client.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: 12.5, color: "rgba(245,240,232,0.55)" }}>
                        {client.profile?.preferred_city || <span style={{ opacity: 0.28 }}>—</span>}
                      </span>
                    </td>
                    <td>
                      {fmtBudget(client.profile?.budget_max)
                        ? <span style={{ fontSize: 12.5, color: "#c9b87a", fontWeight: 500 }}>{fmtBudget(client.profile.budget_max)}</span>
                        : <span style={{ opacity: 0.28, fontSize: 12 }}>—</span>}
                    </td>
                    <td>
                      {client.profile?.preferred_type
                        ? <span className="ac-type-chip">{client.profile.preferred_type}</span>
                        : <span style={{ opacity: 0.28, fontSize: 12 }}>—</span>}
                    </td>
                    <td>
                      <span style={{ fontSize: 12.5, color: "rgba(245,240,232,0.38)" }}>
                        {fmtDate(client.created_at)}
                      </span>
                    </td>
                    <td>
                      <div className="ac-actions">
                        <button className="ac-btn ac-btn-ghost" onClick={() => setViewTarget(client)}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                          </svg>
                          View
                        </button>
                        <button
                          className="ac-btn ac-btn-impersonate"
                          onClick={() => setConfirmTarget(client)}
                          disabled={!client.is_active}
                          title={!client.is_active ? "Cannot impersonate inactive user" : undefined}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                          </svg>
                          Login as
                        </button>
                        <button
                          className="ac-btn"
                          onClick={() => handleToggleActive(client)}
                          disabled={togglingId === client.id}
                          style={{
                            background:   client.is_active ? "rgba(248,113,113,0.1)"  : "rgba(52,211,153,0.1)",
                            borderColor:  client.is_active ? "rgba(248,113,113,0.25)" : "rgba(52,211,153,0.25)",
                            color:        client.is_active ? "#f87171"                : "#34d399",
                            opacity:      togglingId === client.id ? 0.5 : 1,
                            cursor:       togglingId === client.id ? "not-allowed" : "pointer",
                          }}
                        >
                          {togglingId === client.id
                            ? "..."
                            : client.is_active ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── VIEW MODAL ── */}
      {viewTarget && (
        <div className="ac-modal-overlay" onClick={() => setViewTarget(null)}>
          <div className="ac-modal" onClick={e => e.stopPropagation()}>
            <div className="ac-modal-header">
              <p className="ac-modal-title">Client Profile</p>
              <p className="ac-modal-sub">Full details for this client</p>
            </div>
            <div className="ac-modal-body">
              <div className="ac-profile-hero">
                {viewTarget.profile?.photo_url ? (
                  <img src={viewTarget.profile.photo_url} alt="" className="ac-profile-avatar" />
                ) : (
                  <div className="ac-profile-avatar-placeholder">{getInitials(viewTarget)}</div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="ac-profile-name">{getFullName(viewTarget) || "—"}</div>
                  <div className="ac-profile-email">{viewTarget.email}</div>
                  <div style={{ marginTop: 8 }}>
                    <span className={`ac-badge ${viewTarget.is_active ? "ac-badge-active" : "ac-badge-inactive"}`}>
                      <span className="ac-badge-dot" />
                      {viewTarget.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="ac-grid">
                <div className="ac-grid-item">
                  <div className="ac-grid-label">Preferred City</div>
                  <div className="ac-grid-value">{viewTarget.profile?.preferred_city || "—"}</div>
                </div>
                <div className="ac-grid-item">
                  <div className="ac-grid-label">Looking For</div>
                  <div className="ac-grid-value">{viewTarget.profile?.preferred_type || "—"}</div>
                </div>
                <div className="ac-grid-item">
                  <div className="ac-grid-label">Budget Min</div>
                  <div className="ac-grid-value" style={{ color: viewTarget.profile?.budget_min ? "#c9b87a" : undefined }}>
                    {fmtBudget(viewTarget.profile?.budget_min) || "—"}
                  </div>
                </div>
                <div className="ac-grid-item">
                  <div className="ac-grid-label">Budget Max</div>
                  <div className="ac-grid-value" style={{ color: viewTarget.profile?.budget_max ? "#c9b87a" : undefined }}>
                    {fmtBudget(viewTarget.profile?.budget_max) || "—"}
                  </div>
                </div>
                <div className="ac-grid-item">
                  <div className="ac-grid-label">Phone</div>
                  <div className="ac-grid-value">{viewTarget.profile?.phone || "—"}</div>
                </div>
                <div className="ac-grid-item">
                  <div className="ac-grid-label">Preferred Contact</div>
                  <div className="ac-grid-value">{viewTarget.profile?.preferred_contact || "—"}</div>
                </div>
                <div className="ac-grid-item">
                  <div className="ac-grid-label">Joined</div>
                  <div className="ac-grid-value">{fmtDate(viewTarget.created_at)}</div>
                </div>
                <div className="ac-grid-item">
                  <div className="ac-grid-label">Role</div>
                  <div className="ac-grid-value" style={{ textTransform: "capitalize" }}>{viewTarget.role}</div>
                </div>
              </div>

              <div className="ac-modal-footer">
                <button className="ac-btn-cancel" onClick={() => setViewTarget(null)}>Close</button>
                <button
                  className="ac-btn-cancel"
                  onClick={() => { handleToggleActive(viewTarget); setViewTarget(null); }}
                  style={{
                    color:       viewTarget.is_active ? "#f87171" : "#34d399",
                    borderColor: viewTarget.is_active ? "rgba(248,113,113,0.25)" : "rgba(52,211,153,0.25)",
                  }}
                >
                  {viewTarget.is_active ? "Deactivate" : "Activate"}
                </button>
                <button
                  className="ac-btn-confirm"
                  disabled={!viewTarget.is_active}
                  onClick={() => { setViewTarget(null); setConfirmTarget(viewTarget); }}
                >
                  Login as this Client
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CONFIRM IMPERSONATE MODAL ── */}
      {confirmTarget && (
        <div className="ac-modal-overlay" onClick={() => setConfirmTarget(null)}>
          <div className="ac-modal" onClick={e => e.stopPropagation()}>
            <div className="ac-modal-header">
              <p className="ac-modal-title">Login as Client</p>
              <p className="ac-modal-sub">You will temporarily act as this user</p>
            </div>
            <div className="ac-modal-body">
              <div className="ac-modal-warn">
                <strong>⚠️ Impersonation active</strong><br />
                All actions will be attributed to <strong style={{ color: "#c9b87a" }}>{confirmTarget.email}</strong>.
                A red banner will remind you throughout the session.
              </div>
              <div className="ac-profile-hero" style={{ marginBottom: 20 }}>
                <Avatar client={confirmTarget} size={44} />
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#f5f0e8", fontFamily: "'Cormorant Garamond', serif" }}>
                    {getFullName(confirmTarget) || "—"}
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(245,240,232,0.35)", marginTop: 2 }}>
                    {confirmTarget.email} · Client
                  </div>
                  {confirmTarget.profile?.preferred_city && (
                    <div style={{ fontSize: 11, color: "rgba(201,184,122,0.6)", marginTop: 3 }}>
                      📍 {confirmTarget.profile.preferred_city}
                    </div>
                  )}
                </div>
              </div>
              <div className="ac-modal-footer">
                <button className="ac-btn-cancel" onClick={() => setConfirmTarget(null)}>Cancel</button>
                <button className="ac-btn-confirm" onClick={handleImpersonate} disabled={impersonating}>
                  {impersonating ? "Logging in..." : "Login as this Client"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`ac-toast ${toast.type}`}>
          <span>{toast.type === "success" ? "✅" : "❌"}</span>
          {toast.msg}
        </div>
      )}
    </MainLayout>
  );
}