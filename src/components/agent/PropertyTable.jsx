import { STATUS_CONFIG, TYPE_ICONS, fmtPrice } from "../../constants/propertyConstants";
import PropImage from "./PropImage";

export default function PropertyTable({ properties, page, totalPages, onPageChange, onAction, loading, error, onRetry }) {

  if (loading) return (
    <div style={{ padding:"48px 24px", textAlign:"center", color:"var(--text-muted)" }}>
      <div style={{ fontSize:32, marginBottom:12 }}>⏳</div>
      Loading properties…
    </div>
  );

  if (error) return (
    <div style={{ padding:"48px 24px", textAlign:"center" }}>
      <div style={{ fontSize:32, marginBottom:12 }}>⚠️</div>
      <div style={{ color:"var(--text-secondary)" }}>{error}</div>
      <button className="btn btn--secondary btn--sm" style={{ marginTop:16 }} onClick={onRetry}>Retry</button>
    </div>
  );

  if (properties.length === 0) return (
    <div style={{ padding:"60px 24px", textAlign:"center" }}>
      <div style={{ fontSize:48, marginBottom:16 }}>🏡</div>
      <div style={{ fontWeight:600, marginBottom:6 }}>No properties yet</div>
      <div className="text-muted" style={{ marginBottom:20 }}>Start by adding your first listing</div>
      <button className="btn btn--primary" onClick={() => onAction("create", null)}>+ Add Property</button>
    </div>
  );

  return (
    <>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
               <th>Id</th><th>Property</th><th>Type</th><th>Price</th>
              <th>Status</th><th>Views</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {properties.map(p => {
              const sc = STATUS_CONFIG[p.status] || STATUS_CONFIG.INACTIVE;
              return (
                <tr key={p.id}>
                   <td><span style={{ fontSize:13 }}>{TYPE_ICONS[p.type]||"🏠"} {p.id}</span></td>
                  <td>
                    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                      <PropImage src={p.primaryImage || p.primary_image} title={p.title} />
                      <div style={{ minWidth:0 }}>
                        <div style={{ fontWeight:500, fontSize:13.5, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", maxWidth:200 }}>{p.title}</div>
                        {p.city && <div style={{ fontSize:12, color:"var(--text-muted)", marginTop:2 }}>📍 {p.city}</div>}
                      </div>
                    </div>
                  </td>
                  <td><span style={{ fontSize:13 }}>{TYPE_ICONS[p.type]||"🏠"} {p.type}</span></td>
                 
                  <td><span style={{ fontWeight:600, fontFamily:"var(--font-mono)", fontSize:13 }}>{fmtPrice(p.price, p.currency)}</span></td>
                  <td><span className={`badge ${sc.cls}`}>{sc.label}</span></td>
                  <td><span style={{ fontSize:13, color:"var(--text-secondary)" }}>👁 {p.view_count||0}</span></td>
                  <td>
                    <div style={{ display:"flex", gap:6 }}>
                      <button className="btn btn--secondary btn--sm" title="Images"       onClick={() => onAction("images",  p)}>🖼️</button>
                      <button className="btn btn--secondary btn--sm" title="Edit"         onClick={() => onAction("edit",    p)}>✏️</button>
                      <button className="btn btn--secondary btn--sm" title="Status"       onClick={() => onAction("status",  p)}>🔄</button>
                      <button className="btn btn--secondary btn--sm" title="Price History" onClick={() => onAction("history", p)}>📈</button>
                      <button className="btn btn--danger btn--sm"    title="Delete"        onClick={() => onAction("delete",  p)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ padding:"14px 22px", borderTop:"1px solid var(--border-light)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span style={{ fontSize:12.5, color:"var(--text-muted)" }}>Page {page+1} of {totalPages}</span>
          <div style={{ display:"flex", gap:6 }}>
            <button className="btn btn--secondary btn--sm" disabled={page===0}             onClick={() => onPageChange(page-1)}>← Prev</button>
            <button className="btn btn--secondary btn--sm" disabled={page>=totalPages-1}   onClick={() => onPageChange(page+1)}>Next →</button>
          </div>
        </div>
      )}
    </>
  );
}
