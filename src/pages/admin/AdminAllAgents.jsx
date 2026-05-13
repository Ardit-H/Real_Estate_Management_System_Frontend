import { useState, useEffect, useContext, useCallback } from "react";
import MainLayout from "../../components/layout/Layout";
import { AuthContext } from "../../context/AuthProvider";
import api from "../../api/axios";

// ── Field names nga UserResponse DTO ──────────────────────────
// id, email, first_name, last_name, role, tenant_id, is_active, created_at
//
// Field names nga AgentProfileResponse DTO ────────────────────
// id, user_id, phone, license, bio, experience_years,
// specialization, photo_url, rating, total_reviews

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

  .aa-root * { box-sizing: border-box; margin: 0; padding: 0; }
  .aa-root { min-height: 100vh; background: #1a1714; font-family: 'DM Sans', sans-serif; color: #f5f0e8; padding: 32px 36px; }

  .aa-header { margin-bottom: 32px; }
  .aa-eyebrow { font-size: 10.5px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: rgba(201,184,122,0.55); margin-bottom: 6px; }
  .aa-title { font-family: 'Cormorant Garamond', serif; font-size: 34px; font-weight: 700; color: #f5f0e8; line-height: 1.1; }
  .aa-title span { color: #c9b87a; font-style: italic; }
  .aa-subtitle { font-size: 13px; color: rgba(245,240,232,0.38); margin-top: 6px; font-weight: 300; }

  .aa-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 28px; }
  .aa-stat { background: rgba(255,255,255,0.025); border: 1px solid rgba(201,184,122,0.1); border-radius: 14px; padding: 18px 20px; transition: all 0.2s; }
  .aa-stat:hover { background: rgba(201,184,122,0.05); border-color: rgba(201,184,122,0.2); transform: translateY(-1px); }
  .aa-stat-label { font-size: 10.5px; font-weight: 600; letter-spacing: 1.2px; text-transform: uppercase; color: rgba(245,240,232,0.3); margin-bottom: 8px; }
  .aa-stat-value { font-family: 'Cormorant Garamond', serif; font-size: 28px; font-weight: 700; color: #f5f0e8; line-height: 1; }
  .aa-stat-sub { font-size: 11px; color: rgba(245,240,232,0.3); margin-top: 4px; }

  .aa-toolbar { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
  .aa-search { flex: 1; max-width: 360px; display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.04); border: 1px solid rgba(201,184,122,0.12); border-radius: 10px; padding: 0 14px; height: 40px; transition: all 0.2s; }
  .aa-search:focus-within { border-color: rgba(201,184,122,0.3); background: rgba(255,255,255,0.06); box-shadow: 0 0 0 3px rgba(201,184,122,0.07); }
  .aa-search-icon { color: rgba(245,240,232,0.25); flex-shrink: 0; }
  .aa-search input { flex: 1; border: none; background: transparent; outline: none; font-size: 13px; color: #f5f0e8; font-family: 'DM Sans', sans-serif; }
  .aa-search input::placeholder { color: rgba(245,240,232,0.22); }

  .aa-filter-btn { height: 40px; padding: 0 16px; background: rgba(255,255,255,0.03); border: 1px solid rgba(201,184,122,0.12); border-radius: 10px; color: rgba(245,240,232,0.5); font-size: 12.5px; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.17s; display: flex; align-items: center; gap: 7px; }
  .aa-filter-btn:hover { background: rgba(201,184,122,0.07); color: #c9b87a; border-color: rgba(201,184,122,0.22); }
  .aa-filter-btn.active { background: rgba(201,184,122,0.1); color: #c9b87a; border-color: rgba(201,184,122,0.3); }
  .aa-count { margin-left: auto; font-size: 12px; color: rgba(245,240,232,0.28); }

  .aa-table-wrap { background: rgba(255,255,255,0.02); border: 1px solid rgba(201,184,122,0.1); border-radius: 16px; overflow: hidden; }
  .aa-table { width: 100%; border-collapse: collapse; }
  .aa-table thead tr { border-bottom: 1px solid rgba(201,184,122,0.1); background: rgba(255,255,255,0.02); }
  .aa-table th { padding: 13px 18px; text-align: left; font-size: 10.5px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: rgba(201,184,122,0.5); white-space: nowrap; }
  .aa-table th:last-child { text-align: right; }
  .aa-table tbody tr { border-bottom: 1px solid rgba(201,184,122,0.05); transition: background 0.15s; }
  .aa-table tbody tr:last-child { border-bottom: none; }
  .aa-table tbody tr:hover { background: rgba(201,184,122,0.04); }
  .aa-table td { padding: 16px 18px; vertical-align: middle; }
  .aa-table td:last-child { text-align: right; }

  .aa-agent-cell { display: flex; align-items: center; gap: 12px; }
  .aa-avatar { width: 38px; height: 38px; border-radius: 10px; background: linear-gradient(135deg, rgba(201,184,122,0.15), rgba(201,184,122,0.25)); border: 1px solid rgba(201,184,122,0.2); color: #c9b87a; font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .aa-avatar-img { width: 38px; height: 38px; border-radius: 10px; object-fit: cover; border: 1px solid rgba(201,184,122,0.2); flex-shrink: 0; }
  .aa-agent-name { font-family: 'Cormorant Garamond', serif; font-size: 15px; font-weight: 500; color: rgba(245,240,232,0.88); }
  .aa-agent-email { font-size: 11.5px; color: rgba(245,240,232,0.32); margin-top: 1px; }

  .aa-badge { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
  .aa-badge-dot { width: 5px; height: 5px; border-radius: 50%; }
  .aa-badge-active { background: rgba(52,211,153,0.12); color: #34d399; }
  .aa-badge-active .aa-badge-dot { background: #34d399; }
  .aa-badge-inactive { background: rgba(248,113,113,0.12); color: #f87171; }
  .aa-badge-inactive .aa-badge-dot { background: #f87171; }

  .aa-actions { display: flex; align-items: center; gap: 8px; justify-content: flex-end; }
  .aa-btn { height: 32px; padding: 0 14px; border-radius: 8px; font-size: 12px; font-family: 'DM Sans', sans-serif; font-weight: 500; cursor: pointer; transition: all 0.17s; display: flex; align-items: center; gap: 6px; border: 1px solid transparent; }
  .aa-btn-ghost { background: rgba(255,255,255,0.04); border-color: rgba(201,184,122,0.12); color: rgba(245,240,232,0.5); }
  .aa-btn-ghost:hover { background: rgba(201,184,122,0.08); border-color: rgba(201,184,122,0.25); color: #c9b87a; }
  .aa-btn-impersonate { background: rgba(56,189,248,0.1); border-color: rgba(56,189,248,0.25); color: #38bdf8; }
  .aa-btn-impersonate:hover { background: rgba(56,189,248,0.18); border-color: rgba(56,189,248,0.4); }
  .aa-btn-impersonate:disabled { opacity: 0.4; cursor: not-allowed; }

  .aa-empty { padding: 64px 24px; text-align: center; color: rgba(245,240,232,0.28); }
  .aa-empty-icon { font-size: 36px; margin-bottom: 12px; }
  .aa-empty-text { font-size: 14px; }

  @keyframes aa-spin { to { transform: rotate(360deg); } }
  .aa-spinner { width: 20px; height: 20px; margin: 48px auto; border: 2px solid rgba(201,184,122,0.15); border-top-color: #c9b87a; border-radius: 50%; animation: aa-spin 0.7s linear infinite; }

  .aa-modal-overlay { position: fixed; inset: 0; z-index: 500; background: rgba(0,0,0,0.75); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; animation: aa-fade 0.2s ease; }
  @keyframes aa-fade { from{opacity:0} to{opacity:1} }
  .aa-modal { background: #211d19; border: 1px solid rgba(201,184,122,0.15); border-radius: 18px; width: 480px; max-width: 95vw; box-shadow: 0 32px 80px rgba(0,0,0,0.6); animation: aa-up 0.25s cubic-bezier(0.16,1,0.3,1); overflow: hidden; max-height: 90vh; overflow-y: auto; }
  @keyframes aa-up { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  .aa-modal-header { padding: 22px 24px 16px; border-bottom: 1px solid rgba(201,184,122,0.08); background: rgba(255,255,255,0.02); position: sticky; top: 0; z-index: 1; }
  .aa-modal-title { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 700; color: #f5f0e8; margin-bottom: 3px; }
  .aa-modal-sub { font-size: 12px; color: rgba(245,240,232,0.35); }
  .aa-modal-body { padding: 20px 24px; }

  .aa-profile-hero { display: flex; align-items: center; gap: 14px; background: rgba(255,255,255,0.03); border: 1px solid rgba(201,184,122,0.1); border-radius: 14px; padding: 16px; margin-bottom: 18px; }
  .aa-profile-avatar { width: 56px; height: 56px; border-radius: 12px; object-fit: cover; border: 1px solid rgba(201,184,122,0.2); flex-shrink: 0; }
  .aa-profile-avatar-placeholder { width: 56px; height: 56px; border-radius: 12px; background: linear-gradient(135deg, rgba(201,184,122,0.15), rgba(201,184,122,0.28)); border: 1px solid rgba(201,184,122,0.2); color: #c9b87a; font-size: 18px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .aa-profile-name { font-family: 'Cormorant Garamond', serif; font-size: 18px; font-weight: 700; color: #f5f0e8; }
  .aa-profile-email { font-size: 12px; color: rgba(245,240,232,0.35); margin-top: 2px; }

  .aa-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 18px; }
  .aa-grid-item { background: rgba(255,255,255,0.03); border: 1px solid rgba(201,184,122,0.08); border-radius: 10px; padding: 12px 14px; }
  .aa-grid-item.full { grid-column: 1 / -1; }
  .aa-grid-label { font-size: 10px; font-weight: 600; letter-spacing: 0.8px; text-transform: uppercase; color: rgba(201,184,122,0.45); margin-bottom: 5px; }
  .aa-grid-value { font-size: 13px; color: rgba(245,240,232,0.78); line-height: 1.5; }

  .aa-modal-warn { background: rgba(56,189,248,0.07); border: 1px solid rgba(56,189,248,0.18); border-radius: 10px; padding: 14px 16px; font-size: 13px; color: rgba(245,240,232,0.65); line-height: 1.6; margin-bottom: 18px; }
  .aa-modal-warn strong { color: #38bdf8; }
  .aa-modal-footer { display: flex; gap: 10px; justify-content: flex-end; padding-top: 4px; }
  .aa-btn-cancel { height: 38px; padding: 0 18px; background: rgba(255,255,255,0.04); border: 1px solid rgba(201,184,122,0.12); border-radius: 10px; color: rgba(245,240,232,0.5); font-size: 13px; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.15s; }
  .aa-btn-cancel:hover { background: rgba(255,255,255,0.07); color: rgba(245,240,232,0.8); }
  .aa-btn-confirm { height: 38px; padding: 0 20px; background: linear-gradient(135deg, rgba(56,189,248,0.2), rgba(56,189,248,0.12)); border: 1px solid rgba(56,189,248,0.35); border-radius: 10px; color: #38bdf8; font-size: 13px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.15s; }
  .aa-btn-confirm:hover { background: linear-gradient(135deg, rgba(56,189,248,0.28), rgba(56,189,248,0.18)); }
  .aa-btn-confirm:disabled { opacity: 0.4; cursor: not-allowed; }

  .aa-toast { position: fixed; bottom: 28px; right: 28px; z-index: 999; background: #211d19; border: 1px solid rgba(201,184,122,0.2); border-radius: 12px; padding: 14px 18px; display: flex; align-items: center; gap: 10px; box-shadow: 0 16px 40px rgba(0,0,0,0.5); font-size: 13.5px; color: rgba(245,240,232,0.8); max-width: 340px; animation: aa-up 0.3s cubic-bezier(0.16,1,0.3,1); }
  .aa-toast.success { border-color: rgba(52,211,153,0.3); }
  .aa-toast.error   { border-color: rgba(248,113,113,0.3); }
`;

// ── Helpers — field names saktë nga DTO ───────────────────────
function getFullName(u) {
  if (!u) return "";
  // UserResponse: first_name + last_name (JsonProperty)
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

export default function AdminAllAgents() {
  const { startImpersonation } = useContext(AuthContext);

  const [agents, setAgents]               = useState([]);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState("");
  const [filterActive, setFilterActive]   = useState(null);
  const [viewTarget, setViewTarget]       = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [impersonating, setImpersonating] = useState(false);
  const [toast, setToast]                 = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchAgents = useCallback(async () => {
    setLoading(true);
    try {
      // UserResponse fields: id, email, first_name, last_name, role, is_active, created_at
      const usersRes = await api.get("/api/users");
      const agentUsers = (usersRes.data || []).filter(
        u => u.role?.toLowerCase() === "agent"
      );

      // AgentProfileResponse fields: id, user_id, phone, license, bio,
      // experience_years, specialization, photo_url, rating, total_reviews
      const withProfiles = await Promise.allSettled(
        agentUsers.map(async (u) => {
          try {
            const r = await api.get(`/api/users/agents/${u.id}`, {
              validateStatus: s => s < 500,
            });
            return { ...u, profile: r.status === 200 ? r.data : null };
          } catch {
            return { ...u, profile: null };
          }
        })
      );

      setAgents(withProfiles.map(r =>
        r.status === "fulfilled" ? r.value : { ...r.reason, profile: null }
      ));
    } catch {
      showToast("Failed to load agents", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAgents(); }, [fetchAgents]);

  const filtered = agents.filter(a => {
    const q    = search.toLowerCase();
    const name = getFullName(a).toLowerCase();
    const matchSearch = !q ||
      name.includes(q) ||
      a.email?.toLowerCase().includes(q) ||
      a.profile?.specialization?.toLowerCase().includes(q);
    const matchActive = filterActive === null || a.is_active === filterActive;
    return matchSearch && matchActive;
  });

  const stats = {
    total:    agents.length,
    active:   agents.filter(a => a.is_active).length,
    inactive: agents.filter(a => !a.is_active).length,
    avgRating: (() => {
      const rated = agents.filter(a => a.profile?.rating);
      if (!rated.length) return "—";
      return (rated.reduce((s, a) => s + parseFloat(a.profile.rating), 0) / rated.length).toFixed(1);
    })(),
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

  // ── Avatar helper ───────────────────────────────────────────
  const Avatar = ({ agent, size = 38 }) =>
    agent.profile?.photo_url ? (
      <img src={agent.profile.photo_url} alt="" className="aa-avatar-img" style={{ width: size, height: size }} />
    ) : (
      <div className="aa-avatar" style={{ width: size, height: size, fontSize: size * 0.32 }}>
        {getInitials(agent)}
      </div>
    );

  return (
    <MainLayout role="admin">
      <style>{CSS}</style>
      <div className="aa-root">

        {/* ── Header ── */}
        <div className="aa-header">
          <p className="aa-eyebrow">Team Management</p>
          <h1 className="aa-title">All <span>Agents</span></h1>
          <p className="aa-subtitle">Manage and monitor all real estate agents in your company</p>
        </div>

        {/* ── Stats ── */}
        <div className="aa-stats">
          {[
            { label: "Total Agents",  value: stats.total,    sub: "registered",     color: "#f5f0e8" },
            { label: "Active",        value: stats.active,   sub: "currently active", color: "#34d399" },
            { label: "Inactive",      value: stats.inactive, sub: "deactivated",    color: "#f87171" },
            { label: "Avg Rating",    value: stats.avgRating,sub: "across all",     color: "#c9b87a" },
          ].map(s => (
            <div className="aa-stat" key={s.label}>
              <p className="aa-stat-label">{s.label}</p>
              <p className="aa-stat-value" style={{ color: s.color }}>{s.value}</p>
              <p className="aa-stat-sub">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Toolbar ── */}
        <div className="aa-toolbar">
          <div className="aa-search">
            <span className="aa-search-icon">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email or specialization..." />
          </div>
          <button className={`aa-filter-btn ${filterActive === true ? "active" : ""}`}
            onClick={() => setFilterActive(p => p === true ? null : true)}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399", display: "inline-block" }} /> Active
          </button>
          <button className={`aa-filter-btn ${filterActive === false ? "active" : ""}`}
            onClick={() => setFilterActive(p => p === false ? null : false)}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f87171", display: "inline-block" }} /> Inactive
          </button>
          <span className="aa-count">{filtered.length} agent{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {/* ── Table ── */}
        <div className="aa-table-wrap">
          {loading ? (
            <div className="aa-spinner" />
          ) : filtered.length === 0 ? (
            <div className="aa-empty">
              <div className="aa-empty-icon">🔍</div>
              <div className="aa-empty-text">No agents found</div>
            </div>
          ) : (
            <table className="aa-table">
              <thead>
                <tr>
                  <th>Agent</th>
                  <th>Status</th>
                  <th>Rating</th>
                  <th>Specialization</th>
                  <th>Reviews</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(agent => (
                  <tr key={agent.id}>
                    <td>
                      <div className="aa-agent-cell">
                        <Avatar agent={agent} size={38} />
                        <div>
                          <div className="aa-agent-name">{getFullName(agent) || "—"}</div>
                          <div className="aa-agent-email">{agent.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`aa-badge ${agent.is_active ? "aa-badge-active" : "aa-badge-inactive"}`}>
                        <span className="aa-badge-dot" />
                        {agent.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      {agent.profile?.rating
                        ? <span style={{ color: "#c9b87a", fontWeight: 500, fontSize: 12.5 }}>⭐ {parseFloat(agent.profile.rating).toFixed(1)}</span>
                        : <span style={{ opacity: 0.28, fontSize: 12 }}>—</span>}
                    </td>
                    <td>
                      <span style={{ fontSize: 12.5, color: "rgba(245,240,232,0.5)" }}>
                        {agent.profile?.specialization || <span style={{ opacity: 0.28 }}>—</span>}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: 12.5, color: "rgba(245,240,232,0.45)" }}>
                        {agent.profile?.total_reviews ?? <span style={{ opacity: 0.28 }}>—</span>}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: 12.5, color: "rgba(245,240,232,0.38)" }}>
                        {fmtDate(agent.created_at)}
                      </span>
                    </td>
                    <td>
                      <div className="aa-actions">
                        <button className="aa-btn aa-btn-ghost" onClick={() => setViewTarget(agent)}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                          </svg>
                          View
                        </button>
                        <button
                          className="aa-btn aa-btn-impersonate"
                          onClick={() => setConfirmTarget(agent)}
                          disabled={!agent.is_active}
                          title={!agent.is_active ? "Cannot impersonate inactive user" : undefined}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                          </svg>
                          Login as
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

      {/* ════════════════════════════════
          VIEW MODAL
      ════════════════════════════════ */}
      {viewTarget && (
        <div className="aa-modal-overlay" onClick={() => setViewTarget(null)}>
          <div className="aa-modal" onClick={e => e.stopPropagation()}>
            <div className="aa-modal-header">
              <p className="aa-modal-title">Agent Profile</p>
              <p className="aa-modal-sub">Full details for this agent</p>
            </div>
            <div className="aa-modal-body">

              {/* Hero */}
              <div className="aa-profile-hero">
                {viewTarget.profile?.photo_url ? (
                  <img src={viewTarget.profile.photo_url} alt="" className="aa-profile-avatar" />
                ) : (
                  <div className="aa-profile-avatar-placeholder">{getInitials(viewTarget)}</div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="aa-profile-name">{getFullName(viewTarget) || "—"}</div>
                  <div className="aa-profile-email">{viewTarget.email}</div>
                  <div style={{ marginTop: 8 }}>
                    <span className={`aa-badge ${viewTarget.is_active ? "aa-badge-active" : "aa-badge-inactive"}`}>
                      <span className="aa-badge-dot" />
                      {viewTarget.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Details grid */}
              <div className="aa-grid">
                <div className="aa-grid-item">
                  <div className="aa-grid-label">Rating</div>
                  <div className="aa-grid-value">
                    {viewTarget.profile?.rating
                      ? `⭐ ${parseFloat(viewTarget.profile.rating).toFixed(1)}`
                      : "—"}
                  </div>
                </div>
                <div className="aa-grid-item">
                  <div className="aa-grid-label">Reviews</div>
                  <div className="aa-grid-value">{viewTarget.profile?.total_reviews ?? "—"}</div>
                </div>
                <div className="aa-grid-item">
                  <div className="aa-grid-label">Specialization</div>
                  <div className="aa-grid-value">{viewTarget.profile?.specialization || "—"}</div>
                </div>
                <div className="aa-grid-item">
                  <div className="aa-grid-label">Experience</div>
                  <div className="aa-grid-value">
                    {viewTarget.profile?.experience_years != null
                      ? `${viewTarget.profile.experience_years} years`
                      : "—"}
                  </div>
                </div>
                <div className="aa-grid-item">
                  <div className="aa-grid-label">Phone</div>
                  <div className="aa-grid-value">{viewTarget.profile?.phone || "—"}</div>
                </div>
                <div className="aa-grid-item">
                  <div className="aa-grid-label">License</div>
                  <div className="aa-grid-value">{viewTarget.profile?.license || "—"}</div>
                </div>
                <div className="aa-grid-item">
                  <div className="aa-grid-label">Joined</div>
                  <div className="aa-grid-value">{fmtDate(viewTarget.created_at)}</div>
                </div>
                <div className="aa-grid-item">
                  <div className="aa-grid-label">Role</div>
                  <div className="aa-grid-value" style={{ textTransform: "capitalize" }}>{viewTarget.role}</div>
                </div>
                {viewTarget.profile?.bio && (
                  <div className="aa-grid-item full">
                    <div className="aa-grid-label">Bio</div>
                    <div className="aa-grid-value">{viewTarget.profile.bio}</div>
                  </div>
                )}
              </div>

              <div className="aa-modal-footer">
                <button className="aa-btn-cancel" onClick={() => setViewTarget(null)}>Close</button>
                <button
                  className="aa-btn-confirm"
                  disabled={!viewTarget.is_active}
                  onClick={() => { setViewTarget(null); setConfirmTarget(viewTarget); }}
                >
                  Login as this Agent
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════
          CONFIRM IMPERSONATE MODAL
      ════════════════════════════════ */}
      {confirmTarget && (
        <div className="aa-modal-overlay" onClick={() => setConfirmTarget(null)}>
          <div className="aa-modal" onClick={e => e.stopPropagation()}>
            <div className="aa-modal-header">
              <p className="aa-modal-title">Login as Agent</p>
              <p className="aa-modal-sub">You will temporarily act as this user</p>
            </div>
            <div className="aa-modal-body">
              <div className="aa-modal-warn">
                <strong>⚠️ Impersonation active</strong><br />
                All actions will be attributed to <strong style={{ color: "#c9b87a" }}>{confirmTarget.email}</strong>.
                A red banner will remind you throughout the session.
              </div>
              <div className="aa-profile-hero" style={{ marginBottom: 20 }}>
                <Avatar agent={confirmTarget} size={44} />
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#f5f0e8", fontFamily: "'Cormorant Garamond', serif" }}>
                    {getFullName(confirmTarget) || "—"}
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(245,240,232,0.35)", marginTop: 2 }}>
                    {confirmTarget.email} · Agent
                  </div>
                  {confirmTarget.profile?.specialization && (
                    <div style={{ fontSize: 11, color: "rgba(201,184,122,0.6)", marginTop: 3 }}>
                      {confirmTarget.profile.specialization}
                    </div>
                  )}
                </div>
              </div>
              <div className="aa-modal-footer">
                <button className="aa-btn-cancel" onClick={() => setConfirmTarget(null)}>Cancel</button>
                <button className="aa-btn-confirm" onClick={handleImpersonate} disabled={impersonating}>
                  {impersonating ? "Logging in..." : "Login as this Agent"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`aa-toast ${toast.type}`}>
          <span>{toast.type === "success" ? "✅" : "❌"}</span>
          {toast.msg}
        </div>
      )}
    </MainLayout>
  );
}