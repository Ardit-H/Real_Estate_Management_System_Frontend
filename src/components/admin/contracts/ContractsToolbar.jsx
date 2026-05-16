// src/components/admin/contracts/ContractsToolbar.jsx

export default function ContractsToolbar({ search, setSearch, statusFilter, setStatusFilter, setPage, count, onNew }) {
  return (
    <div className="lc-toolbar">
      <div className="lc-search">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(245,240,232,0.25)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Kërko sipas ID, pronës, klientit..."
        />
      </div>
      <select className="lc-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(0); }}>
        <option value="ALL">Të gjitha statuset</option>
        <option value="ACTIVE">Active</option>
        <option value="PENDING_SIGNATURE">Pending Signature</option>
        <option value="ENDED">Ended</option>
        <option value="CANCELLED">Cancelled</option>
      </select>
      <span className="lc-count">{count} kontrata</span>
      <button className="lc-btn-add" onClick={onNew}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        New Contract
      </button>
    </div>
  );
}