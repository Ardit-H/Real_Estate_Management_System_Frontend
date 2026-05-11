import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import MainLayout from "../../components/layout/Layout";
import api from "../../api/axios";
 
// ── Constants (identike me origjinalin) ───────────────────────────────────────
const PAYMENT_STATUSES = ["PENDING", "PAID", "FAILED", "OVERDUE", "REFUNDED"];
const PAYMENT_TYPES    = ["RENT", "DEPOSIT", "LATE_FEE", "MAINTENANCE"];
const PAYMENT_METHODS  = ["BANK_TRANSFER", "CASH", "CARD", "CHECK"];
const CURRENCIES       = ["EUR", "USD", "ALL"];
 
const TYPE_COLORS = {
  RENT:             { bg:"#eef2ff", color:"#6366f1" },
  DEPOSIT:          { bg:"#fef9c3", color:"#854d0e" },
  LATE_FEE:         { bg:"#fff1f2", color:"#be123c" },
  MAINTENANCE:      { bg:"#f1f5f9", color:"#475569" },
  COMMISSION:       { bg:"#f0fdf4", color:"#166534" },
  AGENT_COMMISSION: { bg:"#eff6ff", color:"#1d4ed8" },
  CLIENT_BONUS:     { bg:"#fdf4ff", color:"#7e22ce" },
};
 
const fmtDate  = (d) => d ? new Date(d).toLocaleDateString("sq-AL") : "—";
const fmtMoney = (v) => v != null ? `€${Number(v).toLocaleString("de-DE")}` : "—";
 
function isOverdue(payment) {
  if (!payment.due_date || payment.status !== "PENDING") return false;
  return new Date(payment.due_date) < new Date();
}
 
