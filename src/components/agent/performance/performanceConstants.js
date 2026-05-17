export const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
 
  .mp * { box-sizing: border-box; }
  .mp { font-family: 'DM Sans', system-ui, sans-serif; background: #f2ede4; min-height: 100vh; }
 
  .mp-card { background: #faf7f2; border: 1.5px solid #e8e2d6; border-radius: 14px; box-shadow: 0 2px 16px rgba(20,16,10,0.06); overflow: hidden; }
 
  .mp-btn { transition: all 0.17s ease; cursor: pointer; font-family: 'DM Sans', sans-serif; border: none; }
  .mp-btn:hover { opacity: 0.85; transform: translateY(-1px); }
 
  @keyframes mp-fade-up  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  @keyframes mp-spin     { to{transform:rotate(360deg)} }
  @keyframes mp-pulse    { 0%,100%{opacity:.4} 50%{opacity:.85} }
  @keyframes mp-toast    { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
 
  .mp-stat { animation: mp-fade-up 0.4s ease both; }
  .mp-stat:nth-child(1) { animation-delay: 0.05s; }
  .mp-stat:nth-child(2) { animation-delay: 0.10s; }
  .mp-stat:nth-child(3) { animation-delay: 0.15s; }
  .mp-stat:nth-child(4) { animation-delay: 0.20s; }
  .mp-stat:nth-child(5) { animation-delay: 0.25s; }
  .mp-stat:nth-child(6) { animation-delay: 0.30s; }
 
  .mp-section { animation: mp-fade-up 0.5s ease 0.2s both; }
  .mp-row:hover { background: #f5f0e8 !important; }
 
  .mp-skeleton { background: #ede9df; border-radius: 10px; animation: mp-pulse 1.5s ease infinite; }
 
  .mp-bar-wrap { background: #ede9df; border-radius: 99px; overflow: hidden; height: 8px; }
  .mp-bar-fill { height: 100%; border-radius: 99px; transition: width 0.6s cubic-bezier(0.4,0,0.2,1); }
 
  .mp-progress-ring { transition: stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1); }
`;
 
export const C = {
  bg:"#f2ede4", surface:"#faf7f2", dark:"#1a1714",
  gold:"#c9b87a", goldL:"#e8d9a0",
  muted:"#9a8c6e", border:"#e8e2d6",
  text:"#1a1714", textSub:"#6b6340", textMut:"#b0a890",
};
 
export const fmtMoney = (v) => v != null ? `€${Number(v).toLocaleString("de-DE")}` : "—";
export const fmtDate  = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" }) : "—";
 
export const LEAD_STATUS_COLOR = {
  NEW:"#d97706", IN_PROGRESS:"#2563eb", DONE:"#059669", REJECTED:"#dc2626", DECLINED:"#64748b",
};
export const CONTRACT_STATUS_COLOR = {
  PENDING_SIGNATURE:"#d97706", ACTIVE:"#059669", ENDED:"#64748b", CANCELLED:"#dc2626",
};
export const PAYMENT_STATUS_COLOR = {
  PENDING:"#d97706", PAID:"#059669", OVERDUE:"#dc2626", FAILED:"#dc2626", REFUNDED:"#64748b",
};
 