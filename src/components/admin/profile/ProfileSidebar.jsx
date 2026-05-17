import { C, fmtDate } from "./profileConstants.js";
import { Avatar } from "./ProfileUI.jsx";
 
export function ProfileSidebar({ fullName, userInfo, activeTab, setActiveTab }) {
  const TABS = [
    { id: "account",  label: "Account",       icon: "✉️" },
    { id: "password", label: "Password",       icon: "🔒" },
    { id: "info",     label: "System info",   icon: "ℹ️" },
  ];
 
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Avatar card */}
      <div className="ap-card">
        <div style={{ padding: "28px 20px", textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
            <Avatar name={fullName} size={88} />
          </div>
          <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 4, fontFamily: "'Cormorant Garamond',Georgia,serif", color: C.text }}>{fullName}</h3>
          <p style={{ fontSize: 12.5, color: C.muted, marginBottom: 12 }}>{userInfo?.email}</p>
          <span style={{ background: `${C.gold}22`, color: C.textSub, padding: "3px 14px", borderRadius: 20, fontSize: 11.5, fontWeight: 600, border: `1px solid ${C.gold}44` }}>Administrator</span>
 
          <div style={{ marginTop: 18, paddingTop: 18, borderTop: `1px solid ${C.border}` }}>
            {[
              { label: "Status",       value: userInfo?.is_active ? "● Active" : "● Inactive", valueColor: userInfo?.is_active ? "#059669" : "#dc2626" },
              { label: "Tenant ID",    value: `#${userInfo?.tenant_id}` },
              { label: "Member since", value: fmtDate(userInfo?.created_at) },
            ].map(row => (
              <div key={row.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: C.muted, marginBottom: 8 }}>
                <span>{row.label}</span>
                <strong style={{ color: row.valueColor || C.textSub }}>{row.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
 
      {/* Nav tabs */}
      <div className="ap-card" style={{ overflow: "hidden" }}>
        {TABS.map(tab => (
          <button key={tab.id} className="ap-tab-btn" onClick={() => setActiveTab(tab.id)}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "12px 16px",
              background: activeTab === tab.id ? "#fff8ee" : "transparent",
              borderLeft: activeTab === tab.id ? `3px solid ${C.gold}` : `3px solid transparent`,
              color: activeTab === tab.id ? C.dark : C.muted,
              fontWeight: activeTab === tab.id ? 600 : 400,
              fontSize: 13.5, borderBottom: `1px solid ${C.border}`,
            }}>
            <span>{tab.icon}</span>
            <span style={{ fontFamily: "'DM Sans',sans-serif" }}>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
 