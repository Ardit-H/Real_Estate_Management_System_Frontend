export const SALE_STATUSES     = ["ACTIVE", "SOLD", "PENDING", "CANCELLED"];
export const CONTRACT_STATUSES = ["PENDING", "COMPLETED", "CANCELLED"];
export const PAYMENT_TYPES     = ["FULL", "DEPOSIT", "INSTALLMENT", "COMMISSION"];
export const PAYMENT_METHODS   = ["BANK_TRANSFER", "CASH", "CARD", "CHECK", "ONLINE"];
export const CURRENCIES        = ["EUR", "USD", "ALL", "GBP", "CHF"];
 
export const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
  .as-wrap * { box-sizing: border-box; }
  .as-wrap { font-family: 'DM Sans', system-ui, sans-serif; }
  .as-row:hover td { background: rgba(138,125,94,0.06) !important; }
  .as-btn:hover { opacity: 0.82; transform: translateY(-1px); }
  .as-btn { transition: all 0.14s ease; }
  .as-tab:hover { color: #c9b87a !important; }
  .as-pg:hover:not(:disabled) { background: rgba(201,184,122,0.1) !important; border-color: #c9b87a !important; color: #c9b87a !important; }
  @keyframes as-spin  { to { transform: rotate(360deg); } }
  @keyframes as-scale { from{opacity:0;transform:scale(0.97)} to{opacity:1;transform:scale(1)} }
  @keyframes as-toast { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes as-pulse { 0%,100%{opacity:.35} 50%{opacity:.75} }
`;
 
export const fmtPrice = (v) => v != null ? `€${Number(v).toLocaleString("de-DE")}` : "—";
export const fmtDate  = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" }) : "—";
export const fmtDateTime = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—";
 
export const BADGE_MAP = {
  ACTIVE:    { bg: "rgba(29,158,117,0.12)",  color: "#1D9E75",  border: "rgba(29,158,117,0.25)"  },
  SOLD:      { bg: "rgba(55,138,221,0.12)",  color: "#378ADD",  border: "rgba(55,138,221,0.25)"  },
  PENDING:   { bg: "rgba(201,184,122,0.15)", color: "#c9b87a",  border: "rgba(201,184,122,0.3)"  },
  CANCELLED: { bg: "rgba(216,90,48,0.12)",   color: "#D85A30",  border: "rgba(216,90,48,0.25)"   },
  COMPLETED: { bg: "rgba(29,158,117,0.12)",  color: "#1D9E75",  border: "rgba(29,158,117,0.25)"  },
  PAID:      { bg: "rgba(29,158,117,0.12)",  color: "#1D9E75",  border: "rgba(29,158,117,0.25)"  },
  FAILED:    { bg: "rgba(216,90,48,0.12)",   color: "#D85A30",  border: "rgba(216,90,48,0.25)"   },
  REFUNDED:  { bg: "rgba(136,135,128,0.12)", color: "#888780",  border: "rgba(136,135,128,0.25)" },
};
 
export const inputSt    = { width:"100%", padding:"9px 12px", fontSize:13, border:"1.5px solid rgba(138,125,94,0.25)", borderRadius:9, background:"#fff", color:"#1a1714", outline:"none", boxSizing:"border-box", fontFamily:"'DM Sans',sans-serif" };
export const selectSt   = { ...inputSt, cursor:"pointer" };
export const textareaSt = { ...inputSt, resize:"vertical", lineHeight:1.6 };
export const primaryBtn  = { fontSize:13, padding:"8px 16px", borderRadius:10, border:"none", background:"linear-gradient(135deg,#c9b87a 0%,#b0983e 100%)", color:"#1a1714", cursor:"pointer", fontWeight:700, whiteSpace:"nowrap", fontFamily:"'DM Sans',sans-serif" };
export const secondaryBtn = { fontSize:13, padding:"8px 15px", borderRadius:10, border:"1.5px solid rgba(138,125,94,0.25)", background:"transparent", color:"#6b6248", cursor:"pointer", whiteSpace:"nowrap", fontFamily:"'DM Sans',sans-serif" };
export const dangerBtn   = { fontSize:13, padding:"8px 16px", borderRadius:10, border:"none", background:"#D85A30", color:"#fff", cursor:"pointer", fontWeight:700, fontFamily:"'DM Sans',sans-serif" };
export const btnSm = (bg, color, border) => ({ fontSize:11, padding:"4px 9px", borderRadius:7, border:`1px solid ${border}`, background:bg, color, cursor:"pointer", whiteSpace:"nowrap", fontWeight:600, fontFamily:"'DM Sans',sans-serif" });
export const pillGold   = { background:"rgba(201,184,122,0.12)", color:"#c9b87a", border:"1px solid rgba(201,184,122,0.25)", padding:"3px 10px", borderRadius:999, fontSize:12, fontWeight:600 };
 
export const card = { background:"#fff", borderRadius:14, border:"1px solid rgba(138,125,94,0.15)", overflow:"hidden", boxShadow:"0 2px 20px rgba(20,16,10,0.06)" };
export const cardHeader = { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 20px", borderBottom:"1px solid rgba(138,125,94,0.12)", flexWrap:"wrap", gap:10 };
export const cardTitle  = { fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:18, fontWeight:700, margin:0, color:"#1a1714", letterSpacing:"-0.2px" };
export const TH = { padding:"10px 12px", textAlign:"left", fontWeight:600, fontSize:10.5, color:"#8a7d5e", borderBottom:"1px solid rgba(138,125,94,0.15)", background:"rgba(138,125,94,0.04)", whiteSpace:"nowrap", textTransform:"uppercase", letterSpacing:"0.5px" };
export const TD = { padding:"10px 12px", borderBottom:"1px solid rgba(138,125,94,0.08)", fontSize:13, color:"#1a1714", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" };
export const pgBtn = (disabled) => ({ fontSize:13, padding:"5px 12px", borderRadius:9, border:"1.5px solid rgba(138,125,94,0.2)", background:"transparent", color: disabled ? "rgba(138,125,94,0.3)" : "#8a7d5e", cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.5 : 1, fontFamily:"'DM Sans',sans-serif" });
 