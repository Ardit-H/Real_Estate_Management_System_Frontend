import MainLayout from "../../components/layout/Layout";
 
const myStats = [
  { label: "My Listings", value: "23", delta: "+3", up: true, color: "#eef2ff", iconColor: "#6366f1" },
  { label: "Active Leads", value: "14", delta: "+5", up: true, color: "#f0f9ff", iconColor: "#0ea5e9" },
  { label: "Closings This Month", value: "4", delta: "+1", up: true, color: "#ecfdf5", iconColor: "#10b981" },
  { label: "Commissions", value: "€8,400", delta: "+18%", up: true, color: "#fffbeb", iconColor: "#f59e0b" },
];
 
const myLeads = [
  { id: 1, name: "Besa Gashi", type: "Buyer", property: "Apartment in Prishtinë", status: "New", date: "Today" },
  { id: 2, name: "Muhamet Krasniqi", type: "Tenant", property: "House in Prizren", status: "In Progress", date: "Yesterday" },
  { id: 3, name: "Adelina Berisha", type: "Buyer", property: "Villa in Pejë", status: "Hot", date: "2 days ago" },
  { id: 4, name: "Faton Osmani", type: "Seller", property: "Commercial, Mitrovicë", status: "Follow-up", date: "3 days ago" },
];
 
const leadBadge = {
  "New":         "badge badge--blue",
  "In Progress": "badge badge--purple",
  "Hot":         "badge badge--red",
  "Follow-up":   "badge badge--amber",
  "Closed":      "badge badge--green",
};
 
export default function AgentDashboard() {
  return (
    <MainLayout role="agent">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Dashboard</h1>
          <p className="page-subtitle">Your performance overview for April 2026</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn--secondary btn--sm">My Schedule</button>
          <button className="btn btn--primary btn--sm">+ New Listing</button>
        </div>
      </div>
 
      <div className="stat-grid">
        {myStats.map((s) => (
          <div className="stat-card" key={s.label}>
            <div className="flex items-center justify-between">
              <div className="stat-card__icon" style={{ background: s.color }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={s.iconColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
                </svg>
              </div>
              <span className={`stat-card__delta ${s.up ? "stat-card__delta--up" : "stat-card__delta--down"}`}>
                {s.delta}
              </span>
            </div>
            <div>
              <div className="stat-card__label">{s.label}</div>
              <div className="stat-card__value">{s.value}</div>
            </div>
          </div>
        ))}
      </div>
 
      <div className="card">
        <div className="card__header">
          <h2 className="card__title">My Leads</h2>
          <button className="btn btn--primary btn--sm">+ Add Lead</button>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Type</th>
                <th>Interested In</th>
                <th>Status</th>
                <th>Last Contact</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {myLeads.map((l) => (
                <tr key={l.id}>
                  <td style={{ fontWeight: 500 }}>{l.name}</td>
                  <td className="text-muted">{l.type}</td>
                  <td className="text-muted">{l.property}</td>
                  <td><span className={leadBadge[l.status] || "badge badge--gray"}>{l.status}</span></td>
                  <td className="text-muted">{l.date}</td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn--ghost btn--sm">View</button>
                      <button className="btn btn--primary btn--sm">Contact</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}
 