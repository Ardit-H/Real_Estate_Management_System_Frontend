// ── Constants ─────────────────────────────────────────────────────────────────
export const LISTING_STATUSES = ["ACTIVE", "INACTIVE", "EXPIRED", "RENTED"];
export const PRICE_PERIODS    = ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"];
export const CURRENCIES       = ["EUR", "USD", "ALL"];

// ── Formatues ─────────────────────────────────────────────────────────────────
export const fmtPrice = (v, cur = "EUR", period = "MONTHLY") =>
  v != null ? `€${Number(v).toLocaleString("de-DE")} / ${period.toLowerCase()}` : "—";

export const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("sq-AL") : "—";

export const fmtMoney = (v) =>
  v != null ? `€${Number(v).toLocaleString("de-DE")}` : "—";

// ── Validim ───────────────────────────────────────────────────────────────────
export function validateListingForm(form, notify) {
  if (!form.property_id || isNaN(Number(form.property_id)) || Number(form.property_id) <= 0) {
    notify("Property ID duhet të jetë numër pozitiv", "error"); return false;
  }
  if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) {
    notify("Çmimi duhet të jetë më i madh se 0", "error"); return false;
  }
  if (Number(form.price) > 999999999) {
    notify("Çmimi është shumë i madh", "error"); return false;
  }
  if (form.deposit && (isNaN(Number(form.deposit)) || Number(form.deposit) < 0)) {
    notify("Depozita nuk mund të jetë negative", "error"); return false;
  }
  if (form.min_lease_months && Number(form.min_lease_months) < 1) {
    notify("Minimumi i muajve duhet të jetë së paku 1", "error"); return false;
  }
  if (form.min_lease_months && Number(form.min_lease_months) > 120) {
    notify("Minimumi i muajve nuk mund të kalojë 120", "error"); return false;
  }
  if (form.available_from && form.available_until && new Date(form.available_until) <= new Date(form.available_from)) {
    notify("Data 'deri' duhet të jetë pas datës 'nga'", "error"); return false;
  }
  if (form.title && form.title.length > 255) {
    notify("Titulli nuk mund të kalojë 255 karaktere", "error"); return false;
  }
  if (form.description && form.description.length > 2000) {
    notify("Përshkrimi nuk mund të kalojë 2000 karaktere", "error"); return false;
  }
  return true;
}

// ── Konfigurim statusesh ──────────────────────────────────────────────────────
export const STATUS_CFG = {
  ACTIVE:    { bg: "rgba(126,184,164,0.12)", color: "#2a6049",  border: "rgba(126,184,164,0.25)" },
  INACTIVE:  { bg: "#f0ece3",                color: "#6b6248",  border: "#e0d8c8" },
  EXPIRED:   { bg: "rgba(201,184,122,0.1)",  color: "#a8923e",  border: "rgba(201,184,122,0.22)" },
  RENTED:    { bg: "rgba(201,184,122,0.12)", color: "#8a7230",  border: "rgba(201,184,122,0.25)" },
  PENDING:   { bg: "rgba(201,184,122,0.1)",  color: "#a8923e",  border: "rgba(201,184,122,0.2)"  },
  APPROVED:  { bg: "rgba(126,184,164,0.12)", color: "#2a6049",  border: "rgba(126,184,164,0.25)" },
  REJECTED:  { bg: "rgba(212,133,90,0.1)",   color: "#8b4013",  border: "rgba(212,133,90,0.2)"   },
  CANCELLED: { bg: "#f0ece3",                color: "#6b6248",  border: "#e0d8c8" },
};

// ── Stilet e përbashkëta inline ───────────────────────────────────────────────
export const INP_S = {
  width: "100%", padding: "10px 13px", border: "1.5px solid #e4ddd0",
  borderRadius: 10, fontSize: 13.5, color: "#1a1714", background: "#fff",
  fontFamily: "'DM Sans',sans-serif", boxSizing: "border-box",
  outline: "none", transition: "border-color 0.2s",
};

export const SEL_S = { ...INP_S, cursor: "pointer" };

export const BTN_PRI = {
  padding: "10px 22px", borderRadius: 10, border: "none",
  background: "linear-gradient(135deg,#c9b87a,#b0983e)",
  color: "#1a1714", fontSize: 13, fontWeight: 700,
  cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
};

export const BTN_SEC = {
  padding: "10px 18px", borderRadius: 10, border: "1.5px solid #e4ddd0",
  background: "transparent", color: "#6b6248", fontWeight: 500,
  fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
};

export const PGB = (active, disabled) => ({
  padding: "6px 14px", borderRadius: 9,
  border: `1.5px solid ${active ? "#1a1714" : "#e4ddd0"}`,
  background: active ? "#1a1714" : "transparent",
  color: active ? "#f5f0e8" : disabled ? "#d4ccbe" : "#6b6248",
  cursor: disabled ? "not-allowed" : "pointer",
  fontSize: 12.5, fontFamily: "'DM Sans',sans-serif",
  opacity: disabled ? 0.5 : 1, transition: "all 0.14s",
});