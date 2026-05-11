import { useState, useEffect, useCallback } from "react";
import MainLayout from "../../components/layout/Layout";
import api from "../../api/axios";
 
// ─── Global CSS — matches AgentDashboard / Navbar aesthetic ──────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
 
  .ra * { box-sizing: border-box; }
  .ra { font-family: 'DM Sans', system-ui, sans-serif; background: #f2ede4; min-height: 100vh; }
 
  .ra-card {
    background: #faf7f2;
    border: 1.5px solid #e8e2d6;
    border-radius: 14px;
    box-shadow: 0 2px 16px rgba(20,16,10,0.06);
    overflow: hidden;
  }
 
  .ra-btn {
    transition: all 0.17s ease;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    border: none;
  }
  .ra-btn:hover { opacity: 0.85; transform: translateY(-1px); }
  .ra-btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }
 
  @keyframes ra-fade-up  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  @keyframes ra-pulse    { 0%,100%{opacity:.4} 50%{opacity:.85} }
  @keyframes ra-toast    { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes ra-spin     { to{transform:rotate(360deg)} }
  @keyframes ra-modal-in { from{opacity:0;transform:translateY(14px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
 
  .ra-section  { animation: ra-fade-up 0.5s ease 0.15s both; }
  .ra-row:hover { background: #f5f0e8 !important; }
 
  .ra-skeleton {
    background: #ede9df;
    border-radius: 10px;
    animation: ra-pulse 1.5s ease infinite;
  }
 
  .ra-stat { animation: ra-fade-up 0.4s ease both; }
  .ra-stat:nth-child(1) { animation-delay: 0.05s; }
  .ra-stat:nth-child(2) { animation-delay: 0.10s; }
  .ra-stat:nth-child(3) { animation-delay: 0.15s; }
  .ra-stat:nth-child(4) { animation-delay: 0.20s; }
 
  .ra-table { width: 100%; border-collapse: collapse; }
  .ra-table th {
    text-align: left; font-size: 10px; font-weight: 600;
    color: #b0a890; text-transform: uppercase; letter-spacing: 0.9px;
    padding: 10px 16px; background: #fdf9f4;
    border-bottom: 1px solid #e8e2d6; white-space: nowrap;
  }
  .ra-table td {
    padding: 13px 16px; font-size: 13px; color: #1a1714;
    border-bottom: 1px solid #e8e2d6; vertical-align: middle;
  }
  .ra-table tr:last-child td { border-bottom: none; }
  .ra-table-wrap { overflow-x: auto; }
 
  .ra-input {
    padding: 9px 13px;
    border: 1.5px solid #e0dbd0;
    border-radius: 10px;
    font-size: 13.5px;
    font-family: 'DM Sans', sans-serif;
    color: #1a1714;
    background: #f5f0e8;
    outline: none;
    transition: border-color 0.17s, box-shadow 0.17s, background 0.17s;
  }
  .ra-input:focus {
    border-color: #c9b87a;
    background: #faf7f2;
    box-shadow: 0 0 0 3px rgba(201,184,122,0.12);
  }
  .ra-input::placeholder { color: #b0a890; }
 
  .ra-textarea {
    width: 100%; padding: 10px 13px;
    border: 1.5px solid #e0dbd0; border-radius: 10px;
    font-size: 13.5px; font-family: 'DM Sans', sans-serif;
    color: #1a1714; background: #f5f0e8;
    outline: none; resize: vertical;
    transition: border-color 0.17s, box-shadow 0.17s, background 0.17s;
  }
  .ra-textarea:focus {
    border-color: #c9b87a; background: #faf7f2;
    box-shadow: 0 0 0 3px rgba(201,184,122,0.12);
  }
  .ra-textarea::placeholder { color: #b0a890; }
 
  .ra-char-count { font-size: 11px; color: #b0a890; text-align: right; margin-top: 4px; }
`;
 
// ─── Palette — same as AgentDashboard ────────────────────────────────────────
const C = {
  bg:      "#f2ede4",
  surface: "#faf7f2",
  dark:    "#1a1714",
  gold:    "#c9b87a",
  goldL:   "#e8d9a0",
  muted:   "#9a8c6e",
  border:  "#e8e2d6",
  text:    "#1a1714",
  textSub: "#6b6340",
  textMut: "#b0a890",
};
 
const APP_STATUS_CFG = {
  PENDING:   { color: "#d97706", bg: "#fffbeb", dot: "#d97706" },
  APPROVED:  { color: "#059669", bg: "#ecfdf5", dot: "#059669" },
  REJECTED:  { color: "#dc2626", bg: "#fef2f2", dot: "#dc2626" },
  CANCELLED: { color: "#64748b", bg: "#f1f5f9", dot: "#64748b" },
};
 
// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate  = (d) => d ? new Date(d).toLocaleDateString("sq-AL") : "—";
const fmtDT    = (d) => d ? new Date(d).toLocaleString("sq-AL", {
  day: "2-digit", month: "2-digit", year: "numeric",
  hour: "2-digit", minute: "2-digit" }) : "—";
const fmtMoney = (v) => v != null ? `€${Number(v).toLocaleString("de-DE")}` : "—";
 
// ─── Validim ──────────────────────────────────────────────────────────────────
function validateListingId(listingId, notify) {
  if (!listingId || listingId.toString().trim() === "") {
    notify("Shkruaj Listing ID", "error"); return false;
  }
  if (isNaN(Number(listingId)) || Number(listingId) <= 0) {
    notify("Listing ID duhet të jetë numër pozitiv", "error"); return false;
  }
  return true;
}
 
function validateRejectionReason(reason, notify) {
  if (reason && reason.length > 500) {
    notify("Arsyeja e refuzimit nuk mund të kalojë 500 karaktere", "error"); return false;
  }
  return true;
}
 
// ─── Shared components ────────────────────────────────────────────────────────
function Toast({ msg, type = "success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{
      position: "fixed", bottom: 26, right: 26, zIndex: 9999,
      background: C.dark,
      color: type === "error" ? "#f09090" : "#90c8a8",
      padding: "11px 18px", borderRadius: 12, fontSize: 13,
      boxShadow: "0 10px 36px rgba(0,0,0,0.32)",
      border: `1px solid ${type === "error" ? "rgba(240,128,128,0.15)" : "rgba(144,200,168,0.15)"}`,
      fontFamily: "'DM Sans',sans-serif", animation: "ra-toast 0.2s ease",
      display: "flex", alignItems: "center", gap: 8,
    }}>
      {type === "error" ? "⚠️" : "✅"} {msg}
    </div>
  );
}
 
function Skeleton({ rows = 4, h = 54 }) {
  return (
    <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="ra-skeleton" style={{ height: h, opacity: 1 - i * 0.15 }} />
      ))}
    </div>
  );
}
 
function EmptyState({ icon, title, sub }) {
  return (
    <div style={{ padding: "52px 20px", textAlign: "center", color: C.textMut }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
      <p style={{ fontSize: 14, fontWeight: 600, color: C.textSub, margin: "0 0 4px",
        fontFamily: "'Cormorant Garamond',Georgia,serif" }}>{title}</p>
      {sub && <p style={{ fontSize: 12.5, margin: 0 }}>{sub}</p>}
    </div>
  );
}
 
function StatusPill({ status }) {
  const s = APP_STATUS_CFG[status] || { color: "#64748b", bg: "#f1f5f9", dot: "#64748b" };
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: "3px 10px", borderRadius: 20,
      fontSize: 10.5, fontWeight: 600,
      display: "inline-flex", alignItems: "center", gap: 5,
      whiteSpace: "nowrap",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.dot, display: "inline-block" }} />
      {status}
    </span>
  );
}
 
function SectionHeader({ title, count, children }) {
  return (
    <div style={{
      padding: "14px 20px", borderBottom: `1px solid ${C.border}`,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: "#fdf9f4", flexWrap: "wrap", gap: 10,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.text,
          fontFamily: "'Cormorant Garamond',Georgia,serif" }}>{title}</p>
        {count != null && (
          <span style={{ background: `${C.gold}22`, color: C.textSub,
            padding: "2px 9px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
            {count}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
 
// ─── Stat Card — same pattern as AgentDashboard ───────────────────────────────
function StatCard({ icon, label, value, accent = C.gold }) {
  return (
    <div className="ra-stat ra-card ra-btn" style={{
      padding: "18px 20px", display: "flex", alignItems: "center", gap: 14,
    }}>
      <div style={{
        width: 46, height: 46, borderRadius: 12, flexShrink: 0,
        background: `${accent}18`, border: `1.5px solid ${accent}28`,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
      }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 10, fontWeight: 600, color: C.textMut,
          textTransform: "uppercase", letterSpacing: "0.9px", marginBottom: 3 }}>{label}</p>
        <p style={{ margin: 0, fontSize: 26, fontWeight: 700, color: C.text,
          fontFamily: "'Cormorant Garamond',Georgia,serif", letterSpacing: "-0.5px", lineHeight: 1 }}>
          {value ?? "—"}
        </p>
      </div>
    </div>
  );
}
 
// ─── App Detail Modal ─────────────────────────────────────────────────────────
function AppDetailModal({ app, onClose, onReview, notify }) {
  const [rejReason,   setRejReason]   = useState("");
  const [showReject,  setShowReject]  = useState(false);
  const [reviewing,   setReviewing]   = useState(false);
 
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
 
// ═══════════════════════════════════════════════════════════════════════════════
export default function AgentRentalApplications() {
  const [listingId,     setListingId]     = useState("");
  const [applications,  setApplications]  = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [selectedApp,   setSelectedApp]   = useState(null);
  const [toast,         setToast]         = useState(null);
 
  const stats = {
    total:    applications.length,
    pending:  applications.filter(a => a.status === "PENDING").length,
    approved: applications.filter(a => a.status === "APPROVED").length,
    rejected: applications.filter(a => a.status === "REJECTED").length,
  };
 
  const notify = useCallback((msg, type = "success") =>
    setToast({ msg, type, key: Date.now() }), []);
 
  const fetchApplications = async () => {
    if (!validateListingId(listingId, notify)) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/rentals/applications/listing/${Number(listingId)}`);
      setApplications(Array.isArray(res.data) ? res.data : []);
    } catch {
      notify("Gabim — listing nuk u gjet ose nuk ka aplikime", "error");
    } finally {
      setLoading(false);
    }
  };
 
  const handleReview = async (appId, status, reason) => {
    if (status === "REJECTED" && !validateRejectionReason(reason, notify)) return;
    try {
      await api.patch(`/api/rentals/applications/${appId}/review`, {
        status,
        rejection_reason: reason || null,
      });
      setApplications(prev => prev.map(a =>
        a.id === appId ? { ...a, status, rejection_reason: reason } : a
      ));
      if (selectedApp?.id === appId) {
        setSelectedApp(prev => ({ ...prev, status, rejection_reason: reason }));
      }
      notify(`Aplikimi #${appId} → ${status}`);
    } catch (err) {
      notify(err.response?.data?.message || "Gabim", "error");
    }
  };
 
  return (
    <MainLayout role="agent">
      <style>{CSS}</style>
      <div className="ra">
 
        {/* ── HERO — same as AgentDashboard ── */}
        <div style={{
          background: `linear-gradient(160deg, ${C.dark} 0%, #1e1a14 50%, #241e16 100%)`,
          minHeight: 190, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "36px 32px", position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.018) 1px,transparent 1px)", backgroundSize: "22px 22px", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: "-60px", right: "5%", width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle,rgba(201,184,122,0.07) 0%,transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(90deg,transparent,${C.gold} 30%,${C.gold} 70%,transparent)` }} />
 
          <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 680, width: "100%" }}>
            <p style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 600, color: C.gold,
              textTransform: "uppercase", letterSpacing: "2.5px", fontFamily: "'DM Sans',sans-serif" }}>
              Rental Management
            </p>
            <h1 style={{
              margin: "0 0 8px",
              fontFamily: "'Cormorant Garamond',Georgia,serif",
              fontSize: "clamp(22px,3.2vw,34px)",
              fontWeight: 700, color: "#f5f0e8", letterSpacing: "-0.4px", lineHeight: 1.1,
            }}>
              Rental{" "}
              <span style={{
                background: `linear-gradient(90deg,${C.gold},${C.goldL},${C.gold})`,
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>
                Applications
              </span>
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: "rgba(245,240,232,0.38)", fontFamily: "'DM Sans',sans-serif" }}>
              Shiko dhe shqyrto aplikimet e klientëve për listings
            </p>
          </div>
        </div>
 
        <div style={{ padding: "24px 28px", maxWidth: 1400, margin: "0 auto" }}>
 
          {/* ── Search card ── */}
          <div className="ra-card ra-section" style={{ marginBottom: 24 }}>
            <SectionHeader title="Kërko Aplikime" />
            <div style={{ padding: "20px 22px", display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
              <div>
                <p style={{ margin: "0 0 7px", fontSize: 12, fontWeight: 600, color: C.textMut,
                  textTransform: "uppercase", letterSpacing: "0.7px" }}>
                  Listing ID <span style={{ color: "#ef4444" }}>*</span>
                </p>
                <div style={{ display: "flex", gap: 10 }}>
                  <input
                    className="ra-input"
                    type="number"
                    min="1"
                    style={{ width: 160, height: 40 }}
                    placeholder="p.sh. 42"
                    value={listingId}
                    onChange={e => setListingId(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && fetchApplications()}
                  />
                  <button className="ra-btn" onClick={fetchApplications} disabled={loading}
                    style={{
                      padding: "0 20px", height: 40, borderRadius: 10,
                      background: C.dark, color: "#f5f0e8",
                      fontSize: 13, fontWeight: 500,
                      display: "flex", alignItems: "center", gap: 7,
                    }}>
                    {loading
                      ? <><div style={{ width: 14, height: 14, border: "2px solid rgba(245,240,232,0.3)", borderTop: "2px solid #f5f0e8", borderRadius: "50%", animation: "ra-spin 0.7s linear infinite" }} /> Duke ngarkuar…</>
                      : <>🔍 Shiko aplikimet</>}
                  </button>
                </div>
                <p style={{ margin: "5px 0 0", fontSize: 11, color: C.textMut }}>
                  Duhet të jetë numër pozitiv
                </p>
              </div>
            </div>
          </div>
 
          {/* ── Stat Cards — only when results loaded ── */}
          {applications.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(175px,1fr))", gap: 14, marginBottom: 24 }}>
              <StatCard icon="📋" label="Total"    value={stats.total}    accent={C.gold}    />
              <StatCard icon="⏳" label="Pending"  value={stats.pending}  accent="#d97706"   />
              <StatCard icon="✅" label="Approved" value={stats.approved} accent="#5aaa80"   />
              <StatCard icon="✕"  label="Rejected" value={stats.rejected} accent="#dc2626"   />
            </div>
          )}
 
          {/* ── Applications table ── */}
          <div className="ra-card ra-section">
            <SectionHeader
              title={listingId && applications.length > 0
                ? `Aplikimet për Listing #${listingId}`
                : "Aplikimet"}
              count={applications.length > 0 ? applications.length : undefined}
            />
 
            {loading ? (
              <Skeleton rows={5} h={58} />
            ) : applications.length === 0 ? (
              <EmptyState
                icon="📝"
                title={listingId ? "Nuk ka aplikime" : "Asnjë kërkim akoma"}
                sub={listingId
                  ? "Nuk ka aplikime për këtë listing ID"
                  : "Shkruaj Listing ID dhe kliko Shiko aplikimet"}
              />
            ) : (
              <div className="ra-table-wrap">
                <table className="ra-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Client ID</th>
                      <th>Të ardhura</th>
                      <th>Move-in</th>
                      <th>Statusi</th>
                      <th>Krijuar</th>
                      <th>Shqyrtuar</th>
                      <th>Veprime</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app, i) => (
                      <tr key={app.id} className="ra-row" style={{ transition: "background 0.15s" }}>
                        <td style={{ color: C.textMut, fontSize: 12 }}>{app.id}</td>
                        <td>
                          <span style={{
                            background: `${C.gold}18`, color: C.textSub,
                            padding: "2px 9px", borderRadius: 20,
                            fontSize: 12, fontWeight: 600,
                          }}>#{app.client_id}</span>
                        </td>
                        <td style={{ fontWeight: 500 }}>{fmtMoney(app.income)}</td>
                        <td style={{ fontSize: 12.5, color: C.textSub }}>
                          {fmtDate(app.move_in_date)}
                        </td>
                        <td><StatusPill status={app.status} /></td>
                        <td style={{ fontSize: 12, color: C.textMut }}>
                          {fmtDT(app.created_at)}
                        </td>
                        <td style={{ fontSize: 12, color: C.textMut }}>
                          {app.reviewed_at ? fmtDT(app.reviewed_at) : "—"}
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                            {/* View */}
                            <button className="ra-btn" onClick={() => setSelectedApp(app)}
                              style={{
                                padding: "5px 12px", borderRadius: 8,
                                background: "#f0ece3", color: C.textSub,
                                border: `1px solid ${C.border}`, fontSize: 11.5, fontWeight: 500,
                              }}>
                              View
                            </button>
 
                            {app.status === "PENDING" && (
                              <>
                                {/* Quick approve */}
                                <button className="ra-btn"
                                  onClick={() => handleReview(app.id, "APPROVED", null)}
                                  title="Aprovo"
                                  style={{
                                    width: 30, height: 30, borderRadius: 8,
                                    background: "#ecfdf5", color: "#059669",
                                    border: "1px solid #a7f3d0",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: 13,
                                  }}>✓</button>
 
                                {/* Open modal for rejection */}
                                <button className="ra-btn"
                                  onClick={() => setSelectedApp(app)}
                                  title="Refuzo"
                                  style={{
                                    width: 30, height: 30, borderRadius: 8,
                                    background: "#fef2f2", color: "#dc2626",
                                    border: "1px solid #fecaca",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: 13,
                                  }}>✕</button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
 
        {/* Modal */}
        {selectedApp && (
          <AppDetailModal
            app={selectedApp}
            onClose={() => setSelectedApp(null)}
            onReview={handleReview}
            notify={notify}
          />
        )}
 
        {/* Toast */}
        {toast && (
          <Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />
        )}
      </div>
    </MainLayout>
  );
}
 