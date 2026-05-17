import { useState } from "react";
import { STATUS_CONFIG, fmtDate, fmtMon, CalendarIcon, EuroIcon, HomeIcon, CloseIcon } from "./applicationsConstants";
import { ConfirmCancelModal, ListingDetail } from "./ApplicationModals";
 
export default function ApplicationCard({ app, onCancel }) {
  const [cancelling,  setCancelling]  = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
 
  const s = STATUS_CONFIG[app.status] || STATUS_CONFIG.CANCELLED;
 
  const handleConfirmCancel = async () => {
    setCancelling(true);
    await onCancel(app.id);
    setCancelling(false);
    setShowConfirm(false);
  };
 
  return (
    <>
      <div
        style={{ background: "#fff", borderRadius: "14px", overflow: "hidden", boxShadow: "0 2px 12px rgba(90,95,58,0.10)", border: "1px solid #ede9df", transition: "transform 0.18s, box-shadow 0.18s" }}
        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(90,95,58,0.18)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(90,95,58,0.10)"; }}
      >
        <div style={{ height: "4px", background: s.strip }} />
 
        <div style={{ padding: "18px 22px" }}>
          {/* Top row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "14px" }}>
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#a0997e", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "4px" }}>
                Application #{app.id}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "#8a8469", fontSize: "12.5px" }}>
                <CalendarIcon />
                <span>Submitted on {fmtDate(app.created_at)}</span>
              </div>
            </div>
            <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, padding: "3px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}>
              {s.icon} {s.label}
            </span>
          </div>
 
          {/* Listing section */}
          <div style={{ marginBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11.5px", fontWeight: 700, color: "#6b6651", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "2px" }}>
              <HomeIcon /> Listing
            </div>
            <ListingDetail listingId={app.listing_id} />
          </div>
 
          {/* Income / move-in */}
          {(app.income != null || app.move_in_date) && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 20px", padding: "10px 14px", background: "#f5f2eb", borderRadius: "8px", border: "1px solid #e5e0d4", marginBottom: "12px" }}>
              {app.income != null && (
                <span style={{ fontSize: "12.5px", color: "#4a4a36", display: "flex", alignItems: "center", gap: 4 }}>
                  <EuroIcon /> Income: <strong>{fmtMon(app.income)}/month</strong>
                </span>
              )}
              {app.move_in_date && (
                <span style={{ fontSize: "12.5px", color: "#4a4a36", display: "flex", alignItems: "center", gap: 4 }}>
                  <CalendarIcon /> Move-in Date: <strong>{fmtDate(app.move_in_date)}</strong>
                </span>
              )}
            </div>
          )}
 
          {/* Message */}
          {app.message && (
            <div style={{ padding: "10px 14px", background: "#f5f2eb", borderLeft: "3px solid #a3a380", borderRadius: "0 8px 8px 0", marginBottom: "12px" }}>
              <p style={{ margin: 0, fontSize: "13px", color: "#4a4a36", fontStyle: "italic", lineHeight: 1.6 }}>"{app.message}"</p>
            </div>
          )}
 
          {/* Status banners */}
          {app.status === "APPROVED" && (
            <div style={{ background: "#edf5f0", border: "1px solid #a3c9b0", borderRadius: "10px", padding: "12px 14px", fontSize: "13px", color: "#2a6049", display: "flex", alignItems: "center", gap: 8, marginBottom: "4px" }}>
              🎉 <span>Your application has been approved! The agent will contact you soon.</span>
            </div>
          )}
          {app.status === "CANCELLED" && (
            <div style={{ background: "#f5f2eb", border: "1px solid #d9d4c7", borderRadius: "10px", padding: "12px 14px", fontSize: "13px", color: "#8a8469", display: "flex", alignItems: "center", gap: 8, marginBottom: "4px" }}>
              🚫 <span>This application has been cancelled.</span>
            </div>
          )}
          {app.status === "REJECTED" && (
            <div style={{ background: "#fff5ee", border: "1px solid #f5c6a0", borderRadius: "10px", padding: "12px 14px", fontSize: "13px", color: "#8b4513", display: "flex", alignItems: "center", gap: 8, marginBottom: "4px" }}>
              ❌ <span>Your application has been rejected.</span>
            </div>
          )}
 
          {/* Cancel button */}
          {app.status === "PENDING" && (
            <div style={{ marginTop: "14px" }}>
              <button
                onClick={() => setShowConfirm(true)}
                style={{ padding: "8px 18px", borderRadius: "8px", border: "1.5px solid #d9c4b0", background: "#fff", color: "#8b4513", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s", display: "flex", alignItems: "center", gap: 6 }}
                onMouseEnter={e => { e.currentTarget.style.background = "#fff5ee"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#fff"; }}
              >
                <CloseIcon /> Cancel Application
              </button>
            </div>
          )}
        </div>
      </div>
 
      {showConfirm && (
        <ConfirmCancelModal loading={cancelling} onConfirm={handleConfirmCancel} onClose={() => setShowConfirm(false)} />
      )}
    </>
  );
}
 