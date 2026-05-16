// src/components/admin/payments/PaymentsTabs.jsx

const TABS = [
  { id: "status",   label: "By Status",   icon: "🔍" },
  { id: "contract", label: "By Contract", icon: "📋" },
  { id: "overdue",  label: "Overdue",     icon: "🔴", red: true },
];

export default function PaymentsTabs({ tab, setTab, setPage, setPayments, setSummary, overdueCount }) {
  return (
    <div className="pm-tabs">
      {TABS.map(t => (
        <button
          key={t.id}
          className={`pm-tab ${tab === t.id ? "active" : ""}`}
          onClick={() => { setTab(t.id); setPage(0); setPayments([]); setSummary(null); }}
        >
          {t.icon} {t.label}
          {t.id === "overdue" && overdueCount > 0 && (
            <span className="pm-tab-badge red">{overdueCount}</span>
          )}
        </button>
      ))}
    </div>
  );
}