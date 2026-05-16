// Constants, helpers, and validators
export const PAYMENT_STATUSES = ["PENDING", "PAID", "FAILED", "OVERDUE", "REFUNDED"];
export const PAYMENT_TYPES    = ["RENT", "DEPOSIT", "LATE_FEE", "MAINTENANCE"];
export const PAYMENT_METHODS  = ["BANK_TRANSFER", "CASH", "CARD", "CHECK"];
export const CURRENCIES       = ["EUR", "USD", "ALL"];

export const STATUS_STYLE = {
  PENDING:  { bg: "#fffbeb", color: "#d97706" },
  PAID:     { bg: "#ecfdf5", color: "#059669" },
  FAILED:   { bg: "#fef2f2", color: "#dc2626" },
  OVERDUE:  { bg: "#fff1f2", color: "#be123c" },
  REFUNDED: { bg: "#f5f3ff", color: "#7c3aed" },
};

export const fmtDate = (d) => d ? new Date(d).toLocaleDateString("sq-AL") : "—";
export const fmtMoney = (v) => v != null ? `€${Number(v).toLocaleString("de-DE")}` : "—";
export const today = () => new Date().toISOString().split("T")[0];

export function isOverdue(payment) {
  if (!payment.due_date || payment.status !== "PENDING") return false;
  return new Date(payment.due_date) < new Date();
}

// Validim për CreatePaymentModal
export function validatePaymentForm(form, notify) {
  if (!form.contract_id || isNaN(Number(form.contract_id)) || Number(form.contract_id) <= 0) {
    notify("Contract ID duhet të jetë numër pozitiv", "error"); return false;
  }
  if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
    notify("Shuma duhet të jetë më e madhe se 0", "error"); return false;
  }
  if (Number(form.amount) > 999999999) {
    notify("Shuma është shumë e madhe", "error"); return false;
  }
  if (!form.due_date) {
    notify("Due date është e detyrueshme", "error"); return false;
  }
  if (form.notes && form.notes.length > 500) {
    notify("Shënimet nuk mund të kalojnë 500 karaktere", "error"); return false;
  }
  return true;
}

// Validim për MarkPaidModal
export function validateMarkPaid(form, notify) {
  if (!form.paid_date) {
    notify("Data e pagesës është e detyrueshme", "error"); return false;
  }
  if (form.paid_date > today()) {
    notify("Data e pagesës nuk mund të jetë në të ardhmen", "error"); return false;
  }
  if (form.transaction_ref && form.transaction_ref.length > 100) {
    notify("Transaction Ref nuk mund të kalojë 100 karaktere", "error"); return false;
  }
  return true;
}