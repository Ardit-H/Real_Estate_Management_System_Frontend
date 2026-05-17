import { parsePropertyData } from "./leadsConstants.js";
import { BTN_PRI } from "./leadsConstants.js";
 
export function StatusActions({ lead, onStatusChange, onDecline, onCompleteClick, loading, isMyLead }) {
  const { status } = lead;
 
  if (status === "DONE" || status === "REJECTED") {
    return <span style={{ fontSize:12, color:"#b0a890", fontStyle:"italic" }}>Final</span>;
  }
 
  if (!isMyLead) {
    if (status === "NEW" && !lead.assigned_agent_id) return <span style={{ fontSize:11.5, color:"#a8923e", background:"rgba(201,184,122,0.10)", padding:"3px 10px", borderRadius:999 }}>🕐 Unassigned</span>;
    if (status === "NEW" && lead.assigned_agent_id)  return <span style={{ fontSize:11.5, color:"#a8923e", background:"rgba(201,184,122,0.10)", padding:"3px 10px", borderRadius:999 }}>⏳ Waiting for acceptance</span>;
    return <span style={{ fontSize:11.5, color:"#b0a890", background:"#f0ece3", padding:"3px 10px", borderRadius:999, fontStyle:"italic" }}>View only</span>;
  }
 
  if (status === "NEW") {
    return (
      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
        <button className="al-btn" onClick={() => onStatusChange(lead.id, "IN_PROGRESS")} disabled={loading} style={{ ...BTN_PRI, padding:"6px 14px", fontSize:12 }}>▶ Accept</button>
        <button className="al-btn" onClick={() => onDecline(lead.id)} disabled={loading} style={{ padding:"6px 14px", borderRadius:9, border:"1.5px solid rgba(192,112,80,0.30)", background:"rgba(192,112,80,0.08)", color:"#8b4030", fontSize:12, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>↩ Decline</button>
      </div>
    );
  }
 
  if (status === "IN_PROGRESS") {
    const hasPropertyData = !!parsePropertyData(lead.message) && (lead.type === "SELL" || lead.type === "RENT");
    return (
      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
        <button className="al-btn" onClick={() => onCompleteClick(lead)} disabled={loading}
          style={{ padding:"6px 14px", borderRadius:9, border:`1.5px solid ${hasPropertyData ? "rgba(126,184,164,0.30)" : "rgba(164,176,126,0.30)"}`, background:hasPropertyData ? "rgba(126,184,164,0.10)" : "rgba(164,176,126,0.10)", color:hasPropertyData ? "#2a6049" : "#5a6a38", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}
          title={hasPropertyData ? "Complete + Create property automatically" : "Mark as completed"}>
          ✓ Complete{hasPropertyData ? " 🏠" : ""}
        </button>
        <button className="al-btn" onClick={() => onStatusChange(lead.id, "REJECTED")} disabled={loading} style={{ padding:"6px 14px", borderRadius:9, border:"1.5px solid rgba(192,112,80,0.30)", background:"rgba(192,112,80,0.08)", color:"#8b4030", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>✕ Reject</button>
      </div>
    );
  }
 
  return null;
}
 