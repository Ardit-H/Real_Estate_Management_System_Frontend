// src/components/admin/contracts/ContractViewModal.jsx

import { useEffect } from "react";
import ContractStatusBadge from "./ContractStatusBadge";
import { fmtMoney, fmtDate } from "./contractsHelpers";

export default function ContractViewModal({ contract, onClose, onEdit, onStatus }) {
  useEffect(() => {
    const h = e => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div className="lc-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="lc-modal">
        <div className="lc-modal-header">
          <div>
            <div className="lc-modal-title">Contract #{contract.id}</div>
            <div className="lc-modal-sub">Detajet e plota të kontratës</div>
          </div>
          <button className="lc-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="lc-modal-body">
          <div style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(201,184,122,0.1)", borderRadius: 12, padding: "14px 16px", marginBottom: 18 }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 11, color: "rgba(245,240,232,0.35)", textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: 600, marginBottom: 6 }}>Status</p>
              <ContractStatusBadge status={contract.status} />
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 11, color: "rgba(245,240,232,0.35)", textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: 600, marginBottom: 4 }}>Monthly Rent</p>
              <p style={{ fontSize: 22, fontWeight: 700, color: "#c9b87a", fontFamily: "'Cormorant Garamond', serif" }}>
                {fmtMoney(contract.rent, contract.currency)}
              </p>
            </div>
          </div>
          <div className="lc-detail-grid">
            <div className="lc-detail-item"><div className="lc-detail-label">Property ID</div><div className="lc-detail-value">#{contract.property_id || "—"}</div></div>
            <div className="lc-detail-item"><div className="lc-detail-label">Client ID</div><div className="lc-detail-value">#{contract.client_id || "—"}</div></div>
            <div className="lc-detail-item"><div className="lc-detail-label">Agent ID</div><div className="lc-detail-value">#{contract.agent_id || "—"}</div></div>
            <div className="lc-detail-item"><div className="lc-detail-label">Listing ID</div><div className="lc-detail-value">{contract.listing_id ? `#${contract.listing_id}` : "—"}</div></div>
            <div className="lc-detail-item"><div className="lc-detail-label">Start Date</div><div className="lc-detail-value">{fmtDate(contract.start_date)}</div></div>
            <div className="lc-detail-item"><div className="lc-detail-label">End Date</div><div className="lc-detail-value">{fmtDate(contract.end_date)}</div></div>
            <div className="lc-detail-item"><div className="lc-detail-label">Deposit</div><div className="lc-detail-value">{fmtMoney(contract.deposit, contract.currency)}</div></div>
            <div className="lc-detail-item"><div className="lc-detail-label">Currency</div><div className="lc-detail-value">{contract.currency || "EUR"}</div></div>
            <div className="lc-detail-item"><div className="lc-detail-label">Created At</div><div className="lc-detail-value">{fmtDate(contract.created_at)}</div></div>
            <div className="lc-detail-item"><div className="lc-detail-label">Updated At</div><div className="lc-detail-value">{fmtDate(contract.updated_at)}</div></div>
            {contract.contract_file_url && (
              <div className="lc-detail-item full">
                <div className="lc-detail-label">Contract File</div>
                <div className="lc-detail-value">
                  <a href={contract.contract_file_url} target="_blank" rel="noopener noreferrer" style={{ color: "#38bdf8", fontSize: 12.5 }}>
                    {contract.contract_file_url}
                  </a>
                </div>
              </div>
            )}
          </div>
          <div className="lc-modal-footer">
            <button className="lc-btn-cancel" onClick={onClose}>Mbyll</button>
            <button className="lc-btn lc-btn-status" style={{ height: 38, padding: "0 16px", fontSize: 13 }} onClick={() => { onClose(); onStatus(contract); }}>⚡ Status</button>
            <button className="lc-btn-primary" onClick={() => { onClose(); onEdit(contract); }}>✏️ Edit</button>
          </div>
        </div>
      </div>
    </div>
  );
}