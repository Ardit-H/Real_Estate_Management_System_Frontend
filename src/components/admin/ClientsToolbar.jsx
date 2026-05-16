// src/components/admin/ClientsToolbar.jsx

export default function ClientsToolbar({ search, setSearch, filterActive, setFilterActive, count }) {
  return (
    <div className="ac-toolbar">
      <div className="ac-search">
        <span className="ac-search-icon">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email or city..."
        />
      </div>
      <button
        className={`ac-filter-btn ${filterActive === true ? "active" : ""}`}
        onClick={() => setFilterActive(p => p === true ? null : true)}
      >
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399", display: "inline-block" }} /> Active
      </button>
      <button
        className={`ac-filter-btn ${filterActive === false ? "active" : ""}`}
        onClick={() => setFilterActive(p => p === false ? null : false)}
      >
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f87171", display: "inline-block" }} /> Inactive
      </button>
      <span className="ac-count">{count} client{count !== 1 ? "s" : ""}</span>
    </div>
  );
}