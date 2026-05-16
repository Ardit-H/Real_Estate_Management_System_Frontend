

import { getFullName, getInitials } from "./agentsHelpers";

function Avatar({ agent, size = 44 }) {
  return agent.profile?.photo_url ? (
    <img src={agent.profile.photo_url} alt="" className="aa-profile-avatar" style={{ width: size, height: size }} />
  ) : (
    <div className="aa-profile-avatar-placeholder" style={{ width: size, height: size, fontSize: size * 0.32 }}>
      {getInitials(agent)}
    </div>
  );
}

export default function AgentImpersonateModal({ agent, onClose, onConfirm, impersonating }) {
  return (
    <div className="aa-modal-overlay" onClick={onClose}>
      <div className="aa-modal" onClick={e => e.stopPropagation()}>
        <div className="aa-modal-header">
          <p className="aa-modal-title">Login as Agent</p>
          <p className="aa-modal-sub">You will temporarily act as this user</p>
        </div>
        <div className="aa-modal-body">
          <div className="aa-modal-warn">
            <strong>⚠️ Impersonation active</strong><br />
            All actions will be attributed to <strong style={{ color: "#c9b87a" }}>{agent.email}</strong>.
            A red banner will remind you throughout the session.
          </div>
          <div className="aa-profile-hero" style={{ marginBottom: 20 }}>
            <Avatar agent={agent} size={44} />
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#f5f0e8", fontFamily: "'Cormorant Garamond', serif" }}>
                {getFullName(agent) || "—"}
              </div>
              <div style={{ fontSize: 12, color: "rgba(245,240,232,0.35)", marginTop: 2 }}>
                {agent.email} · Agent
              </div>
              {agent.profile?.specialization && (
                <div style={{ fontSize: 11, color: "rgba(201,184,122,0.6)", marginTop: 3 }}>
                  {agent.profile.specialization}
                </div>
              )}
            </div>
          </div>
          <div className="aa-modal-footer">
            <button className="aa-btn-cancel" onClick={onClose}>Cancel</button>
            <button className="aa-btn-confirm" onClick={onConfirm} disabled={impersonating}>
              {impersonating ? "Logging in..." : "Login as this Agent"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}