import { C, STATUSES, PRIORITIES } from "./maintenanceHelpers";

const TABS = [
  { id: "all",      label: "All Requests", icon: "📋" },
  { id: "urgent",   label: "Urgent",       icon: "🚨" },
  { id: "property", label: "By Property",  icon: "🏠" },
];

export function MaintenanceToolbar({
  tab, onTabChange,
  statusFilter, onStatusChange,
  priorityFilter, onPriorityChange,
  propertySearch, onPropertySearchChange,
  onPropertySearch,
  urgentCount,
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
      {/* Tabs */}
      <div style={{ display: "flex", gap: 2, borderBottom: `1px solid ${C.border}` }}>
        {TABS.map(t => (
          <button
            key={t.id}
            className="ad-btn"
            onClick={() => onTabChange(t.id)}
            style={{
              padding: "9px 16px", background: "none",
              color: tab === t.id ? C.dark : C.muted,
              fontWeight: tab === t.id ? 600 : 400,
              fontSize: 13.5,
              borderBottom: tab === t.id ? `2px solid ${C.gold}` : "2px solid transparent",
              marginBottom: -1,
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            {t.icon} {t.label}
            {t.id === "urgent" && urgentCount > 0 && (
              <span style={{
                background: "#dc2626", color: "#fff", borderRadius: "50%",
                width: 18, height: 18, fontSize: 10,
                display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700,
              }}>
                {urgentCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        {tab === "all" && (
          <select
            className="ad-in"
            value={statusFilter}
            onChange={e => onStatusChange(e.target.value)}
            style={{ width: 150, height: 36, padding: "0 10px", fontSize: 13 }}
          >
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        )}

        {tab === "property" && (
          <div style={{ display: "flex", gap: 6 }}>
            <input
              className="ad-in"
              type="number"
              placeholder="Property ID..."
              value={propertySearch}
              onChange={e => onPropertySearchChange(e.target.value)}
              style={{ width: 160, height: 36, padding: "0 10px", fontSize: 13 }}
            />
            <button
              className="ad-btn"
              onClick={onPropertySearch}
              style={{ padding: "0 14px", height: 36, borderRadius: 9, background: C.dark, color: "#f5f0e8", fontSize: 13 }}
            >
              Search
            </button>
          </div>
        )}

        <select
          className="ad-in"
          value={priorityFilter}
          onChange={e => onPriorityChange(e.target.value)}
          style={{ width: 140, height: 36, padding: "0 10px", fontSize: 13 }}
        >
          <option value="">All Priorities</option>
          {PRIORITIES.map(p => <option key={p}>{p}</option>)}
        </select>
      </div>
    </div>
  );
}