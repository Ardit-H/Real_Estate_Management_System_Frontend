import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import { fmtDate, STATUS_CFG, INP_S, BTN_PRI, BTN_SEC } from "./rentalHelpers";
import { Modal, Loader, EmptyState, StatusBadge } from "./RentalBadges";

function RejectDialog({ app, onConfirm, onClose }) {
  const [reason, setReason] = useState("");

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 2000,
      background: "rgba(8,6,4,0.7)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }}>
      <div style={{
        background: "#faf7f2", borderRadius: 14, padding: 24,
        maxWidth: 420, width: "100%", boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
      }}>
        <h3 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontWeight: 700, fontSize: 17, marginBottom: 14, color: "#1a1714" }}>
          Refuzo aplikimin #{app.id}
        </h3>

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 10.5, fontWeight: 600, color: "#9a8c6e", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 6 }}>
            Arsyeja e refuzimit
          </label>
          <textarea
            value={reason} onChange={e => setReason(e.target.value)}
            rows={3} placeholder="Shkruaj arsyen..." maxLength={500}
            style={{ ...INP_S, resize: "vertical" }}
          />
          <p style={{ fontSize: 11, color: "#b0a890", textAlign: "right", marginTop: 2 }}>{reason.length}/500</p>
        </div>

        <div style={{ display: "flex", gap: 9, justifyContent: "flex-end" }}>
          <button style={BTN_SEC} onClick={onClose}>Anulo</button>
          <button style={{ ...BTN_PRI, background: "#8b3a1c" }} onClick={() => onConfirm(reason || null)}>
            Konfirmo refuzimin
          </button>
        </div>
      </div>
    </div>
  );
}

// ── ApplicationsPanel ─────────────────────────────────────────────────────────
export function ApplicationsPanel({ listing, onClose, notify }) {
  const navigate = useNavigate();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/rentals/applications/listing/${listing.id}`);
        setApps(res.data || []);
      } catch {
        notify("Gabim gjatë ngarkimit", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, [listing.id, notify]);

  const handleReview = async (appId, status, reason = null) => {
    try {
      await api.patch(`/api/rentals/applications/${appId}/review`, { status, rejection_reason: reason });
      setApps(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
      notify(`Aplikimi #${appId} → ${status}`);
      setReviewing(null);
    } catch (err) {
      notify(err.response?.data?.message || "Gabim", "error");
    }
  };

  const goToCreateContract = (app) => {
    navigate("/agent/contracts", {
      state: {
        fromPropertyId: String(listing.property_id),
        fromListingId:  String(listing.id),
        fromClientId:   String(app.client_id),
      },
    });
  };

  return (
    <Modal title={`Aplikimet — Listing #${listing.id}`} onClose={onClose} wide>
      {loading ? (
        <Loader />
      ) : apps.length === 0 ? (
        <EmptyState icon="📭" text="Nuk ka aplikime për këtë listing" />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {apps.map(app => {
            const s = STATUS_CFG[app.status] || STATUS_CFG.CANCELLED;
            return (
              <div key={app.id} style={{ background: "#fff", border: "1.5px solid #e8e2d6", borderRadius: 12, padding: "14px 16px" }}>
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 3, color: "#1a1714", fontFamily: "'Cormorant Garamond',Georgia,serif" }}>
                      Aplikim #{app.id} — Client #{app.client_id}
                    </p>
                    <p style={{ fontSize: 12, color: "#9a8c6e", margin: 0 }}>
                      {new Date(app.created_at).toLocaleDateString("sq-AL")}
                      {app.income && ` · Të ardhura: €${Number(app.income).toLocaleString()}`}
                      {app.move_in_date && ` · Move-in: ${fmtDate(app.move_in_date)}`}
                    </p>
                  </div>
                  <StatusBadge status={app.status} />
                </div>

                {/* Mesazhi */}
                {app.message && (
                  <p style={{ fontSize: 13, color: "#6b6248", marginBottom: 10, fontStyle: "italic", fontFamily: "'Cormorant Garamond',Georgia,serif" }}>
                    "{app.message}"
                  </p>
                )}

                {/* Aprovuar → krijo kontratë */}
                {app.status === "APPROVED" && (
                  <div style={{
                    background: "rgba(201,184,122,0.07)", border: "1.5px solid rgba(201,184,122,0.2)",
                    borderRadius: 10, padding: "10px 14px", marginBottom: 10,
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                  }}>
                    <div>
                      <span style={{ fontSize: 13, color: "#c9b87a", fontWeight: 500 }}>✓ Aprovuar — gati për kontratë</span>
                      <p style={{ fontSize: 11.5, color: "#8a7230", marginTop: 2 }}>
                        Client #{app.client_id} · Listing #{listing.id} · Property #{listing.property_id}
                      </p>
                    </div>
                    <button className="ar-btn" onClick={() => goToCreateContract(app)} style={{ ...BTN_PRI, padding: "7px 14px", fontSize: 12 }}>
                      📋 Krijo Kontratë →
                    </button>
                  </div>
                )}

                {/* Pending → aprovo / refuzo */}
                {app.status === "PENDING" && (
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="ar-btn" onClick={() => handleReview(app.id, "APPROVED")} style={{ padding: "6px 14px", borderRadius: 9, border: "1.5px solid rgba(126,184,164,0.3)", background: "rgba(126,184,164,0.1)", color: "#2a6049", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                      ✓ Aprovo
                    </button>
                    <button className="ar-btn" onClick={() => setReviewing(app)} style={{ padding: "6px 14px", borderRadius: 9, border: "1.5px solid rgba(212,133,90,0.3)", background: "rgba(212,133,90,0.08)", color: "#8b4013", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                      ✕ Refuzo
                    </button>
                  </div>
                )}

                {/* Arsyeja e refuzimit */}
                {app.rejection_reason && (
                  <p style={{ fontSize: 12, color: "#8b4013", marginTop: 6 }}>Arsyeja: {app.rejection_reason}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {reviewing && (
        <RejectDialog
          app={reviewing}
          onConfirm={reason => handleReview(reviewing.id, "REJECTED", reason)}
          onClose={() => setReviewing(null)}
        />
      )}
    </Modal>
  );
}