// src/components/admin/payments/PaymentStatusBadge.jsx

export default function PaymentStatusBadge({ status }) {
  const s = status || "PENDING";
  return (
    <span className={`pm-badge pm-badge-${s}`}>
      <span className="pm-badge-dot" />
      {s}
    </span>
  );
}