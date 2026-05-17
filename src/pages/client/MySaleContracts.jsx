import { useState, useEffect, useCallback, useContext } from "react";
import MainLayout from "../../components/layout/Layout";
import { AuthContext } from "../../context/AuthProvider";
import api from "../../api/axios";
 
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
  .msc * { box-sizing: border-box; }
  .msc { font-family: 'DM Sans', system-ui, sans-serif; background: #f2ede4; min-height: 100vh; }
  .msc-card { transition: transform 0.22s cubic-bezier(0.25,0.46,0.45,0.94), box-shadow 0.22s ease; }
  .msc-card:hover { transform: translateY(-4px); box-shadow: 0 20px 48px rgba(20,16,10,0.14) !important; }
  .msc-btn { transition: all 0.15s ease; }
  .msc-btn:hover:not(:disabled) { opacity: 0.86; transform: translateY(-1px); }
  @keyframes msc-scale-in { from{opacity:0;transform:scale(0.95) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes msc-spin { to{transform:rotate(360deg)} }
  @keyframes msc-pulse { 0%,100%{opacity:.38} 50%{opacity:.82} }
  @keyframes msc-toast { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes msc-glow { 0%,100%{opacity:0.07} 50%{opacity:0.14} }
  @keyframes msc-card-in { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
`;
 
const fmtMoney = (v, cur = "EUR") =>
  v != null ? new Intl.NumberFormat("de-DE", { style: "currency", currency: cur, maximumFractionDigits: 0 }).format(Number(v)) : "—";
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";
const daysUntil = (d) => {
  if (!d) return null;
  return Math.ceil((new Date(d) - new Date()) / 86400000);
};
 
const STATUS_CFG = {
  PENDING:           { bg: "rgba(201,184,122,0.10)", color: "#a8923e", border: "rgba(201,184,122,0.28)", label: "Pending",           icon: "⏳", strip: "#c9b87a"  },
  PENDING_SIGNATURE: { bg: "rgba(201,184,122,0.10)", color: "#a8923e", border: "rgba(201,184,122,0.28)", label: "Pending Signature", icon: "✍️", strip: "#c9b87a"  },
  ACTIVE:            { bg: "rgba(126,184,164,0.12)", color: "#2a6049", border: "rgba(126,184,164,0.28)", label: "Active",            icon: "✅", strip: "#7eb8a4"  },
  COMPLETED:         { bg: "rgba(126,184,164,0.12)", color: "#2a6049", border: "rgba(126,184,164,0.28)", label: "Completed",         icon: "🏆", strip: "#5aaa80"  },
  CANCELLED:         { bg: "rgba(160,153,126,0.10)", color: "#6b6248", border: "rgba(160,153,126,0.20)", label: "Cancelled",         icon: "🚫", strip: "#9a8c6e"  },
};
const getStatus = (s) => STATUS_CFG[s] || { bg: "#f0ece3", color: "#6b6248", border: "#e0d8c8", label: s, icon: "📄", strip: "#b0a890" };
 
function Toast({ msg, type = "success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{ position: "fixed", bottom: 26, right: 26, zIndex: 9999, background: "#1a1714", color: type === "error" ? "#f09090" : "#90c8a8", padding: "11px 18px", borderRadius: 12, fontSize: 13, boxShadow: "0 10px 36px rgba(0,0,0,0.32)", border: `1px solid ${type === "error" ? "rgba(240,128,128,0.15)" : "rgba(144,200,168,0.15)"}`, maxWidth: 320, fontFamily: "'DM Sans',sans-serif", animation: "msc-toast 0.2s ease", display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 14 }}>{type === "error" ? "⚠️" : "✅"}</span>{msg}
    </div>
  );
}
 
function Skeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} style={{ background: "linear-gradient(90deg,#ede9df 25%,#e4ddd0 50%,#ede9df 75%)", backgroundSize: "800px 100%", borderRadius: 14, height: 160, animation: "msc-pulse 1.6s ease-in-out infinite" }} />
      ))}
    </div>
  );
}
 
const PGB = (active, disabled) => ({ padding: "7px 13px", borderRadius: 9, border: `1.5px solid ${active ? "#1a1714" : "#e4ddd0"}`, background: active ? "#1a1714" : "transparent", color: active ? "#f5f0e8" : disabled ? "#d4ccbe" : "#6b6248", cursor: disabled ? "not-allowed" : "pointer", fontSize: 13, fontWeight: active ? 600 : 400, fontFamily: "'DM Sans',sans-serif", opacity: disabled ? 0.5 : 1, transition: "all 0.14s" });
 
function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i);
  const visible = pages.filter(p => p === 0 || p === totalPages - 1 || Math.abs(p - page) <= 1);
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: 4, marginTop: 36, flexWrap: "wrap" }}>
      <button disabled={page === 0} onClick={() => onChange(page - 1)} style={PGB(false, page === 0)}>‹</button>
      {visible.map((p, i) => {
        const gap = visible[i - 1] != null && p - visible[i - 1] > 1;
        return (<span key={p} style={{ display: "flex", gap: 4 }}>{gap && <span style={{ padding: "7px 4px", color: "#b0a890", fontSize: 13 }}>…</span>}<button onClick={() => onChange(p)} style={PGB(p === page, false)}>{p + 1}</button></span>);
      })}
      <button disabled={page === totalPages - 1} onClick={() => onChange(page + 1)} style={PGB(false, page === totalPages - 1)}>›</button>
    </div>
  );
}
 
// ─── Detail Modal — X button fix ──────────────────────────────────────────────
function ContractDetailModal({ contract: c, onClose, onViewPayments }) {
  const st = getStatus(c.status);
  const days = daysUntil(c.handover_date);
 
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", h); document.body.style.overflow = ""; };
  }, [onClose]);
 
  return (
    <div onClick={(e) => e.target === e.currentTarget && onClose()} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(8,6,4,0.84)", backdropFilter: "blur(14px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 560, background: "#faf7f2", borderRadius: 18, boxShadow: "0 44px 100px rgba(0,0,0,0.55)", maxHeight: "90vh", overflowY: "auto", animation: "msc-scale-in 0.24s ease" }}>
 
        {/* ── Header — X button nu është absolutë mbi badge ── */}
        <div style={{ background: "linear-gradient(160deg,#141210 0%,#1e1a14 45%,#241e16 100%)", padding: "20px 24px 18px", borderRadius: "18px 18px 0 0", position: "relative" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,#c9b87a 30%,#c9b87a 70%,transparent)", borderRadius: "18px 18px 0 0" }} />
 
          {/* Row 1: label + X */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: "#c9b87a", textTransform: "uppercase", letterSpacing: "1.2px", margin: 0 }}>Sale Contract</p>
            {/* X button këtu — larg badge-it */}
            <button onClick={onClose} style={{ background: "rgba(245,240,232,0.08)", border: "1px solid rgba(245,240,232,0.14)", borderRadius: 8, width: 30, height: 30, cursor: "pointer", color: "rgba(245,240,232,0.65)", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>×</button>
          </div>
 
          {/* Row 2: title + badge — nuk mbivendosen me X */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 22, fontWeight: 700, color: "#f5f0e8", margin: 0 }}>
              Contract #{c.id}
            </h2>
            <span style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}`, padding: "5px 14px", borderRadius: 999, fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
              {st.icon} {st.label}
            </span>
          </div>
        </div>
 
        <div style={{ padding: "22px 24px" }}>
          {/* Key figures */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            {[
              { label: "Sale Price",    value: fmtMoney(c.sale_price, c.currency), accent: true },
              { label: "Property",      value: `#${c.property_id}` },
              { label: "Contract Date", value: fmtDate(c.contract_date) },
              { label: "Handover Date", value: fmtDate(c.handover_date) },
            ].map(({ label, value, accent }) => (
              <div key={label} style={{ background: accent ? "rgba(201,184,122,0.07)" : "#fff", border: `1.5px solid ${accent ? "rgba(201,184,122,0.22)" : "#e8e2d6"}`, borderRadius: 12, padding: "13px 16px" }}>
                <p style={{ fontSize: 9.5, fontWeight: 600, color: "#b0a890", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 5 }}>{label}</p>
                <p style={{ fontSize: 17, fontWeight: 700, color: accent ? "#c9b87a" : "#1a1714", margin: 0, fontFamily: "'Cormorant Garamond',Georgia,serif" }}>{value}</p>
              </div>
            ))}
          </div>
 
          {/* Handover countdown */}
          {days !== null && c.status !== "COMPLETED" && c.status !== "CANCELLED" && (
            <div style={{ background: days < 0 ? "rgba(212,133,90,0.08)" : days <= 7 ? "rgba(201,184,122,0.08)" : "rgba(126,184,164,0.08)", border: `1.5px solid ${days < 0 ? "rgba(212,133,90,0.25)" : days <= 7 ? "rgba(201,184,122,0.25)" : "rgba(126,184,164,0.25)"}`, borderRadius: 12, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: days < 0 ? "#d4855a" : days <= 7 ? "#c9b87a" : "#2a6049", display: "flex", alignItems: "center", gap: 8 }}>
              {days < 0 ? "⚠️" : days <= 7 ? "🕐" : "📅"}
              {days < 0 ? `Handover was ${Math.abs(days)} day${Math.abs(days) !== 1 ? "s" : ""} ago` : days === 0 ? "Handover is today!" : `Handover in ${days} day${days !== 1 ? "s" : ""}`}
            </div>
          )}
 
          {c.status === "COMPLETED" && (
            <div style={{ background: "rgba(126,184,164,0.08)", border: "1.5px solid rgba(126,184,164,0.22)", borderRadius: 12, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: "#2a6049", display: "flex", alignItems: "center", gap: 8 }}>
              🎉 Congratulations! This property purchase has been completed.
            </div>
          )}
 
          {c.contract_file_url && (
            <div style={{ marginBottom: 16 }}>
              <a href={c.contract_file_url} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "#fff", border: "1.5px solid #e8e2d6", borderRadius: 10, color: "#1a1714", textDecoration: "none", fontSize: 13 }}>
                📎 <span>View Contract Document</span>
                <span style={{ marginLeft: "auto", fontSize: 11, color: "#9a8c6e" }}>Open ↗</span>
              </a>
            </div>
          )}
 
          <div style={{ display: "flex", gap: 8, paddingTop: 16, borderTop: "1.5px solid #e8e2d6" }}>
            <button onClick={() => onViewPayments(c)} className="msc-btn" style={{ flex: 1, padding: "10px 16px", borderRadius: 10, background: "linear-gradient(135deg,#c9b87a,#b0983e)", color: "#1a1714", border: "none", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
              💳 View Payments
            </button>
            <button onClick={onClose} className="msc-btn" style={{ padding: "10px 18px", borderRadius: 10, border: "1.5px solid #e4ddd0", background: "transparent", color: "#6b6248", fontWeight: 500, fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
 
function ContractCard({ contract: c, idx, onDetail, onPayments }) {
  const st = getStatus(c.status);
  const days = daysUntil(c.handover_date);
  return (
    <div className="msc-card" style={{ background: "#fff", borderRadius: 14, border: "1.5px solid #ece6da", overflow: "hidden", boxShadow: "0 2px 16px rgba(20,16,10,0.07)", animation: `msc-card-in 0.36s ease ${Math.min(idx * 0.06, 0.4)}s both` }}>
      <div style={{ height: 4, background: st.strip }} />
      <div style={{ padding: "18px 22px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, color: "#b0a890", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 4 }}>Sale Contract #{c.id} · Property #{c.property_id}</p>
            <p style={{ fontSize: 24, fontWeight: 700, color: "#1a1714", margin: 0, fontFamily: "'Cormorant Garamond',Georgia,serif", letterSpacing: "-0.3px" }}>{fmtMoney(c.sale_price, c.currency)}</p>
          </div>
          <span style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}`, padding: "4px 13px", borderRadius: 999, fontSize: 10.5, fontWeight: 700, flexShrink: 0, display: "flex", alignItems: "center", gap: 5 }}>{st.icon} {st.label}</span>
        </div>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 14 }}>
          {[{ label: "Contract Date", value: fmtDate(c.contract_date) }, { label: "Handover Date", value: fmtDate(c.handover_date) }].map(({ label, value }) => (
            <div key={label}>
              <p style={{ fontSize: 10, color: "#b0a890", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 3 }}>{label}</p>
              <p style={{ fontSize: 13.5, color: "#4a4438", margin: 0, fontWeight: 500 }}>{value}</p>
            </div>
          ))}
          {days !== null && c.status !== "COMPLETED" && c.status !== "CANCELLED" && (
            <div style={{ marginLeft: "auto" }}>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: days < 0 ? "#d4855a" : days <= 7 ? "#c9b87a" : "#2a6049", background: days < 0 ? "rgba(212,133,90,0.08)" : days <= 7 ? "rgba(201,184,122,0.08)" : "rgba(126,184,164,0.08)", border: `1px solid ${days < 0 ? "rgba(212,133,90,0.22)" : days <= 7 ? "rgba(201,184,122,0.22)" : "rgba(126,184,164,0.22)"}`, padding: "3px 10px", borderRadius: 999 }}>
                {days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? "Today" : `${days}d to handover`}
              </span>
            </div>
          )}
        </div>
        {c.status === "COMPLETED" && (
          <div style={{ background: "rgba(126,184,164,0.08)", border: "1.5px solid rgba(126,184,164,0.22)", borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: "#2a6049", display: "flex", alignItems: "center", gap: 8 }}>
            🎉 Property purchase completed successfully.
          </div>
        )}
        <div style={{ display: "flex", gap: 8, paddingTop: 12, borderTop: "1.5px solid #f0ece3" }}>
          <button onClick={() => onDetail(c)} className="msc-btn" style={{ flex: 1, padding: "8px 14px", borderRadius: 10, background: "#f0ece3", color: "#4a4438", border: "1.5px solid #e8e2d6", fontSize: 12.5, fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>📄 Details</button>
          <button onClick={() => onPayments(c)} className="msc-btn" style={{ flex: 1, padding: "8px 14px", borderRadius: 10, background: "#1a1714", color: "#f5f0e8", border: "none", fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>💳 Payments</button>
        </div>
      </div>
    </div>
  );
}
 
function PaymentsQuickModal({ contract: c, onClose, notify }) {
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", h); document.body.style.overflow = ""; };
  }, [onClose]);
 
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [listRes, sumRes] = await Promise.all([
          api.get(`/api/sales/payments/contract/${c.id}`),
          api.get(`/api/sales/payments/contract/${c.id}/summary`),
        ]);
        setPayments(listRes.data || []);
        setSummary(sumRes.data);
      } catch { notify("Failed to load payments", "error"); }
      finally { setLoading(false); }
    })();
  }, [c.id, notify]);
 
  const TYPE_COLORS = {
    FULL: { bg: "rgba(201,184,122,0.12)", color: "#8a7230" }, DEPOSIT: { bg: "rgba(126,184,164,0.12)", color: "#2a6049" },
    INSTALLMENT: { bg: "#f0ece3", color: "#6b6248" }, COMMISSION: { bg: "rgba(126,184,164,0.12)", color: "#2a6049" },
    AGENT_COMMISSION: { bg: "rgba(201,184,122,0.12)", color: "#8a6430" }, CLIENT_BONUS: { bg: "rgba(164,176,126,0.12)", color: "#4a6030" },
  };
  const STATUS_BADGE = {
    PENDING: { bg: "rgba(201,184,122,0.10)", color: "#a8923e" }, PAID: { bg: "rgba(126,184,164,0.12)", color: "#2a6049" },
    FAILED: { bg: "rgba(212,133,90,0.10)", color: "#8b4013" }, REFUNDED: { bg: "rgba(160,153,126,0.10)", color: "#6b6248" },
  };
 
  return (
    <div onClick={(e) => e.target === e.currentTarget && onClose()} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(8,6,4,0.84)", backdropFilter: "blur(14px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 640, background: "#faf7f2", borderRadius: 18, boxShadow: "0 44px 100px rgba(0,0,0,0.55)", maxHeight: "90vh", overflowY: "auto", animation: "msc-scale-in 0.24s ease" }}>
        <div style={{ background: "linear-gradient(160deg,#141210 0%,#1e1a14 100%)", padding: "20px 24px 18px", borderRadius: "18px 18px 0 0", position: "relative" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,#c9b87a 30%,#c9b87a 70%,transparent)", borderRadius: "18px 18px 0 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: "#c9b87a", textTransform: "uppercase", letterSpacing: "1.2px", margin: 0 }}>Payments</p>
            <button onClick={onClose} style={{ background: "rgba(245,240,232,0.08)", border: "1px solid rgba(245,240,232,0.14)", borderRadius: 8, width: 30, height: 30, cursor: "pointer", color: "rgba(245,240,232,0.65)", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
          </div>
          <h2 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 19, fontWeight: 700, color: "#f5f0e8", margin: "0 0 12px" }}>
            Contract #{c.id} · {fmtMoney(c.sale_price, c.currency)}
          </h2>
          {summary && (
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {[{ label: "Total", value: summary.total_payments, color: "#c9b87a" }, { label: "Paid", value: fmtMoney(summary.total_paid), color: "#7eb8a4" }].map(s => (
                <div key={s.label}>
                  <span style={{ fontSize: 9.5, color: "rgba(245,240,232,0.35)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px" }}>{s.label} </span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: s.color, fontFamily: "'Cormorant Garamond',Georgia,serif" }}>{s.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ padding: "18px 24px" }}>
          {loading && <div style={{ textAlign: "center", padding: 36, color: "#9a8c6e" }}><div style={{ width: 24, height: 24, margin: "0 auto 12px", border: "2px solid #e8e2d6", borderTop: "2px solid #c9b87a", borderRadius: "50%", animation: "msc-spin .8s linear infinite" }} /><p style={{ fontSize: 13 }}>Loading payments…</p></div>}
          {!loading && payments.length === 0 && <div style={{ textAlign: "center", padding: "32px 16px", color: "#b0a890" }}><div style={{ fontSize: 36, marginBottom: 10 }}>💳</div><p style={{ fontSize: 14 }}>No payments found.</p></div>}
          {!loading && payments.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {payments.map(p => {
                const tc = TYPE_COLORS[p.payment_type] || { bg: "#f0ece3", color: "#6b6248" };
                const sc = STATUS_BADGE[p.status] || { bg: "#f0ece3", color: "#6b6248" };
                return (
                  <div key={p.id} style={{ background: "#fff", border: "1.5px solid #e8e2d6", borderRadius: 11, padding: "13px 16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ background: tc.bg, color: tc.color, padding: "2px 9px", borderRadius: 999, fontSize: 10.5, fontWeight: 600 }}>{p.payment_type}</span>
                        <span style={{ fontSize: 16, fontWeight: 700, color: "#1a1714", fontFamily: "'Cormorant Garamond',Georgia,serif" }}>{fmtMoney(p.amount, p.currency)}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {p.paid_date && <span style={{ fontSize: 12, color: "#9a8c6e" }}>{fmtDate(p.paid_date)}</span>}
                        <span style={{ background: sc.bg, color: sc.color, padding: "2px 10px", borderRadius: 999, fontSize: 10.5, fontWeight: 600 }}>{p.status}</span>
                      </div>
                    </div>
                    <p style={{ fontSize: 12, color: "#9a8c6e", margin: "6px 0 0" }}>
                      → {p.recipient_name ? <><strong style={{ color: "#6b6248" }}>{p.recipient_name}</strong> ({p.recipient_type})</> : <span style={{ color: "#7eb8a4", fontWeight: 600 }}>Company</span>}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
 
export default function MySaleContracts() {
  const { user } = useContext(AuthContext);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [detailTarget, setDetailTarget] = useState(null);
  const [paymentsTarget, setPaymentsTarget] = useState(null);
  const [toast, setToast] = useState(null);
  const notify = useCallback((msg, type = "success") => setToast({ msg, type, key: Date.now() }), []);
 
  const fetch = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/sales/contracts/buyer/${user.id}?page=${page}&size=10`);
      setContracts(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setTotalElements(res.data.totalElements || 0);
    } catch { notify("Failed to load sale contracts", "error"); }
    finally { setLoading(false); }
  }, [user?.id, page, notify]);
 
  useEffect(() => { fetch(); }, [fetch]);
 
  const stats = { total: totalElements, completed: contracts.filter(c => c.status === "COMPLETED").length, pending: contracts.filter(c => ["PENDING", "PENDING_SIGNATURE"].includes(c.status)).length };
 
  return (
    <MainLayout role="client">
      <style>{CSS}</style>
      <div className="msc">
        <div style={{ background: "linear-gradient(160deg,#141210 0%,#1e1a14 45%,#241e16 100%)", minHeight: 300, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 32px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.018) 1px,transparent 1px)", backgroundSize: "22px 22px", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: "-60px", left: "10%", width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle,rgba(201,184,122,0.07) 0%,transparent 70%)", pointerEvents: "none", animation: "msc-glow 4s ease-in-out infinite" }} />
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg,transparent,#c9b87a 30%,#c9b87a 70%,transparent)" }} />
          <div style={{ position: "relative", zIndex: 1, maxWidth: 700, width: "100%", textAlign: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(201,184,122,0.1)", border: "1px solid rgba(201,184,122,0.18)", borderRadius: 999, padding: "4px 14px", marginBottom: 14 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#c9b87a", display: "inline-block", boxShadow: "0 0 6px #c9b87a" }} />
              <span style={{ fontSize: 10.5, fontWeight: 600, color: "#c9b87a", letterSpacing: "1.2px", textTransform: "uppercase" }}>Purchase History</span>
            </div>
            <h1 style={{ margin: "0 0 10px", fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "clamp(28px,4vw,44px)", fontWeight: 700, color: "#f5f0e8", letterSpacing: "-0.7px", lineHeight: 1.1 }}>
              My Sale <span style={{ background: "linear-gradient(90deg,#c9b87a,#e8d9a0,#c9b87a)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Contracts</span>
            </h1>
            <p style={{ margin: "0 auto 22px", fontSize: 13.5, color: "rgba(245,240,232,0.38)", fontFamily: "'DM Sans',sans-serif", lineHeight: 1.6 }}>Track your property purchases, contracts & payment schedules</p>
            {!loading && totalElements > 0 && (
              <div style={{ display: "flex", gap: 10, maxWidth: 480, margin: "0 auto", justifyContent: "center", flexWrap: "wrap" }}>
                {[{ label: "Total", value: stats.total, dot: "#c9b87a" }, { label: "Completed", value: stats.completed, dot: "#7eb8a4" }, { label: "Pending", value: stats.pending, dot: "#d4855a" }].map(s => (
                  <div key={s.label} style={{ background: "rgba(245,240,232,0.06)", backdropFilter: "blur(10px)", borderRadius: 12, padding: "10px 18px", border: "1px solid rgba(245,240,232,0.1)", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                    <span style={{ fontSize: 22, fontWeight: 700, color: s.dot, lineHeight: 1, fontFamily: "'Cormorant Garamond',Georgia,serif" }}>{s.value}</span>
                    <span style={{ fontSize: 9.5, color: "rgba(245,240,232,0.35)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px" }}>{s.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div style={{ background: "#fff", borderBottom: "1.5px solid #e8e2d6", padding: "0 28px", height: 46, display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: "'DM Sans',sans-serif", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 10px rgba(20,16,10,0.05)" }}>
          <p style={{ margin: 0, fontSize: 12.5, color: "#9a8c6e" }}>{loading ? "Loading…" : `${totalElements} contract${totalElements !== 1 ? "s" : ""}`}</p>
        </div>
        <div style={{ padding: "20px 24px", maxWidth: 900, margin: "0 auto" }}>
          {loading && <Skeleton />}
          {!loading && contracts.length === 0 && (
            <div style={{ textAlign: "center", padding: "88px 32px", color: "#b0a890", fontFamily: "'DM Sans',sans-serif" }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>🏠</div>
              <p style={{ fontSize: 20, fontWeight: 700, color: "#4a4438", marginBottom: 6, fontFamily: "'Cormorant Garamond',Georgia,serif" }}>No sale contracts yet</p>
              <p style={{ fontSize: 13, color: "#b0a890", lineHeight: 1.6, marginBottom: 24 }}>Your property purchase contracts will appear here once created.</p>
              <a href="/client/browseproperties" style={{ padding: "12px 28px", background: "linear-gradient(135deg,#c9b87a,#b0983e)", color: "#1a1714", border: "none", borderRadius: 11, fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 7, boxShadow: "0 6px 24px rgba(201,184,122,0.28)" }}>🔍 Browse Properties</a>
            </div>
          )}
          {!loading && contracts.length > 0 && (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {contracts.map((c, i) => <ContractCard key={c.id} contract={c} idx={i} onDetail={setDetailTarget} onPayments={setPaymentsTarget} />)}
              </div>
              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            </>
          )}
        </div>
      </div>
      {detailTarget && <ContractDetailModal contract={detailTarget} onClose={() => setDetailTarget(null)} onViewPayments={(c) => { setDetailTarget(null); setPaymentsTarget(c); }} />}
      {paymentsTarget && <PaymentsQuickModal contract={paymentsTarget} onClose={() => setPaymentsTarget(null)} notify={notify} />}
      {toast && <Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </MainLayout>
  );
}
 