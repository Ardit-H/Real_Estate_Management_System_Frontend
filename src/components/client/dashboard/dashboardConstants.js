export const BASE_URL    = import.meta.env.VITE_API_URL || "http://localhost:8080";
export const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%23ede9df' width='400' height='300'/%3E%3Cpath d='M160 195 L200 135 L240 195Z' fill='%23d4cfc3'/%3E%3Crect x='180' y='165' width='40' height='30' fill='%23c4bfb0'/%3E%3C/svg%3E";

export const fmtPrice  = (v) => v != null ? `€${Number(v).toLocaleString("de-DE")}` : "—";
export const fmtDate   = (d) => d ? new Date(d).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : "—";
export const buildImg  = (src) => src ? (src.startsWith("http")?src:BASE_URL+src) : null;
export const daysUntil = (d) => d ? Math.ceil((new Date(d)-new Date())/(1000*60*60*24)) : null;

export const isPaymentOverdue = (p) => {
  if (p.status === "OVERDUE") return true;
  if (p.status !== "PENDING") return false;
  if (!p.due_date) return false;
  const due   = new Date(p.due_date).toISOString().split("T")[0];
  const today = new Date().toISOString().split("T")[0];
  return due < today;
};

export const TYPE_ICON  = { SELL:"🏷️", BUY:"🏠", RENT:"🔑", RENT_SEEKING:"🔎", VALUATION:"📊" };
export const TYPE_EMOJI = { APARTMENT:"🏢", HOUSE:"🏠", VILLA:"🏡", COMMERCIAL:"🏬", LAND:"🌿", OFFICE:"🏛️" };

export const LEAD_STATUS_CFG = {
  NEW:         { dot:"#c9b87a", bg:"rgba(201,184,122,0.12)", border:"rgba(201,184,122,0.28)", color:"#9a7a30", label:"New"         },
  IN_PROGRESS: { dot:"#a4b07e", bg:"rgba(164,176,126,0.12)", border:"rgba(164,176,126,0.28)", color:"#4a5a30", label:"In Progress" },
  DONE:        { dot:"#7eb8a4", bg:"rgba(126,184,164,0.12)", border:"rgba(126,184,164,0.28)", color:"#2a6049", label:"Done"        },
  REJECTED:    { dot:"#d4855a", bg:"rgba(212,133,90,0.12)",  border:"rgba(212,133,90,0.28)",  color:"#8b4513", label:"Rejected"    },
};

export const CONTRACT_STATUS_CFG = {
  ACTIVE:            { dot:"#7eb8a4", color:"#2a6049", bg:"rgba(126,184,164,0.12)", border:"rgba(126,184,164,0.28)" },
  PENDING_SIGNATURE: { dot:"#c9b87a", color:"#9a7a30", bg:"rgba(201,184,122,0.12)", border:"rgba(201,184,122,0.28)" },
  ENDED:             { dot:"#a0997e", color:"#6b6248", bg:"rgba(160,153,126,0.1)",  border:"rgba(160,153,126,0.22)" },
  CANCELLED:         { dot:"#d4855a", color:"#8b4513", bg:"rgba(212,133,90,0.12)",  border:"rgba(212,133,90,0.28)"  },
};

export const PAY_STATUS_CFG = {
  PENDING:  { dot:"#c9b87a", color:"#9a7a30", bg:"rgba(201,184,122,0.1)",  border:"rgba(201,184,122,0.22)", label:"Pending"  },
  PAID:     { dot:"#7eb8a4", color:"#2a6049", bg:"rgba(126,184,164,0.1)",  border:"rgba(126,184,164,0.22)", label:"Paid"     },
  OVERDUE:  { dot:"#d4855a", color:"#8b4513", bg:"rgba(212,133,90,0.12)",  border:"rgba(212,133,90,0.28)",  label:"Overdue"  },
  FAILED:   { dot:"#d4855a", color:"#8b4513", bg:"rgba(212,133,90,0.1)",   border:"rgba(212,133,90,0.22)",  label:"Failed"   },
  REFUNDED: { dot:"#a0997e", color:"#6b6248", bg:"rgba(160,153,126,0.1)",  border:"rgba(160,153,126,0.22)", label:"Refunded" },
};

export const STATUS_CFG_APP = {
  PENDING:   { dot:"#c9b87a", bg:"rgba(201,184,122,0.12)", border:"rgba(201,184,122,0.28)", color:"#9a7a30", label:"Pending"   },
  APPROVED:  { dot:"#7eb8a4", bg:"rgba(126,184,164,0.12)", border:"rgba(126,184,164,0.28)", color:"#2a6049", label:"Approved"  },
  REJECTED:  { dot:"#d4855a", bg:"rgba(212,133,90,0.12)",  border:"rgba(212,133,90,0.28)",  color:"#8b4513", label:"Rejected"  },
  CANCELLED: { dot:"#a0997e", bg:"rgba(160,153,126,0.1)",  border:"rgba(160,153,126,0.22)", color:"#6b6248", label:"Cancelled" },
};