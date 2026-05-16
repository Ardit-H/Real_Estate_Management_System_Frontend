// ─── Palette — same as AgentDashboard ────────────────────────────────────────
export const C = {
  bg:      "#f2ede4",
  surface: "#faf7f2",
  dark:    "#1a1714",
  gold:    "#c9b87a",
  goldL:   "#e8d9a0",
  muted:   "#9a8c6e",
  border:  "#e8e2d6",
  text:    "#1a1714",
  textSub: "#6b6340",
  textMut: "#b0a890",
};

export const APP_STATUS_CFG = {
  PENDING:   { color: "#d97706", bg: "#fffbeb", dot: "#d97706" },
  APPROVED:  { color: "#059669", bg: "#ecfdf5", dot: "#059669" },
  REJECTED:  { color: "#dc2626", bg: "#fef2f2", dot: "#dc2626" },
  CANCELLED: { color: "#64748b", bg: "#f1f5f9", dot: "#64748b" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
export const fmtDate  = (d) => d ? new Date(d).toLocaleDateString("sq-AL") : "—";
export const fmtDT    = (d) => d ? new Date(d).toLocaleString("sq-AL", {
  day: "2-digit", month: "2-digit", year: "numeric",
  hour: "2-digit", minute: "2-digit" }) : "—";
export const fmtMoney = (v) => v != null ? `€${Number(v).toLocaleString("de-DE")}` : "—";

// ─── Validim ──────────────────────────────────────────────────────────────────
export function validateListingId(listingId, notify) {
  if (!listingId || listingId.toString().trim() === "") {
    notify("Shkruaj Listing ID", "error"); return false;
  }
  if (isNaN(Number(listingId)) || Number(listingId) <= 0) {
    notify("Listing ID duhet të jetë numër pozitiv", "error"); return false;
  }
  return true;
}

export function validateRejectionReason(reason, notify) {
  if (reason && reason.length > 500) {
    notify("Arsyeja e refuzimit nuk mund të kalojë 500 karaktere", "error"); return false;
  }
  return true;
}