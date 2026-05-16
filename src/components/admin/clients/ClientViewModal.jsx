// src/components/admin/ClientViewModal.jsx

import { getFullName, getInitials, fmtDate, fmtBudget } from "./clientsHelpers";

function Avatar({ client, size = 56 }) {
  return client.profile?.photo_url ? (
    <img src={client.profile.photo_url} alt="" className="ac-profile-avatar" style={{ width: size, height: size }} />
  ) : (
    <div className="ac-profile-avatar-placeholder" style={{ width: size, height: size, fontSize: size * 0.32 }}>
      {getInitials(client)}
    </div>
  );
}

export default function ClientViewModal({ client, onClose, onImpersonate, onToggleActive }) {
  return (
    <div className="ac-modal-overlay" onClick={onClose}>
      <div className="ac-modal" onClick={e => e.stopPropagation()}>
        <div className="ac-modal-header">
          <p className="ac-modal-title">Client Profile</p>
          <p className="ac-modal-sub">Full details for this client</p>
        </div>
        <div className="ac-modal-body">

          <div className="ac-profile-hero">
            <Avatar client={client} size={56} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="ac-profile-name">{getFullName(client) || "—"}</div>
              <div className="ac-profile-email">{client.email}</div>
              <div style={{ marginTop: 8 }}>
                <span className={`ac-badge ${client.is_active ? "ac-badge-active" : "ac-badge-inactive"}`}>
                  <span className="ac-badge-dot" />
                  {client.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          <div className="ac-grid">
            <div className="ac-grid-item">
              <div className="ac-grid-label">Preferred City</div>
              <div className="ac-grid-value">{client.profile?.preferred_city || "—"}</div>
            </div>
            <div className="ac-grid-item">
              <div className="ac-grid-label">Looking For</div>
              <div className="ac-grid-value">{client.profile?.preferred_type || "—"}</div>
            </div>
            <div className="ac-grid-item">
              <div className="ac-grid-label">Budget Min</div>
              <div className="ac-grid-value" style={{ color: client.profile?.budget_min ? "#c9b87a" : undefined }}>
                {fmtBudget(client.profile?.budget_min) || "—"}
              </div>
            </div>
            <div className="ac-grid-item">
              <div className="ac-grid-label">Budget Max</div>
              <div className="ac-grid-value" style={{ color: client.profile?.budget_max ? "#c9b87a" : undefined }}>
                {fmtBudget(client.profile?.budget_max) || "—"}
              </div>
            </div>
            <div className="ac-grid-item">
              <div className="ac-grid-label">Phone</div>
              <div className="ac-grid-value">{client.profile?.phone || "—"}</div>
            </div>
            <div className="ac-grid-item">
              <div className="ac-grid-label">Preferred Contact</div>
              <div className="ac-grid-value">{client.profile?.preferred_contact || "—"}</div>
            </div>
            <div className="ac-grid-item">
              <div className="ac-grid-label">Joined</div>
              <div className="ac-grid-value">{fmtDate(client.created_at)}</div>
            </div>
            <div className="ac-grid-item">
              <div className="ac-grid-label">Role</div>
              <div className="ac-grid-value" style={{ textTransform: "capitalize" }}>{client.role}</div>
            </div>
          </div>

          <div className="ac-modal-footer">
            <button className="ac-btn-cancel" onClick={onClose}>Close</button>
            <button
              className="ac-btn-cancel"
              onClick={() => { onToggleActive(client); onClose(); }}
              style={{
                color:       client.is_active ? "#f87171" : "#34d399",
                borderColor: client.is_active ? "rgba(248,113,113,0.25)" : "rgba(52,211,153,0.25)",
              }}
            >
              {client.is_active ? "Deactivate" : "Activate"}
            </button>
            <button
              className="ac-btn-confirm"
              disabled={!client.is_active}
              onClick={() => { onClose(); onImpersonate(client); }}
            >
              Login as this Client
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}