

import { getFullName, getInitials, fmtDate } from "./agentsHelpers";

function Avatar({ agent, size = 38 }) {
  return agent.profile?.photo_url ? (
    <img src={agent.profile.photo_url} alt="" className="aa-avatar-img" style={{ width: size, height: size }} />
  ) : (
    <div className="aa-avatar" style={{ width: size, height: size, fontSize: size * 0.32 }}>
      {getInitials(agent)}
    </div>
  );
}

export default function AgentsTable({ agents, loading, onView, onImpersonate, onToggleActive, togglingId }) {
  if (loading) return <div className="aa-spinner" />;

  if (agents.length === 0) {
    return (
      <div className="aa-empty">
        <div className="aa-empty-icon">🔍</div>
        <div className="aa-empty-text">No agents found</div>
      </div>
    );
  }

  return (
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
        {agents.map(agent => (
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
                <button className="aa-btn aa-btn-ghost" onClick={() => onView(agent)}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                  View
                </button>
                <button
                  className="aa-btn aa-btn-impersonate"
                  onClick={() => onImpersonate(agent)}
                  disabled={!agent.is_active}
                  title={!agent.is_active ? "Cannot impersonate inactive user" : undefined}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  Login as
                </button>
                <button
                  className="aa-btn"
                  onClick={() => onToggleActive(agent)}
                  disabled={togglingId === agent.id}
                  style={{
                    background:  agent.is_active ? "rgba(248,113,113,0.1)"  : "rgba(52,211,153,0.1)",
                    borderColor: agent.is_active ? "rgba(248,113,113,0.25)" : "rgba(52,211,153,0.25)",
                    color:       agent.is_active ? "#f87171"                : "#34d399",
                    opacity:     togglingId === agent.id ? 0.5 : 1,
                    cursor:      togglingId === agent.id ? "not-allowed" : "pointer",
                  }}
                >
                  {togglingId === agent.id ? "..." : agent.is_active ? "Deactivate" : "Activate"}
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}