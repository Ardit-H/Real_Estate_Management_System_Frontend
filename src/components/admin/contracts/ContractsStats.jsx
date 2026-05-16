// src/components/admin/contracts/ContractsStats.jsx

export default function ContractsStats({ stats }) {
  return (
    <div className="lc-stats">
      {[
        { label: "Total Contracts",    value: stats.total,    sub: "në sistem",           color: "#f5f0e8" },
        { label: "Active",             value: stats.active,   sub: "aktive tani",          color: "#34d399" },
        { label: "Pending Signature",  value: stats.pending,  sub: "në pritje firme",      color: "#fbbf24" },
        { label: "Expiring (30 days)", value: stats.expiring, sub: "skadojnë së shpejti",  color: stats.expiring > 0 ? "#f87171" : "#94a3b8" },
      ].map(s => (
        <div className="lc-stat" key={s.label}>
          <p className="lc-stat-label">{s.label}</p>
          <p className="lc-stat-value" style={{ color: s.color }}>{s.value}</p>
          <p className="lc-stat-sub">{s.sub}</p>
        </div>
      ))}
    </div>
  );
}