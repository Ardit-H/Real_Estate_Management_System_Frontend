export const INP_S = {width:"100%",padding:"10px 13px",border:"1.5px solid #e4ddd0",borderRadius:10,fontSize:13.5,color:"#1a1714",background:"#fff",fontFamily:"'DM Sans',sans-serif",boxSizing:"border-box",outline:"none",transition:"border-color 0.2s"};
export const SEL_S = {...INP_S,cursor:"pointer"};
export const BTN_PRI = {padding:"10px 22px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#c9b87a,#b0983e)",color:"#1a1714",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"};
export const BTN_SEC = {padding:"10px 18px",borderRadius:10,border:"1.5px solid #e4ddd0",background:"transparent",color:"#6b6248",fontWeight:500,fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"};
 
export const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
 
  .sa * { box-sizing: border-box; }
  .sa { font-family: 'DM Sans', system-ui, sans-serif; background: #f2ede4; min-height: 100vh; }
 
  .sa-card { background: #faf7f2; border: 1.5px solid #e8e2d6; border-radius: 14px; box-shadow: 0 2px 16px rgba(20,16,10,0.06); overflow: hidden; }
 
  .sa-btn { transition: all 0.17s ease; cursor: pointer; font-family: 'DM Sans', sans-serif; border: none; }
  .sa-btn:hover { opacity: 0.85; transform: translateY(-1px); }
  .sa-btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }
 
  @keyframes sa-fade-up  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  @keyframes sa-pulse    { 0%,100%{opacity:.4} 50%{opacity:.85} }
  @keyframes sa-toast    { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes sa-spin     { to{transform:rotate(360deg)} }
  @keyframes sa-modal-in { from{opacity:0;transform:translateY(14px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes sa-row-in   { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
 
  .sa-section  { animation: sa-fade-up 0.5s ease 0.15s both; }
  .sa-row:hover { background: #f5f0e8 !important; }
  .sa-row { animation: sa-row-in 0.3s ease both; }
 
  .sa-skeleton { background: #ede9df; border-radius: 10px; animation: sa-pulse 1.5s ease infinite; }
 
  .sa-stat { animation: sa-fade-up 0.4s ease both; }
  .sa-stat:nth-child(1) { animation-delay: 0.05s; }
  .sa-stat:nth-child(2) { animation-delay: 0.10s; }
  .sa-stat:nth-child(3) { animation-delay: 0.15s; }
  .sa-stat:nth-child(4) { animation-delay: 0.20s; }
  .sa-stat:nth-child(5) { animation-delay: 0.25s; }
 
  .sa-table { width: 100%; border-collapse: collapse; }
  .sa-table th { text-align: left; font-size: 10px; font-weight: 600; color: #b0a890; text-transform: uppercase; letter-spacing: 0.9px; padding: 10px 16px; background: #fdf9f4; border-bottom: 1px solid #e8e2d6; white-space: nowrap; }
  .sa-table td { padding: 13px 16px; font-size: 13px; color: #1a1714; border-bottom: 1px solid #e8e2d6; vertical-align: middle; }
  .sa-table tr:last-child td { border-bottom: none; }
  .sa-table-wrap { overflow-x: auto; }
 
  .sa-input { padding: 9px 13px; border: 1.5px solid #e0dbd0; border-radius: 10px; font-size: 13.5px; font-family: 'DM Sans', sans-serif; color: #1a1714; background: #f5f0e8; outline: none; transition: border-color 0.17s, box-shadow 0.17s, background 0.17s; }
  .sa-input:focus { border-color: #c9b87a; background: #faf7f2; box-shadow: 0 0 0 3px rgba(201,184,122,0.12); }
  .sa-input::placeholder { color: #b0a890; }
 
  .sa-select { padding: 9px 13px; border: 1.5px solid #e0dbd0; border-radius: 10px; font-size: 13.5px; font-family: 'DM Sans', sans-serif; color: #1a1714; background: #f5f0e8; outline: none; cursor: pointer; transition: border-color 0.17s, box-shadow 0.17s, background 0.17s; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23b0a890' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 32px; }
  .sa-select:focus { border-color: #c9b87a; background-color: #faf7f2; box-shadow: 0 0 0 3px rgba(201,184,122,0.12); }
 
  .sa-textarea { width: 100%; padding: 10px 13px; border: 1.5px solid #e0dbd0; border-radius: 10px; font-size: 13.5px; font-family: 'DM Sans', sans-serif; color: #1a1714; background: #f5f0e8; outline: none; resize: vertical; transition: border-color 0.17s, box-shadow 0.17s, background 0.17s; }
  .sa-textarea:focus { border-color: #c9b87a; background: #faf7f2; box-shadow: 0 0 0 3px rgba(201,184,122,0.12); }
  .sa-textarea::placeholder { color: #b0a890; }
 
  .sa-char-count { font-size: 11px; color: #b0a890; text-align: right; margin-top: 4px; }
 
  .sa-tab { padding: 10px 20px; font-size: 13px; font-weight: 500; border: none; background: none; cursor: pointer; font-family: 'DM Sans', sans-serif; color: #9a8c6e; border-bottom: 2px solid transparent; transition: all 0.16s ease; }
  .sa-tab:hover { color: #1a1714; }
  .sa-tab.active { color: #1a1714; border-bottom-color: #c9b87a; font-weight: 600; }
 
  .sa-chip { display: inline-flex; align-items: center; gap: 5px; padding: 4px 11px; border-radius: 20px; font-size: 11px; font-weight: 600; white-space: nowrap; }
`;
 
export const C = {
  bg: "#f2ede4", surface: "#faf7f2", dark: "#1a1714",
  gold: "#c9b87a", goldL: "#e8d9a0",
  muted: "#9a8c6e", border: "#e8e2d6",
  text: "#1a1714", textSub: "#6b6340", textMut: "#b0a890",
};
 
export const STATUS_CFG = {
  PENDING:   { color: "#d97706", bg: "#fffbeb", dot: "#d97706" },
  APPROVED:  { color: "#059669", bg: "#ecfdf5", dot: "#059669" },
  REJECTED:  { color: "#dc2626", bg: "#fef2f2", dot: "#dc2626" },
  CANCELLED: { color: "#64748b", bg: "#f1f5f9", dot: "#64748b" },
};
 
export const fmtDate  = (d) => d ? new Date(d).toLocaleDateString("sq-AL") : "—";
export const fmtDT    = (d) => d ? new Date(d).toLocaleString("sq-AL", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
export const fmtMoney = (v, c = "EUR") => v != null ? new Intl.NumberFormat("de-DE", { style: "currency", currency: c, maximumFractionDigits: 0 }).format(v) : "—";
 
export function validateInput({ mode, listingId, propertyId }, notify) {
  if (mode === "listing") {
    if (!listingId || !listingId.toString().trim()) { notify("Enter Listing ID", "error"); return false; }
    if (isNaN(Number(listingId)) || Number(listingId) <= 0) { notify("Listing ID must be a positive number", "error"); return false; }
  }
  if (mode === "property") {
    if (!propertyId || !propertyId.toString().trim()) { notify("Enter Property ID", "error"); return false; }
    if (isNaN(Number(propertyId)) || Number(propertyId) <= 0) { notify("Property ID must be a positive number", "error"); return false; }
  }
  return true;
}
 
export function validateRejection(reason, notify) {
  if (reason && reason.length > 500) { notify("Reason cannot exceed 500 characters", "error"); return false; }
  return true;
}
 