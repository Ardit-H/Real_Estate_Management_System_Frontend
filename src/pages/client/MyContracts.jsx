import { useState, useEffect, useCallback, useContext } from "react";
import MainLayout from "../../components/layout/Layout";
import { AuthContext } from "../../context/AuthProvider";
import api from "../../api/axios";

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_CFG = {
  ACTIVE:            { label:"Active",              dot:"#7eb8a4", strip:"#7eb8a4", pill:"rgba(126,184,164,0.13)", pillBorder:"rgba(126,184,164,0.28)", color:"#2a6049" },
  ENDED:             { label:"Ended",               dot:"#a0997e", strip:"#a0997e", pill:"rgba(160,153,126,0.1)",  pillBorder:"rgba(160,153,126,0.22)", color:"#6b6248" },
  CANCELLED:         { label:"Cancelled",           dot:"#d4855a", strip:"#d4855a", pill:"rgba(212,133,90,0.1)",   pillBorder:"rgba(212,133,90,0.25)",  color:"#8b4513" },
  PENDING_SIGNATURE: { label:"Pending Signature",   dot:"#c9b87a", strip:"#c9b87a", pill:"rgba(201,184,122,0.12)", pillBorder:"rgba(201,184,122,0.28)", color:"#9a7a30" },
};

const PAY_STATUS_CFG = {
  PENDING:  { bg:"rgba(201,184,122,0.1)",  color:"#c9b87a", border:"rgba(201,184,122,0.25)" },
  PAID:     { bg:"rgba(126,184,164,0.1)",  color:"#2a6049", border:"rgba(126,184,164,0.25)" },
  FAILED:   { bg:"rgba(212,133,90,0.1)",   color:"#8b4513", border:"rgba(212,133,90,0.25)"  },
  OVERDUE:  { bg:"rgba(212,133,90,0.12)",  color:"#8b3a1c", border:"rgba(212,133,90,0.3)"   },
  REFUNDED: { bg:"rgba(160,153,126,0.1)",  color:"#6b6248", border:"rgba(160,153,126,0.22)" },
};

