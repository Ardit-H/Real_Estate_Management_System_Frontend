import { TYPE_ICON, SOURCE_ICON, fmtDate, BTN_SEC } from "./leadsConstants.js";
import { StatusBadge } from "./LeadsUI.jsx";
import { StatusActions } from "./StatusActions.jsx";
 
export function LeadRow({ lead, onView, onStatusChange, onDecline, onCompleteClick, statusLoading, isMyLead }) {
  return (
    <tr style={{ borderBottom:"1px solid #f0ece3", transition:"background 0.12s" }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "#faf7f2"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = ""; }}>
      <td style={{ padding:"12px 16px", color:"#b0a890", fontSize:12 }}>{lead.id}</td>
      <td style={{ padding:"12px 16px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ fontSize:16 }}>{TYPE_ICON[lead.type] || "📋"}</span>
          <span style={{ fontWeight:500, fontSize:13.5, color:"#1a1714" }}>{lead.type}</span>
        </div>
      </td>
      <td style={{ padding:"12px 16px", fontWeight:500, fontSize:13, color:"#1a1714" }}>{lead.client_name || `#${lead.client_id}`}</td>
      <td style={{ padding:"12px 16px", fontSize:12.5, color:"#9a8c6e" }}>{lead.property_title || (lead.property_id ? `#${lead.property_id}` : "—")}</td>
      {!isMyLead && (
        <td style={{ padding:"12px 16px" }}>
          {lead.agent_name
            ? <span style={{ fontWeight:500, fontSize:13, color:"#1a1714" }}>{lead.agent_name}</span>
            : <span style={{ color:"#b0a890", fontSize:12, fontStyle:"italic" }}>No agent</span>}
        </td>
      )}
      <td style={{ padding:"12px 16px", fontSize:12.5, color:"#9a8c6e" }}>{SOURCE_ICON[lead.source]} {lead.source}</td>
      <td style={{ padding:"12px 16px" }}><StatusBadge status={lead.status} /></td>
      <td style={{ padding:"12px 16px", fontSize:12, color:"#b0a890" }}>{fmtDate(lead.created_at)}</td>
      <td style={{ padding:"12px 16px" }}>
        <div style={{ display:"flex", gap:6, alignItems:"center" }}>
          <button className="al-btn" onClick={() => onView(lead)} style={{ padding:"5px 11px", borderRadius:9, border:"1.5px solid #e4ddd0", background:"transparent", color:"#6b6248", fontSize:12, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>View</button>
          <StatusActions lead={lead} onStatusChange={onStatusChange} onDecline={onDecline} onCompleteClick={onCompleteClick} loading={statusLoading} isMyLead={isMyLead} />
        </div>
      </td>
    </tr>
  );
}
 