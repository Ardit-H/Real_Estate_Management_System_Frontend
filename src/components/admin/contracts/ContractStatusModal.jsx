// src/components/admin/contracts/ContractStatusModal.jsx

import { useState, useEffect } from "react";
import api from "../../../api/axios";
import ContractStatusBadge from "./ContractStatusBadge";

const STATUSES = ["ACTIVE", "PENDING_SIGNATURE", "ENDED", "CANCELLED"];

export default function ContractStatusModal({ contract, onClose, onSuccess, notify }) {
  const [status, setStatus] = useState(contract.status);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const h = e => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const handleSubmit = async () => {
    if (status === contract.status) { onClose(); return; }
    setSaving(true);
    try {
      await api.patch(`/api/contracts/lease/${contract.id}/status`, { status });
      onSuccess();
    } catch (err) {
      notify(err.response?.data?.message || "Gabim gjatë ndryshimit", "error");
    } finally { setSaving(false); }
  };

  return (
    <div className="lc-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="lc-modal lc-modal-sm">
        <div className="lc-modal-header">
          <div>
            <div className="lc-modal-title">Change Status</div>
            <div className="lc-modal-sub">Contract #{contract.id}</div>
          </div>
          <button className="lc-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="lc-modal-body">
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
            {STATUSES.map(s => (
              <label key={s} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: status === s ? "rgba(201,184,122,0.08)" : "rgba(255,255,255,0.02)", border: `1px solid ${status === s ? "rgba(201,184,122,0.25)" : "rgba(201,184,122,0.08)"}`, borderRadius: 10, cursor: "pointer", transition: "all 0.15s" }}>
                <input type="radio" name="status" value={s} checked={status === s} onChange={() => setStatus(s)} style={{ accentColor: "#c9b87a" }} />
                <ContractStatusBadge status={s} />
              </label>
            ))}
          </div>
          {status === "ACTIVE" && contract.status === "PENDING_SIGNATURE" && (
            <div style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.18)", borderRadius: 9, padding: "10px 13px", fontSize: 12.5, color: "rgba(245,240,232,0.6)", marginBottom: 16, lineHeight: 1.6 }}>
              ℹ️ Aktivizimi i kontratës do të krijojë automatikisht pagesat e komisionit.
            </div>
          )}
          <div className="lc-modal-footer">
            <button className="lc-btn-cancel" onClick={onClose}>Anulo</button>
            <button className="lc-btn-primary" onClick={handleSubmit} disabled={saving || status === contract.status}>
              {saving ? "Duke ndryshuar..." : "✓ Ndrysho Statusin"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}