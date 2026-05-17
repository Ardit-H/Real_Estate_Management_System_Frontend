// ─── Constants ────────────────────────────────────────────────────────────────
export const LEAD_TYPES     = ["SELL", "RENT", "VALUATION"];
export const LEAD_SOURCES   = ["WEBSITE", "PHONE", "EMAIL", "REFERRAL", "SOCIAL"];
export const PROPERTY_TYPES = ["APARTMENT", "HOUSE", "VILLA", "COMMERCIAL", "LAND", "OFFICE"];
export const CURRENCIES     = ["EUR", "USD", "ALL", "GBP", "CHF"];
export const PRICE_PERIODS  = ["MONTHLY", "YEARLY", "DAILY", "WEEKLY"];
 
export const TYPE_FIELDS = {
  APARTMENT:  { floor: true,  total_floors: true,  bedrooms: true,  bathrooms: true,  year_built: true,  area_sqm: true },
  HOUSE:      { floor: false, total_floors: true,  bedrooms: true,  bathrooms: true,  year_built: true,  area_sqm: true },
  VILLA:      { floor: false, total_floors: true,  bedrooms: true,  bathrooms: true,  year_built: true,  area_sqm: true },
  COMMERCIAL: { floor: true,  total_floors: true,  bedrooms: false, bathrooms: false, year_built: true,  area_sqm: true },
  LAND:       { floor: false, total_floors: false, bedrooms: false, bathrooms: false, year_built: false, area_sqm: true },
  OFFICE:     { floor: true,  total_floors: true,  bedrooms: false, bathrooms: true,  year_built: true,  area_sqm: true },
};
 
export const TYPE_LABEL = {
  SELL:      "Sell a property",
  RENT:      "Rent out a property",
  VALUATION: "Property valuation",
};
 
export const SOURCE_LABEL = {
  WEBSITE:  "Website",
  PHONE:    "Phone",
  EMAIL:    "Email",
  REFERRAL: "Referral",
  SOCIAL:   "Social Media",
};
 
export const STATUS = {
  NEW:         { strip: "#c9b87a", pill: "rgba(201,184,122,0.12)", pillBorder: "rgba(201,184,122,0.28)", color: "#a8923e", label: "New"         },
  IN_PROGRESS: { strip: "#7eb8a4", pill: "rgba(126,184,164,0.12)", pillBorder: "rgba(126,184,164,0.28)", color: "#2a8068", label: "In Progress" },
  DONE:        { strip: "#a4b07e", pill: "rgba(164,176,126,0.12)", pillBorder: "rgba(164,176,126,0.28)", color: "#5a6a38", label: "Done"        },
  REJECTED:    { strip: "#c07050", pill: "rgba(192,112,80,0.12)",  pillBorder: "rgba(192,112,80,0.28)",  color: "#8b4030", label: "Rejected"    },
};
 
export const fmtDate     = d => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
export const fmtDateTime = d => d ? new Date(d).toLocaleString("en-GB",     { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
 
export const parsePD = msg => {
  if (!msg) return null;
  try {
    const marker = "__PROPERTY_DATA__:";
    const idx    = msg.indexOf(marker);
    if (idx === -1) return null;
    return JSON.parse(msg.substring(idx + marker.length));
  } catch { return null; }
};
 
export const cleanMsg = msg => {
  if (!msg) return "";
  const idx = msg.indexOf("\n--- Property Details ---");
  if (idx !== -1) return msg.substring(0, idx).trim();
  const idx2 = msg.indexOf("\n__PROPERTY_DATA__:");
  if (idx2 !== -1) return msg.substring(0, idx2).trim();
  return msg;
};
 
export const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
  .cl * { box-sizing: border-box; }
  .cl { font-family: 'DM Sans', system-ui, sans-serif; background: #f2ede4; min-height: 100vh; }
  .cl-card { transition: transform 0.25s cubic-bezier(0.25,0.46,0.45,0.94), box-shadow 0.25s ease; }
  .cl-card:hover { transform: translateY(-4px); box-shadow: 0 20px 48px rgba(20,16,10,0.13) !important; }
  .cl-btn { transition: all 0.17s ease; }
  .cl-btn:hover:not(:disabled) { opacity: 0.86; transform: translateY(-1px); }
  .cl-in:focus { border-color: #8a7d5e !important; box-shadow: 0 0 0 3px rgba(138,125,94,0.13) !important; outline: none; }
  @keyframes cl-fade-up  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  @keyframes cl-scale-in { from{opacity:0;transform:scale(0.95) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes cl-spin     { to{transform:rotate(360deg)} }
  @keyframes cl-toast    { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes cl-card-in  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes cl-shimmer  { 0%{background-position:-800px 0} 100%{background-position:800px 0} }
`;
 
export const INP_S = {
  width: "100%", padding: "10px 13px", border: "1.5px solid #e4ddd0",
  borderRadius: 10, fontSize: 13.5, color: "#1a1714",
  background: "#fff", fontFamily: "'DM Sans',sans-serif",
  boxSizing: "border-box", outline: "none", transition: "border-color 0.2s",
};
export const SEL_S = { ...INP_S, cursor: "pointer" };
export const LBL = {
  display: "block", fontSize: 10.5, fontWeight: 600, color: "#9a8c6e",
  textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 6,
  fontFamily: "'DM Sans',sans-serif",
};
 