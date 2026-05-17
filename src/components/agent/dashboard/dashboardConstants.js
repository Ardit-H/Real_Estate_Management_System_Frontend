// Palette
export const C = {
  bg:      "#f2ede4",
  surface: "#faf7f2",
  dark:    "#1a1714",
  gold:    "#c9b87a",
  goldL:   "#e8d9a0",
  green:   "#8a7d5e",
  muted:   "#9a8c6e",
  border:  "#e8e2d6",
  text:    "#1a1714",
  textSub: "#6b6340",
  textMut: "#b0a890",
};

// Helpers
export const fmtMoney = (v) => v != null ? `€${Number(v).toLocaleString("de-DE")}` : "—";
export const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";
export const fmtRelative = (d) => {
  if (!d) return "—";
  const diff  = Date.now() - new Date(d).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

// Status configs
export const LEAD_STATUS = {
  NEW:         { color: "#d97706", bg: "#fffbeb", dot: "#d97706" },
  IN_PROGRESS: { color: "#2563eb", bg: "#eff6ff", dot: "#2563eb" },
  DONE:        { color: "#059669", bg: "#ecfdf5", dot: "#059669" },
  REJECTED:    { color: "#dc2626", bg: "#fef2f2", dot: "#dc2626" },
  DECLINED:    { color: "#64748b", bg: "#f1f5f9", dot: "#64748b" },
};

export const CONTRACT_STATUS = {
  PENDING_SIGNATURE: { color: "#d97706", bg: "#fffbeb" },
  ACTIVE:            { color: "#059669", bg: "#ecfdf5" },
  ENDED:             { color: "#64748b", bg: "#f1f5f9" },
  CANCELLED:         { color: "#dc2626", bg: "#fef2f2" },
};

export const APP_STATUS = {
  PENDING:   { color: "#d97706", bg: "#fffbeb" },
  APPROVED:  { color: "#059669", bg: "#ecfdf5" },
  REJECTED:  { color: "#dc2626", bg: "#fef2f2" },
  CANCELLED: { color: "#64748b", bg: "#f1f5f9" },
};

export const PROP_EMOJI = {
  APARTMENT: "🏢", HOUSE: "🏠", VILLA: "🏡",
  LAND: "🌿", COMMERCIAL: "🏬", OFFICE: "🏛️",
};

export const RISK_CFG = {
  LOW:      { color: "#059669", bg: "#ecfdf5", bar: "#059669" },
  MEDIUM:   { color: "#d97706", bg: "#fffbeb", bar: "#d97706" },
  HIGH:     { color: "#ea580c", bg: "#fff7ed", bar: "#ea580c" },
  CRITICAL: { color: "#dc2626", bg: "#fef2f2", bar: "#dc2626" },
};