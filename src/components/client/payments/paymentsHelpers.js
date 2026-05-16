// Constants
export const PAY_STATUS_CFG = {
  PENDING:  { bg:"rgba(201,184,122,0.1)",  color:"#c9b87a", border:"rgba(201,184,122,0.25)", label:"Pending"  },
  PAID:     { bg:"rgba(126,184,164,0.1)",  color:"#2a6049", border:"rgba(126,184,164,0.25)", label:"Paid"     },
  FAILED:   { bg:"rgba(212,133,90,0.1)",   color:"#8b4513", border:"rgba(212,133,90,0.25)",  label:"Failed"   },
  OVERDUE:  { bg:"rgba(212,133,90,0.12)",  color:"#8b3a1c", border:"rgba(212,133,90,0.3)",   label:"Overdue"  },
  REFUNDED: { bg:"rgba(160,153,126,0.1)",  color:"#6b6248", border:"rgba(160,153,126,0.22)", label:"Refunded" },
};

export const CONTRACT_STATUS_CFG = {
  ACTIVE:            { label:"Active",            dot:"#7eb8a4", pill:"rgba(126,184,164,0.13)", pillBorder:"rgba(126,184,164,0.28)", color:"#2a6049"  },
  ENDED:             { label:"Ended",             dot:"#a0997e", pill:"rgba(160,153,126,0.1)",  pillBorder:"rgba(160,153,126,0.22)", color:"#6b6248"  },
  CANCELLED:         { label:"Cancelled",         dot:"#d4855a", pill:"rgba(212,133,90,0.1)",   pillBorder:"rgba(212,133,90,0.25)",  color:"#8b4513"  },
  PENDING_SIGNATURE: { label:"Pending Signature", dot:"#c9b87a", pill:"rgba(201,184,122,0.12)", pillBorder:"rgba(201,184,122,0.28)", color:"#9a7a30"  },
};

export const TYPE_ICON = { RENT:"💳", DEPOSIT:"🔒", LATE_FEE:"🔴", REFUND:"↩️" };

// Helpers
export const fmtDate  = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" }) : "—";
export const fmtMoney = (v) => v != null ? `€${Number(v).toLocaleString("de-DE")}` : "—";

export function isOverdue(p) {
  if (!p.due_date || p.status !== "PENDING") return false;
  return new Date(p.due_date) < new Date();
}

// Global CSS
export const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

  .cp * { box-sizing: border-box; }
  .cp { font-family: 'DM Sans', system-ui, sans-serif; background: #f2ede4; min-height: 100vh; }

  .cp-card { transition: transform 0.22s ease, box-shadow 0.22s ease; }
  .cp-card:hover { transform: translateY(-4px); box-shadow: 0 20px 44px rgba(20,16,10,0.12) !important; }

  .cp-pay-row { transition: box-shadow 0.15s ease, background 0.15s ease; }
  .cp-pay-row:hover { box-shadow: 0 4px 18px rgba(20,16,10,0.08) !important; background: #faf7f2 !important; }

  .cp-btn { transition: all 0.17s ease; }
  .cp-btn:hover { opacity: 0.85; transform: translateY(-1px); }

  .cp-chip { transition: all 0.14s ease; }

  @keyframes cp-fade-up  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  @keyframes cp-shimmer  { 0%{background-position:-800px 0} 100%{background-position:800px 0} }
  @keyframes cp-pulse    { 0%,100%{opacity:.38} 50%{opacity:.82} }
  @keyframes cp-spin     { to{transform:rotate(360deg)} }
  @keyframes cp-toast    { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes cp-glow     { 0%,100%{opacity:0.07} 50%{opacity:0.14} }
  @keyframes cp-card-in  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
`;