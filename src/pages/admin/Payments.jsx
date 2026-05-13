import { useState, useEffect, useCallback } from "react";
import MainLayout from "../../components/layout/Layout";
import api from "../../api/axios";

// ─── Constants ────────────────────────────────────────────────────────────────
const PAYMENT_STATUSES = ["PENDING", "PAID", "FAILED", "OVERDUE", "REFUNDED"];
const PAYMENT_TYPES    = ["RENT", "DEPOSIT", "LATE_FEE", "MAINTENANCE", "AGENT_COMMISSION", "CLIENT_BONUS"];
const PAYMENT_METHODS  = ["BANK_TRANSFER", "CASH", "CARD", "CHECK", "ONLINE"];
const CURRENCIES       = ["EUR", "USD", "GBP", "CHF", "ALL", "MKD"];

// ─── Global CSS ───────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
  .ap-wrap * { box-sizing: border-box; }
  .ap-wrap { font-family: 'DM Sans', system-ui, sans-serif; }
  .ap-row:hover td { background: rgba(138,125,94,0.06) !important; }
  .ap-btn { transition: all 0.14s ease; }
  .ap-btn:hover { opacity: 0.82; transform: translateY(-1px); }
  .ap-pg:hover:not(:disabled) { background: rgba(201,184,122,0.1) !important; border-color: #c9b87a !important; color: #c9b87a !important; }
  @keyframes ap-spin  { to { transform: rotate(360deg); } }
  @keyframes ap-scale { from{opacity:0;transform:scale(0.97)} to{opacity:1;transform:scale(1)} }
  @keyframes ap-toast { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes ap-glow  { 0%,100%{opacity:0.07} 50%{opacity:0.14} }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtPrice = (v, cur = "EUR") =>
  v != null ? `€${Number(v).toLocaleString("de-DE")}` : "—";

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" }) : "—";

const fmtDateTime = (d) =>
  d ? new Date(d).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—";

// ─── Badge ────────────────────────────────────────────────────────────────────
const BADGE_CFG = {
  PENDING:  { bg: "rgba(201,184,122,0.12)", color: "#c9b87a",  border: "rgba(201,184,122,0.3)"  },
  PAID:     { bg: "rgba(29,158,117,0.12)",  color: "#1D9E75",  border: "rgba(29,158,117,0.25)"  },
  FAILED:   { bg: "rgba(216,90,48,0.12)",   color: "#D85A30",  border: "rgba(216,90,48,0.25)"   },
  OVERDUE:  { bg: "rgba(216,90,48,0.12)",   color: "#D85A30",  border: "rgba(216,90,48,0.25)"   },
  REFUNDED: { bg: "rgba(136,135,128,0.12)", color: "#888780",  border: "rgba(136,135,128,0.25)" },
};

function Badge({ label }) {
  const s = BADGE_CFG[label] || { bg: "rgba(136,135,128,0.12)", color: "#888780", border: "rgba(136,135,128,0.25)" };
  return (
    <span style={{
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      fontSize: 10.5, fontWeight: 600, letterSpacing: "0.4px",
      padding: "3px 10px", borderRadius: 999,
      whiteSpace: "nowrap", display: "inline-block",
      fontFamily: "'DM Sans', sans-serif",
    }}>{label ?? "—"}</span>
  );
}

// ─── Shared modal ─────────────────────────────────────────────────────────────
function Modal({ title, onClose, children, maxWidth = 520 }) {
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(8,6,4,0.82)", backdropFilter: "blur(10px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      fontFamily: "'DM Sans', sans-serif",
    }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{
        width: "100%", maxWidth, background: "#faf7f2", borderRadius: 18,
        boxShadow: "0 44px 100px rgba(0,0,0,0.55)", maxHeight: "90vh", overflowY: "auto",
        animation: "ap-scale 0.22s ease", overflow: "hidden",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 24px", borderBottom: "1px solid rgba(138,125,94,0.15)",
          position: "sticky", top: 0, background: "#faf7f2", zIndex: 1,
        }}>
          <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 700, fontSize: 17, color: "#1a1714" }}>{title}</span>
          <button onClick={onClose} style={{
            width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center",
            border: "1px solid rgba(138,125,94,0.2)", background: "rgba(138,125,94,0.08)",
            color: "#8a7d5e", cursor: "pointer", fontSize: 15, borderRadius: 8,
          }}>✕</button>
        </div>
        <div style={{ padding: "22px 24px", overflowY: "auto", maxHeight: "calc(90vh - 60px)" }}>{children}</div>
      </div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type = "success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{
      position: "fixed", bottom: 26, right: 26, zIndex: 9999,
      background: "#1a1714", color: type === "error" ? "#f09090" : "#90c8a8",
      padding: "11px 18px", borderRadius: 12, fontSize: 13, fontWeight: 400,
      boxShadow: "0 10px 36px rgba(0,0,0,0.32)",
      border: `1px solid ${type === "error" ? "rgba(240,128,128,0.15)" : "rgba(144,200,168,0.15)"}`,
      maxWidth: 320, fontFamily: "'DM Sans', sans-serif",
      animation: "ap-toast 0.2s ease", display: "flex", alignItems: "center", gap: 8,
    }}>
      <span style={{ fontSize: 14 }}>{type === "error" ? "⚠️" : "✅"}</span>
      {msg}
    </div>
  );
}

