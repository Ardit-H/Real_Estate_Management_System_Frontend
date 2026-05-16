// src/components/admin/payments/PaymentsToolbar.jsx

import { ALL_STATUSES } from "./paymentsHelpers";

export default function PaymentsToolbar({ tab, search, setSearch, contractId, setContractId, onLoadContract, statusFilter, setStatusFilter, setPage, count, onNew }) {
  return (
    <div className="pm-toolbar">
      <div className="pm-search">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(245,240,232,0.25)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Kërko sipas ID, tippit, recipientit..." />
      </div>

      {tab === "contract" && (
        <>
          <input
            className="pm-select"
            type="number" min="1"
            style={{ width: 150, cursor: "text" }}
            placeholder="Contract ID..."
            value={contractId}
            onChange={e => setContractId(e.target.value)}
            onKeyDown={e => e.key === "Enter" && onLoadContract(contractId)}
          />
          <button
            style={{ height: 38, padding: "0 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(201,184,122,0.15)", borderRadius: 10, color: "#c9b87a", fontSize: 13, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}
            onClick={() => onLoadContract(contractId)}
          >
            Load
          </button>
        </>
      )}

      {tab === "status" && (
        <select className="pm-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(0); }}>
          {ALL_STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
      )}

      <span className="pm-count">{count} pagesa</span>
      <button className="pm-btn-add" onClick={onNew}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        New Payment
      </button>
    </div>
  );
}