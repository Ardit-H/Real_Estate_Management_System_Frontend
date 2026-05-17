export const LEAD_STATUSES = ["NEW", "IN_PROGRESS", "DONE", "REJECTED"];
export const PROP_MARKER   = "__PROPERTY_DATA__:";
 
export const TYPE_ICON   = { SELL:"🏷️", BUY:"🏠", RENT:"🔑", RENT_SEEKING:"🔎", VALUATION:"📊" };
export const SOURCE_ICON = { WEBSITE:"🌐", PHONE:"📞", EMAIL:"✉️", REFERRAL:"👥", SOCIAL:"📱" };
 
export const fmtDate     = (d) => d ? new Date(d).toLocaleDateString("sq-AL") : "—";
export const fmtDateTime = (d) => d ? new Date(d).toLocaleString("sq-AL", { day:"2-digit", month:"2-digit", year:"numeric", hour:"2-digit", minute:"2-digit" }) : "—";
 
export function parsePropertyData(message) {
  if (!message) return null;
  const idx = message.indexOf(PROP_MARKER);
  if (idx === -1) return null;
  try { return JSON.parse(message.substring(idx + PROP_MARKER.length)); }
  catch { return null; }
}
 
export function cleanMessage(message) {
  if (!message) return "";
  const idx = message.indexOf("\n--- Të dhënat e pronës ---");
  if (idx !== -1) return message.substring(0, idx).trim();
  const idx2 = message.indexOf(PROP_MARKER);
  if (idx2 !== -1) return message.substring(0, message.lastIndexOf("\n", idx2)).trim();
  return message;
}
 
export const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
  .al * { box-sizing: border-box; }
  .al { font-family: 'DM Sans', system-ui, sans-serif; background: #f2ede4; min-height: 100vh; }
  .al-btn { transition: all 0.17s ease; }
  .al-btn:hover:not(:disabled) { opacity: 0.86; transform: translateY(-1px); }
  .al-in:focus { border-color: #8a7d5e !important; box-shadow: 0 0 0 3px rgba(138,125,94,0.13) !important; outline: none; }
  @keyframes al-scale-in { from{opacity:0;transform:scale(0.95) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes al-spin     { to{transform:rotate(360deg)} }
  @keyframes al-toast    { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes al-glow     { 0%,100%{opacity:0.07} 50%{opacity:0.14} }
`;
 
export const STATUS_CFG = {
  NEW:         { strip:"#c9b87a", pill:"rgba(201,184,122,0.10)", pillBorder:"rgba(201,184,122,0.25)", color:"#a8923e", label:"New"         },
  IN_PROGRESS: { strip:"#7eb8a4", pill:"rgba(126,184,164,0.10)", pillBorder:"rgba(126,184,164,0.25)", color:"#2a6049", label:"In Progress" },
  DONE:        { strip:"#a4b07e", pill:"rgba(164,176,126,0.10)", pillBorder:"rgba(164,176,126,0.25)", color:"#5a6a38", label:"Done"        },
  REJECTED:    { strip:"#c07050", pill:"rgba(192,112,80,0.10)",  pillBorder:"rgba(192,112,80,0.25)",  color:"#8b4030", label:"Rejected"    },
  DECLINED:    { strip:"#c07050", pill:"rgba(192,112,80,0.08)",  pillBorder:"rgba(192,112,80,0.20)",  color:"#8b4030", label:"Declined"    },
};
 
export const INP_S = { width:"100%", padding:"10px 13px", border:"1.5px solid #e4ddd0", borderRadius:10, fontSize:13.5, color:"#1a1714", background:"#fff", fontFamily:"'DM Sans',sans-serif", boxSizing:"border-box", outline:"none", transition:"border-color 0.2s" };
export const SEL_S = { ...INP_S, cursor:"pointer" };
export const BTN_PRI = { padding:"10px 22px", borderRadius:10, border:"none", background:"linear-gradient(135deg,#c9b87a,#b0983e)", color:"#1a1714", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" };
export const BTN_SEC = { padding:"10px 18px", borderRadius:10, border:"1.5px solid #e4ddd0", background:"transparent", color:"#6b6248", fontWeight:500, fontSize:13, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" };
 