// ─── Table styles ─────────────────────────────────────────────────────────────
const TH = {
  padding: "10px 12px", textAlign: "left", fontWeight: 600, fontSize: 10.5,
  color: "#8a7d5e", borderBottom: "1px solid rgba(138,125,94,0.15)",
  background: "rgba(138,125,94,0.04)", whiteSpace: "nowrap",
  textTransform: "uppercase", letterSpacing: "0.5px",
};
const TD = {
  padding: "10px 12px", borderBottom: "1px solid rgba(138,125,94,0.08)",
  fontSize: 13, color: "#1a1714", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
};

// ─── Input styles ─────────────────────────────────────────────────────────────
const inputSt = {
  width: "100%", padding: "9px 12px", fontSize: 13,
  border: "1.5px solid rgba(138,125,94,0.25)", borderRadius: 9,
  background: "#fff", color: "#1a1714", outline: "none",
  boxSizing: "border-box", fontFamily: "'DM Sans', sans-serif",
};
const selectSt = { ...inputSt, cursor: "pointer" };

const btnSm = (bg, color, border) => ({
  fontSize: 11, padding: "4px 9px", borderRadius: 7,
  border: `1px solid ${border}`, background: bg, color,
  cursor: "pointer", whiteSpace: "nowrap", fontWeight: 600,
  fontFamily: "'DM Sans', sans-serif",
});

const primaryBtn = {
  fontSize: 13, padding: "8px 16px", borderRadius: 10, border: "none",
  background: "linear-gradient(135deg,#c9b87a 0%,#b0983e 100%)",
  color: "#1a1714", cursor: "pointer", fontWeight: 700, whiteSpace: "nowrap",
  fontFamily: "'DM Sans', sans-serif",
};
const secondaryBtn = {
  fontSize: 13, padding: "8px 15px", borderRadius: 10,
  border: "1.5px solid rgba(138,125,94,0.25)", background: "transparent",
  color: "#6b6248", cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
};
const dangerBtn = {
  fontSize: 13, padding: "8px 16px", borderRadius: 10, border: "none",
  background: "#D85A30", color: "#fff", cursor: "pointer", fontWeight: 700,
  fontFamily: "'DM Sans', sans-serif",
};

