import { useState, useEffect, useCallback } from "react";
import MainLayout from "../../components/layout/Layout";
import api from "../../api/axios";

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_CFG = {
  PENDING:   { dot:"#c9b87a", bg:"rgba(201,184,122,0.12)", border:"rgba(201,184,122,0.28)", color:"#9a7a30", label:"Pending"   },
  APPROVED:  { dot:"#7eb8a4", bg:"rgba(126,184,164,0.12)", border:"rgba(126,184,164,0.28)", color:"#2a6049", label:"Approved"  },
  REJECTED:  { dot:"#d4855a", bg:"rgba(212,133,90,0.12)",  border:"rgba(212,133,90,0.28)",  color:"#8b4513", label:"Rejected"  },
  CANCELLED: { dot:"#a0997e", bg:"rgba(160,153,126,0.1)",  border:"rgba(160,153,126,0.22)", color:"#6b6248", label:"Cancelled" },
};

const fmtDate  = (d) => d ? new Date(d).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : "—";
const fmtDT    = (d) => d ? new Date(d).toLocaleString("en-GB",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}) : "—";
const fmtMoney = (v) => v != null ? `€${Number(v).toLocaleString("de-DE")}` : "—";

function validateListingId(listingId, notify) {
  if (!listingId || listingId.toString().trim() === "") {
    notify("Please enter a Listing ID","error"); return false;
  }
  if (isNaN(Number(listingId)) || Number(listingId) <= 0) {
    notify("Listing ID must be a positive number","error"); return false;
  }
  return true;
}

function validateRejectionReason(reason, notify) {
  if (reason && reason.length > 500) {
    notify("Rejection reason cannot exceed 500 characters","error"); return false;
  }
  return true;
}

