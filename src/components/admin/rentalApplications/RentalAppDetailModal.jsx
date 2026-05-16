// src/components/admin/rentalApplications/RentalAppDetailModal.jsx

import { useEffect } from "react";
import RentalAppBadge from "./RentalAppBadge";
import { fmtPrice, fmtDate, fmtDateTime } from "./rentalAppHelpers";

export default function RentalAppDetailModal({ app: a, onClose }) {
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
      <div style={{ width: "100%", maxWidth: 520, background: "#faf7f2", borderRadius: 18, boxShadow: "0 44px 100px rgba(0,0,0,0.55)", maxHeight: "90vh", overflow: "hidden", animation: "ara-scale 0.22s ease" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid rgba(138,125,94,0.15)", position: "sticky", top: 0, background: "#faf7f2", zIndex: 1 }}>
          <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 700, fontSize: 17, color: "#1a1714" }}>Aplikim #{a.id} — Detaje</span>
          <button onClick={onClose} style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(138,125,94,0.2)", background: "rgba(138,125,94,0.08)", color: "#8a7d5e", cursor: "pointer", fontSize: 15, borderRadius: 8 }}>✕</button>
        </div>
        <div style={{ padding: "22px 24px", overflowY: "auto", maxHeight: "calc(90vh - 60px)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px", marginBottom: 16 }}>
            {[
              ["ID",          `#${a.id}`],
              ["Listing",     `#${a.listing_id}`],
              ["Client",      `#${a.client_id}`],
              ["Status",      "badge"],
              ["Income",      fmtPrice(a.income)],
              ["Move-in Date",fmtDate(a.move_in_date)],
              ["Reviewed By", a.reviewed_by ? `#${a.reviewed_by}` : "—"],
              ["Reviewed At", fmtDateTime(a.reviewed_at)],
              ["Created",     fmtDateTime(a.created_at)],
            ].map(([label, val]) => (
              <div key={label}>
                <p style={{ fontSize: 10, color: "#b0a890", textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 3px" }}>{label}</p>
                {val === "badge"
                  ? <RentalAppBadge label={a.status} />
                  : <p style={{ fontSize: 14, fontWeight: 500, margin: 0, color: "#1a1714", fontFamily: "'Cormorant Garamond', serif" }}>{val}</p>}
              </div>
            ))}
          </div>
          {a.message && (
            <div style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 10, color: "#b0a890", textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 4px" }}>Mesazhi i Klientit</p>
              <div style={{ background: "rgba(138,125,94,0.05)", border: "1px solid rgba(138,125,94,0.12)", borderRadius: 9, padding: "10px 14px", fontSize: 13, color: "#4a4438", lineHeight: 1.6 }}>{a.message}</div>
            </div>
          )}
          {a.rejection_reason && (
            <div>
              <p style={{ fontSize: 10, color: "#b0a890", textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 4px" }}>Arsyeja e Refuzimit</p>
              <div style={{ background: "rgba(216,90,48,0.06)", border: "1px solid rgba(216,90,48,0.15)", borderRadius: 9, padding: "10px 14px", fontSize: 13, color: "#D85A30", lineHeight: 1.6 }}>{a.rejection_reason}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}