const fmtDate  = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" }) : "—";
const fmtDT    = (d) => d ? new Date(d).toLocaleString("en-GB",  { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" }) : "—";
const fmtMoney = (v) => v != null ? `€${Number(v).toLocaleString("de-DE")}` : "—";

function daysUntil(dateStr) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
}

// ─── Global CSS ───────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

  .cc * { box-sizing: border-box; }
  .cc { font-family: 'DM Sans', system-ui, sans-serif; background: #f2ede4; min-height: 100vh; }

  .cc-card { transition: transform 0.25s cubic-bezier(0.25,0.46,0.45,0.94), box-shadow 0.25s ease; }
  .cc-card:hover { transform: translateY(-5px); box-shadow: 0 24px 52px rgba(20,16,10,0.14) !important; }

  .cc-btn { transition: all 0.17s ease; }
  .cc-btn:hover { opacity: 0.85; transform: translateY(-1px); }

  .cc-in:focus { border-color: #8a7d5e !important; box-shadow: 0 0 0 3px rgba(138,125,94,0.13) !important; outline: none; }

  @keyframes cc-card-in  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes cc-scale-in { from{opacity:0;transform:scale(0.95) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes cc-shimmer  { 0%{background-position:-800px 0} 100%{background-position:800px 0} }
  @keyframes cc-pulse    { 0%,100%{opacity:.38} 50%{opacity:.82} }
  @keyframes cc-spin     { to{transform:rotate(360deg)} }
  @keyframes cc-toast    { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes cc-glow     { 0%,100%{opacity:0.07} 50%{opacity:0.14} }
`;

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type = "success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{
      position:"fixed", bottom:26, right:26, zIndex:9999,
      background:"#1a1714", color:type==="error"?"#f09090":"#90c8a8",
      padding:"11px 18px", borderRadius:12, fontSize:13,
      boxShadow:"0 10px 36px rgba(0,0,0,0.32)",
      border:`1px solid ${type==="error"?"rgba(240,128,128,0.15)":"rgba(144,200,168,0.15)"}`,
      maxWidth:320, fontFamily:"'DM Sans',sans-serif",
      animation:"cc-toast 0.2s ease", display:"flex", alignItems:"center", gap:8,
    }}>
      <span style={{fontSize:14}}>{type==="error"?"⚠️":"✅"}</span>{msg}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      {Array.from({ length:3 }).map((_, i) => (
        <div key={i} style={{
          background:"linear-gradient(90deg,#ede9df 25%,#e4ddd0 50%,#ede9df 75%)",
          backgroundSize:"800px 100%", borderRadius:14, height:140,
          animation:"cc-shimmer 1.6s ease-in-out infinite",
        }}/>
      ))}
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const s = STATUS_CFG[status] || { label:status, dot:"#a0997e", pill:"rgba(160,153,126,0.1)", pillBorder:"rgba(160,153,126,0.22)", color:"#6b6248" };
  return (
    <span style={{
      background:s.pill, color:s.color, border:`1.5px solid ${s.pillBorder}`,
      padding:"4px 13px", borderRadius:999, fontSize:11, fontWeight:700,
      display:"inline-flex", alignItems:"center", gap:5, letterSpacing:"0.3px",
      textTransform:"uppercase",
    }}>
      <span style={{ width:5, height:5, borderRadius:"50%", background:s.dot, display:"inline-block", boxShadow:`0 0 5px ${s.dot}` }}/>
      {s.label}
    </span>
  );
}

// ─── Modal wrapper ────────────────────────────────────────────────────────────
function ModalWrap({ children, onClose, maxW=600 }) {
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);
  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()}
      style={{
        position:"fixed", inset:0, zIndex:1000,
        background:"rgba(8,6,4,0.84)", backdropFilter:"blur(14px)",
        display:"flex", alignItems:"center", justifyContent:"center",
        padding:20, fontFamily:"'DM Sans',sans-serif",
      }}>
      <div style={{
        width:"100%", maxWidth:maxW, background:"#faf7f2",
        borderRadius:18, boxShadow:"0 44px 100px rgba(0,0,0,0.55)",
        maxHeight:"92vh", overflowY:"auto", animation:"cc-scale-in 0.26s ease",
      }}>
        {children}
      </div>
    </div>
  );
}

function ModalHeader({ icon, title, sub, onClose }) {
  return (
    <div style={{
      background:"linear-gradient(160deg,#141210 0%,#1e1a14 45%,#241e16 100%)",
      padding:"22px 26px", borderRadius:"18px 18px 0 0",
      display:"flex", alignItems:"center", justifyContent:"space-between",
      position:"relative", overflow:"hidden",
    }}>
      <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(rgba(255,255,255,0.018) 1px,transparent 1px)",backgroundSize:"22px 22px",pointerEvents:"none"}}/>
      <div style={{position:"absolute",top:0,left:0,right:0,height:"2px",background:"linear-gradient(90deg,transparent,#c9b87a 30%,#c9b87a 70%,transparent)"}}/>
      <div style={{ display:"flex", alignItems:"center", gap:12, position:"relative" }}>
        <div style={{ width:42, height:42, borderRadius:12, background:"rgba(201,184,122,0.12)", border:"1px solid rgba(201,184,122,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>{icon}</div>
        <div>
          <p style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontWeight:700, fontSize:19, margin:"0 0 2px", color:"#f5f0e8", letterSpacing:"-0.2px" }}>{title}</p>
          {sub && <p style={{ fontSize:12, color:"rgba(245,240,232,0.4)", margin:0 }}>{sub}</p>}
        </div>
      </div>
      <button onClick={onClose} style={{
        position:"relative", background:"rgba(245,240,232,0.08)", backdropFilter:"blur(8px)",
        border:"1px solid rgba(245,240,232,0.12)", borderRadius:9,
        width:32, height:32, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
        color:"rgba(245,240,232,0.6)", fontSize:16,
      }}>×</button>
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
const PGB = (active, disabled) => ({
  padding:"7px 13px", borderRadius:9, border:`1.5px solid ${active?"#1a1714":"#e4ddd0"}`,
  background:active?"#1a1714":"transparent",
  color:active?"#f5f0e8":disabled?"#d4ccbe":"#6b6248",
  cursor:disabled?"not-allowed":"pointer", fontSize:13, fontWeight:active?600:400,
  fontFamily:"'DM Sans',sans-serif", opacity:disabled?0.5:1, transition:"all 0.14s",
});

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const pages   = Array.from({ length:totalPages }, (_,i) => i);
  const visible = pages.filter(p => p===0 || p===totalPages-1 || Math.abs(p-page)<=1);
  return (
    <div style={{ display:"flex", justifyContent:"center", gap:4, marginTop:44, flexWrap:"wrap" }}>
      <button disabled={page===0} onClick={()=>onChange(page-1)} style={PGB(false,page===0)}>‹</button>
      {visible.map((p,i) => {
        const gap = visible[i-1]!=null && p-visible[i-1]>1;
        return <span key={p} style={{ display:"flex", gap:4 }}>
          {gap && <span style={{ padding:"7px 4px", color:"#b0a890", fontSize:13 }}>…</span>}
          <button onClick={()=>onChange(p)} style={PGB(p===page,false)}>{p+1}</button>
        </span>;
      })}
      <button disabled={page===totalPages-1} onClick={()=>onChange(page+1)} style={PGB(false,page===totalPages-1)}>›</button>
    </div>
  );
}

// ─── Contract Detail Modal ────────────────────────────────────────────────────
function ContractDetailModal({ contract, onClose, onViewPayments }) {
  const days     = daysUntil(contract.end_date);
  const expiring = days !== null && days <= 30 && days > 0 && contract.status === "ACTIVE";
  const expired  = days !== null && days <= 0;
  const s        = STATUS_CFG[contract.status] || STATUS_CFG.ENDED;

  return (
    <ModalWrap onClose={onClose} maxW={620}>
      <ModalHeader icon="📄" title={`Contract #${contract.id}`} sub={`Property #${contract.property_id}`} onClose={onClose}/>
      <div style={{ padding:"22px 26px" }}>

        {/* Status + days row */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", background:s.pill, border:`1.5px solid ${s.pillBorder}`, borderRadius:12, padding:"12px 16px", marginBottom:20 }}>
          <StatusBadge status={contract.status}/>
          {contract.status === "ACTIVE" && days !== null && (
            <span style={{ fontSize:12.5, fontWeight:600, color:expiring?"#c9b87a":expired?"#d4855a":"#9a8c6e", display:"flex", alignItems:"center", gap:5 }}>
              {expiring ? `⚠️ Expires in ${days} days` : expired ? "⚠️ Contract has expired" : `${days} days remaining`}
            </span>
          )}
        </div>

        {expiring && (
          <div style={{ background:"rgba(201,184,122,0.08)", border:"1.5px solid rgba(201,184,122,0.22)", borderRadius:10, padding:"10px 14px", marginBottom:18, fontSize:13, color:"#c9b87a", display:"flex", alignItems:"center", gap:8 }}>
            ⚠️ Your contract expires in <strong>{days} days</strong>. Contact your agent to arrange renewal.
          </div>
        )}

        {/* Details grid */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9, marginBottom:20 }}>
          {[
            { label:"Property",    value:`#${contract.property_id}` },
            { label:"Agent",       value:contract.agent_id?`#${contract.agent_id}`:"—" },
            { label:"Start Date",  value:fmtDate(contract.start_date) },
            { label:"End Date",    value:fmtDate(contract.end_date) },
            { label:"Monthly Rent",value:fmtMoney(contract.rent) },
            { label:"Deposit",     value:fmtMoney(contract.deposit) },
            { label:"Created",     value:fmtDT(contract.created_at) },
            { label:"Updated",     value:fmtDT(contract.updated_at) },
          ].map(({ label, value }) => (
            <div key={label} style={{ background:"#fff", borderRadius:11, padding:"11px 14px", border:"1.5px solid #e8e2d6" }}>
              <p style={{ fontSize:9.5, color:"#b0a890", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:5 }}>{label}</p>
              <p style={{ fontSize:13.5, fontWeight:600, color:"#1a1714", margin:0, fontFamily:"'Cormorant Garamond',Georgia,serif" }}>{value}</p>
            </div>
          ))}
        </div>

        {contract.contract_file_url && (
          <div style={{ background:"rgba(201,184,122,0.06)", border:"1.5px solid rgba(201,184,122,0.18)", borderRadius:11, padding:"12px 16px", marginBottom:20 }}>
            <a href={contract.contract_file_url} target="_blank" rel="noopener noreferrer"
              style={{ color:"#c9b87a", fontSize:13.5, fontWeight:600, textDecoration:"none", display:"flex", alignItems:"center", gap:7 }}>
              📄 View Contract Document ↗
            </a>
          </div>
        )}

        <div style={{ borderTop:"1px solid #e8e2d6", paddingTop:18, display:"flex", gap:9, justifyContent:"flex-end" }}>
          <button onClick={onClose} className="cc-btn"
            style={{ padding:"10px 20px", borderRadius:10, border:"1.5px solid #e4ddd0", background:"transparent", color:"#6b6248", fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"inherit" }}>
            Close
          </button>
          {contract.status === "ACTIVE" && (
            <button onClick={()=>{ onClose(); onViewPayments(contract); }} className="cc-btn"
              style={{ padding:"10px 20px", borderRadius:10, border:"none", background:"linear-gradient(135deg,#c9b87a,#b0983e)", color:"#1a1714", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:6 }}>
              💳 View Payments
            </button>
          )}
        </div>
      </div>
    </ModalWrap>
  );
}

// ─── Payments Modal ───────────────────────────────────────────────────────────
function ContractPaymentsModal({ contract, onClose, notify }) {
  const [payments, setPayments] = useState([]);
  const [summary,  setSummary]  = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [listRes, sumRes] = await Promise.all([
          api.get(`/api/payments/contract/${contract.id}`),
          api.get(`/api/payments/contract/${contract.id}/summary`),
        ]);
        setPayments(Array.isArray(listRes.data) ? listRes.data : []);
        setSummary(sumRes.data);
      } catch { notify("Failed to load payments","error"); }
      finally   { setLoading(false); }
    })();
  }, [contract.id, notify]);

  return (
    <ModalWrap onClose={onClose} maxW={700}>
      <ModalHeader icon="💳" title={`Payments — Contract #${contract.id}`} sub={`Rent: ${fmtMoney(contract.rent)} / month`} onClose={onClose}/>
      <div style={{ padding:"22px 26px" }}>

        {summary && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))", gap:9, marginBottom:20 }}>
            {[
              { label:"Total",   value:summary.total_payments,                            dot:"#c9b87a",  bg:"rgba(201,184,122,0.08)",  border:"rgba(201,184,122,0.2)"  },
              { label:"Paid",    value:fmtMoney(summary.total_paid||0),                   dot:"#7eb8a4",  bg:"rgba(126,184,164,0.08)",  border:"rgba(126,184,164,0.2)"  },
              { label:"Pending", value:fmtMoney(summary.total_pending||0),                dot:"#c9b87a",  bg:"rgba(201,184,122,0.06)",  border:"rgba(201,184,122,0.15)" },
              ...(summary.overdue_count>0?[{ label:"Overdue", value:summary.overdue_count, dot:"#d4855a", bg:"rgba(212,133,90,0.08)",   border:"rgba(212,133,90,0.22)"  }]:[]),
            ].map(({ label, value, dot, bg, border }) => (
              <div key={label} style={{ background:bg, borderRadius:11, padding:"12px 14px", border:`1.5px solid ${border}` }}>
                <p style={{ fontSize:9.5, color:"#b0a890", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:5 }}>{label}</p>
                <p style={{ fontSize:18, fontWeight:700, color:dot, margin:0, fontFamily:"'Cormorant Garamond',Georgia,serif" }}>{value}</p>
              </div>
            ))}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign:"center", padding:"48px 0" }}>
            <div style={{ width:26, height:26, margin:"0 auto", border:"2px solid #e8e2d6", borderTop:"2px solid #c9b87a", borderRadius:"50%", animation:"cc-spin .8s linear infinite" }}/>
          </div>
        ) : payments.length === 0 ? (
          <div style={{ textAlign:"center", padding:"48px 20px", color:"#b0a890" }}>
            <div style={{ fontSize:44, marginBottom:12 }}>💳</div>
            <p style={{ fontSize:14, fontFamily:"'Cormorant Garamond',Georgia,serif", color:"#6b6340" }}>No payments found for this contract.</p>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {payments.map(p => {
              const overdue = p.status==="OVERDUE" || (p.status==="PENDING" && p.due_date && new Date(p.due_date)<new Date());
              const key     = overdue ? "OVERDUE" : p.status;
              const s       = PAY_STATUS_CFG[key] || PAY_STATUS_CFG.PENDING;
              return (
                <div key={p.id} style={{
                  display:"flex", justifyContent:"space-between", alignItems:"center",
                  padding:"13px 16px", background:"#fff", borderRadius:11,
                  border:`1.5px solid ${overdue?"rgba(212,133,90,0.25)":"#e8e2d6"}`,
                }}>
                  <div>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4, flexWrap:"wrap" }}>
                      <span style={{ fontWeight:700, fontSize:15, color:"#1a1714", fontFamily:"'Cormorant Garamond',Georgia,serif" }}>{fmtMoney(p.amount)}</span>
                      <span style={{ background:"#f0ece3", color:"#6b5f45", border:"1px solid #e0d8c8", padding:"2px 9px", borderRadius:999, fontSize:10.5, fontWeight:600, textTransform:"uppercase" }}>{p.payment_type}</span>
                    </div>
                    <p style={{ fontSize:12, color:"#b0a890", margin:0 }}>
                      Due: {fmtDate(p.due_date)}{p.paid_date&&` · Paid: ${fmtDate(p.paid_date)}`}{p.payment_method&&` · ${p.payment_method}`}
                    </p>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:7, flexShrink:0 }}>
                    {overdue && <span style={{ fontSize:11.5, color:"#d4855a", fontWeight:700 }}>Overdue</span>}
                    <span style={{ background:s.bg, color:s.color, border:`1.5px solid ${s.border}`, padding:"3px 12px", borderRadius:999, fontSize:11, fontWeight:700, textTransform:"uppercase" }}>{key}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ borderTop:"1px solid #e8e2d6", paddingTop:16, marginTop:20, display:"flex", justifyContent:"flex-end" }}>
          <button onClick={onClose} className="cc-btn"
            style={{ padding:"10px 22px", borderRadius:10, border:"1.5px solid #e4ddd0", background:"transparent", color:"#6b6248", fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"inherit" }}>
            Close
          </button>
        </div>
      </div>
    </ModalWrap>
  );
}

