// src/components/admin/ClientsStats.jsx

export default function ClientsStats({ stats }) {
  return (
    <div className="ac-stats">
      {[
        { label: "Total Clients",  value: stats.total,       sub: "registered",         color: "#f5f0e8" },
        { label: "Active",         value: stats.active,      sub: "currently active",   color: "#34d399" },
        { label: "Inactive",       value: stats.inactive,    sub: "deactivated",        color: "#f87171" },
        { label: "With Profile",   value: stats.withProfile, sub: "completed profiles", color: "#c9b87a" },
      ].map(s => (
        <div className="ac-stat" key={s.label}>
          <p className="ac-stat-label">{s.label}</p>
          <p className="ac-stat-value" style={{ color: s.color }}>{s.value}</p>
          <p className="ac-stat-sub">{s.sub}</p>
        </div>
      ))}
    </div>
  );
}