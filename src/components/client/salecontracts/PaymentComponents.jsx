import { fmtMoney, fmtDate, isOverdue, getType, getPaymentStatus } from "./saleConstants";
 
// ─── Section Label ─────────────────────────────────────────────────────────────
export function SectionLabel({ label, count, color, borderColor }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.9px" }}>{label}</span>
      <span style={{ background: `${color}20`, color, border: `1.5px solid ${borderColor || color + "40"}`, borderRadius: 999, padding: "2px 10px", fontSize: 11, fontWeight: 700 }}>{count}</span>
      <div style={{ flex: 1, height: 1, background: `${color}25` }} />
    </div>
  );
}
 
// ─── Payment Row ───────────────────────────────────────────────────────────────
export function PaymentRow({ payment: p, idx }) {
  const sc  = getPaymentStatus(p.status);
  const tc  = getType(p.payment_type);
  const odd = isOverdue(p);
 
  return (
    <div style={{
      background: odd ? "rgba(212,133,90,0.05)" : "#fff",
      border: `1.5px solid ${odd ? "rgba(212,133,90,0.28)" : "#e8e2d6"}`,
      borderRadius: 11, padding: "14px 18px",
      animation: `msp-row-in 0.3s ease ${Math.min(idx * 0.04, 0.3)}s both`,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ background: tc.bg, color: tc.color, border: `1.5px solid ${tc.border}`, padding: "3px 11px", borderRadius: 999, fontSize: 11, fontWeight: 700 }}>{tc.label}</span>
          <span style={{ fontSize: 19, fontWeight: 700, color: "#1a1714", fontFamily: "'Cormorant Garamond',Georgia,serif" }}>{fmtMoney(p.amount, p.currency)}</span>
          {odd && <span style={{ fontSize: 11, color: "#d4855a", fontWeight: 700, background: "rgba(212,133,90,0.1)", border: "1px solid rgba(212,133,90,0.28)", padding: "2px 8px", borderRadius: 999 }}>⚠️ Overdue</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {p.paid_date  && <span style={{ fontSize: 12, color: "#9a8c6e" }}>Paid {fmtDate(p.paid_date)}</span>}
          {!p.paid_date && p.due_date && <span style={{ fontSize: 12, color: odd ? "#d4855a" : "#9a8c6e", fontWeight: odd ? 600 : 400 }}>Due {fmtDate(p.due_date)}</span>}
          <span style={{ background: sc.bg, color: sc.color, border: `1.5px solid ${sc.border}`, padding: "3px 11px", borderRadius: 999, fontSize: 11, fontWeight: 700 }}>{sc.label}</span>
        </div>
      </div>
      <div style={{ fontSize: 12.5, color: "#9a8c6e", display: "flex", alignItems: "center", gap: 5 }}>
        <span style={{ color: "#c9b87a" }}>→</span>
        {p.recipient_name
          ? <><strong style={{ color: "#6b6248" }}>{p.recipient_name}</strong> <span style={{ background: "#f0ece3", color: "#9a8c6e", padding: "1px 7px", borderRadius: 999, fontSize: 10.5, fontWeight: 600 }}>{p.recipient_type}</span></>
          : <span style={{ color: "#2a6049", fontWeight: 600, background: "rgba(126,184,164,0.1)", border: "1px solid rgba(126,184,164,0.22)", padding: "1px 8px", borderRadius: 999, fontSize: 11 }}>🏢 Company</span>
        }
        {p.transaction_ref && <span style={{ marginLeft: 8, background: "#f0ece3", color: "#9a8c6e", padding: "1px 8px", borderRadius: 999, fontSize: 10.5 }}>Ref: {p.transaction_ref}</span>}
      </div>
    </div>
  );
}
 
// ─── Contract Tab button ───────────────────────────────────────────────────────
export function ContractTab({ contract: c, selected, onSelect }) {
  const dotColor = c.status === "COMPLETED" ? "#7eb8a4" : c.status === "CANCELLED" ? "#9a8c6e" : "#c9b87a";
  return (
    <button onClick={() => onSelect(c.id)} style={{ padding: "9px 16px", borderRadius: 10, background: selected ? "#1a1714" : "#fff", color: selected ? "#f5f0e8" : "#4a4438", border: `1.5px solid ${selected ? "#1a1714" : "#e8e2d6"}`, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: 12.5, fontWeight: selected ? 600 : 400, transition: "all 0.15s", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 7 }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: dotColor, display: "inline-block", flexShrink: 0 }} />
      #{c.id} — {fmtMoney(c.sale_price, c.currency)}
    </button>
  );
}
 