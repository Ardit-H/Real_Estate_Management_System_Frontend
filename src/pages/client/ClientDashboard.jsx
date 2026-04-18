import MainLayout from "../../components/layout/MainLayout";
 
const clientStats = [
  { label: "Saved Properties", value: "12", color: "#fdf4ff", iconColor: "#a855f7" },
  { label: "Active Applications", value: "2", color: "#f0f9ff", iconColor: "#0ea5e9" },
  { label: "Active Leases", value: "1", color: "#ecfdf5", iconColor: "#10b981" },
  { label: "Open Requests", value: "3", color: "#fffbeb", iconColor: "#f59e0b" },
];
 
const recommendations = [
  { id: 1, title: "2BR Apartment", address: "Rr. Nënë Tereza 14, Prishtinë", price: "€420/mo", type: "For Rent", img: null, rooms: 2, area: "78m²" },
  { id: 2, title: "Modern Studio", address: "Rr. Dardania 7, Prizren", price: "€280/mo", type: "For Rent", img: null, rooms: 1, area: "42m²" },
  { id: 3, title: "Family House", address: "Lagja Kalabria, Pejë", price: "€195,000", type: "For Sale", img: null, rooms: 4, area: "145m²" },
];
 
const myApplications = [
  { id: 1, property: "3BR House, Prizren", type: "Rental", submitted: "Apr 12", status: "Under Review", agent: "Vjosa K." },
  { id: 2, property: "2BR Apt, Prishtinë", type: "Rental", submitted: "Apr 8", status: "Approved", agent: "Argjend M." },
];
 
const appBadge = {
  "Under Review": "badge badge--amber",
  "Approved":     "badge badge--green",
  "Rejected":     "badge badge--red",
  "Pending":      "badge badge--blue",
};
 
export default function ClientDashboard() {
  return (
    <MainLayout role="client">
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, Besa</h1>
          <p className="page-subtitle">Find your perfect home</p>
        </div>
        <button className="btn btn--primary">Browse All Properties</button>
      </div>
 
      {/* Quick stats */}
      <div className="stat-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
        {clientStats.map((s) => (
          <div className="stat-card" key={s.label} style={{ padding: "16px 18px" }}>
            <div className="stat-card__icon" style={{ background: s.color, width: 36, height: 36 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={s.iconColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              </svg>
            </div>
            <div>
              <div className="stat-card__label">{s.label}</div>
              <div className="stat-card__value" style={{ fontSize: 22 }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>
 
      {/* Recommended properties */}
      <div className="card mb-6">
        <div className="card__header">
          <h2 className="card__title">Recommended for You</h2>
          <button className="btn btn--ghost btn--sm">Browse more →</button>
        </div>
        <div className="card__body">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            {recommendations.map((r) => (
              <div key={r.id} style={{
                border: "1px solid #e8edf4",
                borderRadius: 12,
                overflow: "hidden",
                transition: "box-shadow 0.15s ease",
                cursor: "pointer",
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = "0 6px 20px rgba(15,23,42,0.09)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
              >
                {/* Image placeholder */}
                <div style={{
                  height: 140,
                  background: "linear-gradient(135deg, #eef2ff 0%, #f0f9ff 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#94a3b8",
                  fontSize: 13,
                }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#c7d2fe" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                </div>
                <div style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                    <span style={{ fontWeight: 600, fontSize: 14, color: "#0f172a" }}>{r.title}</span>
                    <span className={r.type === "For Rent" ? "badge badge--purple" : "badge badge--blue"} style={{ fontSize: 10 }}>{r.type}</span>
                  </div>
                  <p style={{ fontSize: 12.5, color: "#64748b", marginBottom: 10 }}>{r.address}</p>
                  <div style={{ display: "flex", gap: 12, fontSize: 12, color: "#94a3b8", marginBottom: 12 }}>
                    <span>🛏 {r.rooms} rooms</span>
                    <span>📐 {r.area}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: 600, fontSize: 16, color: "#6366f1" }}>{r.price}</span>
                    <button className="btn btn--primary btn--sm">View</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
 
      {/* My applications */}
      <div className="card">
        <div className="card__header">
          <h2 className="card__title">My Applications</h2>
          <button className="btn btn--ghost btn--sm">View all →</button>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Type</th>
                <th>Submitted</th>
                <th>Status</th>
                <th>Agent</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {myApplications.map((a) => (
                <tr key={a.id}>
                  <td style={{ fontWeight: 500 }}>{a.property}</td>
                  <td className="text-muted">{a.type}</td>
                  <td className="text-muted">{a.submitted}</td>
                  <td><span className={appBadge[a.status] || "badge badge--gray"}>{a.status}</span></td>
                  <td className="text-muted">{a.agent}</td>
                  <td><button className="btn btn--ghost btn--sm">Details</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}
 