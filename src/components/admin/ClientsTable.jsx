// src/components/admin/ClientsTable.jsx

import { getFullName, getInitials, fmtDate, fmtBudget } from "./clientsHelpers";

function Avatar({ client, size = 38 }) {
  return client.profile?.photo_url ? (
    <img src={client.profile.photo_url} alt="" className="ac-avatar-img" style={{ width: size, height: size }} />
  ) : (
    <div className="ac-avatar" style={{ width: size, height: size, fontSize: size * 0.32 }}>
      {getInitials(client)}
    </div>
  );
}

export default function ClientsTable({ clients, loading, onView, onImpersonate, onToggleActive, togglingId }) {
  if (loading) return <div className="ac-spinner" />;

  if (clients.length === 0) {
    return (
      <div className="ac-empty">
        <div className="ac-empty-icon">🔍</div>
        <div className="ac-empty-text">No clients found</div>
      </div>
    );
  }

  return (
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
        {clients.map(client => (
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
                <button className="ac-btn ac-btn-ghost" onClick={() => onView(client)}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                  View
                </button>
                <button
                  className="ac-btn ac-btn-impersonate"
                  onClick={() => onImpersonate(client)}
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
                  onClick={() => onToggleActive(client)}
                  disabled={togglingId === client.id}
                  style={{
                    background:  client.is_active ? "rgba(248,113,113,0.1)"  : "rgba(52,211,153,0.1)",
                    borderColor: client.is_active ? "rgba(248,113,113,0.25)" : "rgba(52,211,153,0.25)",
                    color:       client.is_active ? "#f87171"                : "#34d399",
                    opacity:     togglingId === client.id ? 0.5 : 1,
                    cursor:      togglingId === client.id ? "not-allowed" : "pointer",
                  }}
                >
                  {togglingId === client.id ? "..." : client.is_active ? "Deactivate" : "Activate"}
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}