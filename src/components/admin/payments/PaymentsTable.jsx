// src/components/admin/payments/PaymentsTable.jsx

import PaymentStatusBadge from "./PaymentStatusBadge";
import { fmtMoney, fmtDate, isOverdue } from "./paymentsHelpers";

function Pagination({ tab, page, totalPages, setPage }) {
  if (tab !== "status" || totalPages <= 1) return null;
  return (
    <div className="pm-pagination">
      <button className="pm-page-btn" disabled={page === 0} onClick={() => setPage(p => p - 1)}>← Prev</button>
      {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
        const p = page <= 3 ? i : page - 3 + i;
        if (p >= totalPages) return null;
        return (
          <button key={p} className={`pm-page-btn ${p === page ? "active" : ""}`} onClick={() => setPage(p)}>
            {p + 1}
          </button>
        );
      })}
      <button className="pm-page-btn" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next →</button>
    </div>
  );
}

export default function PaymentsTable({ payments, loading, tab, contractId, page, totalPages, setPage, onView, onMarkPaid, onStatus }) {
  if (loading) return <div className="pm-spinner" />;

  if (payments.length === 0) {
    return (
      <div className="pm-empty">
        <div className="pm-empty-icon">
          {tab === "contract" && !contractId ? "📋" : tab === "overdue" ? "✅" : "💳"}
        </div>
        <div className="pm-empty-text">
          {tab === "contract" && !contractId
            ? "Shkruaj Contract ID dhe kliko Load"
            : tab === "overdue"
            ? "Nuk ka pagesa me vonesë 🎉"
            : "Nuk ka pagesa"}
        </div>
      </div>
    );
  }

  return (
    <>
      <table className="pm-table">
        <thead>
          <tr>
            <th>#ID</th>
            <th>Contract</th>
            <th>Shuma</th>
            <th>Tipi</th>
            <th>Recipient</th>
            <th>Due Date</th>
            <th>Paid Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {payments.map(p => {
            const overdue = isOverdue(p);
            return (
              <tr key={p.id} onClick={() => onView(p)}>
                <td>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15, fontWeight: 700, color: "#c9b87a" }}>#{p.id}</span>
                </td>
                <td>
                  <span style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(201,184,122,0.1)", padding: "2px 8px", borderRadius: 6, fontSize: 12, color: "rgba(245,240,232,0.55)" }}>
                    #{p.contract_id}
                  </span>
                </td>
                <td><span style={{ fontWeight: 600, color: "#c9b87a", fontSize: 13.5 }}>{fmtMoney(p.amount, p.currency)}</span></td>
                <td><span className="pm-type-chip">{p.payment_type || "—"}</span></td>
                <td>
                  <span style={{ fontSize: 12.5, color: "rgba(245,240,232,0.5)" }}>
                    {p.recipient_name
                      ? p.recipient_name
                      : <span style={{ color: "rgba(201,184,122,0.5)", fontSize: 12 }}>🏢 Kompania</span>}
                  </span>
                  {p.recipient_type && p.recipient_type !== "COMPANY" && (
                    <span style={{ fontSize: 10, color: "rgba(245,240,232,0.3)", marginLeft: 4 }}>({p.recipient_type})</span>
                  )}
                </td>
                <td>
                  <span style={{ fontSize: 12.5, color: overdue ? "#f87171" : "rgba(245,240,232,0.5)", fontWeight: overdue ? 600 : 400 }}>
                    {overdue && "⚠️ "}{fmtDate(p.due_date)}
                  </span>
                </td>
                <td><span style={{ fontSize: 12, color: "rgba(245,240,232,0.38)" }}>{fmtDate(p.paid_date)}</span></td>
                <td><PaymentStatusBadge status={overdue && p.status === "PENDING" ? "OVERDUE" : p.status} /></td>
                <td onClick={e => e.stopPropagation()}>
                  <div className="pm-actions">
                    <button className="pm-btn pm-btn-view" onClick={() => onView(p)}>👁</button>
                    <button
                      className="pm-btn pm-btn-paid"
                      disabled={p.status === "PAID" || p.status === "REFUNDED"}
                      onClick={() => onMarkPaid(p)}
                    >✓ Paid</button>
                    <button className="pm-btn pm-btn-status" onClick={() => onStatus(p)}>⚡</button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <Pagination tab={tab} page={page} totalPages={totalPages} setPage={setPage} />
    </>
  );
}