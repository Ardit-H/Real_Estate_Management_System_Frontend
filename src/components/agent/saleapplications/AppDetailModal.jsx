import { useState, useEffect } from "react";
import { C, fmtDate, fmtDT, fmtMoney, validateRejection } from "./saleAppConstants.js";
import { StatusPill } from "./SaleAppUI.jsx";
 
export function AppDetailModal({ app, onClose, onUpdateStatus, notify, onCreateContract, currentUserId }) {
  const [rejReason,  setRejReason]  = useState(app.rejection_reason || "");
  const [showReject, setShowReject] = useState(false);
  const [saving,     setSaving]     = useState(false);
 
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
 
  const handleApprove = async () => { setSaving(true); await onUpdateStatus(app.id, "APPROVED", null); setSaving(false); };
  const handleReject  = async () => {
    if (!validateRejection(rejReason, notify)) return;
    setSaving(true); await onUpdateStatus(app.id, "REJECTED", rejReason || null); setSaving(false); setShowReject(false);
  };
  const handleCancel  = async () => { setSaving(true); await onUpdateStatus(app.id, "CANCELLED", null); setSaving(false); };
 
  const infoFields = [
    { label:"Buyer",          value:app.buyer_name || `#${app.buyer_id}`                             },
    { label:"Listing ID",     value:app.listing_id  ? `#${app.listing_id}`  : "—"                   },
    { label:"Property ID",    value:app.property_id ? `#${app.property_id}` : "—"                   },
    { label:"Agent",          value:app.agent_name || (app.agent_id ? `#${app.agent_id}` : "—")     },
    { label:"Offer Price",    value:fmtMoney(app.offer_price)                                        },
    { label:"Monthly Income", value:fmtMoney(app.monthly_income)                                     },
    { label:"Purchase Date",  value:fmtDate(app.desired_purchase_date)                               },
    { label:"Created",        value:fmtDT(app.created_at)                                            },
    { label:"Updated",        value:fmtDT(app.updated_at)                                            },
  ];
 
  const isOwner          = app.agent_id === currentUserId;
  const canApproveReject = app.status === "PENDING"  && isOwner;
  const canCancel        = (app.status === "PENDING" || app.status === "APPROVED") && isOwner;
 
  return (
    <div style={{ position:"fixed", inset:0, zIndex:1000, background:"rgba(20,16,10,0.65)", backdropFilter:"blur(6px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ width:"100%", maxWidth:580, background:C.surface, border:`1.5px solid ${C.border}`, borderRadius:18, boxShadow:"0 32px 72px rgba(0,0,0,0.38)", maxHeight:"90vh", overflowY:"auto", animation:"sa-modal-in 0.22s ease" }}>
 
        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 24px", borderBottom:`1px solid ${C.border}`, background:"#fdf9f4", position:"sticky", top:0, zIndex:1 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:`${C.gold}18`, border:`1px solid ${C.gold}28`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>🏠</div>
            <div>
              <p style={{ margin:0, fontSize:15, fontWeight:700, color:C.text, fontFamily:"'Cormorant Garamond',Georgia,serif" }}>Sale Application #{app.id}</p>
              <p style={{ margin:0, fontSize:11, color:C.muted }}>
                {app.listing_id  ? `Listing #${app.listing_id}` : ""}
                {app.property_id ? ` · Property #${app.property_id}` : ""}
              </p>
            </div>
          </div>
          <button className="sa-btn" onClick={onClose} style={{ width:30, height:30, borderRadius:8, background:"#f0ece3", border:`1px solid ${C.border}`, fontSize:16, display:"flex", alignItems:"center", justifyContent:"center", color:C.muted }}>×</button>
        </div>
 
        <div style={{ padding:"20px 24px" }}>
 
          {/* Status bar */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", background:"#f5f0e8", borderRadius:10, padding:"12px 16px", marginBottom:20 }}>
            <StatusPill status={app.status} />
            {app.updated_at && <span style={{ fontSize:11.5, color:C.muted }}>Updated: {fmtDT(app.updated_at)}</span>}
          </div>
 
          {/* Info grid */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:9, marginBottom:18 }}>
            {infoFields.map(({ label, value }) => (
              <div key={label} style={{ background:"#f5f0e8", borderRadius:9, padding:"10px 13px", border:`1px solid ${C.border}` }}>
                <p style={{ margin:0, fontSize:9.5, color:C.textMut, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.6px", marginBottom:3 }}>{label}</p>
                <p style={{ margin:0, fontSize:13, fontWeight:500, color:C.text, wordBreak:"break-all" }}>{value}</p>
              </div>
            ))}
          </div>
 
          {/* Offer highlight */}
          {app.offer_price && (
            <div style={{ background:"linear-gradient(135deg, rgba(201,184,122,0.08), rgba(201,184,122,0.04))", border:`1.5px solid ${C.gold}30`, borderRadius:12, padding:"14px 18px", marginBottom:18, display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ fontSize:22 }}>💰</span>
              <div>
                <p style={{ margin:0, fontSize:10, fontWeight:600, color:C.gold, textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:3 }}>Buyer's Offer</p>
                <p style={{ margin:0, fontSize:22, fontWeight:700, color:C.text, fontFamily:"'Cormorant Garamond',Georgia,serif", letterSpacing:"-0.3px" }}>{fmtMoney(app.offer_price)}</p>
              </div>
              {app.monthly_income && (
                <>
                  <div style={{ width:1, height:40, background:`${C.gold}25`, flexShrink:0 }} />
                  <div>
                    <p style={{ margin:0, fontSize:10, fontWeight:600, color:C.muted, textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:3 }}>Monthly Income</p>
                    <p style={{ margin:0, fontSize:22, fontWeight:700, color:C.text, fontFamily:"'Cormorant Garamond',Georgia,serif", letterSpacing:"-0.3px" }}>{fmtMoney(app.monthly_income)}</p>
                  </div>
                </>
              )}
            </div>
          )}
 
          {/* Message */}
          {app.message && (
            <div style={{ background:"#f5f0e8", border:`1px solid ${C.border}`, borderRadius:10, padding:"14px 16px", marginBottom:18 }}>
              <p style={{ margin:"0 0 7px", fontSize:9.5, color:C.textMut, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.7px" }}>Buyer's Message</p>
              <p style={{ margin:0, fontSize:13.5, color:C.textSub, lineHeight:1.65, fontStyle:"italic", fontFamily:"'Cormorant Garamond',Georgia,serif" }}>"{app.message}"</p>
            </div>
          )}
 
          {/* Rejection reason */}
          {app.rejection_reason && (
            <div style={{ background:"#fef2f2", border:"1px solid #fecaca", borderRadius:10, padding:"12px 16px", marginBottom:18, display:"flex", alignItems:"flex-start", gap:9 }}>
              <span style={{ fontSize:15, flexShrink:0 }}>✕</span>
              <p style={{ margin:0, fontSize:12.5, color:"#dc2626", lineHeight:1.55 }}>
                <strong>Rejection reason:</strong> {app.rejection_reason}
              </p>
            </div>
          )}
 
          {/* Create contract shortcut */}
          {app.status === "APPROVED" && isOwner && (
            <div style={{ marginBottom:16 }}>
              <button className="sa-btn" onClick={() => onCreateContract(app)}
                style={{ width:"100%", padding:"11px 0", background:"linear-gradient(135deg,#c9b87a,#b0983e)", color:"#1a1714", border:"none", borderRadius:10, fontSize:13, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                📄 Create Sale Contract →
              </button>
            </div>
          )}
 
          {/* Actions */}
          {(canApproveReject || canCancel) && (
            <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:18 }}>
              {!showReject ? (
                <div style={{ display:"flex", gap:9, flexWrap:"wrap" }}>
                  {canApproveReject && (
                    <>
                      <button className="sa-btn" onClick={handleApprove} disabled={saving}
                        style={{ flex:1, minWidth:130, padding:"10px 0", background:"#ecfdf5", color:"#059669", border:"1.5px solid #a7f3d0", borderRadius:10, fontSize:13, fontWeight:600, display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
                        ✓ Approve Application
                      </button>
                      <button className="sa-btn" onClick={() => setShowReject(true)} disabled={saving}
                        style={{ flex:1, minWidth:130, padding:"10px 0", background:"#fef2f2", color:"#dc2626", border:"1.5px solid #fecaca", borderRadius:10, fontSize:13, fontWeight:600, display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
                        ✕ Reject
                      </button>
                    </>
                  )}
                  {canCancel && !canApproveReject && (
                    <button className="sa-btn" onClick={handleCancel} disabled={saving}
                      style={{ padding:"10px 20px", background:"#f1f5f9", color:"#64748b", border:"1.5px solid #e2e8f0", borderRadius:10, fontSize:13, fontWeight:600 }}>
                      Cancel Application
                    </button>
                  )}
                </div>
              ) : (
                <div>
                  <p style={{ margin:"0 0 9px", fontSize:13, fontWeight:500, color:C.text }}>
                    Rejection reason <span style={{ color:C.textMut, fontWeight:400 }}>(optional, max 500 characters)</span>
                  </p>
                  <textarea className="sa-textarea" value={rejReason} onChange={e => setRejReason(e.target.value)} rows={3} placeholder="Enter reason..." maxLength={500}/>
                  <p className="sa-char-count">{rejReason.length}/500</p>
                  <div style={{ display:"flex", gap:9, marginTop:8 }}>
                    <button className="sa-btn" onClick={() => { setShowReject(false); setRejReason(""); }}
                      style={{ padding:"9px 18px", borderRadius:10, background:"#f0ece3", color:C.textSub, border:`1.5px solid ${C.border}`, fontSize:13 }}>
                      Cancel
                    </button>
                    <button className="sa-btn" onClick={handleReject} disabled={saving}
                      style={{ flex:1, padding:"9px 0", background:"#fef2f2", color:"#dc2626", border:"1.5px solid #fecaca", borderRadius:10, fontSize:13, fontWeight:600 }}>
                      Confirm Rejection
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
 
          {!isOwner && app.status === "PENDING" && (
            <div style={{ background:"#f5f2eb", border:"1px solid #e8e2d6", borderRadius:10, padding:"12px 16px", marginTop:4, display:"flex", alignItems:"center", gap:9 }}>
              <span style={{ fontSize:16 }}>👁</span>
              <p style={{ margin:0, fontSize:13, color:"#9a8c6e", lineHeight:1.5 }}>
                This application belongs to another agent's listing. You can view it but cannot take action.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
 