// ── Design tokens ─────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
  .ap * { box-sizing: border-box; }
  .ap { font-family: 'DM Sans', system-ui, sans-serif; background: #f2ede4; min-height: 100vh; }
  .ap-btn { transition: all 0.17s ease; }
  .ap-btn:hover:not(:disabled) { opacity: 0.86; transform: translateY(-1px); }
  .ap-in:focus { border-color: #8a7d5e !important; box-shadow: 0 0 0 3px rgba(138,125,94,0.13) !important; outline: none; }
  @keyframes ap-scale-in { from{opacity:0;transform:scale(0.95) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes ap-spin     { to{transform:rotate(360deg)} }
  @keyframes ap-toast    { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes ap-glow     { 0%,100%{opacity:0.07} 50%{opacity:0.14} }
`;
 
const STATUS_BADGE_CFG = {
  PENDING:  { bg:"rgba(201,184,122,0.10)", color:"#a8923e",  border:"rgba(201,184,122,0.25)" },
  PAID:     { bg:"rgba(126,184,164,0.12)", color:"#2a6049",  border:"rgba(126,184,164,0.25)" },
  FAILED:   { bg:"rgba(212,133,90,0.10)",  color:"#8b4013",  border:"rgba(212,133,90,0.20)"  },
  OVERDUE:  { bg:"rgba(192,80,60,0.10)",   color:"#8b3020",  border:"rgba(192,80,60,0.25)"   },
  REFUNDED: { bg:"rgba(160,153,126,0.10)", color:"#6b6248",  border:"rgba(160,153,126,0.22)" },
};
 
const INP_S = { width:"100%", padding:"10px 13px", border:"1.5px solid #e4ddd0", borderRadius:10, fontSize:13.5, color:"#1a1714", background:"#fff", fontFamily:"'DM Sans',sans-serif", boxSizing:"border-box", outline:"none", transition:"border-color 0.2s" };
const SEL_S = { ...INP_S, cursor:"pointer" };
const BTN_PRI = { padding:"10px 22px", borderRadius:10, border:"none", background:"linear-gradient(135deg,#c9b87a,#b0983e)", color:"#1a1714", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" };
const BTN_SEC = { padding:"10px 18px", borderRadius:10, border:"1.5px solid #e4ddd0", background:"transparent", color:"#6b6248", fontWeight:500, fontSize:13, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" };
 
// ── RecipientCell (logjika identike) ──────────────────────────────────────────
function RecipientCell({ recipientName, recipientType }) {
  if (recipientName) {
    return (
      <span style={{ fontSize:13, color:"#6b6248" }}>
        {recipientType === "AGENT" ? `👤 ${recipientName}` : `🏠 ${recipientName}`}
      </span>
    );
  }
  return (
    <span style={{ fontSize:11.5, color:"#2a6049", fontWeight:600, background:"rgba(126,184,164,0.10)", padding:"2px 9px", borderRadius:999, border:"1px solid rgba(126,184,164,0.22)" }}>
      🏢 Kompania
    </span>
  );
}
 
// ── StatusBadge ───────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const s = STATUS_BADGE_CFG[status] || { bg:"#f0ece3", color:"#6b6248", border:"#e0d8c8" };
  return (
    <span style={{ background:s.bg, color:s.color, border:`1px solid ${s.border}`, padding:"3px 11px", borderRadius:999, fontSize:10.5, fontWeight:700, letterSpacing:"0.3px", textTransform:"uppercase" }}>
      {status}
    </span>
  );
}
 
// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ msg, type = "success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{ position:"fixed", bottom:26, right:26, zIndex:9999, background:"#1a1714", color:type==="error" ? "#f09090" : "#90c8a8", padding:"11px 18px", borderRadius:12, fontSize:13, boxShadow:"0 10px 36px rgba(0,0,0,0.32)", border:`1px solid ${type==="error" ? "rgba(240,128,128,0.15)" : "rgba(144,200,168,0.15)"}`, maxWidth:320, fontFamily:"'DM Sans',sans-serif", animation:"ap-toast 0.2s ease", display:"flex", alignItems:"center", gap:8 }}>
      <span style={{ fontSize:14 }}>{type === "error" ? "⚠️" : "✅"}</span>{msg}
    </div>
  );
}
 
// ── Loader ────────────────────────────────────────────────────────────────────
function Loader() {
  return (
    <div style={{ textAlign:"center", padding:"52px 0" }}>
      <div style={{ width:26, height:26, margin:"0 auto", border:"2px solid #e8e2d6", borderTop:"2px solid #c9b87a", borderRadius:"50%", animation:"ap-spin 0.8s linear infinite" }} />
    </div>
  );
}
 
// ── EmptyState ────────────────────────────────────────────────────────────────
function EmptyState({ icon, text }) {
  return (
    <div style={{ textAlign:"center", padding:"52px 20px", color:"#b0a890", fontFamily:"'DM Sans',sans-serif" }}>
      <div style={{ fontSize:36, marginBottom:10 }}>{icon}</div>
      <p style={{ fontSize:14 }}>{text}</p>
    </div>
  );
}
 
// ── Pagination ────────────────────────────────────────────────────────────────
function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:6, justifyContent:"flex-end", padding:"14px 16px" }}>
      <button disabled={page === 0} onClick={() => onChange(page - 1)} style={{ ...BTN_SEC, padding:"6px 14px", fontSize:12.5, opacity:page===0 ? 0.4 : 1 }}>← Prev</button>
      <span style={{ fontSize:13, color:"#9a8c6e", padding:"0 8px" }}>{page + 1} / {totalPages}</span>
      <button disabled={page >= totalPages - 1} onClick={() => onChange(page + 1)} style={{ ...BTN_SEC, padding:"6px 14px", fontSize:12.5, opacity:page>=totalPages-1 ? 0.4 : 1 }}>Next →</button>
    </div>
  );
}
 
// ── Field helper ──────────────────────────────────────────────────────────────
function Field({ label, children, required }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:"block", fontSize:10.5, fontWeight:600, color:"#9a8c6e", textTransform:"uppercase", letterSpacing:"0.7px", marginBottom:6, fontFamily:"'DM Sans',sans-serif" }}>
        {label}{required && <span style={{ color:"#c0392b", marginLeft:2 }}>*</span>}
      </label>
      {children}
    </div>
  );
}
 
function Row2({ children }) {
  return <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>{children}</div>;
}
 
// ── Modal wrapper ─────────────────────────────────────────────────────────────
function Modal({ title, onClose, children, wide = false }) {
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", h); document.body.style.overflow = ""; };
  }, [onClose]);
 
  return (
    <div onClick={(e) => e.target === e.currentTarget && onClose()} style={{ position:"fixed", inset:0, zIndex:1000, background:"rgba(8,6,4,0.84)", backdropFilter:"blur(14px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20, fontFamily:"'DM Sans',sans-serif" }}>
      <div style={{ width:"100%", maxWidth:wide ? 680 : 500, background:"#faf7f2", borderRadius:18, boxShadow:"0 44px 100px rgba(0,0,0,0.55)", maxHeight:"92vh", overflowY:"auto", animation:"ap-scale-in 0.26s ease" }}>
        <div style={{ background:"linear-gradient(160deg,#141210 0%,#1e1a14 45%,#241e16 100%)", padding:"18px 24px", borderBottom:"1px solid rgba(201,184,122,0.14)", display:"flex", alignItems:"center", justifyContent:"space-between", position:"relative", borderRadius:"18px 18px 0 0" }}>
          <div style={{ position:"absolute", top:0, left:0, right:0, height:"2px", background:"linear-gradient(90deg,transparent,#c9b87a 30%,#c9b87a 70%,transparent)" }} />
          <span style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontWeight:700, fontSize:17, color:"#f5f0e8" }}>{title}</span>
          <button onClick={onClose} style={{ background:"rgba(245,240,232,0.08)", border:"1px solid rgba(245,240,232,0.12)", borderRadius:8, width:30, height:30, cursor:"pointer", color:"rgba(245,240,232,0.6)", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
        </div>
        <div style={{ padding:"22px 24px" }}>{children}</div>
      </div>
    </div>
  );
}
 
// ── CreatePaymentModal (logjika identike) ─────────────────────────────────────
function CreatePaymentModal({ contractId, onClose, onSuccess, notify }) {
  const [contracts,         setContracts]         = useState([]);
  const [loadingContracts,  setLoadingContracts]  = useState(false);
  const [form, setForm] = useState({
    contract_id:    contractId || "",
    amount:         "",
    currency:       "EUR",
    payment_type:   "RENT",
    due_date:       "",
    payment_method: "BANK_TRANSFER",
    notes:          "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
 
  useEffect(() => {
    setLoadingContracts(true);
    api.get("/api/contracts/lease?page=0&size=100")
      .then((res) => setContracts(res.data.content || []))
      .catch(() => {})
      .finally(() => setLoadingContracts(false));
  }, []);
 
  const handleSubmit = async () => {
    if (!form.contract_id || !form.amount || !form.due_date) {
      notify("Kontrata, shuma dhe due date janë të detyrueshme", "error"); return;
    }
    setSaving(true);
    try {
      await api.post("/api/payments", {
        contract_id:    Number(form.contract_id),
        amount:         Number(form.amount),
        currency:       form.currency,
        payment_type:   form.payment_type,
        due_date:       form.due_date,
        payment_method: form.payment_method || null,
        notes:          form.notes          || null,
      });
      onSuccess();
    } catch (err) {
      notify(err.response?.data?.message || "Gabim gjatë krijimit", "error");
    } finally {
      setSaving(false);
    }
  };
 
  return (
    <Modal title="New Lease Payment" onClose={onClose}>
      <Field label="Kontrata" required>
        <select className="ap-in" style={SEL_S} value={form.contract_id} onChange={(e) => set("contract_id", e.target.value)} disabled={loadingContracts}>
          <option value="">Zgjidh një kontratë...</option>
          {contracts.map((c) => (
            <option key={c.id} value={c.id}>#{c.id} — Client #{c.client_id} — {fmtMoney(c.rent)}</option>
          ))}
        </select>
      </Field>
      <Row2>
        <Field label="Shuma" required><input className="ap-in" style={INP_S} type="number" value={form.amount} onChange={(e) => set("amount", e.target.value)} placeholder="450" /></Field>
        <Field label="Monedha"><select className="ap-in" style={SEL_S} value={form.currency} onChange={(e) => set("currency", e.target.value)}>{CURRENCIES.map((c) => <option key={c}>{c}</option>)}</select></Field>
      </Row2>
      <Row2>
        <Field label="Tipi"><select className="ap-in" style={SEL_S} value={form.payment_type} onChange={(e) => set("payment_type", e.target.value)}>{PAYMENT_TYPES.map((t) => <option key={t}>{t}</option>)}</select></Field>
        <Field label="Due Date" required><input className="ap-in" style={INP_S} type="date" value={form.due_date} onChange={(e) => set("due_date", e.target.value)} /></Field>
      </Row2>
      <Field label="Metoda"><select className="ap-in" style={SEL_S} value={form.payment_method} onChange={(e) => set("payment_method", e.target.value)}>{PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}</select></Field>
      <Field label="Shënime"><input className="ap-in" style={INP_S} value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="(opcional)" /></Field>
      <div style={{ display:"flex", gap:9, justifyContent:"flex-end", marginTop:6 }}>
        <button style={BTN_SEC} onClick={onClose}>Anulo</button>
        <button style={BTN_PRI} onClick={handleSubmit} disabled={saving}>{saving ? "Duke krijuar..." : "Krijo pagesë"}</button>
      </div>
    </Modal>
  );
}
 
// ── MarkPaidModal (logjika identike) ──────────────────────────────────────────
function MarkPaidModal({ payment, onClose, onSuccess, notify }) {
  const [form, setForm] = useState({
    payment_method:  payment.payment_method || "BANK_TRANSFER",
    transaction_ref: "",
    paid_date:       new Date().toISOString().split("T")[0],
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
 
  const handleSubmit = async () => {
    setSaving(true);
    try {
      await api.patch(`/api/payments/${payment.id}/pay`, {
        payment_method:  form.payment_method,
        transaction_ref: form.transaction_ref || null,
        paid_date:       form.paid_date,
      });
      onSuccess();
    } catch (err) {
      notify(err.response?.data?.message || "Gabim", "error");
    } finally {
      setSaving(false);
    }
  };
 
  return (
    <Modal title={`Mark as PAID — Pagesë #${payment.id}`} onClose={onClose}>
      <div style={{ background:"rgba(126,184,164,0.08)", border:"1.5px solid rgba(126,184,164,0.22)", borderRadius:10, padding:"10px 14px", marginBottom:16, fontSize:13, color:"#2a6049" }}>
        Shuma: <strong>{fmtMoney(payment.amount)} {payment.currency}</strong>
        {" · "}Tipi: <strong>{payment.payment_type}</strong>
        {payment.recipient_name && <span style={{ marginLeft:8 }}>· Recipient: <strong>{payment.recipient_name}</strong></span>}
      </div>
      <Field label="Metoda e pagesës">
        <select className="ap-in" style={SEL_S} value={form.payment_method} onChange={(e) => set("payment_method", e.target.value)}>
          {PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}
        </select>
      </Field>
      <Row2>
        <Field label="Transaction Ref"><input className="ap-in" style={INP_S} value={form.transaction_ref} onChange={(e) => set("transaction_ref", e.target.value)} placeholder="TXN-12345" /></Field>
        <Field label="Data e pagesës"><input className="ap-in" style={INP_S} type="date" value={form.paid_date} max={new Date().toISOString().split("T")[0]} onChange={(e) => set("paid_date", e.target.value)} /></Field>
      </Row2>
      <div style={{ display:"flex", gap:9, justifyContent:"flex-end", marginTop:6 }}>
        <button style={BTN_SEC} onClick={onClose}>Anulo</button>
        <button style={BTN_PRI} onClick={handleSubmit} disabled={saving}>{saving ? "Duke shënuar..." : "✓ Konfirmo PAID"}</button>
      </div>
    </Modal>
  );
}
 
// ══ MAIN PAGE ════════════════════════════════════════════════════════════════
export default function AgentPayments() {
  const location = useLocation();
 
  const [tab,                  setTab]                  = useState("contract");
  const [selectedContractId,   setSelectedContractId]   = useState(location.state?.fromContractId || "");
  const [contracts,            setContracts]            = useState([]);
  const [statusFilter,         setStatusFilter]         = useState("PENDING");
  const [payments,             setPayments]             = useState([]);
  const [summary,              setSummary]              = useState(null);
  const [loading,              setLoading]              = useState(false);
  const [loadingContracts,     setLoadingContracts]     = useState(false);
  const [page,                 setPage]                 = useState(0);
  const [totalPages,           setTotalPages]           = useState(0);
  const [createOpen,           setCreateOpen]           = useState(false);
  const [markPaidTarget,       setMarkPaidTarget]       = useState(null);
  const [toast,                setToast]                = useState(null);
  const [revenue,              setRevenue]              = useState(null);
 
  const autoLoaded = useRef(false);
  const notify = useCallback((msg, type = "success") => setToast({ msg, type, key: Date.now() }), []);
 
  // Load contracts list for dropdown
  useEffect(() => {
    setLoadingContracts(true);
    api.get("/api/contracts/lease?page=0&size=100")
      .then((res) => setContracts(res.data.content || []))
      .catch(() => {})
      .finally(() => setLoadingContracts(false));
  }, []);
 
  // Load revenue
  useEffect(() => {
    api.get("/api/payments/revenue").then((r) => setRevenue(r.data)).catch(() => {});
  }, []);
 
  // Fetch by contract
  const fetchByContract = useCallback(async (cid) => {
    const id = cid || selectedContractId;
    if (!id) { notify("Zgjidh një kontratë", "error"); return; }
    setLoading(true);
    try {
      const [listRes, sumRes] = await Promise.all([
        api.get(`/api/payments/contract/${id}`),
        api.get(`/api/payments/contract/${id}/summary`),
      ]);
      setPayments(Array.isArray(listRes.data) ? listRes.data : []);
      setSummary(sumRes.data);
      setTotalPages(1);
    } catch {
      notify("Gabim — kontrata nuk u gjet", "error");
    } finally {
      setLoading(false);
    }
  }, [selectedContractId, notify]);
 
  // Auto-load nga navigation state
  useEffect(() => {
    if (location.state?.fromContractId && !autoLoaded.current) {
      autoLoaded.current = true;
      fetchByContract(location.state.fromContractId);
    }
  }, [location.state, fetchByContract]);
 
  // Fetch by status
  const fetchByStatus = useCallback(async () => {
    if (tab !== "status") return;
    setLoading(true);
    try {
      const res = await api.get(`/api/payments/status/${statusFilter}?page=${page}&size=15`);
      setPayments(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setSummary(null);
    } catch {
      notify("Gabim gjatë ngarkimit", "error");
    } finally {
      setLoading(false);
    }
  }, [tab, statusFilter, page, notify]);
 
  // Fetch overdue
  const fetchOverdue = useCallback(async () => {
    if (tab !== "overdue") return;
    setLoading(true);
    try {
      const res = await api.get("/api/payments/overdue");
      setPayments(Array.isArray(res.data) ? res.data : []);
      setTotalPages(1); setSummary(null);
    } catch {
      notify("Gabim gjatë ngarkimit", "error");
    } finally {
      setLoading(false);
    }
  }, [tab, notify]);
 
  useEffect(() => {
    if (tab === "status")  fetchByStatus();
    if (tab === "overdue") fetchOverdue();
    if (tab === "contract") {
      if (selectedContractId) fetchByContract();
      else { setPayments([]); setSummary(null); }
    }
  }, [tab, fetchByStatus, fetchOverdue, fetchByContract, selectedContractId]);
 
  const handleContractChange = (e) => {
    const value = e.target.value;
    setSelectedContractId(value);
    if (!value) { setPayments([]); setSummary(null); }
  };
 
  const handleMarkPaidSuccess = () => {
    setMarkPaidTarget(null);
    notify("Pagesa u shënua si PAID");
    if (tab === "contract" && selectedContractId) fetchByContract();
    else if (tab === "status") fetchByStatus();
    else fetchOverdue();
  };
 
  // ── Computed values (identike me origjinalin) ────────────────────────────
  const overdueCount = payments.filter((p) => isOverdue(p)).length;
 
  const agentCommissionTotal = payments
    .filter((p) => p.payment_type === "AGENT_COMMISSION")
    .reduce((s, p) => s + Number(p.amount), 0);
  const companyCommissionTotal = payments
    .filter((p) => p.payment_type === "COMMISSION")
    .reduce((s, p) => s + Number(p.amount), 0);
  const hasCommissions = agentCommissionTotal > 0 || companyCommissionTotal > 0;
 
  const rentTotal = payments
    .filter((p) => p.payment_type === "RENT")
    .reduce((s, p) => s + Number(p.amount), 0);
  const paidPct = summary && Number(summary.total_paid) > 0 && rentTotal > 0
    ? Math.min(100, Math.round((Number(summary.total_paid) / rentTotal) * 100))
    : null;
 
  const tabs = [
    { id:"contract", label:"By Contract", icon:"📋" },
    { id:"status",   label:"By Status",   icon:"🔍" },
    { id:"overdue",  label:"Overdue",     icon:"🔴" },
  ];
 
  return (
    <MainLayout role="agent">
      <style>{CSS}</style>
      <div className="ap">
 
        {/* ── Hero ── */}
        <div style={{ background:"linear-gradient(160deg,#141210 0%,#1e1a14 45%,#241e16 100%)", minHeight:240, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"32px 32px", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(rgba(255,255,255,0.018) 1px,transparent 1px)", backgroundSize:"22px 22px", pointerEvents:"none" }} />
          <div style={{ position:"absolute", top:"-50px", right:"10%", width:220, height:220, borderRadius:"50%", background:"radial-gradient(circle,rgba(201,184,122,0.07) 0%,transparent 70%)", pointerEvents:"none", animation:"ap-glow 4s ease-in-out infinite" }} />
          <div style={{ position:"absolute", top:0, left:0, right:0, height:"2px", background:"linear-gradient(90deg,transparent,#c9b87a 30%,#c9b87a 70%,transparent)" }} />
          <div style={{ position:"relative", zIndex:1, maxWidth:700, width:"100%", textAlign:"center" }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(201,184,122,0.10)", border:"1px solid rgba(201,184,122,0.18)", borderRadius:999, padding:"4px 14px", marginBottom:14 }}>
              <span style={{ width:5, height:5, borderRadius:"50%", background:"#c9b87a", display:"inline-block", boxShadow:"0 0 6px #c9b87a" }} />
              <span style={{ fontSize:10.5, fontWeight:600, color:"#c9b87a", letterSpacing:"1.2px", textTransform:"uppercase" }}>Lease Payments</span>
            </div>
            <h1 style={{ margin:"0 0 10px", fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"clamp(24px,4vw,38px)", fontWeight:700, color:"#f5f0e8", letterSpacing:"-0.7px" }}>
              Payment{" "}
              <span style={{ background:"linear-gradient(90deg,#c9b87a,#e8d9a0,#c9b87a)", backgroundSize:"200% auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>Management</span>
            </h1>
            <p style={{ margin:"0 auto 22px", fontSize:13.5, color:"rgba(245,240,232,0.38)" }}>Menaxho pagesat e qirasë dhe gjurmo statusin</p>
            <button className="ap-btn" onClick={() => setCreateOpen(true)}
              style={{ display:"inline-flex", alignItems:"center", gap:7, ...BTN_PRI, boxShadow:"0 6px 22px rgba(201,184,122,0.22)" }}>
              + New Payment
            </button>
 
            {/* Revenue + summary stat pills */}
            {(revenue !== null || summary) && (
              <div style={{ display:"flex", gap:8, maxWidth:480, margin:"20px auto 0", justifyContent:"center", flexWrap:"wrap" }}>
                {revenue !== null && (
                  <div style={{ background:"rgba(245,240,232,0.06)", backdropFilter:"blur(10px)", borderRadius:12, padding:"9px 16px", border:"1px solid rgba(245,240,232,0.09)", display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
                    <span style={{ fontSize:18, fontWeight:700, color:"#7eb8a4", lineHeight:1, fontFamily:"'Cormorant Garamond',Georgia,serif" }}>€{Number(revenue).toLocaleString("de-DE")}</span>
                    <span style={{ fontSize:9.5, color:"rgba(245,240,232,0.3)", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.8px" }}>Total Revenue</span>
                  </div>
                )}
                {summary && (
                  <>
                    <div style={{ background:"rgba(245,240,232,0.06)", backdropFilter:"blur(10px)", borderRadius:12, padding:"9px 16px", border:"1px solid rgba(245,240,232,0.09)", display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
                      <span style={{ fontSize:18, fontWeight:700, color:"#7eb8a4", lineHeight:1, fontFamily:"'Cormorant Garamond',Georgia,serif" }}>€{Number(summary.total_paid || 0).toLocaleString("de-DE")}</span>
                      <span style={{ fontSize:9.5, color:"rgba(245,240,232,0.3)", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.8px" }}>Total Paguar</span>
                    </div>
                    <div style={{ background:"rgba(245,240,232,0.06)", backdropFilter:"blur(10px)", borderRadius:12, padding:"9px 16px", border:"1px solid rgba(245,240,232,0.09)", display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
                      <span style={{ fontSize:18, fontWeight:700, color:(summary.overdue_count||0)>0 ? "#c07050" : "#c9b87a", lineHeight:1, fontFamily:"'Cormorant Garamond',Georgia,serif" }}>
                        €{Number(summary.total_pending || 0).toLocaleString("de-DE")}
                        {(summary.overdue_count||0)>0 && <span style={{ fontSize:11, marginLeft:4 }}>({summary.overdue_count})</span>}
                      </span>
                      <span style={{ fontSize:9.5, color:"rgba(245,240,232,0.3)", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.8px" }}>Në Pritje</span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
 
        {/* ── Overdue alert ── */}
        {tab === "overdue" && payments.length > 0 && (
          <div style={{ background:"rgba(192,80,60,0.07)", borderBottom:"1.5px solid rgba(192,80,60,0.18)", padding:"10px 28px", fontSize:13.5, color:"#8b3020", fontWeight:500, display:"flex", alignItems:"center", gap:8 }}>
            🔴 {payments.length} pagesa me vonesë — klienti duhet të njoftohet!
          </div>
        )}
 
        {/* ── Toolbar ── */}
        <div style={{ background:"#fff", borderBottom:"1.5px solid #e8e2d6", padding:"0 28px", height:46, display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, fontFamily:"'DM Sans',sans-serif", position:"sticky", top:0, zIndex:100, boxShadow:"0 1px 10px rgba(20,16,10,0.05)" }}>
          <div style={{ display:"flex", gap:0 }}>
            {tabs.map((t) => (
              <button key={t.id}
                onClick={() => { setTab(t.id); setPage(0); setPayments([]); setSummary(null); }}
                style={{ padding:"0 16px", height:46, border:"none", borderBottom:tab===t.id ? "2.5px solid #c9b87a" : "2.5px solid transparent", background:"none", color:tab===t.id ? "#1a1714" : "#9a8c6e", fontWeight:tab===t.id ? 600 : 400, fontSize:13, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", display:"flex", alignItems:"center", gap:5, transition:"color .15s" }}>
                {t.icon} {t.label}
                {t.id === "overdue" && overdueCount > 0 && tab !== "overdue" && (
                  <span style={{ background:"#c07050", color:"white", borderRadius:"50%", width:17, height:17, fontSize:9.5, display:"inline-flex", alignItems:"center", justifyContent:"center", fontWeight:700 }}>{overdueCount}</span>
                )}
              </button>
            ))}
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            {tab === "contract" && (
              <select className="ap-in"
                style={{ ...SEL_S, height:32, padding:"0 10px", fontSize:12.5, width:280 }}
                value={selectedContractId}
                onChange={handleContractChange}
                disabled={loadingContracts}>
                <option value="">-- Zgjidh një kontratë --</option>
                {contracts.map((c) => (
                  <option key={c.id} value={c.id}>#{c.id} — Client #{c.client_id} — {fmtMoney(c.rent)}</option>
                ))}
              </select>
            )}
            {tab === "status" && (
              <select className="ap-in"
                style={{ ...SEL_S, height:32, padding:"0 10px", fontSize:12.5, width:150 }}
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}>
                {PAYMENT_STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            )}
          </div>
        </div>
 
        {/* ── Content ── */}
        <div style={{ padding:"20px 24px", maxWidth:1440, margin:"0 auto" }}>
 
          {/* Summary bar + progress + commission (logjika identike) */}
          {summary && (
            <div style={{ background:"#fff", borderRadius:12, border:"1.5px solid #ece6da", marginBottom:16, overflow:"hidden", boxShadow:"0 2px 12px rgba(20,16,10,0.06)" }}>
              <div style={{ display:"flex", gap:14, padding:"14px 20px", alignItems:"center", flexWrap:"wrap" }}>
                {[
                  { label:"Total Pagesa", value:summary.total_payments,                                                              color:"#c9b87a" },
                  { label:"Paguar",       value:`€${Number(summary.total_paid    || 0).toLocaleString("de-DE")}`,                    color:"#2a6049" },
                  { label:"Në Pritje",    value:`€${Number(summary.total_pending || 0).toLocaleString("de-DE")}`,                    color:"#a8923e" },
                  ...(summary.overdue_count ? [{ label:"Overdue", value:summary.overdue_count, color:"#8b4013" }] : []),
                ].map((s, i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:14 }}>
                    {i > 0 && <div style={{ width:1, height:28, background:"#e8e2d6" }} />}
                    <div>
                      <p style={{ fontSize:9.5, color:"#b0a890", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.7px", marginBottom:2 }}>{s.label}</p>
                      <p style={{ fontSize:20, fontWeight:700, color:s.color, margin:0, fontFamily:"'Cormorant Garamond',Georgia,serif" }}>{s.value}</p>
                    </div>
                  </div>
                ))}
 
                {paidPct !== null && (
                  <>
                    <div style={{ width:1, height:28, background:"#e8e2d6" }} />
                    <div style={{ flex:1, minWidth:160 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                        <span style={{ fontSize:9.5, color:"#b0a890", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.7px" }}>Paguar</span>
                        <span style={{ fontSize:12.5, fontWeight:700, color:"#c9b87a" }}>{paidPct}%</span>
                      </div>
                      <div style={{ height:6, background:"#e8e2d6", borderRadius:99 }}>
                        <div style={{ height:"100%", borderRadius:99, width:`${paidPct}%`, background:paidPct===100 ? "#7eb8a4" : "#c9b87a", transition:"width .4s ease" }} />
                      </div>
                    </div>
                  </>
                )}
              </div>
 
              {hasCommissions && (
                <div style={{ borderTop:"1.5px solid #e8e2d6", padding:"12px 20px", display:"flex", gap:16, flexWrap:"wrap", alignItems:"center" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                    <div>
                      <p style={{ fontSize:9.5, color:"#b0a890", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.7px", marginBottom:2 }}>Komisioni Agjentit</p>
                      <p style={{ fontSize:20, fontWeight:700, color:"#c9b87a", margin:0, fontFamily:"'Cormorant Garamond',Georgia,serif" }}>€{agentCommissionTotal.toLocaleString("de-DE")}</p>
                    </div>
                    <div style={{ width:1, height:28, background:"#e8e2d6" }} />
                    <div>
                      <p style={{ fontSize:9.5, color:"#b0a890", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.7px", marginBottom:2 }}>Kompania</p>
                      <p style={{ fontSize:20, fontWeight:700, color:"#2a6049", margin:0, fontFamily:"'Cormorant Garamond',Georgia,serif" }}>€{companyCommissionTotal.toLocaleString("de-DE")}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
 
          {/* Payments table */}
          <div style={{ background:"#fff", borderRadius:14, border:"1.5px solid #ece6da", boxShadow:"0 2px 16px rgba(20,16,10,0.07)", overflow:"hidden" }}>
            <div style={{ padding:"14px 20px", borderBottom:"1.5px solid #e8e2d6", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <span style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontWeight:700, fontSize:17, color:"#1a1714" }}>
                {tab==="contract" && selectedContractId ? `Pagesat — Kontratë #${selectedContractId}` :
                 tab==="contract"                       ? "Pagesat" :
                 tab==="status"                         ? `Pagesat — ${statusFilter}` :
                                                          "Pagesat me Vonesë"}
              </span>
              {payments.length > 0 && (
                <span style={{ background:"rgba(201,184,122,0.10)", color:"#c9b87a", border:"1px solid rgba(201,184,122,0.22)", borderRadius:999, padding:"2px 10px", fontSize:10.5, fontWeight:700 }}>
                  {payments.length}
                </span>
              )}
            </div>
 
            {loading ? (
              <Loader />
            ) : payments.length === 0 ? (
              <EmptyState
                icon={tab === "overdue" ? "✅" : "💳"}
                text={
                  tab==="contract" && !selectedContractId ? "Zgjidh një kontratë nga lista" :
                  tab==="contract" && selectedContractId  ? "Nuk ka pagesa për këtë kontratë" :
                  tab==="overdue"                         ? "Nuk ka pagesa me vonesë 🎉" :
                  `Nuk ka pagesa me status ${statusFilter}`
                }
              />
            ) : (
              <>
                <div style={{ overflowX:"auto" }}>
                  <table style={{ width:"100%", borderCollapse:"collapse" }}>
                    <thead>
                      <tr style={{ background:"#faf7f2" }}>
                        {["#", "Contract", "Shuma", "Tipi", "Recipient", "Due Date", "Paid Date", "Metoda", "Statusi", "Veprime"].map((h) => (
                          <th key={h} style={{ textAlign:"left", fontSize:10.5, fontWeight:600, color:"#b0a890", textTransform:"uppercase", letterSpacing:"0.8px", padding:"10px 16px", borderBottom:"1.5px solid #e8e2d6", whiteSpace:"nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((p) => {
                        const typeStyle = TYPE_COLORS[p.payment_type] || TYPE_COLORS.RENT;
                        const overdue   = isOverdue(p);
                        return (
                          <tr key={p.id}
                            style={{ borderBottom:"1px solid #f0ece3", background:overdue ? "rgba(192,80,60,0.03)" : "", transition:"background 0.12s" }}
                            onMouseEnter={(e) => { if (!overdue) e.currentTarget.style.background = "#faf7f2"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = overdue ? "rgba(192,80,60,0.03)" : ""; }}>
                            <td style={{ padding:"12px 16px", color:"#b0a890", fontSize:12 }}>{p.id}</td>
                            <td style={{ padding:"12px 16px" }}>
                              <span style={{ background:"rgba(201,184,122,0.10)", color:"#c9b87a", border:"1px solid rgba(201,184,122,0.22)", padding:"2px 8px", borderRadius:999, fontSize:11.5, fontWeight:600 }}>#{p.contract_id}</span>
                            </td>
                            <td style={{ padding:"12px 16px", fontWeight:700, fontSize:14, color:"#1a1714", fontFamily:"'Cormorant Garamond',Georgia,serif" }}>{fmtMoney(p.amount)}</td>
                            <td style={{ padding:"12px 16px" }}>
                              <span style={{ background:typeStyle.bg, color:typeStyle.color, padding:"2px 8px", borderRadius:999, fontSize:11, fontWeight:600 }}>{p.payment_type}</span>
                            </td>
                            <td style={{ padding:"12px 16px" }}>
                              <RecipientCell recipientName={p.recipient_name} recipientType={p.recipient_type} />
                            </td>
                            <td style={{ padding:"12px 16px" }}>
                              <span style={{ fontSize:12.5, color:overdue ? "#8b3020" : "#9a8c6e", fontWeight:overdue ? 600 : 400 }}>
                                {overdue ? "⚠️ " : ""}{fmtDate(p.due_date)}
                              </span>
                            </td>
                            <td style={{ padding:"12px 16px", fontSize:12.5, color:"#9a8c6e" }}>{fmtDate(p.paid_date)}</td>
                            <td style={{ padding:"12px 16px", fontSize:12.5, color:"#9a8c6e" }}>{p.payment_method || "—"}</td>
                            <td style={{ padding:"12px 16px" }}><StatusBadge status={p.status} /></td>
                            <td style={{ padding:"12px 16px" }}>
                              {(p.status === "PENDING" || p.status === "OVERDUE") && (
                                <button className="ap-btn" onClick={() => setMarkPaidTarget(p)} style={{ ...BTN_PRI, padding:"5px 12px", fontSize:12 }}>Mark Paid</button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <Pagination page={page} totalPages={totalPages} onChange={setPage} />
              </>
            )}
          </div>
        </div>
      </div>
 
      {createOpen && (
        <CreatePaymentModal
          contractId={selectedContractId || ""}
          onClose={() => setCreateOpen(false)}
          onSuccess={() => {
            setCreateOpen(false);
            notify("Pagesa u krijua");
            if (tab === "contract" && selectedContractId) fetchByContract();
            else if (tab === "status") fetchByStatus();
            else fetchOverdue();
          }}
          notify={notify}
        />
      )}
      {markPaidTarget && (
        <MarkPaidModal payment={markPaidTarget} onClose={() => setMarkPaidTarget(null)} onSuccess={handleMarkPaidSuccess} notify={notify} />
      )}
      {toast && <Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </MainLayout>
  );
}