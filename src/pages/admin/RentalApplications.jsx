import { useState, useEffect, useCallback } from "react";
import MainLayout from "../../components/layout/Layout";
import api from "../../api/axios";

// ─── Constants ────────────────────────────────────────────────────────────────

const APP_STATUSES = ["PENDING", "APPROVED", "REJECTED", "CANCELLED"];

// ─── Global CSS ───────────────────────────────────────────────────────────────

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
  .ara-wrap * { box-sizing: border-box; }
  .ara-wrap { font-family: 'DM Sans', system-ui, sans-serif; }
  .ara-row:hover td { background: rgba(138,125,94,0.06) !important; }
  .ara-btn { transition: all 0.14s ease; }
  .ara-btn:hover { opacity: 0.82; transform: translateY(-1px); }
  .ara-pg:hover:not(:disabled) { background: rgba(201,184,122,0.1) !important; border-color: #c9b87a !important; color: #c9b87a !important; }
  @keyframes ara-spin  { to { transform: rotate(360deg); } }
  @keyframes ara-scale { from{opacity:0;transform:scale(0.97)} to{opacity:1;transform:scale(1)} }
  @keyframes ara-toast { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" }) : "—";

const fmtDateTime = (d) =>
  d ? new Date(d).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—";

const fmtPrice = (v, cur = "EUR") =>
  v != null ? `€${Number(v).toLocaleString("de-DE")}` : "—";

// ─── Badge ────────────────────────────────────────────────────────────────────

const BADGE_CFG = {
  PENDING:   { bg: "rgba(201,184,122,0.15)", color: "#c9b87a",  border: "rgba(201,184,122,0.3)"  },
  APPROVED:  { bg: "rgba(29,158,117,0.12)",  color: "#1D9E75",  border: "rgba(29,158,117,0.25)"  },
  REJECTED:  { bg: "rgba(216,90,48,0.12)",   color: "#D85A30",  border: "rgba(216,90,48,0.25)"   },
  CANCELLED: { bg: "rgba(136,135,128,0.12)", color: "#888780",  border: "rgba(136,135,128,0.25)" },
};

function Badge({ label }) {
  const s = BADGE_CFG[label] || { bg: "rgba(136,135,128,0.12)", color: "#888780", border: "rgba(136,135,128,0.25)" };
  return (
    <span style={{
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      fontSize: 10.5, fontWeight: 600, letterSpacing: "0.4px",
      padding: "3px 10px", borderRadius: 999,
      whiteSpace: "nowrap", display: "inline-block",
      fontFamily: "'DM Sans', sans-serif",
    }}>{label ?? "—"}</span>
  );
}

// ─── Shared modal ─────────────────────────────────────────────────────────────

function Modal({ title, onClose, children, maxWidth = 520 }) {
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(8,6,4,0.82)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "'DM Sans', sans-serif" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ width: "100%", maxWidth, background: "#faf7f2", borderRadius: 18, boxShadow: "0 44px 100px rgba(0,0,0,0.55)", maxHeight: "90vh", overflowY: "auto", animation: "ara-scale 0.22s ease", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid rgba(138,125,94,0.15)", position: "sticky", top: 0, background: "#faf7f2", zIndex: 1 }}>
          <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 700, fontSize: 17, color: "#1a1714" }}>{title}</span>
          <button onClick={onClose} style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(138,125,94,0.2)", background: "rgba(138,125,94,0.08)", color: "#8a7d5e", cursor: "pointer", fontSize: 15, borderRadius: 8 }}>✕</button>
        </div>
        <div style={{ padding: "22px 24px", overflowY: "auto", maxHeight: "calc(90vh - 60px)" }}>{children}</div>
      </div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ msg, type = "success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{
      position: "fixed", bottom: 26, right: 26, zIndex: 9999,
      background: "#1a1714", color: type === "error" ? "#f09090" : "#90c8a8",
      padding: "11px 18px", borderRadius: 12, fontSize: 13, fontWeight: 400,
      boxShadow: "0 10px 36px rgba(0,0,0,0.32)",
      border: `1px solid ${type === "error" ? "rgba(240,128,128,0.15)" : "rgba(144,200,168,0.15)"}`,
      maxWidth: 320, fontFamily: "'DM Sans', sans-serif",
      animation: "ara-toast 0.2s ease", display: "flex", alignItems: "center", gap: 8,
    }}>
      <span style={{ fontSize: 14 }}>{type === "error" ? "⚠️" : "✅"}</span>
      {msg}
    </div>
  );
}

