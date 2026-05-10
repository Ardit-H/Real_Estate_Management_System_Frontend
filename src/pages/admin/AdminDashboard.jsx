import MainLayout from "../../components/layout/Layout";
import { useDashboardStats } from "../../hooks/usePropertyCache";

const statusBadge = {
  "For Sale":  "badge badge--blue",
  "For Rent":  "badge badge--purple",
  "Rented":    "badge badge--green",
  "Sold":      "badge badge--gray",
  "Pending":   "badge badge--amber",
};

const recentProperties = [
  { id: 1, address: "Rr. Nënë Tereza 14, Prishtinë", type: "Apartment", status: "For Sale", price: "€145,000", agent: "Argjend M." },
  { id: 2, address: "Rr. Dardania 5, Prizren",        type: "House",     status: "For Rent", price: "€450/mo",  agent: "Vjosa K."   },
  { id: 3, address: "Rr. Adem Jashari 22, Mitrovicë", type: "Commercial",status: "For Sale", price: "€380,000", agent: "Blerim S."  },
  { id: 4, address: "Rr. Skënderbeu 8, Pejë",         type: "Apartment", status: "Rented",   price: "€320/mo",  agent: "Argjend M." },
  { id: 5, address: "Rr. UÇK 3, Gjakovë",             type: "Land",      status: "For Sale", price: "€95,000",  agent: "Zana B."    },
];

export default function AdminDashboard() {
  const { data: apiStats, isLoading } = useDashboardStats();

  const stats = apiStats ? [
    {
      label: "Total Properties",
      value: String(
        (apiStats.available_properties ?? 0) +
        (apiStats.sold_properties      ?? 0) +
        (apiStats.rented_properties    ?? 0)
      ),
      delta: "+live", up: true,
      color: "#eef2ff", iconColor: "#6366f1",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="#6366f1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      ),
    },
    {
      label: "Active Leases",
      value: String(apiStats.active_leases ?? 0),
      delta: "live", up: true,
      color: "#f0f9ff", iconColor: "#0ea5e9",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="#0ea5e9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="7.5" cy="15.5" r="5.5"/>
          <path d="M21 2 10.58 12.42M13 7l3 3M18 2l3 3-6 6-3-3"/>
        </svg>
      ),
    },
    {
      label: "Overdue Payments",
      value: String(apiStats.overdue_payments ?? 0),
      delta: (apiStats.overdue_payments ?? 0) > 0 ? "⚠️" : "✓",
      up:    (apiStats.overdue_payments ?? 0) === 0,
      color: (apiStats.overdue_payments ?? 0) > 0 ? "#fef2f2" : "#ecfdf5",
      iconColor: (apiStats.overdue_payments ?? 0) > 0 ? "#ef4444" : "#10b981",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke={(apiStats.overdue_payments ?? 0) > 0 ? "#ef4444" : "#10b981"}
          strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23"/>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
      ),
    },
    {
      label: "Total Revenue",
      value: `€${Number(apiStats.total_revenue ?? 0).toLocaleString("de-DE")}`,
      delta: "PAID", up: true,
      color: "#ecfdf5", iconColor: "#10b981",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
          <polyline points="17 6 23 6 23 12"/>
        </svg>
      ),
    },
    {
      label: "Open Leads",
      value: String(apiStats.pending_leads ?? 0),
      delta: "NEW", up: true,
      color: "#fffbeb", iconColor: "#f59e0b",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <circle cx="12" cy="12" r="6"/>
          <circle cx="12" cy="12" r="2"/>
        </svg>
      ),
    },
  ] : [];

  if (isLoading) {
    return (
      <MainLayout role="admin">
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div style={{
            width: 32, height: 32, margin: "0 auto",
            border: "3px solid #e8edf4", borderTop: "3px solid #6366f1",
            borderRadius: "50%", animation: "spin 0.7s linear infinite",
          }} />
          <p style={{ color: "#94a3b8", marginTop: 12, fontSize: 13 }}>
            Duke ngarkuar dashboard...
          </p>
        </div>
      </MainLayout>
    );
  }

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
                  <td>
                    <span className={statusBadge[p.status] || "badge badge--gray"}>
                      {p.status}
                    </span>
                  </td>
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