// src/components/admin/rentalApplications/RentalAppReviewModal.jsx

import { useState, useEffect } from "react";
import api from "../../../api/axios";
import { fmtPrice, primaryBtn, secondaryBtn, dangerBtn } from "./rentalAppHelpers";

export default function RentalAppReviewModal({ app, onClose, onSuccess, notify }) {
  const [status, setStatus] = useState("APPROVED");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const h = e => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const handleSubmit = async () => {
    if (status === "REJECTED" && !reason.trim()) {
      notify("Arsyeja e refuzimit është e detyrueshme", "error"); return;
    }
    setSaving(true);
    try {
      await api.patch(`/api/rentals/applications/${app.id}/review`, {
        status,
        rejection_reason: status === "REJECTED" ? reason : null,
      });
      notify(`Aplikimi u shënua si ${status}`);
      onSuccess();
    } catch (err) {
      notify(err.response?.data?.message || "Gabim gjatë shqyrtimit", "error");
    } finally { setSaving(false); }
  };

  const isReject = status === "REJECTED";

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(8,6,4,0.82)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "'DM Sans', sans-serif" }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ width: "100%", maxWidth: 520, background: "#faf7f2", borderRadius: 18, boxShadow: "0 44px 100px rgba(0,0,0,0.55)", overflow: "hidden", animation: "ara-scale 0.22s ease" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid rgba(138,125,94,0.15)", background: "#faf7f2" }}>
          <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 700, fontSize: 17, color: "#1a1714" }}>Shqyrto Aplikimin #{app.id}</span>
          <button onClick={onClose} style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(138,125,94,0.2)", background: "rgba(138,125,94,0.08)", color: "#8a7d5e", cursor: "pointer", fontSize: 15, borderRadius: 8 }}>✕</button>
        </div>
        <div style={{ padding: "22px 24px" }}>
          <div style={{ background: "rgba(138,125,94,0.06)", border: "1px solid rgba(138,125,94,0.15)", borderRadius: 10, padding: "10px 14px", marginBottom: 18, fontSize: 13 }}>
            <span style={{ color: "#8a7d5e" }}>Client <strong style={{ color: "#1a1714" }}>#{app.client_id}</strong> aplikoi për Listing <strong style={{ color: "#1a1714" }}>#{app.listing_id}</strong></span>
            {app.income && <span style={{ marginLeft: 12, color: "#1D9E75" }}>Të ardhura: {fmtPrice(app.income)}</span>}
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 10.5, fontWeight: 600, color: "#8a7d5e", display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Vendimi <span style={{ color: "#D85A30" }}>*</span>
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              {["APPROVED", "REJECTED"].map(s => (
                <button key={s} onClick={() => setStatus(s)} style={{
                  flex: 1, padding: "10px 0", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer",
                  border: status === s ? `2px solid ${s === "APPROVED" ? "rgba(29,158,117,0.5)" : "rgba(216,90,48,0.5)"}` : "1.5px solid rgba(138,125,94,0.2)",
                  background: status === s ? (s === "APPROVED" ? "rgba(29,158,117,0.08)" : "rgba(216,90,48,0.08)") : "transparent",
                  color: status === s ? (s === "APPROVED" ? "#1D9E75" : "#D85A30") : "#8a7d5e",
                  fontFamily: "'DM Sans', sans-serif",
                }}>
                  {s === "APPROVED" ? "✓ Approve" : "✕ Reject"}
                </button>
              ))}
            </div>
          </div>

          {isReject && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 10.5, fontWeight: 600, color: "#8a7d5e", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Arsyeja e refuzimit <span style={{ color: "#D85A30" }}>*</span>
              </label>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                rows={3}
                placeholder="Shkruaj arsyen e refuzimit..."
                style={{ width: "100%", padding: "9px 12px", fontSize: 13, border: "1.5px solid rgba(138,125,94,0.25)", borderRadius: 9, background: "#fff", color: "#1a1714", outline: "none", resize: "vertical", lineHeight: 1.6, boxSizing: "border-box", fontFamily: "'DM Sans', sans-serif" }}
              />
            </div>
          )}

          <div style={{
            background: isReject ? "rgba(216,90,48,0.06)" : "rgba(29,158,117,0.06)",
            border: `1px solid ${isReject ? "rgba(216,90,48,0.2)" : "rgba(29,158,117,0.2)"}`,
            borderRadius: 10, padding: "10px 14px", marginBottom: 18,
            fontSize: 13, color: isReject ? "#D85A30" : "#1D9E75",
          }}>
            {isReject ? "⚠️ Aplikimi do të shënohet si REJECTED — klienti do njoftohet." : "✓ Aplikimi do të shënohet si APPROVED."}
          </div>

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button style={secondaryBtn} onClick={onClose}>Anulo</button>
            <button style={isReject ? dangerBtn : primaryBtn} onClick={handleSubmit} disabled={saving}>
              {saving ? "Duke shqyrtuar..." : `Konfirmo — ${status}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}