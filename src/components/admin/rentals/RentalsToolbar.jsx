// src/components/admin/rentals/RentalsToolbar.jsx

import { RENTAL_STATUSES, selectSt } from "./rentalsHelpers";

export default function RentalsToolbar({ search, setSearch, statusF, setStatusF, setPage, onNew, total }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid rgba(138,125,94,0.12)", flexWrap: "wrap", gap: 10 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(138,125,94,0.05)", border: "1px solid rgba(138,125,94,0.15)", borderRadius: 9, padding: "6px 11px", minWidth: 220 }}>
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#b0a890" strokeWidth={2}>
            <circle cx={11} cy={11} r={8}/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text" value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Kërko ID, title, property..."
            style={{ border: "none", background: "transparent", outline: "none", fontSize: 13, color: "#1a1714", width: "100%", fontFamily: "'DM Sans', sans-serif" }}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 15, color: "#b0a890", padding: 0 }}>×</button>
          )}
        </div>
        <select
          value={statusF}
          onChange={e => { setStatusF(e.target.value); setPage(0); }}
          style={{ ...selectSt, width: 150, height: 36, padding: "0 10px" }}
        >
          <option value="">All statuses</option>
          {RENTAL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
    </div>
  );
}