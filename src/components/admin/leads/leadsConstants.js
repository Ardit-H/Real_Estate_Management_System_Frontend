export const LEAD_STATUSES = ["NEW", "IN_PROGRESS", "DONE", "REJECTED"];
 
export const STATUS_STYLE = {
  NEW:         { bg: "#eff6ff", color: "#2563eb", label: "New"         },
  IN_PROGRESS: { bg: "#f5f3ff", color: "#7c3aed", label: "In Progress" },
  DONE:        { bg: "#ecfdf5", color: "#059669", label: "Done"        },
  REJECTED:    { bg: "#fef2f2", color: "#dc2626", label: "Rejected"    },
  DECLINED:    { bg: "#fff7ed", color: "#ea580c", label: "Declined"    },
};
 
export const TYPE_ICON   = { SELL: "🏷️", BUY: "🏠", RENT: "🔑", RENT_SEEKING: "🔎", VALUATION: "📊" };
export const SOURCE_ICON = { WEBSITE: "🌐", PHONE: "📞", EMAIL: "✉️", REFERRAL: "👥", SOCIAL: "📱" };
 
export const fmtDate = (d) => d ? new Date(d).toLocaleDateString("sq-AL") : "—";
export const fmtDateTime = (d) => d ? new Date(d).toLocaleString("sq-AL", {
  day: "2-digit", month: "2-digit", year: "numeric",
  hour: "2-digit", minute: "2-digit",
}) : "—";
 
export const C = {
  dark: "#1a1714", gold: "#c9b87a", goldL: "#e8d9a0",
  border: "#e8e2d6", surface: "#faf7f2", muted: "#9a8c6e",
  text: "#1a1714", textMut: "#b0a890", textSub: "#6b6340",
};
 
export const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
  .al *{box-sizing:border-box}
  .al{font-family:'DM Sans',system-ui,sans-serif;background:#f2ede4;min-height:100vh}
  .al-btn{transition:all .17s ease;cursor:pointer;font-family:'DM Sans',sans-serif;border:none}
  .al-btn:hover{opacity:.85;transform:translateY(-1px)}
  .al-card{background:#faf7f2;border:1.5px solid #e8e2d6;border-radius:14px;box-shadow:0 2px 16px rgba(20,16,10,.06);overflow:hidden}
  .al-row{transition:background .15s;cursor:pointer}
  .al-row:hover{background:#f5f0e8!important}
  .al-tab-btn{transition:all .17s;cursor:pointer;font-family:'DM Sans',sans-serif;border:none;background:none;display:flex;align-items:center;gap:5px}
  @keyframes al-fade-up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes al-fade-in{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:scale(1)}}
  @keyframes al-spin{to{transform:rotate(360deg)}}
  .al-card{animation:al-fade-up .35s ease both}
  .al-modal-inner{animation:al-fade-in .2s ease}
`;
 
