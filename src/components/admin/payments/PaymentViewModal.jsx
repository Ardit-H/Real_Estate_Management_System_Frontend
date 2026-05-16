// src/components/admin/payments/PaymentViewModal.jsx

import { useEffect } from "react";
import PaymentStatusBadge from "./PaymentStatusBadge";
import { fmtMoney, fmtDate, isOverdue } from "./paymentsHelpers";

export default function PaymentViewModal({ payment, onClose, onMarkPaid, onStatus }) {
  const overdue = isOverdue(payment);

  useEffect(() => {
    const h = e => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div className="pm-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="pm-modal">
        <div className="pm-modal-header">
          <div>
            <div className="pm-modal-title">Payment #{payment.id}</div>
            <div className="pm-modal-sub">Detajet e plota</div>
          </div>
          <button className="pm-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="pm-modal-body">
          <div style={{ display: "flex", alignItems: "center", gap: 14, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(201,184,122,0.1)", borderRadius: 12, padding: "14px 16px", marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 11, color: "rgba(245,240,232,0.35)", textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: 600, marginBottom: 6 }}>Status</p>
              <PaymentStatusBadge status={overdue && payment.status === "PENDING" ? "OVERDUE" : payment.status} />
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 11, color: "rgba(245,240,232,0.35)", textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: 600, marginBottom: 4 }}>Amount</p>
              <p style={{ fontSize: 24, fontWeight: 700, color: "#c9b87a", fontFamily: "'Cormorant Garamond', serif" }}>
                {fmtMoney(payment.amount, payment.currency)}
              </p>
            </div>
          </div>
          <div className="pm-detail-grid">
            <div className="pm-detail-item"><div className="pm-detail-label">Contract ID</div><div className="pm-detail-value">#{payment.contract_id || "—"}</div></div>
            <div className="pm-detail-item"><div className="pm-detail-label">Payment Type</div><div className="pm-detail-value">{payment.payment_type || "—"}</div></div>
            <div className="pm-detail-item">
              <div className="pm-detail-label">Due Date</div>
              <div className="pm-detail-value" style={{ color: overdue ? "#f87171" : undefined }}>{overdue && "⚠️ "}{fmtDate(payment.due_date)}</div>
            </div>
            <div className="pm-detail-item"><div className="pm-detail-label">Paid Date</div><div className="pm-detail-value">{fmtDate(payment.paid_date)}</div></div>
            <div className="pm-detail-item"><div className="pm-detail-label">Payment Method</div><div className="pm-detail-value">{payment.payment_method || "—"}</div></div>
            <div className="pm-detail-item"><div className="pm-detail-label">Transaction Ref</div><div className="pm-detail-value" style={{ fontSize: 12, wordBreak: "break-all" }}>{payment.transaction_ref || "—"}</div></div>
            <div className="pm-detail-item">
              <div className="pm-detail-label">Recipient</div>
              <div className="pm-detail-value">
                {payment.recipient_name
                  ? `${payment.recipient_name} (${payment.recipient_type})`
                  : payment.recipient_type === "COMPANY" ? "🏢 Kompania" : "—"}
              </div>
            </div>
            <div className="pm-detail-item"><div className="pm-detail-label">Currency</div><div className="pm-detail-value">{payment.currency || "EUR"}</div></div>
            {payment.notes && (
              <div className="pm-detail-item full">
                <div className="pm-detail-label">Notes</div>
                <div className="pm-detail-value" style={{ fontSize: 12.5, lineHeight: 1.6 }}>{payment.notes}</div>
              </div>
            )}
            <div className="pm-detail-item"><div className="pm-detail-label">Created At</div><div className="pm-detail-value">{fmtDate(payment.created_at)}</div></div>
          </div>
          <div className="pm-modal-footer">
            <button className="pm-btn-cancel" onClick={onClose}>Mbyll</button>
            <button
              className="pm-btn pm-btn-status"
              style={{ height: 38, padding: "0 16px", fontSize: 13, borderRadius: 10 }}
              onClick={() => { onClose(); onStatus(payment); }}
            >⚡ Status</button>
            {payment.status !== "PAID" && payment.status !== "REFUNDED" && (
              <button className="pm-btn-primary" onClick={() => { onClose(); onMarkPaid(payment); }}>✓ Mark Paid</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}