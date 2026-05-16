// src/components/admin/rentalApplications/RentalAppsByListingModal.jsx

import { useState, useEffect, useCallback } from "react";
import api from "../../../api/axios";
import RentalAppBadge    from "./RentalAppBadge";
import RentalAppReviewModal from "./RentalAppReviewModal";
import { fmtPrice, fmtDate, fmtDateTime, btnSm } from "./rentalAppHelpers";

function Empty({ text }) {
  return (
    <div style={{ textAlign: "center", padding: "52px 20px", color: "#b0a890", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ fontSize: 34, marginBottom: 12 }}>📋</div>
      <p style={{ fontSize: 14 }}>{text}</p>
    </div>
  );
}

export default function RentalAppsByListingModal({ listingId, onClose, notify }) {
  const [apps,         setApps]         = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [reviewTarget, setReviewTarget] = useState(null);

  useEffect(() => {
    const h = e => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const fetchApps = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/rentals/applications/listing/${listingId}`);
      setApps(res.data || []);
    } catch (err) {
      notify(err.response?.data?.message || "Gabim", "error");
    } finally { setLoading(false); }
  }, [listingId, notify]);

  useEffect(() => { fetchApps(); }, [fetchApps]);

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(8,6,4,0.82)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "'DM Sans', sans-serif" }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ width: "100%", maxWidth: 680, background: "#faf7f2", borderRadius: 18, boxShadow: "0 44px 100px rgba(0,0,0,0.55)", maxHeight: "90vh", overflow: "hidden", animation: "ara-scale 0.22s ease" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid rgba(138,125,94,0.15)", position: "sticky", top: 0, background: "#faf7f2", zIndex: 1 }}>
          <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 700, fontSize: 17, color: "#1a1714" }}>Aplikimet për Listing #{listingId}</span>
          <button onClick={onClose} style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(138,125,94,0.2)", background: "rgba(138,125,94,0.08)", color: "#8a7d5e", cursor: "pointer", fontSize: 15, borderRadius: 8 }}>✕</button>
        </div>
        <div style={{ padding: "22px 24px", overflowY: "auto", maxHeight: "calc(90vh - 60px)" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "32px 0", color: "#b0a890" }}>Duke ngarkuar…</div>
          ) : apps.length === 0 ? (
            <Empty text="Nuk ka aplikime për këtë listing." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {apps.map(a => (
                <div key={a.id} style={{ border: "1px solid rgba(138,125,94,0.15)", background: "#fff", borderRadius: 11, padding: "14px 16px", display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                      <span style={{ fontFamily: "monospace", fontSize: 11.5, color: "#b0a890" }}>#{a.id}</span>
                      <span style={{ fontSize: 13, fontWeight: 500, color: "#1a1714" }}>Client #{a.client_id}</span>
                      <RentalAppBadge label={a.status} />
                    </div>
                    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: 12, color: "#8a7d5e" }}>
                      {a.income      && <span>💰 {fmtPrice(a.income)}</span>}
                      {a.move_in_date && <span>📅 Move-in: {fmtDate(a.move_in_date)}</span>}
                      <span>🕐 {fmtDateTime(a.created_at)}</span>
                    </div>
                    {a.message && (
                      <p style={{ fontSize: 12, color: "#6b6340", margin: "6px 0 0", lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}>
                        "{a.message}"
                      </p>
                    )}
                  </div>
                  {a.status === "PENDING" && (
                    <button className="ara-btn" style={btnSm("rgba(201,184,122,0.08)", "#c9b87a", "rgba(201,184,122,0.25)")} onClick={() => setReviewTarget(a)}>Shqyrto</button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {reviewTarget && (
        <RentalAppReviewModal
          app={reviewTarget}
          onClose={() => setReviewTarget(null)}
          onSuccess={() => { setReviewTarget(null); fetchApps(); notify("Aplikimi u shqyrtua"); }}
          notify={notify}
        />
      )}
    </div>
  );
}