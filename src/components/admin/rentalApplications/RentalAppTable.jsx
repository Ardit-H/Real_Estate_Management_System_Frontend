// src/components/admin/rentalApplications/RentalAppTable.jsx

import RentalAppBadge from "./RentalAppBadge";
import { fmtPrice, fmtDate, fmtDateTime, TH, TD, btnSm } from "./rentalAppHelpers";

function Loader() {
  return (
    <div style={{ textAlign: "center", padding: "48px 0" }}>
      <div style={{ width: 26, height: 26, margin: "0 auto", border: "2px solid rgba(138,125,94,0.15)", borderTop: "2px solid #8a7d5e", borderRadius: "50%", animation: "ara-spin .8s linear infinite" }} />
    </div>
  );
}

function Empty({ text }) {
  return (
    <div style={{ textAlign: "center", padding: "52px 20px", color: "#b0a890", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ fontSize: 34, marginBottom: 12 }}>📋</div>
      <p style={{ fontSize: 14 }}>{text}</p>
    </div>
  );
}

export default function RentalAppTable({ apps, loading, listingId, statusF, onDetail, onReview }) {
  if (!listingId) return <Empty text="Shkruaj Listing ID dhe kliko Load për të parë aplikimet." />;
  if (loading)    return <Loader />;
  if (!apps.length) return <Empty text={statusF ? `Nuk ka aplikime me status ${statusF}.` : "Nuk ka aplikime për këtë listing."} />;

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 750 }}>
        <thead>
          <tr>
            {["#ID", "Client", "Status", "Income", "Move-in Date", "Reviewed By", "Reviewed At", "Created", "Actions"].map(h => (
              <th key={h} style={TH}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {apps.map(a => (
            <tr key={a.id} className="ara-row">
              <td style={{ ...TD, fontFamily: "monospace", color: "#b0a890", fontSize: 11.5 }}>{a.id}</td>
              <td style={TD}>
                <span style={{ background: "rgba(201,184,122,0.1)", color: "#c9b87a", border: "1px solid rgba(201,184,122,0.22)", padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
                  #{a.client_id}
                </span>
              </td>
              <td style={TD}><RentalAppBadge label={a.status} /></td>
              <td style={{ ...TD, fontWeight: 600 }}>{fmtPrice(a.income)}</td>
              <td style={{ ...TD, color: "#8a7d5e" }}>{fmtDate(a.move_in_date)}</td>
              <td style={{ ...TD, color: "#8a7d5e" }}>{a.reviewed_by ? `#${a.reviewed_by}` : "—"}</td>
              <td style={{ ...TD, color: "#b0a890", fontSize: 12 }}>{fmtDateTime(a.reviewed_at)}</td>
              <td style={{ ...TD, color: "#b0a890", fontSize: 12 }}>{fmtDateTime(a.created_at)}</td>
              <td style={TD}>
                <div style={{ display: "flex", gap: 5 }}>
                  <button className="ara-btn" style={btnSm("rgba(201,184,122,0.08)", "#c9b87a", "rgba(201,184,122,0.25)")} onClick={() => onDetail(a)}>Detail</button>
                  {a.status === "PENDING" && (
                    <button className="ara-btn" style={btnSm("rgba(29,158,117,0.08)", "#1D9E75", "rgba(29,158,117,0.25)")} onClick={() => onReview(a)}>Shqyrto</button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}