function Field({ label, children, required }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 10.5, fontWeight: 600, color: "#8a7d5e", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>
        {label}{required && <span style={{ color: "#D85A30", marginLeft: 2 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

function Row2({ children }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>{children}</div>;
}

function Empty({ icon, text }) {
  return (
    <div style={{ textAlign: "center", padding: "52px 20px", color: "#b0a890", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ fontSize: 34, marginBottom: 12 }}>{icon}</div>
      <p style={{ fontSize: 14 }}>{text}</p>
    </div>
  );
}

function Loader() {
  return (
    <div style={{ textAlign: "center", padding: "48px 0" }}>
      <div style={{ width: 26, height: 26, margin: "0 auto", border: "2px solid rgba(138,125,94,0.15)", borderTop: "2px solid #8a7d5e", borderRadius: "50%", animation: "ap-spin .8s linear infinite" }} />
    </div>
  );
}

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const pgBtn = (disabled) => ({
    fontSize: 13, padding: "5px 12px", borderRadius: 9,
    border: "1.5px solid rgba(138,125,94,0.2)", background: "transparent",
    color: disabled ? "rgba(138,125,94,0.3)" : "#8a7d5e",
    cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.5 : 1,
    fontFamily: "'DM Sans', sans-serif",
  });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end", padding: "14px 16px 8px" }}>
      <button disabled={page === 0} onClick={() => onChange(page - 1)} className="ap-pg" style={pgBtn(page === 0)}>← Prev</button>
      <span style={{ fontSize: 13, color: "#8a7d5e", padding: "0 6px", fontFamily: "'DM Sans', sans-serif" }}>{page + 1} / {totalPages}</span>
      <button disabled={page >= totalPages - 1} onClick={() => onChange(page + 1)} className="ap-pg" style={pgBtn(page >= totalPages - 1)}>Next →</button>
    </div>
  );
}

// ─── Payment Detail Modal ─────────────────────────────────────────────────────
function PaymentDetailModal({ payment: p, onClose }) {
  return (
    <Modal title={`Payment #${p.id} — Detaje`} onClose={onClose}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 20px", marginBottom: 16 }}>
        {[
          ["ID", `#${p.id}`], ["Contract", `#${p.contract_id}`],
          ["Amount", fmtPrice(p.amount, p.currency)], ["Type", p.payment_type || "—"],
          ["Status", "badge"], ["Due Date", fmtDate(p.due_date)],
          ["Paid Date", fmtDate(p.paid_date)], ["Method", p.payment_method || "—"],
          ["Transaction", p.transaction_ref || "—"],
          ["Recipient", p.recipient_name || (p.recipient_id ? `#${p.recipient_id}` : "Company")],
          ["Created", fmtDateTime(p.created_at)],
        ].map(([label, val]) => (
          <div key={label}>
            <p style={{ fontSize: 10, color: "#b0a890", textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 3px" }}>{label}</p>
            {val === "badge" ? <Badge label={p.status} /> : <p style={{ fontSize: 14, fontWeight: 500, margin: 0, color: "#1a1714", wordBreak: "break-all", fontFamily: "'Cormorant Garamond', serif" }}>{val}</p>}
          </div>
        ))}
      </div>
      {p.notes && (
        <div>
          <p style={{ fontSize: 10, color: "#b0a890", textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 4px" }}>Notes</p>
          <div style={{ background: "rgba(138,125,94,0.05)", border: "1px solid rgba(138,125,94,0.12)", borderRadius: 9, padding: "10px 14px", fontSize: 13, color: "#4a4438", lineHeight: 1.6 }}>{p.notes}</div>
        </div>
      )}
    </Modal>
  );
}

// ─── Mark Paid Modal ──────────────────────────────────────────────────────────
function MarkPaidModal({ payment, onClose, onSuccess, notify }) {
  const [form, setForm] = useState({
    payment_method: payment.payment_method || "BANK_TRANSFER",
    transaction_ref: "",
    paid_date: new Date().toISOString().split("T")[0],
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (form.paid_date > new Date().toISOString().split("T")[0]) {
      notify("Data e pagesës nuk mund të jetë në të ardhmen", "error"); return;
    }
    setSaving(true);
    try {
      await api.patch(`/api/payments/${payment.id}/pay`, {
        payment_method: form.payment_method,
        transaction_ref: form.transaction_ref || null,
        paid_date: form.paid_date,
      });
      notify("Pagesa u shënua si PAID");
      onSuccess();
    } catch (err) {
      notify(err.response?.data?.message || "Gabim", "error");
    } finally { setSaving(false); }
  };

  return (
    <Modal title={`Mark Payment #${payment.id} as PAID`} onClose={onClose}>
      <div style={{ background: "rgba(29,158,117,0.06)", border: "1px solid rgba(29,158,117,0.2)", borderRadius: 10, padding: "10px 14px", marginBottom: 18, fontSize: 13, color: "#1D9E75" }}>
        Shuma: <strong>{fmtPrice(payment.amount, payment.currency)}</strong>
        {payment.due_date && <span style={{ marginLeft: 12, color: "#8a7d5e" }}>Due: {fmtDate(payment.due_date)}</span>}
      </div>
      <Field label="Payment Method">
        <select style={selectSt} value={form.payment_method} onChange={e => set("payment_method", e.target.value)}>
          {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
        </select>
      </Field>
      <Row2>
        <Field label="Transaction Ref">
          <input style={inputSt} value={form.transaction_ref} onChange={e => set("transaction_ref", e.target.value)} placeholder="TXN-12345" />
        </Field>
        <Field label="Paid Date">
          <input style={inputSt} type="date" value={form.paid_date} max={new Date().toISOString().split("T")[0]} onChange={e => set("paid_date", e.target.value)} />
        </Field>
      </Row2>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 6 }}>
        <button style={secondaryBtn} onClick={onClose}>Anulo</button>
        <button style={primaryBtn} onClick={handleSubmit} disabled={saving}>{saving ? "Duke shënuar..." : "✓ Konfirmo PAID"}</button>
      </div>
    </Modal>
  );
}

// ─── Status Modal ─────────────────────────────────────────────────────────────
function StatusModal({ payment, onClose, onSuccess, notify }) {
  const available = PAYMENT_STATUSES.filter(s => s !== payment.status && s !== "PAID");
  const [status, setStatus] = useState(available[0] || "FAILED");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await api.patch(`/api/payments/${payment.id}/status`, { status });
      notify(`Statusi u ndryshua në ${status}`);
      onSuccess();
    } catch (err) {
      notify(err.response?.data?.message || "Gabim", "error");
    } finally { setSaving(false); }
  };

  const isDanger = ["FAILED", "OVERDUE"].includes(status);
  return (
    <Modal title={`Ndrysho Statusin — Payment #${payment.id}`} onClose={onClose}>
      <p style={{ fontSize: 13, color: "#8a7d5e", marginBottom: 16 }}>Aktual: <Badge label={payment.status} /></p>
      <Field label="Statusi i ri" required>
        <select style={selectSt} value={status} onChange={e => setStatus(e.target.value)}>
          {available.map(s => <option key={s}>{s}</option>)}
        </select>
      </Field>
      <div style={{
        background: isDanger ? "rgba(216,90,48,0.06)" : "rgba(29,158,117,0.06)",
        border: `1px solid ${isDanger ? "rgba(216,90,48,0.2)" : "rgba(29,158,117,0.2)"}`,
        borderRadius: 10, padding: "10px 14px", marginBottom: 20,
        fontSize: 13, color: isDanger ? "#D85A30" : "#1D9E75",
      }}>
        {isDanger ? `⚠️ Pagesa do të shënohet si ${status}.` : `✓ Pagesa do të shënohet si ${status}.`}
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button style={secondaryBtn} onClick={onClose}>Anulo</button>
        <button style={isDanger ? dangerBtn : primaryBtn} onClick={handleSubmit} disabled={saving}>
          {saving ? "Duke ndryshuar..." : `Konfirmo — ${status}`}
        </button>
      </div>
    </Modal>
  );
}

// ─── Create Payment Modal ─────────────────────────────────────────────────────
function CreatePaymentModal({ onClose, onSuccess, notify }) {
  const [form, setForm] = useState({
    contract_id: "", amount: "", currency: "EUR",
    payment_type: "RENT", due_date: "",
    payment_method: "BANK_TRANSFER", notes: "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.contract_id || !form.amount || !form.due_date) {
      notify("Contract ID, Shuma dhe Due Date janë të detyrueshme", "error"); return;
    }
    if (Number(form.amount) <= 0) { notify("Shuma duhet të jetë > 0", "error"); return; }
    setSaving(true);
    try {
      await api.post("/api/payments", {
        contract_id: Number(form.contract_id), amount: Number(form.amount),
        currency: form.currency, payment_type: form.payment_type,
        due_date: form.due_date, payment_method: form.payment_method || null,
        notes: form.notes || null,
      });
      notify("Pagesa u krijua");
      onSuccess();
    } catch (err) {
      notify(err.response?.data?.message || "Gabim gjatë krijimit", "error");
    } finally { setSaving(false); }
  };

  return (
    <Modal title="New Payment" onClose={onClose} maxWidth={560}>
      <Row2>
        <Field label="Contract ID" required><input style={inputSt} type="number" value={form.contract_id} onChange={e => set("contract_id", e.target.value)} placeholder="ex: 10" /></Field>
        <Field label="Amount (€)" required><input style={inputSt} type="number" value={form.amount} onChange={e => set("amount", e.target.value)} placeholder="ex: 800" /></Field>
      </Row2>
      <Row2>
        <Field label="Payment Type"><select style={selectSt} value={form.payment_type} onChange={e => set("payment_type", e.target.value)}>{PAYMENT_TYPES.map(t => <option key={t}>{t}</option>)}</select></Field>
        <Field label="Currency"><select style={selectSt} value={form.currency} onChange={e => set("currency", e.target.value)}>{CURRENCIES.map(c => <option key={c}>{c}</option>)}</select></Field>
      </Row2>
      <Row2>
        <Field label="Due Date" required><input style={inputSt} type="date" value={form.due_date} onChange={e => set("due_date", e.target.value)} /></Field>
        <Field label="Payment Method"><select style={selectSt} value={form.payment_method} onChange={e => set("payment_method", e.target.value)}>{PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}</select></Field>
      </Row2>
      <Field label="Notes"><textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={2} placeholder="Shënime shtesë..." style={{ ...inputSt, resize: "vertical", lineHeight: 1.6 }} /></Field>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 6 }}>
        <button style={secondaryBtn} onClick={onClose}>Anulo</button>
        <button style={primaryBtn} onClick={handleSubmit} disabled={saving}>{saving ? "Duke krijuar..." : "Krijo pagesë"}</button>
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function AdminPayments() {
  const [mode, setMode]               = useState("all");
  const [statusFilter, setStatusFilter] = useState("");
  const [overdueOn, setOverdueOn]     = useState(false);

  const [payments, setPayments]       = useState([]);
  const [revenue, setRevenue]         = useState(null);
  const [loading, setLoading]         = useState(true);
  const [page, setPage]               = useState(0);
  const [totalPages, setTotalPages]   = useState(1);
  const [total, setTotal]             = useState(0);
  const [tick, setTick]               = useState(0);

  const [createOpen, setCreateOpen]   = useState(false);
  const [detailTarget, setDetail]     = useState(null);
  const [markPaidTarget, setMarkPaid] = useState(null);
  const [statusTarget, setStatusTgt] = useState(null);
  const [toast, setToast]             = useState(null);
  const [globalCounts, setGlobalCounts] = useState({});

  const notify = useCallback((msg, type = "success") =>
    setToast({ msg, type, key: Date.now() }), []);

  useEffect(() => {
    api.get("/api/payments/revenue")
      .then(res => setRevenue(res.data))
      .catch(() => setRevenue(0));

    Promise.allSettled(
      ["PENDING", "PAID", "FAILED", "OVERDUE", "REFUNDED"].map(s =>
        api.get(`/api/payments/status/${s}?page=0&size=1`)
          .then(r => ({ status: s, count: r.data.totalElements ?? 0 }))
          .catch(() => ({ status: s, count: 0 }))
      )
    ).then(results => {
      const counts = {};
      results.forEach(r => { if (r.status === "fulfilled") counts[r.value.status] = r.value.count; });
      setGlobalCounts(counts);
    });
  }, [tick]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    const doFetch = async () => {
      try {
        let res;
        if (overdueOn) {
          const [overdueRes, statusRes] = await Promise.allSettled([
            api.get("/api/payments/overdue"),
            api.get("/api/payments/status/OVERDUE?page=0&size=100"),
          ]);
          if (!alive) return;
          const pendingOverdue = overdueRes.status === "fulfilled" ? (Array.isArray(overdueRes.value.data) ? overdueRes.value.data : []) : [];
          const statusOverdue  = statusRes.status === "fulfilled"  ? (statusRes.value.data.content || []) : [];
          const map = new Map();
          [...pendingOverdue, ...statusOverdue].forEach(p => map.set(p.id, p));
          const data = Array.from(map.values());
          setPayments(data); setTotal(data.length); setTotalPages(1);
        } else if (mode === "status" && statusFilter) {
          res = await api.get(`/api/payments/status/${statusFilter}?page=${page}&size=20`);
          if (!alive) return;
          setPayments(res.data.content || []); setTotal(res.data.totalElements || 0); setTotalPages(res.data.totalPages || 1);
        } else {
          res = await api.get(`/api/payments/status/PENDING?page=${page}&size=20`);
          if (!alive) return;
          setPayments(res.data.content || []); setTotal(res.data.totalElements || 0); setTotalPages(res.data.totalPages || 1);
        }
      } catch {
        if (!alive) return;
        setPayments([]); setTotal(0); setTotalPages(1);
      } finally { if (alive) setLoading(false); }
    };
    doFetch();
    return () => { alive = false; };
  }, [mode, statusFilter, overdueOn, page, tick]);

  const refetch = useCallback(() => setTick(t => t + 1), []);

  const applyStatusFilter = (s) => {
    setOverdueOn(false); setStatusFilter(s);
    setMode(s ? "status" : "all"); setPage(0);
  };
  const toggleOverdue = () => {
    const next = !overdueOn;
    setOverdueOn(next);
    if (next) { setStatusFilter(""); setMode("overdue"); }
    else { setMode("all"); }
    setPage(0);
  };

  const counts = globalCounts;
  const statusColors = { PENDING: "#c9b87a", PAID: "#1D9E75", FAILED: "#D85A30", OVERDUE: "#D85A30", REFUNDED: "#888780" };
  const activeLabel = overdueOn ? "⏰ Overdue" : mode === "status" && statusFilter ? `Status: ${statusFilter}` : "PENDING (default)";

  return (
    <MainLayout role="admin">
      <div style={{ backgroundColor: "#f2ede4", minHeight: "100vh", padding: 24 }}>
      <style>{CSS}</style>
      <div className="ap-wrap" style={{ padding: "1.5rem 0" }}>

        {/* ── Hero Header ─────────────────────────────────────────── */}
        <div style={{
          background: "linear-gradient(160deg, #141210 0%, #1e1a14 45%, #241e16 100%)",
          borderRadius: 16, padding: "28px 28px 24px", marginBottom: 22,
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.015) 1px,transparent 1px)", backgroundSize: "22px 22px", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: "-60px", left: "8%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle,rgba(201,184,122,0.07) 0%,transparent 70%)", pointerEvents: "none", animation: "ap-glow 4s ease-in-out infinite" }} />
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,#c9b87a 30%,#c9b87a 70%,transparent)" }} />
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap", position: "relative" }}>
            <div>
              <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 28, fontWeight: 700, color: "#f5f0e8", margin: "0 0 4px", letterSpacing: "-0.4px" }}>Payments</h1>
              <p style={{ fontSize: 13, color: "rgba(245,240,232,0.35)", margin: 0, fontFamily: "'DM Sans', sans-serif" }}>Admin view — shiko dhe menaxho pagesat globalisht</p>
            </div>
            <button onClick={() => setCreateOpen(true)} style={primaryBtn}>+ New Payment</button>
          </div>
        </div>

        {/* ── TOP STATS ── */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid rgba(138,125,94,0.15)", padding: "16px 20px", flex: "2 1 200px", minWidth: 180, boxShadow: "0 2px 12px rgba(20,16,10,0.05)" }}>
            <p style={{ fontSize: 10, color: "#b0a890", textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 6px", fontFamily: "'DM Sans', sans-serif" }}>Total Revenue (PAID)</p>
            <p style={{ fontSize: 26, fontWeight: 700, color: "#1D9E75", margin: 0, letterSpacing: "-0.04em", fontFamily: "'Cormorant Garamond', serif" }}>
              {revenue === null ? "—" : fmtPrice(revenue)}
            </p>
          </div>
          {PAYMENT_STATUSES.map(s => (
            <div key={s} style={{ background: "#fff", borderRadius: 12, border: "1px solid rgba(138,125,94,0.15)", padding: "12px 16px", flex: "1 1 90px", minWidth: 80, boxShadow: "0 2px 12px rgba(20,16,10,0.05)" }}>
              <p style={{ fontSize: 10, color: "#b0a890", textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 4px", fontFamily: "'DM Sans', sans-serif" }}>{s.replace("_", " ")}</p>
              <p style={{ fontSize: 22, fontWeight: 700, color: statusColors[s], margin: 0, letterSpacing: "-0.04em", fontFamily: "'Cormorant Garamond', serif" }}>{counts[s] ?? "—"}</p>
            </div>
          ))}
        </div>

        {/* ── STATUS DISTRIBUTION BAR ── */}
        {payments.length > 0 && (
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid rgba(138,125,94,0.15)", padding: "14px 18px", marginBottom: 16, boxShadow: "0 2px 12px rgba(20,16,10,0.05)" }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "#8a7d5e", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.6px" }}>
              Status distribution — {total} pagesa gjithsej
            </p>
            <div style={{ display: "flex", height: 8, borderRadius: 999, overflow: "hidden", gap: 1, marginBottom: 8 }}>
              {PAYMENT_STATUSES.map(s => {
                const pct = payments.length > 0 ? (counts[s] / payments.length) * 100 : 0;
                return pct > 0 ? (
                  <div key={s} title={`${s}: ${counts[s]}`} style={{ width: `${pct}%`, background: statusColors[s], transition: "width .4s" }} />
                ) : null;
              })}
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {PAYMENT_STATUSES.map(s => (
                <span key={s} style={{ fontSize: 11, color: "#8a7d5e", display: "flex", alignItems: "center", gap: 4, fontFamily: "'DM Sans', sans-serif" }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: statusColors[s], display: "inline-block" }} />
                  {s} ({counts[s] ?? 0})
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── MAIN CARD ── */}
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid rgba(138,125,94,0.15)", overflow: "hidden", boxShadow: "0 2px 20px rgba(20,16,10,0.06)" }}>

          {/* Toolbar */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 12, padding: "16px 20px", borderBottom: "1px solid rgba(138,125,94,0.12)", flexWrap: "wrap" }}>
            <div>
              <label style={{ fontSize: 10.5, fontWeight: 600, color: "#8a7d5e", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>Filter by Status</label>
              <select value={statusFilter} onChange={e => applyStatusFilter(e.target.value)} disabled={overdueOn}
                style={{ ...selectSt, width: 190, height: 36, padding: "0 10px", opacity: overdueOn ? 0.5 : 1 }}>
                <option value="">PENDING (default)</option>
                {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label style={{ fontSize: 10.5, fontWeight: 600, color: "#8a7d5e", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>Overdue Payments</label>
              <button onClick={toggleOverdue} className="ap-btn" style={{
                padding: "7px 16px", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: "pointer",
                border: overdueOn ? "none" : "1.5px solid rgba(216,90,48,0.25)",
                background: overdueOn ? "#D85A30" : "rgba(216,90,48,0.06)",
                color: overdueOn ? "#fff" : "#D85A30", fontFamily: "'DM Sans', sans-serif",
              }}>
                ⏰ {overdueOn ? "Overdue ON" : "Overdue OFF"}
              </button>
            </div>

            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: "#8a7d5e", fontFamily: "'DM Sans', sans-serif" }}>Aktiv:</span>
              <span style={{
                background: overdueOn ? "rgba(216,90,48,0.08)" : "rgba(201,184,122,0.1)",
                color: overdueOn ? "#D85A30" : "#c9b87a",
                border: `1px solid ${overdueOn ? "rgba(216,90,48,0.2)" : "rgba(201,184,122,0.25)"}`,
                fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 999,
                fontFamily: "'DM Sans', sans-serif",
              }}>
                {activeLabel}
              </span>
            </div>
          </div>

          {/* Table */}
          {loading ? <Loader /> : payments.length === 0 ? (
            <Empty icon="💳"
              text={overdueOn ? "Nuk ka pagesa të vonuara." :
                mode === "status" ? `Nuk ka pagesa me status ${statusFilter}.` :
                "Nuk ka pagesa PENDING."} />
          ) : (
            <>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 850 }}>
                  <thead>
                    <tr>
                      {["#ID", "Contract", "Amount", "Type", "Recipient", "Due Date", "Paid Date", "Status", "Created", "Actions"].map(h => <th key={h} style={TH}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map(p => {
                      const isOverdue = p.status === "PENDING" && p.due_date && new Date(p.due_date) < new Date();
                      return (
                        <tr key={p.id} className="ap-row">
                          <td style={{ ...TD, fontFamily: "monospace", color: "#b0a890", fontSize: 11.5 }}>{p.id}</td>
                          <td style={TD}>
                            <span style={{ background: "rgba(201,184,122,0.1)", color: "#c9b87a", border: "1px solid rgba(201,184,122,0.22)", padding: "2px 8px", borderRadius: 999, fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
                              #{p.contract_id}
                            </span>
                          </td>
                          <td style={{ ...TD, fontWeight: 600, color: isOverdue ? "#D85A30" : "#1a1714" }}>
                            {fmtPrice(p.amount, p.currency)}
                            {isOverdue && <span style={{ fontSize: 10, color: "#D85A30", marginLeft: 5, fontWeight: 400 }}>OVERDUE</span>}
                          </td>
                          <td style={TD}>
                            <span style={{ background: "rgba(138,125,94,0.08)", color: "#8a7d5e", border: "1px solid rgba(138,125,94,0.15)", padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 600 }}>
                              {p.payment_type}
                            </span>
                          </td>
                          <td style={{ ...TD, color: "#8a7d5e", fontSize: 12 }}>
                            {p.recipient_name || (p.recipient_id ? `#${p.recipient_id}` : "Company")}
                          </td>
                          <td style={{ ...TD, color: isOverdue ? "#D85A30" : "#8a7d5e", fontWeight: isOverdue ? 600 : 400 }}>{fmtDate(p.due_date)}</td>
                          <td style={{ ...TD, color: "#8a7d5e" }}>{fmtDate(p.paid_date)}</td>
                          <td style={TD}><Badge label={p.status} /></td>
                          <td style={{ ...TD, color: "#b0a890", fontSize: 12 }}>{fmtDate(p.created_at)}</td>
                          <td style={TD}>
                            <div style={{ display: "flex", gap: 5 }}>
                              <button className="ap-btn" style={btnSm("rgba(201,184,122,0.08)", "#c9b87a", "rgba(201,184,122,0.25)")} onClick={() => setDetail(p)}>Detail</button>
                              {p.status === "PENDING" && (
                                <button className="ap-btn" style={btnSm("rgba(29,158,117,0.08)", "#1D9E75", "rgba(29,158,117,0.25)")} onClick={() => setMarkPaid(p)}>Mark Paid</button>
                              )}
                              {["PENDING", "OVERDUE"].includes(p.status) && (
                                <button className="ap-btn" style={btnSm("rgba(201,184,122,0.08)", "#c9b87a", "rgba(201,184,122,0.25)")} onClick={() => setStatusTgt(p)}>Status</button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <Pagination page={page} totalPages={totalPages} onChange={p => setPage(p)} />
            </>
          )}
        </div>

        {createOpen     && <CreatePaymentModal onClose={() => setCreateOpen(false)} onSuccess={() => { setCreateOpen(false); refetch(); }} notify={notify} />}
        {detailTarget   && <PaymentDetailModal payment={detailTarget} onClose={() => setDetail(null)} />}
        {markPaidTarget && <MarkPaidModal payment={markPaidTarget} onClose={() => setMarkPaid(null)} onSuccess={() => { setMarkPaid(null); refetch(); notify("Pagesa u shënua si PAID"); }} notify={notify} />}
        {statusTarget   && <StatusModal payment={statusTarget} onClose={() => setStatusTgt(null)} onSuccess={() => { setStatusTgt(null); refetch(); notify("Statusi u ndryshua"); }} notify={notify} />}
        {toast          && <Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
      </div>
      </div>
    </MainLayout>
  );
}
