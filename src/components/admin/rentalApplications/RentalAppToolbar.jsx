// src/components/admin/rentalApplications/RentalAppToolbar.jsx

import { APP_STATUSES, primaryBtn, secondaryBtn } from "./rentalAppHelpers";

export default function RentalAppToolbar({ inputId, setInputId, onLoad, listingId, onOpenModal, statusF, setStatusF }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 20px", borderBottom: "1px solid rgba(138,125,94,0.12)", flexWrap: "wrap" }}>
      <label style={{ fontSize: 13, color: "#8a7d5e", whiteSpace: "nowrap", fontFamily: "'DM Sans', sans-serif" }}>
        Listing ID:
      </label>
      <input
        type="number"
        value={inputId}
        onChange={e => setInputId(e.target.value)}
        onKeyDown={e => e.key === "Enter" && onLoad()}
        placeholder="ex: 5"
        style={{ width: 110, padding: "7px 11px", fontSize: 13, border: "1.5px solid rgba(138,125,94,0.25)", borderRadius: 9, background: "#fff", color: "#1a1714", outline: "none", fontFamily: "'DM Sans', sans-serif" }}
      />
      <button onClick={onLoad} style={secondaryBtn}>Load</button>
      {listingId && (
        <button onClick={onOpenModal} style={primaryBtn}>Shiko si modal →</button>
      )}
      <div style={{ marginLeft: "auto" }}>
        <select
          value={statusF}
          onChange={e => setStatusF(e.target.value)}
          style={{ padding: "7px 10px", fontSize: 13, border: "1.5px solid rgba(138,125,94,0.25)", borderRadius: 9, background: "#fff", color: "#1a1714", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", outline: "none" }}
        >
          <option value="">All statuses</option>
          {APP_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
    </div>
  );
}