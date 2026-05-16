// src/components/admin/ClientImpersonateModal.jsx

import { getFullName, getInitials } from "./clientsHelpers";

function Avatar({ client, size = 44 }) {
  return client.profile?.photo_url ? (
    <img src={client.profile.photo_url} alt="" className="ac-profile-avatar" style={{ width: size, height: size }} />
  ) : (
    <div className="ac-profile-avatar-placeholder" style={{ width: size, height: size, fontSize: size * 0.32 }}>
      {getInitials(client)}
    </div>
  );
}

export default function ClientImpersonateModal({ client, onClose, onConfirm, impersonating }) {
  return (
    <div className="ac-modal-overlay" onClick={onClose}>
      <div className="ac-modal" onClick={e => e.stopPropagation()}>
        <div className="ac-modal-header">
          <p className="ac-modal-title">Login as Client</p>
          <p className="ac-modal-sub">You will temporarily act as this user</p>
        </div>
        <div className="ac-modal-body">
          <div className="ac-modal-warn">
            <strong>⚠️ Impersonation active</strong><br />
            All actions will be attributed to <strong style={{ color: "#c9b87a" }}>{client.email}</strong>.
            A red banner will remind you throughout the session.
          </div>
          <div className="ac-profile-hero" style={{ marginBottom: 20 }}>
            <Avatar client={client} size={44} />
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#f5f0e8", fontFamily: "'Cormorant Garamond', serif" }}>
                {getFullName(client) || "—"}
              </div>
              <div style={{ fontSize: 12, color: "rgba(245,240,232,0.35)", marginTop: 2 }}>
                {client.email} · Client
              </div>
              {client.profile?.preferred_city && (
                <div style={{ fontSize: 11, color: "rgba(201,184,122,0.6)", marginTop: 3 }}>
                  📍 {client.profile.preferred_city}
                </div>
              )}
            </div>
          </div>
          <div className="ac-modal-footer">
            <button className="ac-btn-cancel" onClick={onClose}>Cancel</button>
            <button className="ac-btn-confirm" onClick={onConfirm} disabled={impersonating}>
              {impersonating ? "Logging in..." : "Login as this Client"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}