// ─── Shared table styles ──────────────────────────────────────────────────────

const TH = { padding: "10px 12px", textAlign: "left", fontWeight: 600, fontSize: 10.5, color: "#8a7d5e", borderBottom: "1px solid rgba(138,125,94,0.15)", background: "rgba(138,125,94,0.04)", whiteSpace: "nowrap", textTransform: "uppercase", letterSpacing: "0.5px" };
const TD = { padding: "10px 12px", borderBottom: "1px solid rgba(138,125,94,0.08)", fontSize: 13, color: "#1a1714", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" };

function Empty({ icon, text }) {
  return (
    <div style={{ textAlign: "center", padding: "52px 20px", color: "#b0a890", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ fontSize: 34, marginBottom: 12 }}>{icon}</div>
      <p style={{ fontSize: 14 }}>{text}</p>
    </div>
  );
}

function Loader() {
  return (
    <div style={{ textAlign: "center", padding: "48px 0" }}>
      <div style={{ width: 26, height: 26, margin: "0 auto", border: "2px solid rgba(138,125,94,0.15)", borderTop: "2px solid #8a7d5e", borderRadius: "50%", animation: "ara-spin .8s linear infinite" }} />
    </div>
  );
}

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end", padding: "14px 16px 8px" }}>
      <button disabled={page === 0} onClick={() => onChange(page - 1)} className="ara-pg" style={pgBtn(page === 0)}>← Prev</button>
      <span style={{ fontSize: 13, color: "#8a7d5e", padding: "0 6px", fontFamily: "'DM Sans', sans-serif" }}>{page + 1} / {totalPages}</span>
      <button disabled={page >= totalPages - 1} onClick={() => onChange(page + 1)} className="ara-pg" style={pgBtn(page >= totalPages - 1)}>Next →</button>
    </div>
  );
}

const pgBtn = (disabled) => ({
  fontSize: 13, padding: "5px 12px", borderRadius: 9,
  border: "1.5px solid rgba(138,125,94,0.2)", background: "transparent",
  color: disabled ? "rgba(138,125,94,0.3)" : "#8a7d5e",
  cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.5 : 1,
  fontFamily: "'DM Sans', sans-serif",
});

const primaryBtn   = { fontSize: 13, padding: "8px 16px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#c9b87a 0%,#b0983e 100%)", color: "#1a1714", cursor: "pointer", fontWeight: 700, whiteSpace: "nowrap", fontFamily: "'DM Sans', sans-serif" };
const secondaryBtn = { fontSize: 13, padding: "8px 15px", borderRadius: 10, border: "1.5px solid rgba(138,125,94,0.25)", background: "transparent", color: "#6b6248", cursor: "pointer", whiteSpace: "nowrap", fontFamily: "'DM Sans', sans-serif" };
const dangerBtn    = { fontSize: 13, padding: "8px 16px", borderRadius: 10, border: "none", background: "#D85A30", color: "#fff", cursor: "pointer", fontWeight: 700, fontFamily: "'DM Sans', sans-serif" };
const btnSm = (bg, color, border) => ({ fontSize: 11, padding: "4px 9px", borderRadius: 7, border: `1px solid ${border}`, background: bg, color, cursor: "pointer", whiteSpace: "nowrap", fontWeight: 600, fontFamily: "'DM Sans', sans-serif" });

// ─── Application detail modal ─────────────────────────────────────────────────

