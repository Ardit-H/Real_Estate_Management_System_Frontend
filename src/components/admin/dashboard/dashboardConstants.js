// Palette
export const C = {
  dark: "#1a1714", gold: "#c9b87a", goldL: "#e8d9a0",
  border: "#e8e2d6", surface: "#faf7f2", muted: "#9a8c6e",
  text: "#1a1714", textMut: "#b0a890", textSub: "#6b6340",
};

export const PROP_EMOJI = {
  APARTMENT:"🏢", HOUSE:"🏠", VILLA:"🏡",
  LAND:"🌿", COMMERCIAL:"🏬", OFFICE:"🏛️",
};

export const LISTING_BADGE = {
  SALE: { bg:"#eff6ff", color:"#2563eb" },
  RENT: { bg:"#f5f3ff", color:"#7c3aed" },
  BOTH: { bg:"#ecfdf5", color:"#059669" },
};

export const STATUS_BADGE = {
  AVAILABLE: { bg:"#ecfdf5", color:"#059669" },
  SOLD:      { bg:"#f0ece3", color:"#6b6340" },
  RENTED:    { bg:"#eff6ff", color:"#2563eb" },
  PENDING:   { bg:"#fffbeb", color:"#d97706" },
  INACTIVE:  { bg:"#f1f5f9", color:"#64748b" },
};

export const RISK_CFG = {
  LOW:      { color:"#059669", bg:"#ecfdf5", bar:"#059669" },
  MEDIUM:   { color:"#d97706", bg:"#fffbeb", bar:"#d97706" },
  HIGH:     { color:"#ea580c", bg:"#fff7ed", bar:"#ea580c" },
  CRITICAL: { color:"#dc2626", bg:"#fef2f2", bar:"#dc2626" },
};

// Helpers
export const fmtMoney = v => v != null ? `€${Number(v).toLocaleString("de-DE")}` : "—";
export const fmtDate  = d => d ? new Date(d).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" }) : "—";