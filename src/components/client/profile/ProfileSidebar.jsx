import { I } from "./profileConstants";
 
export default function ProfileSidebar({ fullName, userInfo, profile }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
 
      {/* Summary card */}
      <div style={{ background: "#fff", border: "1px solid #e4ddd2", padding: "22px 20px" }}>
        <p style={{ fontSize: "10px", fontWeight: 600, color: "#a09080", textTransform: "uppercase", letterSpacing: "1.1px", margin: "0 0 16px", fontFamily: "'DM Sans',sans-serif" }}>Overview</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { icon: I.user(13),  label: "Name",  val: fullName || "—"                },
            { icon: I.mail(13),  label: "Email", val: userInfo?.email || "—"          },
            { icon: I.phone(13), label: "Phone", val: profile?.phone || "—"           },
            { icon: I.pin(13),   label: "City",  val: profile?.preferred_city || "—" },
            { icon: I.home(13),  label: "Type",  val: profile?.preferred_type || "—" },
          ].map(row => (
            <div key={row.label} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <span style={{ color: "#a09080", marginTop: 2, flexShrink: 0 }}>{row.icon}</span>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: "10px", fontWeight: 600, color: "#b0a890", textTransform: "uppercase", letterSpacing: ".8px", margin: "0 0 1px", fontFamily: "'DM Sans',sans-serif" }}>{row.label}</p>
                <p style={{ fontSize: "13px", color: row.val === "—" ? "#c0b8a8" : "#1a1a12", margin: 0, fontFamily: "'DM Sans',sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.val}</p>
              </div>
            </div>
          ))}
          {(profile?.budget_min || profile?.budget_max) && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <span style={{ color: "#a09080", marginTop: 2, flexShrink: 0 }}>{I.euro(13)}</span>
              <div>
                <p style={{ fontSize: "10px", fontWeight: 600, color: "#b0a890", textTransform: "uppercase", letterSpacing: ".8px", margin: "0 0 1px", fontFamily: "'DM Sans',sans-serif" }}>Budget</p>
                <p style={{ fontSize: "13px", color: "#1a1a12", margin: 0, fontFamily: "'DM Sans',sans-serif" }}>
                  €{profile.budget_min ? Number(profile.budget_min).toLocaleString("de-DE") : "—"}
                  <span style={{ color: "#c0b0a0", margin: "0 4px" }}>–</span>
                  €{profile.budget_max ? Number(profile.budget_max).toLocaleString("de-DE") : "—"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
 
      {/* Account status card */}
      <div style={{ background: "#fff", border: "1px solid #e4ddd2", padding: "18px 20px" }}>
        <p style={{ fontSize: "10px", fontWeight: 600, color: "#a09080", textTransform: "uppercase", letterSpacing: "1.1px", margin: "0 0 14px", fontFamily: "'DM Sans',sans-serif" }}>Account Status</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "12.5px", color: "#8a8070", fontFamily: "'DM Sans',sans-serif" }}>Role</span>
            <span style={{ fontSize: "12.5px", color: "#2a5040", fontWeight: 500, fontFamily: "'DM Sans',sans-serif" }}>Client</span>
          </div>
          <div style={{ height: 1, background: "#f0e8de" }}/>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "12.5px", color: "#8a8070", fontFamily: "'DM Sans',sans-serif" }}>Status</span>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: userInfo?.is_active ? "#2a8040" : "#c04040" }}/>
              <span style={{ fontSize: "12.5px", color: userInfo?.is_active ? "#2a5040" : "#8b3010", fontWeight: 500, fontFamily: "'DM Sans',sans-serif" }}>{userInfo?.is_active ? "Active" : "Inactive"}</span>
            </div>
          </div>
          {userInfo?.tenant_id && <>
            <div style={{ height: 1, background: "#f0e8de" }}/>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "12.5px", color: "#8a8070", fontFamily: "'DM Sans',sans-serif" }}>Tenant</span>
              <span style={{ fontSize: "12px", color: "#6b6040", fontFamily: "'DM Sans',sans-serif" }}>#{userInfo.tenant_id}</span>
            </div>
          </>}
        </div>
      </div>
    </div>
  );
}
 