// ─── Global CSS ───────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

  .ara * { box-sizing: border-box; }
  .ara { font-family: 'DM Sans', system-ui, sans-serif; background: #f2ede4; min-height: 100vh; }

  .ara-in {
    width: 100%; padding: 10px 13px; border: 1.5px solid #e4ddd0; border-radius: 10px;
    font-size: 13.5px; color: #1a1714; background: #fff;
    font-family: 'DM Sans', sans-serif; outline: none;
    transition: border-color 0.2s, box-shadow 0.2s; box-sizing: border-box;
  }
  .ara-in:focus { border-color: #8a7d5e !important; box-shadow: 0 0 0 3px rgba(138,125,94,0.13) !important; }
  .ara-ta { resize: vertical; }

  .ara-table { width: 100%; border-collapse: collapse; }
  .ara-table th {
    padding: 9px 14px; font-size: 9.5px; font-weight: 700;
    color: #b0a890; text-transform: uppercase; letter-spacing: 0.8px;
    border-bottom: 1.5px solid #ece6da; text-align: left;
    background: #faf7f2; white-space: nowrap;
  }
  .ara-table td {
    padding: 12px 14px; font-size: 13px; color: #1a1714;
    border-bottom: 1px solid #f0ece3; vertical-align: middle;
  }
  .ara-table tbody tr { transition: background 0.14s; }
  .ara-table tbody tr:hover { background: #faf7f2; }
  .ara-table tbody tr:last-child td { border-bottom: none; }

  .ara-btn {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 7px 14px; border-radius: 9px; font-size: 12.5px;
    font-weight: 600; cursor: pointer; font-family: inherit;
    border: none; transition: all 0.17s ease; white-space: nowrap;
  }
  .ara-btn:hover { opacity: 0.85; transform: translateY(-1px); }
  .ara-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
  .ara-btn--primary   { background: linear-gradient(135deg,#c9b87a,#b0983e); color: #1a1714; }
  .ara-btn--secondary { background: transparent; border: 1.5px solid #e4ddd0 !important; color: #6b6248; }
  .ara-btn--secondary:hover { background: #f5f0e8 !important; }
  .ara-btn--ghost     { background: rgba(201,184,122,0.08); border: 1px solid rgba(201,184,122,0.2) !important; color: #9a7a30; }
  .ara-btn--ghost:hover { background: rgba(201,184,122,0.16) !important; }
  .ara-btn--success   { background: rgba(126,184,164,0.1); border: 1.5px solid rgba(126,184,164,0.28) !important; color: #2a6049; }
  .ara-btn--success:hover { background: rgba(126,184,164,0.2) !important; }
  .ara-btn--danger    { background: rgba(212,133,90,0.1); border: 1.5px solid rgba(212,133,90,0.28) !important; color: #8b4513; }
  .ara-btn--danger:hover { background: rgba(212,133,90,0.2) !important; }
  .ara-btn--sm        { padding: 5px 11px; font-size: 11.5px; border-radius: 8px; }
  .ara-btn--icon      { padding: 5px 9px; font-size: 13px; border-radius: 8px; }

  .ara-card { background: #fff; border-radius: 14px; border: 1.5px solid #ece6da; box-shadow: 0 2px 16px rgba(20,16,10,0.07); overflow: hidden; }
  .ara-card-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 22px; border-bottom: 1.5px solid #ece6da; background: #faf7f2; flex-wrap: wrap; gap: 10px; }
  .ara-card-title  { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 18px; font-weight: 700; color: #1a1714; letter-spacing: -0.2px; margin: 0; }

  .ara-stat { background: #fff; border-radius: 12px; border: 1.5px solid #ece6da; padding: 16px 20px; box-shadow: 0 2px 12px rgba(20,16,10,0.06); transition: transform 0.2s; }
  .ara-stat:hover { transform: translateY(-3px); }

  @keyframes ara-scale-in { from{opacity:0;transform:scale(0.95) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes ara-spin     { to{transform:rotate(360deg)} }
  @keyframes ara-toast    { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes ara-glow     { 0%,100%{opacity:0.07} 50%{opacity:0.14} }
  @keyframes ara-shimmer  { 0%{background-position:-800px 0} 100%{background-position:800px 0} }
`;

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const s = STATUS_CFG[status] || { dot:"#a0997e", bg:"rgba(160,153,126,0.1)", border:"rgba(160,153,126,0.22)", color:"#6b6248", label:status };
  return (
    <span style={{ background:s.bg, color:s.color, border:`1.5px solid ${s.border}`, padding:"3px 11px", borderRadius:999, fontSize:10.5, fontWeight:700, display:"inline-flex", alignItems:"center", gap:5, textTransform:"uppercase", letterSpacing:"0.3px" }}>
      <span style={{ width:5, height:5, borderRadius:"50%", background:s.dot, boxShadow:`0 0 5px ${s.dot}` }}/>
      {s.label}
    </span>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type="success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{ position:"fixed", bottom:26, right:26, zIndex:9999, background:"#1a1714", color:type==="error"?"#f09090":"#90c8a8", padding:"11px 18px", borderRadius:12, fontSize:13, boxShadow:"0 10px 36px rgba(0,0,0,0.32)", border:`1px solid ${type==="error"?"rgba(240,128,128,0.15)":"rgba(144,200,168,0.15)"}`, maxWidth:320, fontFamily:"'DM Sans',sans-serif", animation:"ara-toast 0.2s ease", display:"flex", alignItems:"center", gap:8 }}>
      <span style={{fontSize:14}}>{type==="error"?"⚠️":"✅"}</span>{msg}
    </div>
  );
}

// ─── Loader ───────────────────────────────────────────────────────────────────
function Loader() {
  return (
    <div style={{ textAlign:"center", padding:"52px 0" }}>
      <div style={{ width:26, height:26, margin:"0 auto", border:"2px solid #e8e2d6", borderTop:"2px solid #c9b87a", borderRadius:"50%", animation:"ara-spin 0.8s linear infinite" }}/>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ icon, text }) {
  return (
    <div style={{ textAlign:"center", padding:"56px 20px", color:"#b0a890" }}>
      <div style={{ fontSize:40, marginBottom:12 }}>{icon}</div>
      <p style={{ fontSize:13.5, fontFamily:"'Cormorant Garamond',Georgia,serif", color:"#8a7d5e", fontStyle:"italic" }}>{text}</p>
    </div>
  );
}

// ─── Info Box ─────────────────────────────────────────────────────────────────
function InfoBox({ type="info", children }) {
  const cfg = {
    info:    { bg:"rgba(201,184,122,0.08)", border:"rgba(201,184,122,0.22)", color:"#9a7a30" },
    success: { bg:"rgba(126,184,164,0.08)", border:"rgba(126,184,164,0.22)", color:"#2a6049" },
    warning: { bg:"rgba(212,133,90,0.08)",  border:"rgba(212,133,90,0.22)",  color:"#8b4513" },
  }[type];
  return (
    <div style={{ background:cfg.bg, border:`1.5px solid ${cfg.border}`, borderRadius:10, padding:"10px 14px", marginBottom:14, fontSize:12.5, color:cfg.color, lineHeight:1.6 }}>
      {children}
    </div>
  );
}

const ML = { display:"block", fontSize:10.5, fontWeight:600, color:"#9a8c6e", textTransform:"uppercase", letterSpacing:"0.7px", marginBottom:6, fontFamily:"'DM Sans',sans-serif" };

// ─── App Detail Modal ─────────────────────────────────────────────────────────
function AppDetailModal({ app, onClose, onReview, notify }) {
  const [rejReason,   setRejReason]   = useState("");
  const [showReject,  setShowReject]  = useState(false);
  const [reviewing,   setReviewing]   = useState(false);

  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  useEffect(() => { document.body.style.overflow="hidden"; return()=>{ document.body.style.overflow=""; }; }, []);

  const handleApprove = async () => {
    setReviewing(true);
    await onReview(app.id,"APPROVED",null);
    setReviewing(false);
  };
  const handleReject = async () => {
    if (!validateRejectionReason(rejReason, notify)) return;
    setReviewing(true);
    await onReview(app.id,"REJECTED",rejReason||null);
    setReviewing(false);
    setShowReject(false);
  };

  const s = STATUS_CFG[app.status] || STATUS_CFG.PENDING;

  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()}
      style={{ position:"fixed", inset:0, zIndex:1000, background:"rgba(8,6,4,0.84)", backdropFilter:"blur(14px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ width:"100%", maxWidth:580, background:"#faf7f2", borderRadius:18, boxShadow:"0 44px 100px rgba(0,0,0,0.55)", maxHeight:"92vh", overflowY:"auto", animation:"ara-scale-in 0.26s ease" }}>

        {/* Header */}
        <div style={{ background:"linear-gradient(160deg,#141210 0%,#1e1a14 45%,#241e16 100%)", padding:"20px 26px", borderRadius:"18px 18px 0 0", display:"flex", alignItems:"center", justifyContent:"space-between", position:"relative", overflow:"hidden" }}>
          <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(rgba(255,255,255,0.018) 1px,transparent 1px)",backgroundSize:"22px 22px",pointerEvents:"none"}}/>
          <div style={{position:"absolute",top:0,left:0,right:0,height:"2px",background:`linear-gradient(90deg,transparent,${s.dot} 30%,${s.dot} 70%,transparent)`}}/>
          <div style={{position:"relative"}}>
            <p style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontWeight:700, fontSize:19, margin:"0 0 2px", color:"#f5f0e8", letterSpacing:"-0.2px" }}>Application #{app.id}</p>
            <p style={{ fontSize:11.5, color:"rgba(245,240,232,0.4)", margin:0 }}>Listing #{app.listing_id} · Client #{app.client_id}</p>
          </div>
          <button onClick={onClose} style={{ position:"relative", background:"rgba(245,240,232,0.08)", backdropFilter:"blur(8px)", border:"1px solid rgba(245,240,232,0.12)", borderRadius:9, width:32, height:32, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"rgba(245,240,232,0.6)", fontSize:16 }}>×</button>
        </div>

        <div style={{ padding:"22px 26px" }}>
          {/* Status row */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18, padding:"12px 16px", background:s.bg, border:`1.5px solid ${s.border}`, borderRadius:12 }}>
            <StatusBadge status={app.status}/>
            {app.reviewed_at && (
              <span style={{ fontSize:12, color:"#b0a890" }}>Reviewed: {fmtDT(app.reviewed_at)}</span>
            )}
          </div>

          {/* Info grid */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9, marginBottom:18 }}>
            {[
              { label:"Client ID",     value:`#${app.client_id}`        },
              { label:"Listing ID",    value:`#${app.listing_id}`       },
              { label:"Monthly Income",value:fmtMoney(app.income)       },
              { label:"Move-in Date",  value:fmtDate(app.move_in_date)  },
              { label:"Reviewed By",   value:app.reviewed_by?`#${app.reviewed_by}`:"—" },
              { label:"Created",       value:fmtDT(app.created_at)      },
            ].map(({label,value}) => (
              <div key={label} style={{ background:"#fff", borderRadius:11, padding:"11px 14px", border:"1.5px solid #e8e2d6" }}>
                <p style={ML}>{label}</p>
                <p style={{ fontSize:13.5, fontWeight:600, color:"#1a1714", margin:0, fontFamily:"'Cormorant Garamond',Georgia,serif" }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Message */}
          {app.message && (
            <div style={{ background:"#fff", border:"1.5px solid #e8e2d6", borderRadius:11, padding:"14px 16px", marginBottom:16 }}>
              <p style={ML}>Message</p>
              <p style={{ fontSize:14, color:"#3c3830", lineHeight:1.8, fontStyle:"italic", margin:0, fontFamily:"'Cormorant Garamond',Georgia,serif" }}>"{app.message}"</p>
            </div>
          )}

          {/* Rejection reason */}
          {app.rejection_reason && (
            <InfoBox type="warning">
              ✕ Rejection reason: {app.rejection_reason}
            </InfoBox>
          )}

          {/* Actions */}
          {app.status === "PENDING" && (
            <div style={{ borderTop:"1px solid #e8e2d6", paddingTop:18, marginTop:4 }}>
              {!showReject ? (
                <div style={{ display:"flex", gap:9 }}>
                  <button className="ara-btn ara-btn--success" style={{ flex:1 }} onClick={handleApprove} disabled={reviewing}>
                    ✓ Approve Application
                  </button>
                  <button className="ara-btn ara-btn--danger" style={{ flex:1 }} onClick={()=>setShowReject(true)}>
                    ✕ Reject
                  </button>
                </div>
              ) : (
                <div>
                  <label style={ML}>Rejection Reason <span style={{ color:"#b0a890", fontWeight:400, textTransform:"none", letterSpacing:0 }}>(optional — max 500 chars)</span></label>
                  <textarea className="ara-in ara-ta" rows={3} value={rejReason} onChange={e=>setRejReason(e.target.value)} placeholder="Write rejection reason…" maxLength={500}/>
                  <p style={{ fontSize:11, color:"#b0a890", textAlign:"right", marginTop:3, marginBottom:12 }}>{rejReason.length}/500</p>
                  <div style={{ display:"flex", gap:9 }}>
                    <button className="ara-btn ara-btn--secondary" onClick={()=>{ setShowReject(false); setRejReason(""); }}>Cancel</button>
                    <button className="ara-btn ara-btn--danger" onClick={handleReject} disabled={reviewing}>
                      {reviewing ? "Rejecting…" : "Confirm Rejection"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function AgentRentalApplications() {
  const [listingId,    setListingId]    = useState("");
  const [applications, setApplications] = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [searched,     setSearched]     = useState(false);
  const [selectedApp,  setSelectedApp]  = useState(null);
  const [toast,        setToast]        = useState(null);

  const notify = useCallback((msg,type="success") => setToast({msg,type,key:Date.now()}), []);

  const stats = {
    total:    applications.length,
    pending:  applications.filter(a=>a.status==="PENDING").length,
    approved: applications.filter(a=>a.status==="APPROVED").length,
    rejected: applications.filter(a=>a.status==="REJECTED").length,
  };

  const fetchApplications = async () => {
    if (!validateListingId(listingId, notify)) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await api.get(`/api/rentals/applications/listing/${Number(listingId)}`);
      setApplications(Array.isArray(res.data)?res.data:[]);
    } catch { notify("Listing not found or no applications available","error"); }
    finally  { setLoading(false); }
  };

  const handleReview = async (appId, status, reason) => {
    if (status==="REJECTED" && !validateRejectionReason(reason, notify)) return;
    try {
      await api.patch(`/api/rentals/applications/${appId}/review`,{ status, rejection_reason:reason||null });
      setApplications(prev=>prev.map(a=>a.id===appId?{...a,status,rejection_reason:reason}:a));
      if (selectedApp?.id===appId) setSelectedApp(prev=>({...prev,status,rejection_reason:reason}));
      notify(`Application #${appId} → ${status}`);
    } catch (err) { notify(err.response?.data?.message||"Error","error"); }
  };

  const STAT_CARDS = [
    { label:"Total",    value:stats.total,    cfg:{ dot:"#c9b87a", color:"#9a7a30" } },
    { label:"Pending",  value:stats.pending,  cfg:STATUS_CFG.PENDING  },
    { label:"Approved", value:stats.approved, cfg:STATUS_CFG.APPROVED },
    { label:"Rejected", value:stats.rejected, cfg:STATUS_CFG.REJECTED },
  ];

  return (
    <MainLayout role="agent">
      <style>{CSS}</style>
      <div className="ara">

        {/* ── Hero ── */}
        <div style={{ background:"linear-gradient(160deg,#141210 0%,#1e1a14 45%,#241e16 100%)", minHeight:260, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"36px 32px", position:"relative", overflow:"hidden" }}>
          <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(rgba(255,255,255,0.018) 1px,transparent 1px)",backgroundSize:"22px 22px",pointerEvents:"none"}}/>
          <div style={{position:"absolute",top:"-60px",left:"8%",width:280,height:280,borderRadius:"50%",background:"radial-gradient(circle,rgba(201,184,122,0.07) 0%,transparent 70%)",pointerEvents:"none",animation:"ara-glow 4s ease-in-out infinite"}}/>
          <div style={{position:"absolute",bottom:"-40px",right:"8%",width:220,height:220,borderRadius:"50%",background:"radial-gradient(circle,rgba(126,184,164,0.05) 0%,transparent 70%)",pointerEvents:"none",animation:"ara-glow 4s ease-in-out infinite 2s"}}/>
          <div style={{position:"absolute",top:0,left:0,right:0,height:"2px",background:"linear-gradient(90deg,transparent,#c9b87a 30%,#c9b87a 70%,transparent)"}}/>

          <div style={{ position:"relative", zIndex:1, maxWidth:700, width:"100%", textAlign:"center" }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(201,184,122,0.1)", border:"1px solid rgba(201,184,122,0.18)", borderRadius:999, padding:"4px 14px", marginBottom:14 }}>
              <span style={{ width:5, height:5, borderRadius:"50%", background:"#c9b87a", display:"inline-block", boxShadow:"0 0 6px #c9b87a" }}/>
              <span style={{ fontSize:10.5, fontWeight:600, color:"#c9b87a", letterSpacing:"1.2px", textTransform:"uppercase" }}>Rental Applications</span>
            </div>

            <h1 style={{ margin:"0 0 10px", fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"clamp(26px,3.5vw,40px)", fontWeight:700, color:"#f5f0e8", letterSpacing:"-0.7px", lineHeight:1.1 }}>
              Rental{" "}
              <span style={{ background:"linear-gradient(90deg,#c9b87a,#e8d9a0,#c9b87a)", backgroundSize:"200% auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>Applications</span>
            </h1>

            <p style={{ margin:"0 auto 24px", fontSize:13.5, color:"rgba(245,240,232,0.38)", fontFamily:"'DM Sans',sans-serif", lineHeight:1.6 }}>
              Review and manage client applications for rental listings
            </p>

            {/* Search bar in hero */}
            <div style={{ display:"flex", gap:0, maxWidth:480, margin:"0 auto", boxShadow:"0 6px 24px rgba(0,0,0,0.28)", borderRadius:14, overflow:"hidden", border:"1.5px solid rgba(245,240,232,0.09)" }}>
              <div style={{ flex:1, display:"flex", alignItems:"center", gap:10, background:"rgba(245,240,232,0.06)", padding:"0 18px", height:50, backdropFilter:"blur(10px)" }}>
                <span style={{ fontSize:14, opacity:0.5 }}>🔑</span>
                <input type="number" min="1" placeholder="Enter Listing ID…" value={listingId}
                  onChange={e=>setListingId(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&fetchApplications()}
                  style={{ flex:1, border:"none", outline:"none", fontSize:13.5, color:"#f5f0e8", background:"transparent", fontFamily:"'DM Sans',sans-serif" }}/>
              </div>
              <div style={{ width:1, background:"rgba(245,240,232,0.07)", alignSelf:"stretch", flexShrink:0 }}/>
              <button onClick={fetchApplications} disabled={loading}
                style={{ padding:"0 24px", height:50, background:"linear-gradient(135deg,#c9b87a 0%,#b0983e 100%)", color:"#1a1714", border:"none", fontSize:13.5, fontWeight:700, cursor:loading?"not-allowed":"pointer", fontFamily:"'DM Sans',sans-serif", display:"flex", alignItems:"center", gap:7, flexShrink:0, opacity:loading?0.7:1 }}>
                {loading ? "Loading…" : "🔍 Search"}
              </button>
            </div>

            {/* Stat pills — appear after search */}
            {applications.length > 0 && (
              <div style={{ display:"flex", gap:10, maxWidth:480, margin:"20px auto 0", justifyContent:"center", flexWrap:"wrap" }}>
                {STAT_CARDS.map(s => (
                  <div key={s.label} style={{ background:"rgba(245,240,232,0.06)", backdropFilter:"blur(10px)", borderRadius:12, padding:"9px 16px", border:"1px solid rgba(245,240,232,0.1)", display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
                    <span style={{ fontSize:20, fontWeight:700, color:s.cfg.dot, lineHeight:1, fontFamily:"'Cormorant Garamond',Georgia,serif" }}>{s.value}</span>
                    <span style={{ fontSize:10, color:"rgba(245,240,232,0.35)", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.8px" }}>{s.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Toolbar ── */}
        <div style={{ background:"#fff", borderBottom:"1.5px solid #e8e2d6", padding:"0 28px", height:46, display:"flex", alignItems:"center", justifyContent:"space-between", fontFamily:"'DM Sans',sans-serif", position:"sticky", top:0, zIndex:100, boxShadow:"0 1px 10px rgba(20,16,10,0.05)" }}>
          <p style={{ margin:0, fontSize:12.5, color:"#9a8c6e" }}>
            {loading ? "Searching…" : applications.length > 0 ? `${applications.length} application${applications.length!==1?"s":""} for Listing #${listingId}` : searched ? "No applications found" : "Enter a Listing ID to search"}
          </p>
        </div>

        {/* ── Content ── */}
        <div style={{ padding:"20px 24px", maxWidth:1400, margin:"0 auto" }}>

          {/* Stat cards below toolbar when results loaded */}
          {applications.length > 0 && (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
              {STAT_CARDS.map(s => (
                <div key={s.label} className="ara-stat">
                  <div style={{ fontSize:9.5, fontWeight:600, color:"#b0a890", textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:8 }}>{s.label}</div>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:28, fontWeight:700, color:s.cfg.dot, fontFamily:"'Cormorant Garamond',Georgia,serif", lineHeight:1 }}>{s.value}</span>
                    <span style={{ width:7, height:7, borderRadius:"50%", background:s.cfg.dot, boxShadow:`0 0 8px ${s.cfg.dot}`, flexShrink:0 }}/>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Table card */}
          <div className="ara-card">
            <div className="ara-card-header">
              <h2 className="ara-card-title">
                {applications.length > 0 ? `Applications — Listing #${listingId}` : "Applications"}
              </h2>
              {applications.length > 0 && (
                <span style={{ background:"rgba(201,184,122,0.1)", color:"#c9b87a", border:"1px solid rgba(201,184,122,0.22)", padding:"4px 13px", borderRadius:999, fontSize:12, fontWeight:600 }}>
                  {applications.length} total
                </span>
              )}
            </div>

            {loading ? <Loader/> : applications.length===0 ? (
              <EmptyState
                icon="📝"
                text={searched ? "No applications found for this listing" : "Enter a Listing ID above to view its applications"}/>
            ) : (
              <div style={{ overflowX:"auto" }}>
                <table className="ara-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Client</th>
                      <th>Monthly Income</th>
                      <th>Move-in Date</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Reviewed</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map(app => (
                      <tr key={app.id}>
                        <td style={{ color:"#b0a890", fontSize:11.5 }}>{app.id}</td>
                        <td>
                          <span style={{ background:"rgba(201,184,122,0.1)", color:"#c9b87a", border:"1px solid rgba(201,184,122,0.22)", padding:"3px 10px", borderRadius:999, fontSize:11.5, fontWeight:600 }}>
                            #{app.client_id}
                          </span>
                        </td>
                        <td style={{ fontWeight:700, fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:14.5 }}>
                          {fmtMoney(app.income)}
                        </td>
                        <td style={{ fontSize:12.5, color:"#9a8c6e" }}>{fmtDate(app.move_in_date)}</td>
                        <td><StatusBadge status={app.status}/></td>
                        <td style={{ fontSize:12, color:"#b0a890" }}>{fmtDT(app.created_at)}</td>
                        <td style={{ fontSize:12, color:"#b0a890" }}>{app.reviewed_at ? fmtDT(app.reviewed_at) : "—"}</td>
                        <td>
                          <div style={{ display:"flex", gap:5, alignItems:"center" }}>
                            <button className="ara-btn ara-btn--ghost ara-btn--sm" onClick={()=>setSelectedApp(app)}>View</button>
                            {app.status==="PENDING" && (
                              <>
                                <button className="ara-btn ara-btn--success ara-btn--icon" onClick={()=>handleReview(app.id,"APPROVED",null)} title="Approve">✓</button>
                                <button className="ara-btn ara-btn--danger ara-btn--icon" onClick={()=>setSelectedApp(app)} title="Reject">✕</button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedApp && (
        <AppDetailModal app={selectedApp} onClose={()=>setSelectedApp(null)} onReview={handleReview} notify={notify}/>
      )}
      {toast && <Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={()=>setToast(null)}/>}
    </MainLayout>
  );
}