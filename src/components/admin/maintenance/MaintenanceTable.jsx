import { C, CAT_EMOJI, fmtMoney, fmtDate } from "./maintenanceHelpers";
import { PBadge, SBadge, Pager, Loader, Empty } from "./MaintenanceBadges";

const HEADERS = ["#","Title","Category","Priority","Status","Property","Requested By","Assigned To","Est. Cost","Created","Actions"];

export function MaintenanceTable({ items, loading, tab, propertySearch, page, totalPages, onPageChange, onManage }) {
  const tableTitle =
    tab === "all"      ? `All Requests — ${items[0]?.status ?? ""}` :
    tab === "urgent"   ? "Urgent Open Requests" :
                         "Requests for Property";

  const emptyText =
    tab === "property" && !propertySearch
      ? "Enter a property ID to search"
      : "No maintenance requests found";

  return (
    <div className="ad-card">
      {/* Card Header */}
      <div style={{
        padding: "14px 20px", borderBottom: `1px solid ${C.border}`,
        background: "#fdf9f4", display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.text, fontFamily: "'Cormorant Garamond',Georgia,serif" }}>
          {tableTitle}
        </p>
        {items.length > 0 && (
          <span style={{ background: `${C.gold}22`, color: C.textSub, padding: "2px 9px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
            {items.length}
          </span>
        )}
      </div>

      {loading ? (
        <Loader />
      ) : items.length === 0 ? (
        <Empty icon="🔧" text={emptyText} />
      ) : (
        <>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'DM Sans',sans-serif" }}>
              <thead>
                <tr style={{ background: "#f5f0e8" }}>
                  {HEADERS.map(h => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 10.5, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.7px", whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr
                    key={item.id}
                    className="ad-row"
                    style={{
                      borderBottom: i < items.length - 1 ? `1px solid ${C.border}` : "none",
                      background: item.priority === "URGENT" && item.status === "OPEN" ? "#fff9f9" : undefined,
                    }}
                  >
                    <td style={{ padding: "12px 14px", color: C.textMut, fontSize: 12 }}>{item.id}</td>
                    <td style={{ padding: "12px 14px", maxWidth: 180 }}>
                      <p style={{ margin: 0, fontWeight: 500, fontSize: 13.5, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {item.title}
                      </p>
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 13, whiteSpace: "nowrap" }}>{CAT_EMOJI[item.category]} {item.category}</td>
                    <td style={{ padding: "12px 14px" }}><PBadge p={item.priority} /></td>
                    <td style={{ padding: "12px 14px" }}><SBadge s={item.status} /></td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{ background: "#eef2ff", color: "#6366f1", padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 500 }}>
                        #{item.property_id}
                      </span>
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 12.5, color: C.textSub }}>{item.requested_by ? `#${item.requested_by}` : "—"}</td>
                    <td style={{ padding: "12px 14px", fontSize: 12.5, color: item.assigned_to ? C.textSub : C.textMut, fontStyle: item.assigned_to ? "normal" : "italic" }}>
                      {item.assigned_to ? `User #${item.assigned_to}` : "Unassigned"}
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 12.5, color: C.textSub }}>{fmtMoney(item.estimated_cost)}</td>
                    <td style={{ padding: "12px 14px", fontSize: 12, color: C.textMut, whiteSpace: "nowrap" }}>{fmtDate(item.created_at)}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <button
                        className="ad-btn"
                        onClick={() => onManage(item)}
                        style={{ padding: "5px 13px", borderRadius: 8, background: C.dark, color: "#f5f0e8", fontSize: 11.5, fontWeight: 500 }}
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pager page={page} totalPages={totalPages} onChange={onPageChange} />
        </>
      )}
    </div>
  );
}