// ─── Contract Card ────────────────────────────────────────────────────────────
function ContractCard({ contract, onDetail, onPayments, idx }) {
  const days     = daysUntil(contract.end_date);
  const expiring = days !== null && days <= 30 && days > 0 && contract.status === "ACTIVE";
  const s        = STATUS_CFG[contract.status] || STATUS_CFG.ENDED;

  return (
    <div className="cc-card"
      style={{
        background:"#fff", borderRadius:14, overflow:"hidden",
        boxShadow:"0 2px 16px rgba(20,16,10,0.08)", border:"1.5px solid #ece6da",
        display:"flex", fontFamily:"'DM Sans',sans-serif",
        animation:`cc-card-in 0.38s ease ${Math.min(idx*0.06,0.4)}s both`,
      }}>

      {/* Status strip */}
      <div style={{ width:4, background:`linear-gradient(to bottom,${s.strip},${s.strip}66)`, flexShrink:0 }}/>

      {/* Icon col */}
      <div style={{
        width:64, flexShrink:0, display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center", gap:6, padding:"16px 10px",
        background:`linear-gradient(135deg,${s.strip}08,transparent)`,
        borderRight:"1.5px solid #f0ece3",
      }}>
        <span style={{ fontSize:26 }}>📄</span>
        <span style={{ fontSize:9, fontWeight:700, color:s.dot, textTransform:"uppercase", letterSpacing:"0.5px", textAlign:"center", lineHeight:1.3, background:`${s.strip}15`, padding:"3px 6px", borderRadius:6, border:`1px solid ${s.strip}30` }}>
          #{contract.id}
        </span>
      </div>

      {/* Content */}
      <div style={{ flex:1, padding:"14px 20px", display:"flex", flexDirection:"column", justifyContent:"space-between", minWidth:0 }}>
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12, marginBottom:10 }}>
            <div style={{ minWidth:0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
                <span style={{ fontSize:9.5, fontWeight:700, color:"#b0a890", textTransform:"uppercase", letterSpacing:"0.8px" }}>Contract #{contract.id}</span>
                <span style={{ background:"rgba(201,184,122,0.1)", color:"#c9b87a", border:"1px solid rgba(201,184,122,0.22)", borderRadius:999, padding:"2px 10px", fontSize:10.5, fontWeight:700 }}>
                  Property #{contract.property_id}
                </span>
              </div>
              <div style={{ fontSize:19, fontWeight:700, color:"#1a1714", fontFamily:"'Cormorant Garamond',Georgia,serif", letterSpacing:"-0.3px" }}>
                {fmtMoney(contract.rent)}<span style={{ fontSize:13, fontWeight:400, color:"#b0a890", marginLeft:4 }}>/month</span>
              </div>
            </div>
            <div style={{ flexShrink:0 }}>
              <StatusBadge status={contract.status}/>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))", gap:7, marginBottom:expiring?10:0 }}>
            {[
              { label:"Deposit",    value:fmtMoney(contract.deposit) },
              { label:"Start Date", value:fmtDate(contract.start_date) },
              { label:"End Date",   value:fmtDate(contract.end_date) },
            ].map(({ label, value }) => (
              <div key={label} style={{ background:"#f8f5f0", borderRadius:8, padding:"8px 11px", border:"1.5px solid #ede9df" }}>
                <div style={{ fontSize:9.5, color:"#b0a890", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.7px", marginBottom:3 }}>{label}</div>
                <div style={{ fontSize:13, fontWeight:700, color:"#1a1714", fontFamily:"'Cormorant Garamond',Georgia,serif" }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Expiring banner */}
        {expiring && (
          <div style={{ background:"rgba(201,184,122,0.08)", border:"1.5px solid rgba(201,184,122,0.22)", borderRadius:8, padding:"8px 12px", marginTop:10, marginBottom:10, fontSize:12, color:"#c9b87a", display:"flex", alignItems:"center", gap:6 }}>
            ⚠️ Expires in <strong>{days} days</strong> — contact your agent to renew
          </div>
        )}

        {/* Actions */}
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", paddingTop:12, borderTop:"1.5px solid #f0ece3", marginTop:expiring?0:10 }}>
          <button onClick={() => onDetail(contract)} className="cc-btn"
            style={{ padding:"8px 16px", borderRadius:9, border:"1.5px solid #e4ddd0", background:"transparent", color:"#6b6248", fontSize:12.5, fontWeight:500, cursor:"pointer", fontFamily:"inherit" }}>
            View Details
          </button>
          {contract.status === "ACTIVE" && (
            <button onClick={() => onPayments(contract)} className="cc-btn"
              style={{ padding:"8px 16px", borderRadius:9, border:"none", background:"linear-gradient(135deg,#c9b87a,#b0983e)", color:"#1a1714", fontSize:12.5, fontWeight:700, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:5 }}>
              💳 Payments
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function ClientContracts() {
  const { user }         = useContext(AuthContext);
  const [contracts,      setContracts]    = useState([]);
  const [loading,        setLoading]      = useState(true);
  const [page,           setPage]         = useState(0);
  const [totalPages,     setTotalPages]   = useState(0);
  const [totalElements,  setTotalElements]= useState(0);
  const [detailTarget,   setDetailTarget] = useState(null);
  const [paymentsTarget, setPaymentsTarget] = useState(null);
  const [toast,          setToast]        = useState(null);

  const notify = useCallback((msg, type="success") => setToast({ msg, type, key:Date.now() }), []);

  const fetchContracts = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/contracts/lease/client/${user.id}?page=${page}&size=10`);
      setContracts(res.data.content||[]);
      setTotalPages(res.data.totalPages||0);
      setTotalElements(res.data.totalElements||0);
    } catch { notify("Failed to load contracts","error"); }
    finally   { setLoading(false); }
  }, [user?.id, page, notify]);

  useEffect(() => { fetchContracts(); }, [fetchContracts]);

  const stats = {
    active:   contracts.filter(c => c.status==="ACTIVE").length,
    pending:  contracts.filter(c => c.status==="PENDING_SIGNATURE").length,
    expiring: contracts.filter(c => { const d=daysUntil(c.end_date); return d!==null&&d<=30&&d>0&&c.status==="ACTIVE"; }).length,
  };

  return (
    <MainLayout role="client">
      <style>{CSS}</style>
      <div className="cc">

        {/* ── Hero ── */}
        <div style={{
          background:"linear-gradient(160deg,#141210 0%,#1e1a14 45%,#241e16 100%)",
          minHeight:320, display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center",
          padding:"40px 32px", position:"relative", overflow:"hidden",
        }}>
          <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(rgba(255,255,255,0.018) 1px,transparent 1px)",backgroundSize:"22px 22px",pointerEvents:"none"}}/>
          <div style={{position:"absolute",top:"-60px",left:"10%",width:300,height:300,borderRadius:"50%",background:"radial-gradient(circle,rgba(201,184,122,0.07) 0%,transparent 70%)",pointerEvents:"none",animation:"cc-glow 4s ease-in-out infinite"}}/>
          <div style={{position:"absolute",bottom:"-40px",right:"10%",width:240,height:240,borderRadius:"50%",background:"radial-gradient(circle,rgba(126,184,164,0.05) 0%,transparent 70%)",pointerEvents:"none",animation:"cc-glow 4s ease-in-out infinite 2s"}}/>
          <div style={{position:"absolute",top:0,left:0,right:0,height:"2px",background:"linear-gradient(90deg,transparent,#c9b87a 30%,#c9b87a 70%,transparent)"}}/>

          <div style={{ position:"relative", zIndex:1, maxWidth:700, width:"100%", textAlign:"center" }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(201,184,122,0.1)", border:"1px solid rgba(201,184,122,0.18)", borderRadius:999, padding:"4px 14px", marginBottom:14 }}>
              <span style={{ width:5, height:5, borderRadius:"50%", background:"#c9b87a", display:"inline-block", boxShadow:"0 0 6px #c9b87a" }}/>
              <span style={{ fontSize:10.5, fontWeight:600, color:"#c9b87a", letterSpacing:"1.2px", textTransform:"uppercase" }}>My Contracts</span>
            </div>

            <h1 style={{ margin:"0 0 10px", fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"clamp(28px,4vw,44px)", fontWeight:700, color:"#f5f0e8", letterSpacing:"-0.7px", lineHeight:1.1 }}>
              Lease{" "}
              <span style={{ background:"linear-gradient(90deg,#c9b87a,#e8d9a0,#c9b87a)", backgroundSize:"200% auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>Agreements</span>
            </h1>

            <p style={{ margin:"0 auto 24px", fontSize:13.5, color:"rgba(245,240,232,0.38)", fontFamily:"'DM Sans',sans-serif", lineHeight:1.6 }}>
              View and manage your active lease contracts & payment history
            </p>

            {!loading && contracts.length > 0 && (
              <div style={{ display:"flex", gap:10, maxWidth:520, margin:"0 auto", justifyContent:"center", flexWrap:"wrap" }}>
                {[
                  { label:"Total",    value:totalElements, dot:"#c9b87a" },
                  { label:"Active",   value:stats.active,  dot:"#7eb8a4" },
                  { label:"Pending",  value:stats.pending, dot:"#c9b87a" },
                  { label:"Expiring", value:stats.expiring,dot:"#d4855a" },
                ].map(stat => (
                  <div key={stat.label} style={{ background:"rgba(245,240,232,0.06)", backdropFilter:"blur(10px)", borderRadius:12, padding:"10px 18px", border:"1px solid rgba(245,240,232,0.1)", display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
                    <span style={{ fontSize:24, fontWeight:700, color:stat.dot, lineHeight:1, fontFamily:"'Cormorant Garamond',Georgia,serif" }}>{stat.value}</span>
                    <span style={{ fontSize:10, color:"rgba(245,240,232,0.35)", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.8px" }}>{stat.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Toolbar ── */}
        <div style={{ background:"#fff", borderBottom:"1.5px solid #e8e2d6", padding:"0 28px", height:46, display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, fontFamily:"'DM Sans',sans-serif", position:"sticky", top:0, zIndex:100, boxShadow:"0 1px 10px rgba(20,16,10,0.05)" }}>
          <p style={{ margin:0, fontSize:12.5, color:"#9a8c6e" }}>
            {loading ? "Loading…" : `${totalElements} contract${totalElements!==1?"s":""}`}
          </p>
          {stats.expiring > 0 && (
            <span style={{ fontSize:12, color:"#c9b87a", fontWeight:600, display:"flex", alignItems:"center", gap:5 }}>
              ⚠️ {stats.expiring} expiring soon
            </span>
          )}
        </div>

        {/* ── Content ── */}
        <div style={{ padding:"20px 24px", maxWidth:1100, margin:"0 auto" }}>

          {stats.expiring > 0 && (
            <div style={{ background:"rgba(201,184,122,0.08)", border:"1.5px solid rgba(201,184,122,0.22)", borderRadius:12, padding:"13px 18px", marginBottom:20, fontSize:13, color:"#c9b87a", display:"flex", alignItems:"center", gap:8 }}>
              ⚠️ You have <strong>{stats.expiring}</strong> contract{stats.expiring!==1?"s":""} expiring within 30 days. Contact your agent to arrange renewal.
            </div>
          )}

          {loading && <Skeleton/>}

          {!loading && contracts.length === 0 && (
            <div style={{ textAlign:"center", padding:"80px 32px", color:"#b0a890", fontFamily:"'DM Sans',sans-serif" }}>
              <div style={{ fontSize:52, marginBottom:16 }}>📄</div>
              <p style={{ fontSize:20, fontWeight:700, color:"#6b6340", marginBottom:6, fontFamily:"'Cormorant Garamond',Georgia,serif", letterSpacing:"-0.2px" }}>No lease contracts yet</p>
              <p style={{ fontSize:13, color:"#b0a890" }}>Your contracts will appear here once created by your agent.</p>
            </div>
          )}

          {!loading && contracts.length > 0 && (
            <>
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                {contracts.map((c,i) => (
                  <ContractCard key={c.id} contract={c} idx={i} onDetail={setDetailTarget} onPayments={setPaymentsTarget}/>
                ))}
              </div>
              <Pagination page={page} totalPages={totalPages} onChange={setPage}/>
            </>
          )}
        </div>
      </div>

      {detailTarget && (
        <ContractDetailModal
          contract={detailTarget} onClose={()=>setDetailTarget(null)}
          onViewPayments={(c)=>{ setDetailTarget(null); setPaymentsTarget(c); }}
        />
      )}
      {paymentsTarget && (
        <ContractPaymentsModal contract={paymentsTarget} onClose={()=>setPaymentsTarget(null)} notify={notify}/>
      )}
      {toast && <Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={()=>setToast(null)}/>}
    </MainLayout>
  );
}