// src/components/admin/rentals/rentalsHelpers.js

export const RENTAL_STATUSES = ["ACTIVE", "INACTIVE", "EXPIRED", "RENTED"];
export const PRICE_PERIODS   = ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"];
export const CURRENCIES      = ["EUR", "USD", "GBP", "CHF", "ALL", "MKD"];

export const fmtPrice = (v) =>
  v != null ? `€${Number(v).toLocaleString("de-DE")}` : "—";

export const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" }) : "—";

export const fmtDateTime = (d) =>
  d ? new Date(d).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—";

export const TH = { padding: "10px 12px", textAlign: "left", fontWeight: 600, fontSize: 10.5, color: "#8a7d5e", borderBottom: "1px solid rgba(138,125,94,0.15)", background: "rgba(138,125,94,0.04)", whiteSpace: "nowrap", textTransform: "uppercase", letterSpacing: "0.5px" };
export const TD = { padding: "10px 12px", borderBottom: "1px solid rgba(138,125,94,0.08)", fontSize: 13, color: "#1a1714", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" };

export const primaryBtn   = { fontSize: 13, padding: "8px 16px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#c9b87a 0%,#b0983e 100%)", color: "#1a1714", cursor: "pointer", fontWeight: 700, whiteSpace: "nowrap", fontFamily: "'DM Sans', sans-serif" };
export const secondaryBtn = { fontSize: 13, padding: "8px 15px", borderRadius: 10, border: "1.5px solid rgba(138,125,94,0.25)", background: "transparent", color: "#6b6248", cursor: "pointer", whiteSpace: "nowrap", fontFamily: "'DM Sans', sans-serif" };
export const dangerBtn    = { fontSize: 13, padding: "8px 16px", borderRadius: 10, border: "none", background: "#D85A30", color: "#fff", cursor: "pointer", fontWeight: 700, fontFamily: "'DM Sans', sans-serif" };
export const btnSm        = (bg, color, border) => ({ fontSize: 11, padding: "4px 9px", borderRadius: 7, border: `1px solid ${border}`, background: bg, color, cursor: "pointer", whiteSpace: "nowrap", fontWeight: 600, fontFamily: "'DM Sans', sans-serif" });
export const pillGold     = { background: "rgba(201,184,122,0.12)", color: "#c9b87a", border: "1px solid rgba(201,184,122,0.25)", padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600 };

export const inputSt    = { width: "100%", padding: "9px 12px", fontSize: 13, border: "1.5px solid rgba(138,125,94,0.25)", borderRadius: 9, background: "#fff", color: "#1a1714", outline: "none", boxSizing: "border-box", fontFamily: "'DM Sans', sans-serif" };
export const selectSt   = { ...inputSt, cursor: "pointer" };
export const textareaSt = { ...inputSt, resize: "vertical", lineHeight: 1.6 };