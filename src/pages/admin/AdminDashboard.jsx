import MainLayout from "../../components/layout/MainLayout";
 
const stats = [
  {
    label: "Total Properties",
    value: "248",
    delta: "+12%",
    up: true,
    color: "#eef2ff",
    iconColor: "#6366f1",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    label: "Active Rentals",
    value: "143",
    delta: "+8%",
    up: true,
    color: "#f0f9ff",
    iconColor: "#0ea5e9",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="7.5" cy="15.5" r="5.5"/><path d="M21 2 10.58 12.42M13 7l3 3M18 2l3 3-6 6-3-3"/>
      </svg>
    ),
  },
  {
    label: "Sales This Month",
    value: "34",
    delta: "-3%",
    up: false,
    color: "#fff7ed",
    iconColor: "#f97316",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
  },
  {
    label: "Revenue",
    value: "€84.2k",
    delta: "+21%",
    up: true,
    color: "#ecfdf5",
    iconColor: "#10b981",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
      </svg>
    ),
  },
  {
    label: "Active Agents",
    value: "18",
    delta: "+2",
    up: true,
    color: "#fdf4ff",
    iconColor: "#a855f7",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    label: "Open Leads",
    value: "61",
    delta: "+14%",
    up: true,
    color: "#fffbeb",
    iconColor: "#f59e0b",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
      </svg>
    ),
  },
];
 
const recentProperties = [
  { id: 1, address: "Rr. Nënë Tereza 14, Prishtinë", type: "Apartment", status: "For Sale", price: "€145,000", agent: "Argjend M." },
  { id: 2, address: "Rr. Dardania 5, Prizren", type: "House", status: "For Rent", price: "€450/mo", agent: "Vjosa K." },
  { id: 3, address: "Rr. Adem Jashari 22, Mitrovicë", type: "Commercial", status: "For Sale", price: "€380,000", agent: "Blerim S." },
  { id: 4, address: "Rr. Skënderbeu 8, Pejë", type: "Apartment", status: "Rented", price: "€320/mo", agent: "Argjend M." },
  { id: 5, address: "Rr. UÇK 3, Gjakovë", type: "Land", status: "For Sale", price: "€95,000", agent: "Zana B." },
];
 
const statusBadge = {
  "For Sale":  "badge badge--blue",
  "For Rent":  "badge badge--purple",
  "Rented":    "badge badge--green",
  "Sold":      "badge badge--gray",
  "Pending":   "badge badge--amber",
};
 
export default function AdminDashboard() {
  return (
    <MainLayout role="admin">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back — here's what's happening today.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn--secondary btn--sm">Export Report</button>
          <button className="btn btn--primary btn--sm">+ Add Property</button>
        </div>
      </div>
 
      {/* Stats */}
      <div className="stat-grid">
        {stats.map((s) => (
          <div className="stat-card" key={s.label}>
            <div className="flex items-center justify-between">
              <div className="stat-card__icon" style={{ background: s.color }}>
                {s.icon}
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
 
      {/* Recent Properties Table */}
      <div className="card">
        <div className="card__header">
          <h2 className="card__title">Recent Properties</h2>
          <button className="btn btn--ghost btn--sm">View all →</button>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Address</th>
                <th>Type</th>
                <th>Status</th>
                <th>Price</th>
                <th>Agent</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentProperties.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 500 }}>{p.address}</td>
                  <td className="text-muted">{p.type}</td>
                  <td><span className={statusBadge[p.status] || "badge badge--gray"}>{p.status}</span></td>
                  <td style={{ fontWeight: 500 }}>{p.price}</td>
                  <td className="text-muted">{p.agent}</td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn--ghost btn--sm">View</button>
                      <button className="btn btn--secondary btn--sm">Edit</button>
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