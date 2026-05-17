import { useEffect, useContext } from "react";
import { AuthContext } from "../../../context/AuthProvider";
import { TYPE_ICON, SOURCE_ICON, STATUS_CFG, fmtDate, parsePropertyData, cleanMessage } from "./leadsConstants.js";
import { Modal, StatusBadge } from "./LeadsUI.jsx";
import { StatusActions } from "./StatusActions.jsx";
 
export function LeadDetailModal({ lead, onClose, onStatusChange, onDecline, onCompleteClick, statusLoading, isMyLead }) {
  const { user }     = useContext(AuthContext);
  const propertyData = parsePropertyData(lead.message);
  const s            = STATUS_CFG[lead.status] || STATUS_CFG.NEW;
 
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
 
  return (
    <Modal title={`Lead #${lead.id} — ${lead.type}`} onClose={onClose} wide>
      {!isMyLead && (
        <div style={{ background:"rgba(201,184,122,0.06)", border:"1.5px solid rgba(201,184,122,0.18)", borderRadius:10, padding:"10px 14px", marginBottom:16, fontSize:13, color:"#a8923e", display:"flex", alignItems:"center", gap:8 }}>
          ℹ️{" "}
          {!lead.assigned_agent_id ? "This lead has not been assigned to any agent yet." : lead.assigned_agent_id === user?.id ? "This lead is assigned to you." : `This lead is assigned to agent ${lead.agent_name || `#${lead.assigned_agent_id}`}.`}
        </div>
      )}
 
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16, padding:"12px 16px", background:s.pill, border:`1.5px solid ${s.pillBorder}`, borderRadius:11 }}>
        <div>
          <p style={{ fontSize:9.5, color:"#b0a890", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:5 }}>Status</p>
          <StatusBadge status={lead.status} />
        </div>
        <StatusActions lead={lead} onStatusChange={onStatusChange} onDecline={onDecline} onCompleteClick={onCompleteClick} loading={statusLoading} isMyLead={isMyLead} />
      </div>
 
      {propertyData && (lead.type === "SELL" || lead.type === "RENT") && (
        <div style={{ background:lead.type==="SELL" ? "rgba(201,184,122,0.06)" : "rgba(126,184,164,0.06)", border:`1.5px solid ${lead.type==="SELL" ? "rgba(201,184,122,0.20)" : "rgba(126,184,164,0.20)"}`, borderRadius:11, padding:"14px 16px", marginBottom:16 }}>
          <p style={{ fontSize:9.5, fontWeight:700, color:lead.type==="SELL" ? "#c9b87a" : "#7eb8a4", textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:10 }}>
            🏠 Property data from client
            {lead.status === "IN_PROGRESS" && isMyLead && <span style={{ fontSize:10.5, fontWeight:400, color:"#b0a890", marginLeft:8 }}>— will be created automatically after Complete</span>}
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7 }}>
            {propertyData.title         && <span style={{ fontSize:13, color:"#4a4438" }}>📌 {propertyData.title}</span>}
            {propertyData.city          && <span style={{ fontSize:13, color:"#4a4438" }}>📍 {propertyData.city}</span>}
            {propertyData.property_type && <span style={{ fontSize:13, color:"#4a4438" }}>🏗 {propertyData.property_type}</span>}
            {propertyData.area_sqm      && <span style={{ fontSize:13, color:"#4a4438" }}>📐 {propertyData.area_sqm} m²</span>}
            {propertyData.bedrooms      && <span style={{ fontSize:13, color:"#4a4438" }}>🛏 {propertyData.bedrooms} rooms</span>}
            {propertyData.bathrooms     && <span style={{ fontSize:13, color:"#4a4438" }}>🚿 {propertyData.bathrooms} bathrooms</span>}
            {propertyData.floor         && <span style={{ fontSize:13, color:"#4a4438" }}>🏢 Floor {propertyData.floor}</span>}
            {propertyData.year_built    && <span style={{ fontSize:13, color:"#4a4438" }}>🗓 Built: {propertyData.year_built}</span>}
            {propertyData.price         && <span style={{ fontSize:13, color:"#1a1714", fontWeight:600 }}>💰 {Number(propertyData.price).toLocaleString("de-DE")} {propertyData.currency}</span>}
            {propertyData.total_floors  && <span style={{ fontSize:13, color:"#4a4438" }}>🏢 {propertyData.total_floors} floors total</span>}
            {propertyData.price_per_sqm && <span style={{ fontSize:13, color:"#4a4438" }}>📊 €{Number(propertyData.price_per_sqm).toLocaleString("de-DE")}/m²</span>}
          </div>
          {propertyData.street      && <p style={{ fontSize:13, marginTop:8, color:"#6b6248" }}>📍 {propertyData.street}</p>}
          {propertyData.description && <p style={{ fontSize:13, marginTop:8, color:"#6b6248", fontStyle:"italic", lineHeight:1.5, fontFamily:"'Cormorant Garamond',Georgia,serif" }}>"{propertyData.description}"</p>}
        </div>
      )}
 
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9, marginBottom:16 }}>
        {[
          { label:"Client",          value:lead.client_name || `#${lead.client_id}` },
          { label:"Agent",           value:lead.agent_name || (lead.assigned_agent_id ? `#${lead.assigned_agent_id}` : "—") },
          { label:"Type",            value:`${TYPE_ICON[lead.type] || ""} ${lead.type}` },
          { label:"Source",          value:`${SOURCE_ICON[lead.source] || ""} ${lead.source}` },
          { label:"Preferred Date",  value:fmtDate(lead.preferred_date) },
        ].map(({ label, value }) => (
          <div key={label} style={{ background:"#fff", borderRadius:10, padding:"10px 14px", border:"1.5px solid #e8e2d6" }}>
            <p style={{ fontSize:9.5, color:"#b0a890", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.7px", marginBottom:4 }}>{label}</p>
            <p style={{ fontSize:13.5, fontWeight:500, color:"#1a1714", margin:0, fontFamily:"'Cormorant Garamond',Georgia,serif" }}>{value}</p>
          </div>
        ))}
      </div>
 
      {lead.message && cleanMessage(lead.message) && (
        <div style={{ background:"#fff", border:"1.5px solid #e8e2d6", borderRadius:11, padding:"14px 16px" }}>
          <p style={{ fontSize:9.5, color:"#b0a890", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.7px", marginBottom:8 }}>Message</p>
          <p style={{ fontSize:14.5, color:"#3c3830", lineHeight:1.85, fontStyle:"italic", margin:0, fontFamily:"'Cormorant Garamond',Georgia,serif" }}>"{cleanMessage(lead.message)}"</p>
        </div>
      )}
    </Modal>
  );
}
 