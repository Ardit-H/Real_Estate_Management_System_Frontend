// src/components/admin/payments/PaymentsStats.jsx

import { fmtMoney } from "./paymentsHelpers";

export default function PaymentsStats({ revenue, total, paid, overdueCount }) {
  return (
    <div className="pm-stats">
      <div className="pm-stat">
        <p className="pm-stat-label">Total Revenue</p>
        <p className="pm-stat-value" style={{ color: "#34d399" }}>
          {revenue != null ? `€${Number(revenue).toLocaleString("de-DE")}` : "—"}
        </p>
        <p className="pm-stat-sub">pagesat PAID</p>
      </div>
      <div className="pm-stat">
        <p className="pm-stat-label">Payments Loaded</p>
        <p className="pm-stat-value" style={{ color: "#f5f0e8" }}>{total}</p>
        <p className="pm-stat-sub">në pamjen aktuale</p>
      </div>
      <div className="pm-stat">
        <p className="pm-stat-label">PAID</p>
        <p className="pm-stat-value" style={{ color: "#34d399" }}>{paid}</p>
        <p className="pm-stat-sub">nga lista aktuale</p>
      </div>
      <div className="pm-stat">
        <p className="pm-stat-label">Overdue</p>
        <p className="pm-stat-value" style={{ color: overdueCount > 0 ? "#f87171" : "#94a3b8" }}>
          {overdueCount}
        </p>
        <p className="pm-stat-sub">pagesa me vonesë</p>
      </div>
    </div>
  );
}