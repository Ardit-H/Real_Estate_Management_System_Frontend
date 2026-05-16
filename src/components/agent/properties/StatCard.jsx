export default function StatCard({ icon, label, value, color }) {
  return (
    <div className="stat-card">
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div className="stat-card__icon" style={{ background: color + "18" }}>
          <span style={{ fontSize:18 }}>{icon}</span>
        </div>
      </div>
      <div>
        <div className="stat-card__label">{label}</div>
        <div className="stat-card__value">{value ?? "—"}</div>
      </div>
    </div>
  );
}
