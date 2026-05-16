// src/components/admin/payments/paymentsHelpers.js

export const PAYMENT_TYPES   = ["RENT","DEPOSIT","LATE_FEE","MAINTENANCE","AGENT_COMMISSION","CLIENT_BONUS"];
export const PAYMENT_METHODS = ["BANK_TRANSFER","CASH","CARD","CHECK"];
export const CURRENCIES      = ["EUR","USD","GBP","CHF","ALL","MKD"];
export const ALL_STATUSES    = ["PENDING","PAID","OVERDUE","FAILED","REFUNDED"];

export const fmtMoney = (v, cur = "EUR") =>
  v != null ? `${cur || "EUR"} ${Number(v).toLocaleString("de-DE", { minimumFractionDigits: 2 })}` : "—";

export const fmtDate = d =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export const today = () => new Date().toISOString().split("T")[0];

export const isOverdue = p =>
  p.status === "OVERDUE" ||
  (p.status === "PENDING" && p.due_date &&
    new Date(p.due_date).toISOString().split("T")[0] < today());