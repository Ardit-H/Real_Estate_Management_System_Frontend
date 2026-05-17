export const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
 
  .mc * { box-sizing: border-box; }
  .mc { font-family: 'DM Sans', system-ui, sans-serif; background: #f2ede4; min-height: 100vh; }
 
  .mc-card { background: #faf7f2; border: 1.5px solid #e8e2d6; border-radius: 14px; box-shadow: 0 2px 16px rgba(20,16,10,0.06); overflow: hidden; }
 
  .mc-btn { transition: all 0.17s ease; cursor: pointer; font-family: 'DM Sans', sans-serif; border: none; }
  .mc-btn:hover { opacity: 0.85; transform: translateY(-1px); }
 
  @keyframes mc-fade-up  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  @keyframes mc-pulse    { 0%,100%{opacity:.4} 50%{opacity:.85} }
  @keyframes mc-toast    { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
 
  .mc-section { animation: mc-fade-up 0.5s ease 0.15s both; }
  .mc-row:hover { background: #f5f0e8 !important; }
 
  .mc-skeleton { background: #ede9df; border-radius: 10px; animation: mc-pulse 1.5s ease infinite; }
 
  .mc-search-wrap { display: flex; align-items: center; gap: 8px; background: #f0ece3; border: 1.5px solid #e0dbd0; border-radius: 10px; padding: 0 12px; height: 38px; transition: border-color 0.17s; }
  .mc-search-wrap:focus-within { border-color: #c9b87a; background: #faf7f2; }
  .mc-search-input { flex: 1; border: none; background: transparent; outline: none; font-size: 13px; color: #1a1714; font-family: 'DM Sans', sans-serif; }
  .mc-search-input::placeholder { color: #b0a890; }
 
  .mc-tab { padding: 7px 16px; border-radius: 9px; font-size: 12.5px; font-weight: 500; cursor: pointer; transition: all 0.15s; font-family: 'DM Sans', sans-serif; border: 1.5px solid transparent; }
  .mc-tab.active { background: #1a1714; color: #f5f0e8; border-color: #1a1714; }
  .mc-tab:not(.active) { background: #faf7f2; color: #6b6340; border-color: #e8e2d6; }
  .mc-tab:not(.active):hover { background: #f0ece3; border-color: #c9b87a; color: #1a1714; }
 
  .mc-modal-overlay { position: fixed; inset: 0; z-index: 8000; background: rgba(20,16,10,0.55); display: flex; align-items: center; justify-content: center; padding: 20px; }
  .mc-modal { background: #faf7f2; border: 1.5px solid #e8e2d6; border-radius: 18px; box-shadow: 0 24px 60px rgba(0,0,0,0.28); width: 100%; max-width: 500px; max-height: 82vh; overflow-y: auto; animation: mc-fade-up 0.22s ease; }
 
  .mc-avatar-circle { width: 40px; height: 40px; border-radius: 10px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; letter-spacing: 0.3px; }
`;
 
export const C = {
  bg:"#f2ede4", surface:"#faf7f2", dark:"#1a1714",
  gold:"#c9b87a", goldL:"#e8d9a0",
  muted:"#9a8c6e", border:"#e8e2d6",
  text:"#1a1714", textSub:"#6b6340", textMut:"#b0a890",
};
 
export const AVATAR_COLORS = [
  { bg:"rgba(201,184,122,0.18)", color:"#7a6a3a" },
  { bg:"rgba(94,164,164,0.18)",  color:"#2a6464" },
  { bg:"rgba(160,126,184,0.18)", color:"#5a3a7a" },
  { bg:"rgba(90,170,128,0.18)",  color:"#2a6a50" },
  { bg:"rgba(200,100,100,0.18)", color:"#8a3030" },
  { bg:"rgba(100,140,200,0.18)", color:"#2a4080" },
];
 
export const LEAD_STATUS_CFG = {
  NEW:         { color:"#d97706", bg:"#fffbeb" },
  IN_PROGRESS: { color:"#2563eb", bg:"#eff6ff" },
  DONE:        { color:"#059669", bg:"#ecfdf5" },
  REJECTED:    { color:"#dc2626", bg:"#fef2f2" },
  DECLINED:    { color:"#64748b", bg:"#f1f5f9" },
};
 
export const CONTRACT_STATUS_CFG = {
  PENDING_SIGNATURE: { color:"#d97706", bg:"#fffbeb" },
  ACTIVE:            { color:"#059669", bg:"#ecfdf5" },
  ENDED:             { color:"#64748b", bg:"#f1f5f9" },
  CANCELLED:         { color:"#dc2626", bg:"#fef2f2" },
};
 
export function getInitials(name) {
  if (!name) return "?";
  return name.trim().split(" ").filter(Boolean).slice(0,2).map(w=>w[0].toUpperCase()).join("");
}
export function getAvatarColor(id) {
  return AVATAR_COLORS[(id || 0) % AVATAR_COLORS.length];
}
export const fmtDate  = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" }) : "—";
export const fmtMoney = (v) => v != null ? `€${Number(v).toLocaleString("de-DE")}` : "—";
 