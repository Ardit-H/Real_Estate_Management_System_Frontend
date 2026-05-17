import { useEffect } from "react";
import { C, LEAD_STATUS_CFG, CONTRACT_STATUS_CFG, getInitials, getAvatarColor, fmtDate, fmtMoney } from "./clientsConstants.js";
 
export function Toast({ msg, type = "success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{ position:"fixed", bottom:26, right:26, zIndex:9999, background:C.dark, color:type==="error"?"#f09090":"#90c8a8", padding:"11px 18px", borderRadius:12, fontSize:13, boxShadow:"0 10px 36px rgba(0,0,0,0.32)", border:`1px solid ${type==="error"?"rgba(240,128,128,0.15)":"rgba(144,200,168,0.15)"}`, fontFamily:"'DM Sans',sans-serif", animation:"mc-toast 0.2s ease", display:"flex", alignItems:"center", gap:8 }}>
      {type === "error" ? "⚠️" : "✅"} {msg}
    </div>
  );
}
 
export function Skeleton({ rows = 4, h = 68 }) {
  return (
    <div style={{ padding:"14px 16px", display:"flex", flexDirection:"column", gap:10 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="mc-skeleton" style={{ height:h, opacity:1 - i * 0.15 }} />
      ))}
    </div>
  );
}
 
export function EmptyState({ icon, title, sub }) {
  return (
    <div style={{ padding:"48px 20px", textAlign:"center", color:C.textMut }}>
      <div style={{ fontSize:38, marginBottom:10 }}>{icon}</div>
      <p style={{ fontSize:14, fontWeight:600, color:C.textSub, margin:"0 0 4px", fontFamily:"'Cormorant Garamond',Georgia,serif" }}>{title}</p>
      {sub && <p style={{ fontSize:12, margin:0 }}>{sub}</p>}
    </div>
  );
}
 
