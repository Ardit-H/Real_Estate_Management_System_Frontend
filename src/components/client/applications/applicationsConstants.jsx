export const STATUS_CONFIG = {
  PENDING:   { bg: "#fffbeb", color: "#c9a84c", border: "#f0d878", label: "Në pritje", icon: "⏳", strip: "#c9a84c" },
  APPROVED:  { bg: "#edf5f0", color: "#2a6049", border: "#a3c9b0", label: "Aprovuar",  icon: "✅", strip: "#2a6049" },
  REJECTED:  { bg: "#fef2f2", color: "#8b4513", border: "#f5c6a0", label: "Refuzuar",  icon: "❌", strip: "#8b4513" },
  CANCELLED: { bg: "#f5f2eb", color: "#8a8469", border: "#d9d4c7", label: "Anuluar",   icon: "🚫", strip: "#a0997e" },
};
 
export const STATUS_FILTERS = [
  { value: "",          label: "Të gjitha" },
  { value: "PENDING",   label: "Në pritje"  },
  { value: "APPROVED",  label: "Aprovuar"   },
  { value: "REJECTED",  label: "Refuzuar"   },
  { value: "CANCELLED", label: "Anuluar"    },
];
 
export const fmtDate = d => d ? new Date(d).toLocaleDateString("sq-AL", { day: "2-digit", month: "long", year: "numeric" }) : "—";
export const fmtMon  = v => v != null ? `€${Number(v).toLocaleString("de-DE")}` : null;
 
export const S = {
  applyBtn: {
    width: "100%", padding: "11px", background: "#5a5f3a", color: "#fff",
    border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 700,
    cursor: "pointer", fontFamily: "'Georgia', serif",
  },
  pageBtn: (active, disabled) => ({
    padding: "7px 13px", borderRadius: "8px", border: "1.5px solid",
    borderColor: active ? "#5a5f3a" : "#d9d4c7",
    background:  active ? "#5a5f3a" : "#fff",
    color: active ? "#fff" : disabled ? "#c5bfaf" : "#5a5f3a",
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: "13px", fontWeight: active ? 700 : 400,
    fontFamily: "inherit", transition: "all 0.15s",
    display: "flex", alignItems: "center", justifyContent: "center",
    minWidth: "36px", minHeight: "36px",
  }),
};
 
// ─── Icons ────────────────────────────────────────────────────────────────────
export const CalendarIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
export const EuroIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 10h12"/><path d="M4 14h9"/><path d="M19 6a7 7 0 1 0 0 12"/>
  </svg>
);
export const HomeIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
export const ClockIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
export const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
  </svg>
);
export const ChevronLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 18-6-6 6-6"/>
  </svg>
);
export const ChevronRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6"/>
  </svg>
);
 