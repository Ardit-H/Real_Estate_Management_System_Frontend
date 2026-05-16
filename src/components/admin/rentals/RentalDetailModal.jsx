// src/components/admin/rentals/RentalDetailModal.jsx

import { useEffect } from "react";
import RentalsBadge from "./RentalsBadge";
import { fmtPrice, fmtDate, fmtDateTime } from "./rentalsHelpers";

export default function RentalDetailModal({ listing: l, onClose }) {
  useEffect(() => {
    const h = e => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(8,6,4,0.82)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "'DM Sans', sans-serif" }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ width: "100%", maxWidth: 600, background: "#faf7f2", borderRadius: 18, boxShadow: "0 44px 100px rgba(0,0,0,0.55)", maxHeight: "90vh", overflow: "hidden", animation: "ar-scale 0.22s ease" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid rgba(138,125,94,0.15)", position: "sticky", top: 0, background: "#faf7f2", zIndex: 1 }}>
          <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 700, fontSize: 17, color: "#1a1714" }}>Rental Listing #{l.id} — Detaje</span>
          <button onClick={onClose} style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(138,125,94,0.2)", background: "rgba(138,125,94,0.08)", color: "#8a7d5e", cursor: "pointer", fontSize: 15, borderRadius: 8 }}>✕</button>
        </div>
        <div style={{ padding: "22px 24px", overflowY: "auto", maxHeight: "calc(90vh - 60px)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px", marginBottom: 16 }}>
            {[
              ["ID",             `#${l.id}`],
              ["Property",       `#${l.property_id}`],
              ["Agent",          l.agent_id ? `#${l.agent_id}` : "—"],
              ["Price",          `${fmtPrice(l.price, l.currency)} / ${l.price_period || "MONTHLY"}`],
              ["Deposit",        fmtPrice(l.deposit, l.currency)],
              ["Min Lease",      l.min_lease_months ? `${l.min_lease_months} muaj` : "—"],
              ["Available From", fmtDate(l.available_from)],
              ["Available Until",fmtDate(l.available_until)],
              ["Status",         "badge"],
              ["Created",        fmtDateTime(l.created_at)],
              ["Updated",        fmtDateTime(l.updated_at)],
            ].map(([label, val]) => (
              <div key={label}>
                <p style={{ fontSize: 10, color: "#b0a890", textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 3px" }}>{label}</p>
                {val === "badge"
                  ? <RentalsBadge label={l.status} />
                  : <p style={{ fontSize: 14, fontWeight: 500, margin: 0, color: "#1a1714", fontFamily: "'Cormorant Garamond', serif" }}>{val}</p>}
              </div>
            ))}
          </div>
          {l.title && (
            <div style={{ marginBottom: 10 }}>
              <p style={{ fontSize: 10, color: "#b0a890", textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 4px" }}>Title</p>
              <p style={{ fontSize: 14, fontWeight: 500, margin: 0, color: "#1a1714" }}>{l.title}</p>
            </div>
          )}
          {l.description && (
            <div>
              <p style={{ fontSize: 10, color: "#b0a890", textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 4px" }}>Description</p>
              <p style={{ fontSize: 13, color: "#4a4438", lineHeight: 1.6, margin: 0 }}>{l.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}