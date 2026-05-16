// src/components/admin/rentals/RentalDeleteModal.jsx

import { secondaryBtn, dangerBtn } from "./rentalsHelpers";

export default function RentalDeleteModal({ id, onCancel, onConfirm, loading }) {
  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(8,6,4,0.82)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "'DM Sans', sans-serif" }}
      onClick={e => e.target === e.currentTarget && !loading && onCancel()}
    >
      <div style={{ width: "100%", maxWidth: 440, background: "#faf7f2", borderRadius: 18, boxShadow: "0 44px 100px rgba(0,0,0,0.55)", animation: "ar-scale 0.22s ease", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid rgba(138,125,94,0.15)" }}>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 17, color: "#1a1714" }}>Konfirmo fshirjen</span>
          <button onClick={onCancel} style={{ width: 30, height: 30, border: "1px solid rgba(138,125,94,0.2)", background: "rgba(138,125,94,0.08)", color: "#8a7d5e", cursor: "pointer", fontSize: 15, borderRadius: 8 }}>✕</button>
        </div>
        <div style={{ padding: "22px 24px" }}>
          <p style={{ fontSize: 14, color: "#4a4438", marginBottom: 18, lineHeight: 1.6 }}>
            A jeni i sigurt që dëshironi të fshini <strong style={{ color: "#1a1714" }}>Listing #{id}</strong>?
          </p>
          <div style={{ background: "rgba(216,90,48,0.08)", border: "1px solid rgba(216,90,48,0.2)", borderRadius: 10, padding: "10px 15px", marginBottom: 22, fontSize: 13, color: "#D85A30" }}>
            Soft delete — rekordi shënohet me <code style={{ background: "rgba(216,90,48,0.12)", padding: "1px 6px", borderRadius: 4, fontSize: 12 }}>deleted_at</code> dhe nuk shfaqet më.
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button onClick={onCancel} disabled={loading} style={secondaryBtn}>Anulo</button>
            <button onClick={onConfirm} disabled={loading} style={dangerBtn}>
              {loading ? "Duke fshirë..." : "Fshi"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}