export const CATEGORIES = ["PLUMBING","ELECTRICAL","HVAC","STRUCTURAL","CLEANING","OTHER"];
export const PRIORITIES = ["LOW","MEDIUM","HIGH","URGENT"];
export const STATUSES   = ["OPEN","IN_PROGRESS","COMPLETED","CANCELLED"];

export const CAT_EMOJI = {
  PLUMBING: "🔧",
  ELECTRICAL: "⚡",
  HVAC: "❄️",
  STRUCTURAL: "🏗️",
  CLEANING: "🧹",
  OTHER: "🔩",
};

export const PRI_CFG = {
  LOW:    { color: "#059669", bg: "#ecfdf5", dot: "#059669", label: "Low" },
  MEDIUM: { color: "#d97706", bg: "#fffbeb", dot: "#d97706", label: "Medium" },
  HIGH:   { color: "#ea580c", bg: "#fff7ed", dot: "#ea580c", label: "High" },
  URGENT: { color: "#dc2626", bg: "#fef2f2", dot: "#dc2626", label: "Urgent" },
};

export const STA_CFG = {
  OPEN:        { color: "#2563eb", bg: "#eff6ff", label: "Open" },
  IN_PROGRESS: { color: "#d97706", bg: "#fffbeb", label: "In Progress" },
  COMPLETED:   { color: "#059669", bg: "#ecfdf5", label: "Completed" },
  CANCELLED:   { color: "#64748b", bg: "#f1f5f9", label: "Cancelled" },
};

export const C = {
  dark:    "#1a1714",
  gold:    "#c9b87a",
  goldL:   "#e8d9a0",
  border:  "#e8e2d6",
  surface: "#faf7f2",
  muted:   "#9a8c6e",
  text:    "#1a1714",
  textMut: "#b0a890",
  textSub: "#6b6340",
};

export const fmtMoney = v => v != null ? `€${Number(v).toLocaleString("de-DE")}` : "—";
export const fmtDate  = d => d ? new Date(d).toLocaleDateString("en-GB") : "—";
export const fmtDT    = d => d ? new Date(d).toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";