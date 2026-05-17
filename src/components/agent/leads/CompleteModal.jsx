import { useState, useEffect } from "react";
import { parsePropertyData, TYPE_ICON, BTN_SEC, BTN_PRI } from "./leadsConstants.js";
import { Modal } from "./LeadsUI.jsx";
 
export function CompleteModal({ lead, onConfirm, onClose, loading }) {
  const propertyData    = parsePropertyData(lead.message);
  const hasPropertyData = !!propertyData && (lead.type === "SELL" || lead.type === "RENT");
  const [createProperty, setCreateProperty] = useState(hasPropertyData);
 
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
 
  return (
    <Modal title={`✓ Confirm Complete — Lead #${lead.id}`} onClose={onClose}>
      {hasPropertyData ? (
        <>
          <p style={{ fontSize:13.5, color:"#6b6248", marginBottom:14, lineHeight:1.6 }}>
            This <strong style={{ color:"#1a1714" }}>{TYPE_ICON[lead.type]} {lead.type}</strong> lead has property data. Would you like to automatically add it as a new property in the system?
          </p>
          <div style={{ background:"rgba(126,184,164,0.08)", border:"1.5px solid rgba(126,184,164,0.22)", borderRadius:10, padding:"12px 16px", marginBottom:16 }}>
            <p style={{ fontSize:10, fontWeight:700, color:"#2a6049", textTransform:"uppercase", letterSpacing:"1px", marginBottom:8 }}>🏠 Property to be created</p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
              {propertyData.title         && <span style={{ fontSize:13, color:"#4a4438" }}>📌 {propertyData.title}</span>}
              {propertyData.city          && <span style={{ fontSize:13, color:"#4a4438" }}>📍 {propertyData.city}</span>}
              {propertyData.property_type && <span style={{ fontSize:13, color:"#4a4438" }}>🏗 {propertyData.property_type}</span>}
              {propertyData.area_sqm      && <span style={{ fontSize:13, color:"#4a4438" }}>📐 {propertyData.area_sqm} m²</span>}
              {propertyData.bedrooms      && <span style={{ fontSize:13, color:"#4a4438" }}>🛏 {propertyData.bedrooms} rooms</span>}
              {propertyData.price         && <span style={{ fontSize:13, color:"#1a1714", fontWeight:600 }}>💰 {Number(propertyData.price).toLocaleString("de-DE")} {propertyData.currency}</span>}
              {propertyData.total_floors  && <span style={{ fontSize:13, color:"#4a4438" }}>🏢 {propertyData.total_floors} floors</span>}
              {propertyData.price_per_sqm && <span style={{ fontSize:13, color:"#4a4438" }}>📊 €{Number(propertyData.price_per_sqm).toLocaleString("de-DE")}/m²</span>}
            </div>
          </div>
          <div onClick={() => setCreateProperty((p) => !p)} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20, padding:"10px 14px", background:"#f8f5f0", borderRadius:9, cursor:"pointer", border:"1.5px solid #e8e2d6" }}>
            <div style={{ width:20, height:20, borderRadius:5, background:createProperty ? "#2a6049" : "#e4ddd0", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"background .15s" }}>
              {createProperty && <span style={{ color:"white", fontSize:12 }}>✓</span>}
            </div>
            <span style={{ fontSize:13.5, color:"#4a4438" }}>Automatically create property in the system after Complete</span>
          </div>
        </>
      ) : (
        <p style={{ fontSize:13.5, color:"#6b6248", marginBottom:20, lineHeight:1.6 }}>
          Are you sure you want to mark lead #{lead.id} as <strong style={{ color:"#1a1714" }}>DONE</strong>? This action is final and cannot be changed.
        </p>
      )}
      <div style={{ display:"flex", gap:9, justifyContent:"flex-end" }}>
        <button style={BTN_SEC} onClick={onClose} disabled={loading}>Cancel</button>
        <button style={{ ...BTN_PRI, background:loading ? "#b0a890" : undefined }} disabled={loading} onClick={() => onConfirm(lead, createProperty && hasPropertyData, propertyData)}>
          {loading ? "Processing..." : "✓ Complete"}
        </button>
      </div>
    </Modal>
  );
}
 