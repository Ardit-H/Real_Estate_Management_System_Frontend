// src/components/admin/contracts/contractsHelpers.js

export const CURRENCIES = ["EUR","USD","GBP","CHF","ALL","MKD"];

export const STATUS_LABELS = {
  ACTIVE:            "Active",
  PENDING_SIGNATURE: "Pending Signature",
  ENDED:             "Ended",
  CANCELLED:         "Cancelled",
};

export const fmtMoney = (v, cur = "EUR") =>
  v != null ? `${cur} ${Number(v).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—";

export const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export const today = () => new Date().toISOString().split("T")[0];