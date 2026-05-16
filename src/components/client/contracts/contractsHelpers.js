// Constants
export const STATUS_CFG = {
  ACTIVE:            { label:"Active",              dot:"#7eb8a4", strip:"#7eb8a4", pill:"rgba(126,184,164,0.13)", pillBorder:"rgba(126,184,164,0.28)", color:"#2a6049" },
  ENDED:             { label:"Ended",               dot:"#a0997e", strip:"#a0997e", pill:"rgba(160,153,126,0.1)",  pillBorder:"rgba(160,153,126,0.22)", color:"#6b6248" },
  CANCELLED:         { label:"Cancelled",           dot:"#d4855a", strip:"#d4855a", pill:"rgba(212,133,90,0.1)",   pillBorder:"rgba(212,133,90,0.25)",  color:"#8b4513" },
  PENDING_SIGNATURE: { label:"Pending Signature",   dot:"#c9b87a", strip:"#c9b87a", pill:"rgba(201,184,122,0.12)", pillBorder:"rgba(201,184,122,0.28)", color:"#9a7a30" },
};

export const PAY_STATUS_CFG = {
  PENDING:  { bg:"rgba(201,184,122,0.1)",  color:"#c9b87a", border:"rgba(201,184,122,0.25)" },
  PAID:     { bg:"rgba(126,184,164,0.1)",  color:"#2a6049", border:"rgba(126,184,164,0.25)" },
  FAILED:   { bg:"rgba(212,133,90,0.1)",   color:"#8b4513", border:"rgba(212,133,90,0.25)"  },
  OVERDUE:  { bg:"rgba(212,133,90,0.12)",  color:"#8b3a1c", border:"rgba(212,133,90,0.3)"   },
  REFUNDED: { bg:"rgba(160,153,126,0.1)",  color:"#6b6248", border:"rgba(160,153,126,0.22)" },
};

// Helpers
export const fmtDate  = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" }) : "—";
export const fmtDT    = (d) => d ? new Date(d).toLocaleString("en-GB",  { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" }) : "—";
export const fmtMoney = (v) => v != null ? `€${Number(v).toLocaleString("de-DE")}` : "—";

export function daysUntil(dateStr) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
}

// Global CSS
export const CSS = `
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