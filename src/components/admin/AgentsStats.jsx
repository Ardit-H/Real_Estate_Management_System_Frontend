

export default function AgentsStats({ stats }) {
  return (
    <div className="aa-stats">
      {[
        { label: "Total Agents",  value: stats.total,     sub: "registered",      color: "#f5f0e8" },
        { label: "Active",        value: stats.active,    sub: "currently active", color: "#34d399" },
        { label: "Inactive",      value: stats.inactive,  sub: "deactivated",     color: "#f87171" },
        { label: "Avg Rating",    value: stats.avgRating, sub: "across all",      color: "#c9b87a" },
      ].map(s => (
        <div className="aa-stat" key={s.label}>
          <p className="aa-stat-label">{s.label}</p>
          <p className="aa-stat-value" style={{ color: s.color }}>{s.value}</p>
          <p className="aa-stat-sub">{s.sub}</p>
        </div>
      ))}
    </div>
  );
}