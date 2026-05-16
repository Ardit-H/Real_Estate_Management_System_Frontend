// src/components/admin/payments/PaymentsSummaryBar.jsx

import { fmtMoney } from "./paymentsHelpers";

export default function PaymentsSummaryBar({ summary }) {
  if (!summary) return null;

  const items = [
    { label: "Total",   value: summary.total_payments, color: "#f5f0e8" },
    { label: "Paid",    value: fmtMoney(summary.total_paid),    color: "#34d399" },
    { label: "Pending", value: fmtMoney(summary.total_pending), color: "#fbbf24" },
    ...(summary.total_overdue ? [{ label: "Overdue", value: summary.total_overdue, color: "#f87171" }] : []),
  ];

  return (
    <div style={{ display: "flex", gap: 16, padding: "14px 18px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(201,184,122,0.1)", borderRadius: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
      {items.map((s, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {i > 0 && <div style={{ width: 1, height: 28, background: "rgba(201,184,122,0.1)" }} />}
          <div>
            <p style={{ fontSize: 10, color: "rgba(245,240,232,0.3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 3 }}>{s.label}</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: s.color, fontFamily: "'Cormorant Garamond', serif" }}>{s.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}