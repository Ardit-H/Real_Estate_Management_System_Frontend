import { useState, useEffect } from "react";
import api from "../../../api/axios";
import { fmtMoney, fmtDate, daysUntil, getContractStatus, getType, getPaymentStatus } from "./saleConstants";
 
// ─── Contract Card ─────────────────────────────────────────────────────────────
export function ContractCard({ contract: c, idx, onDetail, onPayments }) {
  const st   = getContractStatus(c.status);
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
 
// ─── Contract Detail Modal ─────────────────────────────────────────────────────
export function ContractDetailModal({ contract: c, onClose, onViewPayments }) {
  const st   = getContractStatus(c.status);
  const days = daysUntil(c.handover_date);
 
  useEffect(() => {
    const h = e => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", h); document.body.style.overflow = ""; };
  }, [onClose]);
 
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(8,6,4,0.84)", backdropFilter: "blur(14px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 560, background: "#faf7f2", borderRadius: 18, boxShadow: "0 44px 100px rgba(0,0,0,0.55)", maxHeight: "90vh", overflowY: "auto", animation: "msc-scale-in 0.24s ease" }}>
 
        <div style={{ background: "linear-gradient(160deg,#141210 0%,#1e1a14 45%,#241e16 100%)", padding: "20px 24px 18px", borderRadius: "18px 18px 0 0", position: "relative" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,#c9b87a 30%,#c9b87a 70%,transparent)", borderRadius: "18px 18px 0 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: "#c9b87a", textTransform: "uppercase", letterSpacing: "1.2px", margin: 0 }}>Sale Contract</p>
            <button onClick={onClose} style={{ background: "rgba(245,240,232,0.08)", border: "1px solid rgba(245,240,232,0.14)", borderRadius: 8, width: 30, height: 30, cursor: "pointer", color: "rgba(245,240,232,0.65)", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>×</button>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 22, fontWeight: 700, color: "#f5f0e8", margin: 0 }}>Contract #{c.id}</h2>
            <span style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}`, padding: "5px 14px", borderRadius: 999, fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{st.icon} {st.label}</span>
          </div>
        </div>
 
        <div style={{ padding: "22px 24px" }}>
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
 
// ─── Payments Quick Modal ──────────────────────────────────────────────────────
export function PaymentsQuickModal({ contract: c, onClose, notify }) {
  const [payments, setPayments] = useState([]);
  const [summary,  setSummary]  = useState(null);
  const [loading,  setLoading]  = useState(true);
 
  useEffect(() => {
    const h = e => e.key === "Escape" && onClose();
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
 
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(8,6,4,0.84)", backdropFilter: "blur(14px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "'DM Sans',sans-serif" }}>
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
                const tc = getType(p.payment_type);
                const sc = getPaymentStatus(p.status);
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
 