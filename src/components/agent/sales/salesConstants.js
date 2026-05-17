export const SALE_STATUSES   = ["ACTIVE", "SOLD", "PENDING", "CANCELLED"];
export const CONTRACT_STATUSES = ["PENDING", "COMPLETED", "CANCELLED"];
export const PAYMENT_TYPES   = ["FULL", "DEPOSIT", "INSTALLMENT", "COMMISSION","AGENT_COMMISSION", "CLIENT_BONUS"];
export const PAYMENT_METHODS = ["BANK_TRANSFER", "CASH", "CARD", "CHECK"];
export const MANUAL_PAYMENT_TYPES = ["DEPOSIT", "INSTALLMENT"];
 
export const TYPE_COLORS = {
  FULL:             { bg:"#f0ece3", color:"#4a4438" },
  DEPOSIT:          { bg:"rgba(201,184,122,0.12)", color:"#8a7230" },
  INSTALLMENT:      { bg:"#f0ece3", color:"#6b6248" },
  COMMISSION:       { bg:"rgba(126,184,164,0.12)", color:"#2a6049" },
  AGENT_COMMISSION: { bg:"rgba(201,184,122,0.12)", color:"#8a6430" },
  CLIENT_BONUS:     { bg:"rgba(164,176,126,0.12)", color:"#4a6030" },
};
 
export const fmtPrice = (v) => v != null ? `€${Number(v).toLocaleString("de-DE")}` : "—";
export const fmtDate  = (d) => d ? new Date(d).toLocaleDateString("sq-AL") : "—";
 
export const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
  .as * { box-sizing: border-box; }
  .as { font-family: 'DM Sans', system-ui, sans-serif; background: #f2ede4; min-height: 100vh; }
  .as-btn { transition: all 0.17s ease; }
  .as-btn:hover:not(:disabled) { opacity: 0.86; transform: translateY(-1px); }
  .as-in:focus { border-color: #8a7d5e !important; box-shadow: 0 0 0 3px rgba(138,125,94,0.13) !important; outline: none; }
  @keyframes as-scale-in { from{opacity:0;transform:scale(0.95) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes as-fade-up   { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes as-spin      { to{transform:rotate(360deg)} }
  @keyframes as-toast     { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes as-glow      { 0%,100%{opacity:0.07} 50%{opacity:0.14} }
`;
 
export const STATUS_BADGE_CFG = {
  ACTIVE:    { bg:"rgba(126,184,164,0.12)", color:"#2a6049",  border:"rgba(126,184,164,0.25)" },
  SOLD:      { bg:"rgba(201,184,122,0.12)", color:"#8a7230",  border:"rgba(201,184,122,0.25)" },
  PENDING:   { bg:"rgba(201,184,122,0.1)",  color:"#a8923e",  border:"rgba(201,184,122,0.2)"  },
  CANCELLED: { bg:"rgba(212,133,90,0.1)",   color:"#8b4013",  border:"rgba(212,133,90,0.2)"   },
  COMPLETED: { bg:"rgba(126,184,164,0.12)", color:"#2a6049",  border:"rgba(126,184,164,0.25)" },
  PAID:      { bg:"rgba(126,184,164,0.12)", color:"#2a6049",  border:"rgba(126,184,164,0.25)" },
  FAILED:    { bg:"rgba(212,133,90,0.1)",   color:"#8b4013",  border:"rgba(212,133,90,0.2)"   },
  REFUNDED:  { bg:"rgba(160,153,126,0.1)",  color:"#6b6248",  border:"rgba(160,153,126,0.2)"  },
};
 
export const INP_S = {width:"100%",padding:"10px 13px",border:"1.5px solid #e4ddd0",borderRadius:10,fontSize:13.5,color:"#1a1714",background:"#fff",fontFamily:"'DM Sans',sans-serif",boxSizing:"border-box",outline:"none",transition:"border-color 0.2s"};
export const SEL_S = {...INP_S,cursor:"pointer"};
export const BTN_PRI = {padding:"10px 22px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#c9b87a,#b0983e)",color:"#1a1714",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"};
export const BTN_SEC = {padding:"10px 18px",borderRadius:10,border:"1.5px solid #e4ddd0",background:"transparent",color:"#6b6248",fontWeight:500,fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"};
 
export const PGB = (active, disabled) => ({padding:"6px 14px",borderRadius:9,border:`1.5px solid ${active?"#1a1714":"#e4ddd0"}`,background:active?"#1a1714":"transparent",color:active?"#f5f0e8":disabled?"#d4ccbe":"#6b6248",cursor:disabled?"not-allowed":"pointer",fontSize:12.5,fontWeight:active?600:400,fontFamily:"'DM Sans',sans-serif",opacity:disabled?0.5:1,transition:"all 0.14s"});
 