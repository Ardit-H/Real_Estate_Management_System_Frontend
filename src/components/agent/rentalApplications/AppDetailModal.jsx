import { useState, useEffect } from "react";
import { C, fmtDate, fmtDT, fmtMoney, validateRejectionReason } from "./rentalApplicationHelpers";
import { StatusPill } from "./RentalApplicationBadges";

export default function AppDetailModal({ app, onClose, onReview, notify }) {
  const [rejReason,  setRejReason]  = useState("");
  const [showReject, setShowReject] = useState(false);
  const [reviewing,  setReviewing]  = useState(false);

  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const handleApprove = async () => {
    setReviewing(true);
    await onReview(app.id, "APPROVED", null);
    setReviewing(false);
  };

  const handleReject = async () => {
    if (!validateRejectionReason(rejReason, notify)) return;
    setReviewing(true);
    await onReview(app.id, "REJECTED", rejReason || null);
    setReviewing(false);
    setShowReject(false);
  };

  const fields = [
    { label: "Client ID",     value: `#${app.client_id}`       },
    { label: "Listing ID",    value: `#${app.listing_id}`       },
    { label: "Të ardhura",    value: fmtMoney(app.income)       },
    { label: "Move-in date",  value: fmtDate(app.move_in_date)  },
    { label: "Shqyrtuar nga", value: app.reviewed_by ? `#${app.reviewed_by}` : "—" },
    { label: "Krijuar më",    value: fmtDT(app.created_at)      },
  ];

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(20,16,10,0.6)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        width: "100%", maxWidth: 540,
        background: C.surface,
        border: `1.5px solid ${C.border}`,
        borderRadius: 18,
        boxShadow: "0 28px 64px rgba(0,0,0,0.32)",
        maxHeight: "88vh", overflowY: "auto",
        animation: "ra-modal-in 0.22s ease",
      }}>

        {/* Modal header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 24px", borderBottom: `1px solid ${C.border}`,
          background: "#fdf9f4",
          position: "sticky", top: 0, zIndex: 1,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 9,
              background: `${C.gold}18`, border: `1px solid ${C.gold}28`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15,
            }}>📝</div>
            <div>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.text,
                fontFamily: "'Cormorant Garamond',Georgia,serif" }}>
                Aplikim #{app.id}
              </p>
              <p style={{ margin: 0, fontSize: 11, color: C.muted }}>
                Listing #{app.listing_id}
              </p>
            </div>
          </div>
          <button className="ra-btn" onClick={onClose}
            style={{
              width: 30, height: 30, borderRadius: 8,
              background: "#f0ece3", border: `1px solid ${C.border}`,
              fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
              color: C.muted, cursor: "pointer",
            }}>
            ×
          </button>
        </div>

        <div style={{ padding: "20px 24px" }}>

          {/* Status bar */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            background: "#f5f0e8", borderRadius: 10, padding: "12px 16px", marginBottom: 20,
          }}>
            <StatusPill status={app.status} />
            {app.reviewed_at && (
              <span style={{ fontSize: 11.5, color: C.muted }}>
                Shqyrtuar: {fmtDT(app.reviewed_at)}
              </span>
            )}
          </div>

          {/* Info grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
            {fields.map(({ label, value }) => (
              <div key={label} style={{
                background: "#f5f0e8", borderRadius: 9,
                padding: "10px 14px", border: `1px solid ${C.border}`,
              }}>
                <p style={{ margin: 0, fontSize: 10, color: C.textMut, fontWeight: 600,
                  textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 3 }}>{label}</p>
                <p style={{ margin: 0, fontSize: 13.5, fontWeight: 500, color: C.text }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Message */}
          {app.message && (
            <div style={{
              background: "#f5f0e8", border: `1px solid ${C.border}`,
              borderRadius: 10, padding: "14px 16px", marginBottom: 18,
            }}>
              <p style={{ margin: "0 0 8px", fontSize: 10, color: C.textMut, fontWeight: 600,
                textTransform: "uppercase", letterSpacing: "0.7px" }}>Mesazhi</p>
              <p style={{ margin: 0, fontSize: 13.5, color: C.textSub,
                lineHeight: 1.6, fontStyle: "italic" }}>
                "{app.message}"
              </p>
            </div>
          )}

          {/* Rejection reason (if already rejected) */}
          {app.rejection_reason && (
            <div style={{
              background: "#fef2f2", border: "1px solid #fecaca",
              borderRadius: 10, padding: "12px 16px", marginBottom: 18,
              display: "flex", alignItems: "flex-start", gap: 8,
            }}>
              <span style={{ fontSize: 14, flexShrink: 0 }}>✕</span>
              <p style={{ margin: 0, fontSize: 12.5, color: "#dc2626", lineHeight: 1.5 }}>
                <strong>Arsyeja e refuzimit:</strong> {app.rejection_reason}
              </p>
            </div>
          )}

          {/* Actions — only for PENDING */}
          {app.status === "PENDING" && (
            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 18 }}>
              {!showReject ? (
                <div style={{ display: "flex", gap: 10 }}>
                  <button className="ra-btn" onClick={handleApprove} disabled={reviewing}
                    style={{
                      flex: 1, padding: "10px 0",
                      background: "#ecfdf5", color: "#059669",
                      border: "1.5px solid #a7f3d0",
                      borderRadius: 10, fontSize: 13, fontWeight: 600,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                    }}>
                    ✓ Aprovo aplikimin
                  </button>
                  <button className="ra-btn" onClick={() => setShowReject(true)}
                    style={{
                      flex: 1, padding: "10px 0",
                      background: "#fef2f2", color: "#dc2626",
                      border: "1.5px solid #fecaca",
                      borderRadius: 10, fontSize: 13, fontWeight: 600,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                    }}>
                    ✕ Refuzo
                  </button>
                </div>
              ) : (
                <div>
                  <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 500, color: C.text }}>
                    Arsyeja e refuzimit{" "}
                    <span style={{ color: C.textMut, fontWeight: 400 }}>(opcionale, max 500 karaktere)</span>
                  </p>
                  <textarea
                    className="ra-textarea"
                    value={rejReason}
                    onChange={e => setRejReason(e.target.value)}
                    rows={3}
                    placeholder="Shkruaj arsyen e refuzimit..."
                    maxLength={500}
                  />
                  <p className="ra-char-count">{rejReason.length}/500</p>
                  <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                    <button className="ra-btn" onClick={() => { setShowReject(false); setRejReason(""); }}
                      style={{
                        padding: "9px 18px", borderRadius: 10,
                        background: "#f0ece3", color: C.textSub,
                        border: `1.5px solid ${C.border}`, fontSize: 13,
                      }}>
                      Anulo
                    </button>
                    <button className="ra-btn" onClick={handleReject} disabled={reviewing}
                      style={{
                        flex: 1, padding: "9px 0",
                        background: "#fef2f2", color: "#dc2626",
                        border: "1.5px solid #fecaca",
                        borderRadius: 10, fontSize: 13, fontWeight: 600,
                      }}>
                      Konfirmo refuzimin
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}