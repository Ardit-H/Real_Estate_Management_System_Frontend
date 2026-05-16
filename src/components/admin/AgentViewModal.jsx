

import { getFullName, getInitials, fmtDate } from "./agentsHelpers";

function Avatar({ agent, size = 56 }) {
  return agent.profile?.photo_url ? (
    <img src={agent.profile.photo_url} alt="" className="aa-profile-avatar" style={{ width: size, height: size }} />
  ) : (
    <div className="aa-profile-avatar-placeholder" style={{ width: size, height: size, fontSize: size * 0.32 }}>
      {getInitials(agent)}
    </div>
  );
}

export default function AgentViewModal({ agent, onClose, onImpersonate, onToggleActive }) {
  return (
    <div className="aa-modal-overlay" onClick={onClose}>
      <div className="aa-modal" onClick={e => e.stopPropagation()}>
        <div className="aa-modal-header">
          <p className="aa-modal-title">Agent Profile</p>
          <p className="aa-modal-sub">Full details for this agent</p>
        </div>
        <div className="aa-modal-body">

          <div className="aa-profile-hero">
            <Avatar agent={agent} size={56} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="aa-profile-name">{getFullName(agent) || "—"}</div>
              <div className="aa-profile-email">{agent.email}</div>
              <div style={{ marginTop: 8 }}>
                <span className={`aa-badge ${agent.is_active ? "aa-badge-active" : "aa-badge-inactive"}`}>
                  <span className="aa-badge-dot" />
                  {agent.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          <div className="aa-grid">
            <div className="aa-grid-item">
              <div className="aa-grid-label">Rating</div>
              <div className="aa-grid-value">
                {agent.profile?.rating ? `⭐ ${parseFloat(agent.profile.rating).toFixed(1)}` : "—"}
              </div>
            </div>
            <div className="aa-grid-item">
              <div className="aa-grid-label">Reviews</div>
              <div className="aa-grid-value">{agent.profile?.total_reviews ?? "—"}</div>
            </div>
            <div className="aa-grid-item">
              <div className="aa-grid-label">Specialization</div>
              <div className="aa-grid-value">{agent.profile?.specialization || "—"}</div>
            </div>
            <div className="aa-grid-item">
              <div className="aa-grid-label">Experience</div>
              <div className="aa-grid-value">
                {agent.profile?.experience_years != null ? `${agent.profile.experience_years} years` : "—"}
              </div>
            </div>
            <div className="aa-grid-item">
              <div className="aa-grid-label">Phone</div>
              <div className="aa-grid-value">{agent.profile?.phone || "—"}</div>
            </div>
            <div className="aa-grid-item">
              <div className="aa-grid-label">License</div>
              <div className="aa-grid-value">{agent.profile?.license || "—"}</div>
            </div>
            <div className="aa-grid-item">
              <div className="aa-grid-label">Joined</div>
              <div className="aa-grid-value">{fmtDate(agent.created_at)}</div>
            </div>
            <div className="aa-grid-item">
              <div className="aa-grid-label">Role</div>
              <div className="aa-grid-value" style={{ textTransform: "capitalize" }}>{agent.role}</div>
            </div>
            {agent.profile?.bio && (
              <div className="aa-grid-item full">
                <div className="aa-grid-label">Bio</div>
                <div className="aa-grid-value">{agent.profile.bio}</div>
              </div>
            )}
          </div>

          <div className="aa-modal-footer">
            <button className="aa-btn-cancel" onClick={onClose}>Close</button>
            <button
              className="aa-btn-cancel"
              onClick={() => { onToggleActive(agent); onClose(); }}
              style={{
                color:       agent.is_active ? "#f87171" : "#34d399",
                borderColor: agent.is_active ? "rgba(248,113,113,0.25)" : "rgba(52,211,153,0.25)",
              }}
            >
              {agent.is_active ? "Deactivate" : "Activate"}
            </button>
            <button
              className="aa-btn-confirm"
              disabled={!agent.is_active}
              onClick={() => { onClose(); onImpersonate(agent); }}
            >
              Login as this Agent
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}