import { C, fmtDate, fmtDT, fmtMoney } from "./saleAppConstants.js";
import { Skeleton, EmptyState, StatusPill } from "./SaleAppUI.jsx";
 
export function ApplicationsTable({ applications, loading, onOpenApp, onQuickApprove, onQuickReject, onCreateContract, currentUserId, emptyTitle, emptySub }) {
  if (loading) return <Skeleton rows={5} h={58} />;
  if (applications.length === 0) return <EmptyState icon="🏠" title={emptyTitle} sub={emptySub} />;
 
  return (
    <div className="sa-table-wrap">
      <table className="sa-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Buyer</th>
            <th>Ownership</th>
            <th>Listing</th>
            <th>Property</th>
            <th>Offer</th>
            <th>Income</th>
            <th>Purchase Date</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app, i) => (
            <tr key={app.id} className="sa-row" style={{ transition:"background 0.15s", animationDelay:`${i * 0.04}s` }}>
              <td style={{ color:C.textMut, fontSize:12 }}>{app.id}</td>
              <td style={{ fontWeight:500 }}>{app.buyer_name || `#${app.buyer_id}`}</td>
              <td>
                {app.agent_id === currentUserId
                  ? <span style={{ background:"rgba(201,184,122,0.12)", color:"#8a7230", border:"1px solid rgba(201,184,122,0.3)", padding:"2px 10px", borderRadius:999, fontSize:11, fontWeight:600 }}>👤 Me</span>
                  : <span style={{ background:"#f0ece3", color:"#b0a890", border:"1px solid #e4ddd0", padding:"2px 10px", borderRadius:999, fontSize:11, fontWeight:500 }}>👁 View only</span>
                }
              </td>
              <td style={{ fontSize:12.5, color:C.textSub }}>{app.listing_id ? `#${app.listing_id}` : "—"}</td>
              <td style={{ fontSize:12.5, color:C.textSub }}>{app.property_id ? `#${app.property_id}` : "—"}</td>
              <td style={{ fontWeight:600, color:C.text, fontSize:13 }}>{fmtMoney(app.offer_price)}</td>
              <td style={{ fontSize:12.5, color:C.textSub }}>{fmtMoney(app.monthly_income)}</td>
              <td style={{ fontSize:12, color:C.textMut }}>{fmtDate(app.desired_purchase_date)}</td>
              <td><StatusPill status={app.status} /></td>
              <td style={{ fontSize:12, color:C.textMut }}>{fmtDT(app.created_at)}</td>
              <td>
                <div style={{ display:"flex", gap:5, alignItems:"center" }}>
                  <button className="sa-btn" onClick={() => onOpenApp(app)}
                    style={{ padding:"5px 11px", borderRadius:8, background:"#f0ece3", color:C.textSub, border:`1px solid ${C.border}`, fontSize:11.5, fontWeight:500 }}>
                    View
                  </button>
                  {app.agent_id === currentUserId ? (
                    <>
                      {app.status === "PENDING" && (
                        <>
                          <button className="sa-btn" onClick={() => onQuickApprove(app.id)} title="Approve"
                            style={{ width:30, height:30, borderRadius:8, background:"#ecfdf5", color:"#059669", border:"1px solid #a7f3d0", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13 }}>✓</button>
                          <button className="sa-btn" onClick={() => onQuickReject(app)} title="Reject"
                            style={{ width:30, height:30, borderRadius:8, background:"#fef2f2", color:"#dc2626", border:"1px solid #fecaca", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13 }}>✕</button>
                        </>
                      )}
                      {app.status === "APPROVED" && (
                        <button className="sa-btn" onClick={() => onCreateContract(app)} title="Create contract"
                          style={{ padding:"5px 10px", borderRadius:8, fontSize:11.5, fontWeight:700, background:"linear-gradient(135deg,#c9b87a,#b0983e)", color:"#1a1714", border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                          📄 Contract
                        </button>
                      )}
                    </>
                  ) : (
                    <span style={{ fontSize:11, color:"#b0a890", fontStyle:"italic", background:"#f5f2eb", padding:"3px 9px", borderRadius:999, border:"1px solid #e8e2d6" }}>
                      view only
                    </span>
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
 