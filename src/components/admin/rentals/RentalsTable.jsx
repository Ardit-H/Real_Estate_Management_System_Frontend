// src/components/admin/rentals/RentalsTable.jsx

import RentalsBadge from "./RentalsBadge";
import { fmtPrice, fmtDate, TH, TD, btnSm, pillGold } from "./rentalsHelpers";

function Loader() {
  return (
    <div style={{ textAlign: "center", padding: "48px 0" }}>
      <div style={{ width: 26, height: 26, margin: "0 auto", border: "2px solid rgba(138,125,94,0.15)", borderTop: "2px solid #8a7d5e", borderRadius: "50%", animation: "ar-spin .8s linear infinite" }} />
    </div>
  );
}

function Empty({ text }) {
  return (
    <div style={{ textAlign: "center", padding: "52px 20px", color: "#b0a890", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ fontSize: 34, marginBottom: 12 }}>🏠</div>
      <p style={{ fontSize: 14 }}>{text}</p>
    </div>
  );
}

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const pgBtn = (disabled) => ({
    fontSize: 13, padding: "5px 12px", borderRadius: 9,
    border: "1.5px solid rgba(138,125,94,0.2)", background: "transparent",
    color: disabled ? "rgba(138,125,94,0.3)" : "#8a7d5e",
    cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.5 : 1,
    fontFamily: "'DM Sans', sans-serif",
  });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end", padding: "14px 16px 8px" }}>
      <button disabled={page === 0} onClick={() => onChange(page - 1)} className="ar-pg" style={pgBtn(page === 0)}>← Prev</button>
      <span style={{ fontSize: 13, color: "#8a7d5e", padding: "0 6px", fontFamily: "'DM Sans', sans-serif" }}>{page + 1} / {totalPages}</span>
      <button disabled={page >= totalPages - 1} onClick={() => onChange(page + 1)} className="ar-pg" style={pgBtn(page >= totalPages - 1)}>Next →</button>
    </div>
  );
}

export default function RentalsTable({ rows, loading, search, page, totalPages, onPage, onDetail, onEdit, onDelete }) {
  if (loading) return <Loader />;
  if (rows.length === 0) return <Empty text={search ? "Nuk u gjet asnjë listing." : "Nuk ka rental listings."} />;

  return (
    <>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 850 }}>
          <thead>
            <tr>
              {["#ID", "Property", "Agent", "Title", "Price / Period", "Deposit", "Available", "Status", "Created", "Actions"].map(h => (
                <th key={h} style={TH}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(l => (
              <tr key={l.id} className="ar-row">
                <td style={{ ...TD, fontFamily: "monospace", color: "#b0a890", fontSize: 11.5 }}>{l.id}</td>
                <td style={TD}><span style={pillGold}>#{l.property_id}</span></td>
                <td style={{ ...TD, color: "#8a7d5e" }}>{l.agent_id ? `#${l.agent_id}` : "—"}</td>
                <td style={{ ...TD, maxWidth: 160 }} title={l.title || ""}>{l.title || <span style={{ color: "#b0a890" }}>—</span>}</td>
                <td style={{ ...TD, fontWeight: 600 }}>
                  {fmtPrice(l.price, l.currency)}
                  <span style={{ fontSize: 11, color: "#b0a890", fontWeight: 400, marginLeft: 4 }}>/ {l.price_period || "MONTHLY"}</span>
                </td>
                <td style={TD}>{fmtPrice(l.deposit, l.currency)}</td>
                <td style={{ ...TD, color: "#8a7d5e", fontSize: 12 }}>
                  {l.available_from || l.available_until
                    ? `${fmtDate(l.available_from)} → ${fmtDate(l.available_until)}`
                    : "—"}
                </td>
                <td style={TD}><RentalsBadge label={l.status} /></td>
                <td style={{ ...TD, color: "#b0a890", fontSize: 12 }}>{fmtDate(l.created_at)}</td>
                <td style={TD}>
                  <div style={{ display: "flex", gap: 5 }}>
                    <button className="ar-btn" style={btnSm("rgba(201,184,122,0.08)", "#c9b87a", "rgba(201,184,122,0.25)")} onClick={() => onDetail(l)}>Detail</button>
                    <button className="ar-btn" style={btnSm("rgba(29,158,117,0.08)", "#1D9E75", "rgba(29,158,117,0.25)")} onClick={() => onEdit(l)}>Edit</button>
                    <button className="ar-btn" style={btnSm("rgba(216,90,48,0.08)", "#D85A30", "rgba(216,90,48,0.25)")} onClick={() => onDelete(l.id)}>Del</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={totalPages} onChange={onPage} />
    </>
  );
}