function AppDetailModal({ app: a, onClose }) {
  return (
    <Modal title={`Aplikim #${a.id} — Detaje`} onClose={onClose}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px", marginBottom: 16 }}>
        {[
          ["ID", `#${a.id}`], ["Listing", `#${a.listing_id}`],
          ["Client", `#${a.client_id}`], ["Status", "badge"],
          ["Income", fmtPrice(a.income)], ["Move-in Date", fmtDate(a.move_in_date)],
          ["Reviewed By", a.reviewed_by ? `#${a.reviewed_by}` : "—"], ["Reviewed At", fmtDateTime(a.reviewed_at)],
          ["Created", fmtDateTime(a.created_at)],
        ].map(([label, val]) => (
          <div key={label}>
            <p style={{ fontSize: 10, color: "#b0a890", textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 3px" }}>{label}</p>
            {val === "badge" ? <Badge label={a.status} /> : <p style={{ fontSize: 14, fontWeight: 500, margin: 0, color: "#1a1714", fontFamily: "'Cormorant Garamond', serif" }}>{val}</p>}
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
    </Modal>
  );
}

// ─── Review modal ─────────────────────────────────────────────────────────────

function ReviewModal({ app, onClose, onSuccess, notify }) {
  const [status, setStatus] = useState("APPROVED");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (status === "REJECTED" && !reason.trim()) { notify("Arsyeja e refuzimit është e detyrueshme", "error"); return; }
    setSaving(true);
    try {
      await api.patch(`/api/rentals/applications/${app.id}/review`, { status, rejection_reason: status === "REJECTED" ? reason : null });
      notify(`Aplikimi u shënua si ${status}`);
      onSuccess();
    } catch (err) {
      notify(err.response?.data?.message || "Gabim gjatë shqyrtimit", "error");
    } finally { setSaving(false); }
  };

  const isReject = status === "REJECTED";
  return (
    <Modal title={`Shqyrto Aplikimin #${app.id}`} onClose={onClose}>
      <div style={{ background: "rgba(138,125,94,0.06)", border: "1px solid rgba(138,125,94,0.15)", borderRadius: 10, padding: "10px 14px", marginBottom: 18, fontSize: 13 }}>
        <span style={{ color: "#8a7d5e", fontFamily: "'DM Sans', sans-serif" }}>Client <strong style={{ color: "#1a1714" }}>#{app.client_id}</strong> aplikoi për Listing <strong style={{ color: "#1a1714" }}>#{app.listing_id}</strong></span>
        {app.income && <span style={{ marginLeft: 12, color: "#1D9E75", fontFamily: "'DM Sans', sans-serif" }}>Të ardhura: {fmtPrice(app.income)}</span>}
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 10.5, fontWeight: 600, color: "#8a7d5e", display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>
          Vendimi <span style={{ color: "#D85A30" }}>*</span>
        </label>
        <div style={{ display: "flex", gap: 8 }}>
          {["APPROVED", "REJECTED"].map((s) => (
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
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Shkruaj arsyen e refuzimit..."
            style={{ width: "100%", padding: "9px 12px", fontSize: 13, border: "1.5px solid rgba(138,125,94,0.25)", borderRadius: 9, background: "#fff", color: "#1a1714", outline: "none", resize: "vertical", lineHeight: 1.6, boxSizing: "border-box", fontFamily: "'DM Sans', sans-serif" }} />
        </div>
      )}

      <div style={{
        background: isReject ? "rgba(216,90,48,0.06)" : "rgba(29,158,117,0.06)",
        border: `1px solid ${isReject ? "rgba(216,90,48,0.2)" : "rgba(29,158,117,0.2)"}`,
        borderRadius: 10, padding: "10px 14px", marginBottom: 18,
        fontSize: 13, color: isReject ? "#D85A30" : "#1D9E75", fontFamily: "'DM Sans', sans-serif",
      }}>
        {isReject ? "⚠️ Aplikimi do të shënohet si REJECTED — klienti do njoftohet." : "✓ Aplikimi do të shënohet si APPROVED."}
      </div>

      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button style={secondaryBtn} onClick={onClose}>Anulo</button>
        <button style={isReject ? dangerBtn : primaryBtn} onClick={handleSubmit} disabled={saving}>
          {saving ? "Duke shqyrtuar..." : `Konfirmo — ${status}`}
        </button>
      </div>
    </Modal>
  );
}

// ─── Applications by listing modal ───────────────────────────────────────────

function AppsByListingModal({ listingId, onClose, notify }) {
  const [apps, setApps]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [reviewTarget, setReviewTarget] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/rentals/applications/listing/${listingId}`);
      setApps(res.data || []);
    } catch (err) {
      notify(err.response?.data?.message || "Gabim", "error");
    } finally { setLoading(false); }
  }, [listingId, notify]);

  useEffect(() => { fetch(); }, [fetch]);

  return (
    <Modal title={`Aplikimet për Listing #${listingId}`} onClose={onClose} maxWidth={680}>
      {loading ? (
        <div style={{ textAlign: "center", padding: "32px 0", color: "#b0a890", fontFamily: "'DM Sans', sans-serif" }}>Duke ngarkuar…</div>
      ) : apps.length === 0 ? (
        <Empty icon="📋" text="Nuk ka aplikime për këtë listing." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {apps.map((a) => (
            <div key={a.id} style={{ border: "1px solid rgba(138,125,94,0.15)", background: "#fff", borderRadius: 11, padding: "14px 16px", display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: "monospace", fontSize: 11.5, color: "#b0a890" }}>#{a.id}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: "#1a1714", fontFamily: "'DM Sans', sans-serif" }}>Client #{a.client_id}</span>
                  <Badge label={a.status} />
                </div>
                <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: 12, color: "#8a7d5e", fontFamily: "'DM Sans', sans-serif" }}>
                  {a.income && <span>💰 {fmtPrice(a.income)}</span>}
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

      {reviewTarget && (
        <ReviewModal app={reviewTarget} onClose={() => setReviewTarget(null)}
          onSuccess={() => { setReviewTarget(null); fetch(); notify("Aplikimi u shqyrtua"); }}
          notify={notify} />
      )}
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export default function AdminRentalApplications() {
  const [listingId, setListingId]     = useState("");
  const [inputId, setInputId]         = useState("");
  const [apps, setApps]               = useState([]);
  const [loading, setLoading]         = useState(false);
  const [statusF, setStatusF]         = useState("");

  const [detailTarget, setDetail]         = useState(null);
  const [reviewTarget, setReviewTarget]   = useState(null);
  const [listingModal, setListingModal]   = useState(null);

  const [toast, setToast] = useState(null);
  const notify = useCallback((msg, type = "success") => setToast({ msg, type, key: Date.now() }), []);

  const fetchApps = useCallback(async () => {
    if (!listingId) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/rentals/applications/listing/${listingId}`);
      setApps(res.data || []);
    } catch (err) {
      notify(err.response?.data?.message || "Gabim gjatë ngarkimit", "error");
    } finally { setLoading(false); }
  }, [listingId, notify]);

  useEffect(() => { fetchApps(); }, [fetchApps]);

  const displayed = statusF ? apps.filter((a) => a.status === statusF) : apps;
  const counts = APP_STATUSES.reduce((acc, s) => ({ ...acc, [s]: apps.filter((a) => a.status === s).length }), {});

  const statusColors = {
    PENDING:   "#c9b87a",
    APPROVED:  "#1D9E75",
    REJECTED:  "#D85A30",
    CANCELLED: "#888780",
  };

  return (
    <MainLayout role="admin">
      <style>{CSS}</style>
      <div className="ara-wrap" style={{ padding: "1.5rem 0" }}>

        {/* ── Hero Header ─────────────────────────────────────────── */}
        <div style={{
          background: "linear-gradient(160deg, #141210 0%, #1e1a14 45%, #241e16 100%)",
          borderRadius: 16, padding: "28px 28px 24px", marginBottom: 22,
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.015) 1px,transparent 1px)", backgroundSize: "22px 22px", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,#c9b87a 30%,#c9b87a 70%,transparent)" }} />
          <div style={{ position: "relative" }}>
            <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 28, fontWeight: 700, color: "#f5f0e8", margin: "0 0 4px", letterSpacing: "-0.4px" }}>Rental Applications</h1>
            <p style={{ fontSize: 13, color: "rgba(245,240,232,0.35)", margin: 0, fontFamily: "'DM Sans', sans-serif" }}>Admin view — shiko dhe shqyrto aplikimet sipas listing</p>
          </div>
        </div>

        {/* ── Stat cards ───────────────────────────────────────────── */}
        {apps.length > 0 && (
          <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
            {APP_STATUSES.map((s) => (
              <div key={s} style={{ background: "#fff", borderRadius: 12, border: "1px solid rgba(138,125,94,0.15)", padding: "14px 18px", flex: "1 1 100px", minWidth: 90, boxShadow: "0 2px 12px rgba(20,16,10,0.05)" }}>
                <p style={{ fontSize: 10, color: "#b0a890", textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 4px", fontFamily: "'DM Sans', sans-serif" }}>{s}</p>
                <p style={{ fontSize: 26, fontWeight: 700, color: statusColors[s], margin: 0, letterSpacing: "-0.04em", fontFamily: "'Cormorant Garamond', serif" }}>{counts[s]}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Main card ────────────────────────────────────────────── */}
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid rgba(138,125,94,0.15)", overflow: "hidden", boxShadow: "0 2px 20px rgba(20,16,10,0.06)" }}>

          {/* Toolbar */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 20px", borderBottom: "1px solid rgba(138,125,94,0.12)", flexWrap: "wrap" }}>
            <label style={{ fontSize: 13, color: "#8a7d5e", whiteSpace: "nowrap", fontFamily: "'DM Sans', sans-serif" }}>Listing ID:</label>
            <input type="number" value={inputId} onChange={(e) => setInputId(e.target.value)} placeholder="ex: 5"
              style={{ width: 110, padding: "7px 11px", fontSize: 13, border: "1.5px solid rgba(138,125,94,0.25)", borderRadius: 9, background: "#fff", color: "#1a1714", outline: "none", fontFamily: "'DM Sans', sans-serif" }} />
            <button onClick={() => setListingId(inputId ? Number(inputId) : "")} style={secondaryBtn}>Load</button>
            {listingId && (
              <button onClick={() => setListingModal(listingId)} style={primaryBtn}>Shiko si modal →</button>
            )}
            <div style={{ marginLeft: "auto" }}>
              <select value={statusF} onChange={(e) => setStatusF(e.target.value)}
                style={{ padding: "7px 10px", fontSize: 13, border: "1.5px solid rgba(138,125,94,0.25)", borderRadius: 9, background: "#fff", color: "#1a1714", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", outline: "none" }}>
                <option value="">All statuses</option>
                {APP_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Table */}
          {!listingId ? (
            <Empty icon="📋" text="Shkruaj Listing ID dhe kliko Load për të parë aplikimet." />
          ) : loading ? <Loader /> : displayed.length === 0 ? (
            <Empty icon="📋" text={statusF ? `Nuk ka aplikime me status ${statusF}.` : "Nuk ka aplikime për këtë listing."} />
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 750 }}>
                <thead>
                  <tr>
                    {["#ID", "Client", "Status", "Income", "Move-in Date", "Reviewed By", "Reviewed At", "Created", "Actions"].map((h) => (
                      <th key={h} style={TH}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayed.map((a) => (
                    <tr key={a.id} className="ara-row">
                      <td style={{ ...TD, fontFamily: "monospace", color: "#b0a890", fontSize: 11.5 }}>{a.id}</td>
                      <td style={TD}>
                        <span style={{ background: "rgba(201,184,122,0.1)", color: "#c9b87a", border: "1px solid rgba(201,184,122,0.22)", padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
                          #{a.client_id}
                        </span>
                      </td>
                      <td style={TD}><Badge label={a.status} /></td>
                      <td style={{ ...TD, fontWeight: 600 }}>{fmtPrice(a.income)}</td>
                      <td style={{ ...TD, color: "#8a7d5e" }}>{fmtDate(a.move_in_date)}</td>
                      <td style={{ ...TD, color: "#8a7d5e" }}>{a.reviewed_by ? `#${a.reviewed_by}` : "—"}</td>
                      <td style={{ ...TD, color: "#b0a890", fontSize: 12 }}>{fmtDateTime(a.reviewed_at)}</td>
                      <td style={{ ...TD, color: "#b0a890", fontSize: 12 }}>{fmtDateTime(a.created_at)}</td>
                      <td style={TD}>
                        <div style={{ display: "flex", gap: 5 }}>
                          <button className="ara-btn" style={btnSm("rgba(201,184,122,0.08)", "#c9b87a", "rgba(201,184,122,0.25)")} onClick={() => setDetail(a)}>Detail</button>
                          {a.status === "PENDING" && (
                            <button className="ara-btn" style={btnSm("rgba(29,158,117,0.08)", "#1D9E75", "rgba(29,158,117,0.25)")} onClick={() => setReviewTarget(a)}>Shqyrto</button>
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

        {detailTarget  && <AppDetailModal app={detailTarget} onClose={() => setDetail(null)} />}
        {reviewTarget  && <ReviewModal app={reviewTarget} onClose={() => setReviewTarget(null)} onSuccess={() => { setReviewTarget(null); fetchApps(); notify("Aplikimi u shqyrtua"); }} notify={notify} />}
        {listingModal  && <AppsByListingModal listingId={listingModal} onClose={() => setListingModal(null)} notify={notify} />}
        {toast         && <Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
      </div>
    </MainLayout>
  );
}
