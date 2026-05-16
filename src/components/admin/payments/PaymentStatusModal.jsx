// src/components/admin/payments/PaymentStatusModal.jsx

import { useState, useEffect } from "react";
import api from "../../../api/axios";
import PaymentStatusBadge from "./PaymentStatusBadge";
import { ALL_STATUSES } from "./paymentsHelpers";

export default function PaymentStatusModal({ payment, onClose, onSuccess, notify }) {
  const [status, setStatus] = useState(payment.status);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const h = e => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const handleSubmit = async () => {
    if (status === payment.status) { onClose(); return; }
    setSaving(true);
    try {
      await api.patch(`/api/payments/${payment.id}/status`, { status });
      onSuccess();
    } catch (err) {
      notify(err.response?.data?.message || "Gabim", "error");
    } finally { setSaving(false); }
  };

  return (
    <div className="pm-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="pm-modal pm-modal-sm">
        <div className="pm-modal-header">
          <div>
            <div className="pm-modal-title">Change Status</div>
            <div className="pm-modal-sub">Pagesa #{payment.id}</div>
          </div>
          <button className="pm-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="pm-modal-body">
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            {ALL_STATUSES.map(s => (
              <label key={s} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", background: status === s ? "rgba(201,184,122,0.08)" : "rgba(255,255,255,0.02)", border: `1px solid ${status === s ? "rgba(201,184,122,0.25)" : "rgba(201,184,122,0.08)"}`, borderRadius: 10, cursor: "pointer", transition: "all 0.15s" }}>
                <input type="radio" name="status" value={s} checked={status === s} onChange={() => setStatus(s)} style={{ accentColor: "#c9b87a" }} />
                <PaymentStatusBadge status={s} />
              </label>
            ))}
          </div>
          <div className="pm-modal-footer">
            <button className="pm-btn-cancel" onClick={onClose}>Anulo</button>
            <button className="pm-btn-primary" onClick={handleSubmit} disabled={saving || status === payment.status}>
              {saving ? "Duke ndryshuar..." : "✓ Ndrysho Statusin"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}