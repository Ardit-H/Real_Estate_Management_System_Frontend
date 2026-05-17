export const CSS_CONTRACTS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
  .msc * { box-sizing: border-box; }
  .msc { font-family: 'DM Sans', system-ui, sans-serif; background: #f2ede4; min-height: 100vh; }
  .msc-card { transition: transform 0.22s cubic-bezier(0.25,0.46,0.45,0.94), box-shadow 0.22s ease; }
  .msc-card:hover { transform: translateY(-4px); box-shadow: 0 20px 48px rgba(20,16,10,0.14) !important; }
  .msc-btn { transition: all 0.15s ease; }
  .msc-btn:hover:not(:disabled) { opacity: 0.86; transform: translateY(-1px); }
  @keyframes msc-scale-in { from{opacity:0;transform:scale(0.95) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes msc-spin  { to{transform:rotate(360deg)} }
  @keyframes msc-pulse { 0%,100%{opacity:.38} 50%{opacity:.82} }
  @keyframes msc-toast { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes msc-glow  { 0%,100%{opacity:0.07} 50%{opacity:0.14} }
  @keyframes msc-card-in { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
`;
 
export const CSS_PAYMENTS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
  .msp * { box-sizing: border-box; }
  .msp { font-family: 'DM Sans', system-ui, sans-serif; background: #f2ede4; min-height: 100vh; }
  .msp-card { background: #fff; border-radius: 14px; border: 1.5px solid #ece6da; box-shadow: 0 2px 16px rgba(20,16,10,0.07); }
  .msp-btn { transition: all 0.15s ease; }
  .msp-btn:hover:not(:disabled) { opacity: 0.86; transform: translateY(-1px); }
  @keyframes msp-spin   { to{transform:rotate(360deg)} }
  @keyframes msp-pulse  { 0%,100%{opacity:.38} 50%{opacity:.82} }
  @keyframes msp-toast  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes msp-glow   { 0%,100%{opacity:0.07} 50%{opacity:0.14} }
  @keyframes msp-row-in { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
`;
 
export const fmtMoney = (v, cur = "EUR") =>
  v != null ? new Intl.NumberFormat("de-DE", { style: "currency", currency: cur, maximumFractionDigits: 0 }).format(Number(v)) : "—";
 
export const fmtDate = d =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";
 
export const daysUntil = d => {
  if (!d) return null;
  return Math.ceil((new Date(d) - new Date()) / 86400000);
};
 
export const isOverdue = p => {
  if (!p.due_date || p.status !== "PENDING") return false;
  return new Date(p.due_date) < new Date();
};
 
export const CONTRACT_STATUS_CFG = {
  PENDING:           { bg: "rgba(201,184,122,0.10)", color: "#a8923e", border: "rgba(201,184,122,0.28)", label: "Pending",           icon: "⏳", strip: "#c9b87a" },
  PENDING_SIGNATURE: { bg: "rgba(201,184,122,0.10)", color: "#a8923e", border: "rgba(201,184,122,0.28)", label: "Pending Signature", icon: "✍️", strip: "#c9b87a" },
  ACTIVE:            { bg: "rgba(126,184,164,0.12)", color: "#2a6049", border: "rgba(126,184,164,0.28)", label: "Active",            icon: "✅", strip: "#7eb8a4" },
  COMPLETED:         { bg: "rgba(126,184,164,0.12)", color: "#2a6049", border: "rgba(126,184,164,0.28)", label: "Completed",         icon: "🏆", strip: "#5aaa80" },
  CANCELLED:         { bg: "rgba(160,153,126,0.10)", color: "#6b6248", border: "rgba(160,153,126,0.20)", label: "Cancelled",         icon: "🚫", strip: "#9a8c6e" },
};
export const getContractStatus = s => CONTRACT_STATUS_CFG[s] || { bg: "#f0ece3", color: "#6b6248", border: "#e0d8c8", label: s, icon: "📄", strip: "#b0a890" };
 
export const PAYMENT_TYPE_COLORS = {
  FULL:             { bg: "rgba(201,184,122,0.15)", color: "#7a6220",  border: "rgba(201,184,122,0.35)", label: "Full Payment"     },
  DEPOSIT:          { bg: "rgba(126,184,164,0.15)", color: "#1e5040",  border: "rgba(126,184,164,0.35)", label: "Deposit"          },
  INSTALLMENT:      { bg: "rgba(100,120,180,0.10)", color: "#3a4a8a",  border: "rgba(100,120,180,0.28)", label: "Installment"      },
  COMMISSION:       { bg: "rgba(126,184,164,0.12)", color: "#2a6049",  border: "rgba(126,184,164,0.28)", label: "Commission"       },
  AGENT_COMMISSION: { bg: "rgba(201,184,122,0.12)", color: "#8a6430",  border: "rgba(201,184,122,0.28)", label: "Agent Commission" },
  CLIENT_BONUS:     { bg: "rgba(164,176,126,0.12)", color: "#4a6030",  border: "rgba(164,176,126,0.28)", label: "Client Bonus"     },
};
export const getType = t => PAYMENT_TYPE_COLORS[t] || { bg: "#f0ece3", color: "#6b6248", border: "#e0d8c8", label: t || "—" };
 
export const PAYMENT_STATUS_CFG = {
  PENDING:  { bg: "rgba(201,184,122,0.12)", color: "#8a7230", border: "rgba(201,184,122,0.35)", label: "Pending",  strip: "#c9b87a" },
  PAID:     { bg: "rgba(126,184,164,0.14)", color: "#1e5040", border: "rgba(126,184,164,0.35)", label: "Paid",     strip: "#7eb8a4" },
  FAILED:   { bg: "rgba(212,133,90,0.12)",  color: "#7a3010", border: "rgba(212,133,90,0.30)",  label: "Failed",   strip: "#d4855a" },
  REFUNDED: { bg: "rgba(160,153,126,0.12)", color: "#5a5238", border: "rgba(160,153,126,0.28)", label: "Refunded", strip: "#9a8c6e" },
};
export const getPaymentStatus = s => PAYMENT_STATUS_CFG[s] || { bg: "#f0ece3", color: "#6b6248", border: "#e0d8c8", label: s, strip: "#b0a890" };
 
// Shared hero dot config
export const PGB = (active, disabled) => ({
  padding: "7px 13px", borderRadius: 9,
  border: `1.5px solid ${active ? "#1a1714" : "#e4ddd0"}`,
  background: active ? "#1a1714" : "transparent",
  color: active ? "#f5f0e8" : disabled ? "#d4ccbe" : "#6b6248",
  cursor: disabled ? "not-allowed" : "pointer",
  fontSize: 13, fontWeight: active ? 600 : 400,
  fontFamily: "'DM Sans',sans-serif",
  opacity: disabled ? 0.5 : 1, transition: "all 0.14s",
});
 