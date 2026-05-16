// src/components/admin/contracts/ContractsTable.jsx

import ContractStatusBadge from "./ContractStatusBadge";
import { fmtMoney, fmtDate } from "./contractsHelpers";

function Spinner() { return <div className="lc-spinner" />; }

function Empty({ search, statusFilter }) {
  return (
    <div className="lc-empty">
      <div className="lc-empty-icon">📋</div>
      <div className="lc-empty-text">
        {search || statusFilter !== "ALL" ? "Nuk u gjet asnjë kontratë" : "Nuk ka kontrata ende"}
      </div>
    </div>
  );
}

function Pagination({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null;
  return (
    <div className="lc-pagination">
      <button className="lc-page-btn" disabled={page === 0} onClick={() => onPage(p => p - 1)}>← Prev</button>
      {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
        const p = page <= 3 ? i : page - 3 + i;
        if (p >= totalPages) return null;
        return (
          <button key={p} className={`lc-page-btn ${p === page ? "active" : ""}`} onClick={() => onPage(p)}>
            {p + 1}
          </button>
        );
      })}
      <button className="lc-page-btn" disabled={page >= totalPages - 1} onClick={() => onPage(p => p + 1)}>Next →</button>
    </div>
  );
}

export default function ContractsTable({ contracts, loading, search, statusFilter, expiring, page, totalPages, onPage, onView, onEdit, onStatus }) {
  if (loading) return <Spinner />;
  if (contracts.length === 0) return <Empty search={search} statusFilter={statusFilter} />;

  return (
    <>
      <table className="lc-table">
        <thead>
          <tr>
            <th>#ID</th>
            <th>Property</th>
            <th>Client</th>
            <th>Agent</th>
            <th>Period</th>
            <th>Rent / mo</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {contracts.map(c => {
            const isExpiring = expiring.some(e => e.id === c.id);
            return (
              <tr key={c.id} onClick={() => onView(c)}>
                <td>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15, fontWeight: 700, color: "#c9b87a" }}>
                    #{c.id}
                  </span>
                </td>
                <td>
                  <span style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(201,184,122,0.1)", padding: "3px 9px", borderRadius: 7, fontSize: 12, color: "rgba(245,240,232,0.6)" }}>
                    Prop #{c.property_id}
                  </span>
                </td>
                <td><span style={{ fontSize: 12.5, color: "rgba(245,240,232,0.55)" }}>Client #{c.client_id}</span></td>
                <td><span style={{ fontSize: 12.5, color: "rgba(245,240,232,0.45)" }}>{c.agent_id ? `Agent #${c.agent_id}` : "—"}</span></td>
                <td>
                  <span style={{ fontSize: 12, color: "rgba(245,240,232,0.5)" }}>
                    {fmtDate(c.start_date)} → {fmtDate(c.end_date)}
                  </span>
                  {isExpiring && (
                    <span style={{ marginLeft: 6, fontSize: 10, background: "rgba(251,191,36,0.12)", color: "#fbbf24", padding: "1px 6px", borderRadius: 10 }}>
                      ⚠️ Expiring
                    </span>
                  )}
                </td>
                <td><span style={{ fontWeight: 600, color: "#c9b87a", fontSize: 13 }}>{fmtMoney(c.rent, c.currency)}</span></td>
                <td><ContractStatusBadge status={c.status} /></td>
                <td><span style={{ fontSize: 12, color: "rgba(245,240,232,0.35)" }}>{fmtDate(c.created_at)}</span></td>
                <td onClick={e => e.stopPropagation()}>
                  <div className="lc-actions">
                    <button className="lc-btn lc-btn-view" onClick={() => onView(c)}>👁 View</button>
                    <button className="lc-btn lc-btn-edit" onClick={() => onEdit(c)}>✏️ Edit</button>
                    <button className="lc-btn lc-btn-status" onClick={() => onStatus(c)}>⚡ Status</button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <Pagination page={page} totalPages={totalPages} onPage={onPage} />
    </>
  );
}