export function SectionHeader({ title, count, children }) {
  return (
    <div style={{ padding:"14px 20px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", background:"#fdf9f4", flexWrap:"wrap", gap:10 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <p style={{ margin:0, fontSize:15, fontWeight:700, color:C.text, fontFamily:"'Cormorant Garamond',Georgia,serif" }}>{title}</p>
        {count != null && <span style={{ background:`${C.gold}22`, color:C.textSub, padding:"2px 9px", borderRadius:20, fontSize:11, fontWeight:600 }}>{count}</span>}
      </div>
      {children}
    </div>
  );
}
 
export function StatusChips({ statuses }) {
  const counts = {};
  statuses.forEach(s => { counts[s] = (counts[s] || 0) + 1; });
  return (
    <div style={{ display:"flex", gap:5, flexWrap:"wrap", justifyContent:"flex-end" }}>
      {Object.entries(counts).map(([status, count]) => {
        const s = LEAD_STATUS_CFG[status] || LEAD_STATUS_CFG.DECLINED;
        return (
          <span key={status} style={{ background:s.bg, color:s.color, padding:"2px 8px", borderRadius:20, fontSize:10.5, fontWeight:600, whiteSpace:"nowrap" }}>
            {status.replace(/_/g, " ")}{count > 1 ? ` ×${count}` : ""}
          </span>
        );
      })}
    </div>
  );
}
 
export function ClientModal({ client, profile, leads, contracts, loading, onClose }) {
  const av = getAvatarColor(client.clientId);
  return (
    <div className="mc-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mc-modal">
        <div style={{ padding:"18px 22px 14px", borderBottom:`1px solid ${C.border}`, background:"#fdf9f4", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ ...av, width:46, height:46, borderRadius:12, fontSize:16, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700 }}>
              {getInitials(client.clientName)}
            </div>
            <div>
              <p style={{ margin:0, fontSize:16, fontWeight:700, color:C.text, fontFamily:"'Cormorant Garamond',Georgia,serif" }}>{client.clientName}</p>
              <p style={{ margin:0, fontSize:12, color:C.muted }}>{client.leadCount} lead{client.leadCount !== 1 ? "s" : ""} assigned to you</p>
            </div>
          </div>
          <button className="mc-btn" onClick={onClose}
            style={{ width:30, height:30, borderRadius:8, background:"#f0ece3", border:`1px solid ${C.border}`, fontSize:18, display:"flex", alignItems:"center", justifyContent:"center", color:C.muted }}>
            ×
          </button>
        </div>
 
        <div style={{ padding:"18px 22px" }}>
          {loading ? (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {[80,60,80].map((h,i) => <div key={i} className="mc-skeleton" style={{ height:h }} />)}
            </div>
          ) : (
            <>
              <p style={{ margin:"0 0 10px", fontSize:10, fontWeight:600, color:C.textMut, textTransform:"uppercase", letterSpacing:"0.9px" }}>Client Profile</p>
              {profile ? (
                <div style={{ background:"#f5f0e8", borderRadius:10, padding:"12px 14px", marginBottom:18, display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px 16px" }}>
                  {[
                    ["Phone",       profile.phone || "—"],
                    ["Contact via", profile.preferred_contact || "—"],
                    ["Budget min",  fmtMoney(profile.budget_min)],
                    ["Budget max",  fmtMoney(profile.budget_max)],
                    ["Pref. type",  profile.preferred_type || "—"],
                    ["Pref. city",  profile.preferred_city || "—"],
                  ].map(([k,v]) => (
                    <div key={k}>
                      <p style={{ margin:0, fontSize:10, color:C.textMut, textTransform:"uppercase", letterSpacing:"0.7px", marginBottom:2 }}>{k}</p>
                      <p style={{ margin:0, fontSize:13, fontWeight:500, color:C.text }}>{v}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ background:"#f5f0e8", borderRadius:10, padding:"12px 14px", marginBottom:18 }}>
                  <p style={{ margin:0, fontSize:12.5, color:C.textMut }}>This client has not set up their profile yet.</p>
                </div>
              )}
 
              <p style={{ margin:"0 0 10px", fontSize:10, fontWeight:600, color:C.textMut, textTransform:"uppercase", letterSpacing:"0.9px" }}>Leads ({leads.length})</p>
              {leads.length === 0 ? (
                <div style={{ background:"#f5f0e8", borderRadius:10, padding:"12px 14px", marginBottom:18 }}>
                  <p style={{ margin:0, fontSize:12.5, color:C.textMut }}>No leads found.</p>
                </div>
              ) : (
                <div style={{ background:"#f5f0e8", borderRadius:10, overflow:"hidden", marginBottom:18 }}>
                  {leads.slice(0,6).map((l,i) => {
                    const s = LEAD_STATUS_CFG[l.status] || LEAD_STATUS_CFG.DECLINED;
                    return (
                      <div key={l.id} style={{ padding:"10px 14px", borderBottom:i < Math.min(leads.length,6)-1 ? `1px solid ${C.border}` : "none", display:"flex", alignItems:"center", gap:10 }}>
                        <div style={{ flex:1, minWidth:0 }}>
                          <p style={{ margin:0, fontSize:12.5, fontWeight:500, color:C.text }}>{l.type}{l.property_title ? ` · ${l.property_title}` : ""}</p>
                          <p style={{ margin:"2px 0 0", fontSize:11, color:C.textMut }}>{l.source} · {fmtDate(l.created_at)}{l.budget ? ` · ${fmtMoney(l.budget)}` : ""}</p>
                        </div>
                        <span style={{ background:s.bg, color:s.color, padding:"2px 9px", borderRadius:20, fontSize:10.5, fontWeight:600 }}>{l.status?.replace(/_/g," ")}</span>
                      </div>
                    );
                  })}
                </div>
              )}
 
              <p style={{ margin:"0 0 10px", fontSize:10, fontWeight:600, color:C.textMut, textTransform:"uppercase", letterSpacing:"0.9px" }}>Contracts ({contracts.length})</p>
              {contracts.length === 0 ? (
                <div style={{ background:"#f5f0e8", borderRadius:10, padding:"12px 14px" }}>
                  <p style={{ margin:0, fontSize:12.5, color:C.textMut }}>No lease contracts found for this client.</p>
                </div>
              ) : (
                <div style={{ background:"#f5f0e8", borderRadius:10, overflow:"hidden" }}>
                  {contracts.slice(0,4).map((c,i) => {
                    const s = CONTRACT_STATUS_CFG[c.status] || CONTRACT_STATUS_CFG.PENDING_SIGNATURE;
                    return (
                      <div key={c.id} style={{ padding:"10px 14px", borderBottom:i < Math.min(contracts.length,4)-1 ? `1px solid ${C.border}` : "none", display:"flex", alignItems:"center", gap:10 }}>
                        <div style={{ flex:1, minWidth:0 }}>
                          <p style={{ margin:0, fontSize:12.5, fontWeight:500, color:C.text }}>Contract #{c.id} · {fmtMoney(c.rent)}/mo</p>
                          <p style={{ margin:"2px 0 0", fontSize:11, color:C.textMut }}>{fmtDate(c.start_date)} → {fmtDate(c.end_date)}</p>
                        </div>
                        <span style={{ background:s.bg, color:s.color, padding:"2px 9px", borderRadius:20, fontSize:10.5, fontWeight:600 }}>{c.status?.replace(/_/g," ")}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
 