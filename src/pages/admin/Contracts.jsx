import { useState, useEffect, useCallback } from "react";
import MainLayout from "../../components/layout/Layout";
import api from "../../api/axios";
import { AiContractSummaryButton } from "../shared/AiFeatures";

// ─── Constants ────────────────────────────────────────────────────────────────
const LEASE_STATUSES = ["ACTIVE", "ENDED", "CANCELLED", "PENDING_SIGNATURE"];
const CURRENCIES     = ["EUR", "USD", "GBP", "CHF", "ALL", "MKD"];

// ─── Global CSS ───────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
  .ac-wrap * { box-sizing: border-box; }
  .ac-wrap { font-family: 'DM Sans', system-ui, sans-serif; }
  .ac-row:hover td { background: rgba(138,125,94,0.06) !important; }
  .ac-btn { transition: all 0.14s ease; }
  .ac-btn:hover { opacity: 0.82; transform: translateY(-1px); }
  .ac-pg:hover:not(:disabled) { background: rgba(201,184,122,0.1) !important; border-color: #c9b87a !important; color: #c9b87a !important; }
  @keyframes ac-spin  { to { transform: rotate(360deg); } }
  @keyframes ac-scale { from{opacity:0;transform:scale(0.97)} to{opacity:1;transform:scale(1)} }
  @keyframes ac-toast { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes ac-glow  { 0%,100%{opacity:0.07} 50%{opacity:0.14} }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtPrice = (v, cur = "EUR") =>
  v != null ? `€${Number(v).toLocaleString("de-DE")}` : "—";

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" }) : "—";

const fmtDateTime = (d) =>
  d ? new Date(d).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—";

function daysUntil(dateStr) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
}

// ─── Badge ────────────────────────────────────────────────────────────────────
const BADGE_CFG = {
  ACTIVE:            { bg: "rgba(29,158,117,0.12)",  color: "#1D9E75",  border: "rgba(29,158,117,0.25)",  dot: "#1D9E75"  },
  ENDED:             { bg: "rgba(136,135,128,0.12)", color: "#888780",  border: "rgba(136,135,128,0.25)", dot: "#888780"  },
  CANCELLED:         { bg: "rgba(216,90,48,0.12)",   color: "#D85A30",  border: "rgba(216,90,48,0.25)",   dot: "#D85A30"  },
  PENDING_SIGNATURE: { bg: "rgba(201,184,122,0.12)", color: "#c9b87a",  border: "rgba(201,184,122,0.3)",  dot: "#c9b87a"  },
};

function Badge({ label }) {
  const s = BADGE_CFG[label] || { bg: "rgba(136,135,128,0.12)", color: "#888780", border: "rgba(136,135,128,0.25)" };
  return (
    <span style={{
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      fontSize: 10.5, fontWeight: 600, letterSpacing: "0.4px",
      padding: "3px 10px", borderRadius: 999,
      whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 5,
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {s.dot && <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.dot, display: "inline-block", boxShadow: `0 0 4px ${s.dot}` }} />}
      {label ?? "—"}
    </span>
  );
}

// ─── Modal wrapper ────────────────────────────────────────────────────────────
function Modal({ title, onClose, children, maxWidth = 560 }) {
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
        animation: "ac-scale 0.22s ease", overflow: "hidden",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 24px", borderBottom: "1px solid rgba(138,125,94,0.15)",
          position: "sticky", top: 0, background: "#faf7f2", zIndex: 1,
        }}>
          <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 700, fontSize: 17, color: "#1a1714" }}>{title}</span>
          <button onClick={onClose} style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(138,125,94,0.2)", background: "rgba(138,125,94,0.08)", color: "#8a7d5e", cursor: "pointer", fontSize: 15, borderRadius: 8 }}>✕</button>
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
      animation: "ac-toast 0.2s ease", display: "flex", alignItems: "center", gap: 8,
    }}>
      <span style={{ fontSize: 14 }}>{type === "error" ? "⚠️" : "✅"}</span>
      {msg}
    </div>
  );
}

// ─── Table styles ─────────────────────────────────────────────────────────────
const TH = { padding: "10px 12px", textAlign: "left", fontWeight: 600, fontSize: 10.5, color: "#8a7d5e", borderBottom: "1px solid rgba(138,125,94,0.15)", background: "rgba(138,125,94,0.04)", whiteSpace: "nowrap", textTransform: "uppercase", letterSpacing: "0.5px" };
const TD = { padding: "10px 12px", borderBottom: "1px solid rgba(138,125,94,0.08)", fontSize: 13, color: "#1a1714", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" };

// ─── Input styles ─────────────────────────────────────────────────────────────
const inputSt  = { width: "100%", padding: "9px 12px", fontSize: 13, border: "1.5px solid rgba(138,125,94,0.25)", borderRadius: 9, background: "#fff", color: "#1a1714", outline: "none", boxSizing: "border-box", fontFamily: "'DM Sans', sans-serif" };
const selectSt = { ...inputSt, cursor: "pointer" };
const pillGold = { background: "rgba(201,184,122,0.1)", color: "#c9b87a", border: "1px solid rgba(201,184,122,0.22)", padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600 };

const primaryBtn   = { fontSize: 13, padding: "8px 16px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#c9b87a 0%,#b0983e 100%)", color: "#1a1714", cursor: "pointer", fontWeight: 700, whiteSpace: "nowrap", fontFamily: "'DM Sans', sans-serif" };
const secondaryBtn = { fontSize: 13, padding: "8px 15px", borderRadius: 10, border: "1.5px solid rgba(138,125,94,0.25)", background: "transparent", color: "#6b6248", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" };
const dangerBtn    = { fontSize: 13, padding: "8px 16px", borderRadius: 10, border: "none", background: "#D85A30", color: "#fff", cursor: "pointer", fontWeight: 700, fontFamily: "'DM Sans', sans-serif" };
const btnSm = (bg, color, border) => ({ fontSize: 11, padding: "4px 9px", borderRadius: 7, border: `1px solid ${border}`, background: bg, color, cursor: "pointer", whiteSpace: "nowrap", fontWeight: 600, fontFamily: "'DM Sans', sans-serif" });

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
      <div style={{ width: 26, height: 26, margin: "0 auto", border: "2px solid rgba(138,125,94,0.15)", borderTop: "2px solid #8a7d5e", borderRadius: "50%", animation: "ac-spin .8s linear infinite" }} />
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
      <button disabled={page === 0} onClick={() => onChange(page - 1)} className="ac-pg" style={pgBtn(page === 0)}>← Prev</button>
      <span style={{ fontSize: 13, color: "#8a7d5e", padding: "0 6px", fontFamily: "'DM Sans', sans-serif" }}>{page + 1} / {totalPages}</span>
      <button disabled={page >= totalPages - 1} onClick={() => onChange(page + 1)} className="ac-pg" style={pgBtn(page >= totalPages - 1)}>Next →</button>
    </div>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────
function ContractDetailModal({ contract: c, onClose }) {
  const [detail, setDetail] = useState(null);
  useEffect(() => {
    api.get(`/api/contracts/lease/${c.id}`)
      .then(r => setDetail(r.data))
      .catch(() => setDetail(c));
  }, [c.id]);
  const d    = detail || c;
  const days = daysUntil(d.end_date);
  const expiring = days !== null && days <= 30 && days > 0 && d.status === "ACTIVE";
  const s    = BADGE_CFG[d.status] || BADGE_CFG.ENDED;

  return (
    <Modal title={`Lease Contract #${c.id}`} onClose={onClose} maxWidth={600}>
      {!detail ? <Loader /> : (
        <>
          {expiring && (
            <div style={{ background: "rgba(201,184,122,0.08)", border: "1.5px solid rgba(201,184,122,0.22)", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#c9b87a" }}>
              ⚠️ Kjo kontratë skadon pas <strong>{days}</strong> ditësh!
            </div>
          )}
          <div style={{ background: s.bg, border: `1.5px solid ${s.border}`, borderRadius: 11, padding: "12px 16px", marginBottom: 18, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Badge label={d.status} />
            {d.status === "ACTIVE" && days !== null && (
              <span style={{ fontSize: 12.5, fontWeight: 600, color: expiring ? "#c9b87a" : "#8a7d5e", fontFamily: "'DM Sans', sans-serif" }}>
                {expiring ? `⚠️ Expires in ${days} days` : `${days} days remaining`}
              </span>
            )}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9, marginBottom: 16 }}>
            {[
              ["ID", `#${d.id}`], ["Property", `#${d.property_id}`],
              ["Listing", d.listing_id ? `#${d.listing_id}` : "—"], ["Client", `#${d.client_id}`],
              ["Agent", d.agent_id ? `#${d.agent_id}` : "—"], ["Rent", fmtPrice(d.rent, d.currency)],
              ["Deposit", fmtPrice(d.deposit, d.currency)], ["Start Date", fmtDate(d.start_date)],
              ["End Date", fmtDate(d.end_date)], ["Created", fmtDateTime(d.created_at)],
              ["Updated", fmtDateTime(d.updated_at)],
            ].map(([label, val]) => (
              <div key={label} style={{ background: "#fff", borderRadius: 10, padding: "10px 13px", border: "1.5px solid rgba(138,125,94,0.12)" }}>
                <p style={{ fontSize: 9.5, color: "#b0a890", textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 4px" }}>{label}</p>
                <p style={{ fontSize: 14, fontWeight: 600, margin: 0, color: "#1a1714", fontFamily: "'Cormorant Garamond', serif" }}>{val}</p>
              </div>
            ))}
            {d.contract_file_url && (
              <div style={{ gridColumn: "1/-1", background: "rgba(201,184,122,0.06)", borderRadius: 10, padding: "10px 13px", border: "1.5px solid rgba(201,184,122,0.15)" }}>
                <p style={{ fontSize: 9.5, color: "#b0a890", textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 5px" }}>File</p>
                <a href={d.contract_file_url} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: "#c9b87a", fontFamily: "'DM Sans', sans-serif" }}>📎 Open</a>
              </div>
            )}
          </div>
        </>
      )}
    </Modal>
  );
}

// ─── Form Modal ───────────────────────────────────────────────────────────────
function ContractFormModal({ initial, onClose, onSuccess, notify }) {
  const [form, setForm] = useState({
    property_id:       initial?.property_id       ?? "",
    listing_id:        initial?.listing_id        ?? "",
    client_id:         initial?.client_id         ?? "",
    start_date:        initial?.start_date        ?? "",
    end_date:          initial?.end_date          ?? "",
    rent:              initial?.rent              ?? "",
    deposit:           initial?.deposit           ?? "",
    currency:          initial?.currency          ?? "EUR",
    contract_file_url: initial?.contract_file_url ?? "",
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(p => {
    const n = { ...p, [k]: v };
    if (k === "start_date" && n.end_date && n.end_date <= v) n.end_date = "";
    return n;
  });

  const dateError = form.start_date && form.end_date && form.end_date <= form.start_date
    ? "End Date duhet të jetë pas Start Date." : null;

  const handleSubmit = async () => {
    if (!form.property_id || !form.client_id || !form.rent || !form.start_date || !form.end_date) {
      notify("Property ID, Client ID, Rent, Start Date dhe End Date janë të detyrueshme", "error"); return;
    }
    if (dateError) { notify(dateError, "error"); return; }
    setSaving(true);
    try {
      const payload = {
        property_id: Number(form.property_id), listing_id: form.listing_id ? Number(form.listing_id) : null,
        client_id: Number(form.client_id), start_date: form.start_date, end_date: form.end_date,
        rent: Number(form.rent), deposit: form.deposit ? Number(form.deposit) : null,
        currency: form.currency, contract_file_url: form.contract_file_url || null,
      };
      if (initial) { await api.put(`/api/contracts/lease/${initial.id}`, payload); onSuccess(null); }
      else { const res = await api.post("/api/contracts/lease", payload); onSuccess(res.data?.id ?? null); }
    } catch (err) {
      notify(err.response?.data?.message || "Gabim gjatë ruajtjes", "error");
    } finally { setSaving(false); }
  };

  return (
    <Modal title={initial ? `Edit Contract #${initial.id}` : "New Lease Contract"} onClose={onClose} maxWidth={620}>
      <Row2>
        <Field label="Property ID" required><input style={inputSt} type="number" value={form.property_id} onChange={e => set("property_id", e.target.value)} disabled={!!initial} placeholder="ex: 1" /></Field>
        <Field label="Listing ID"><input style={inputSt} type="number" value={form.listing_id} onChange={e => set("listing_id", e.target.value)} placeholder="(opcional)" /></Field>
      </Row2>
      <Row2>
        <Field label="Client ID" required><input style={inputSt} type="number" value={form.client_id} onChange={e => set("client_id", e.target.value)} disabled={!!initial} placeholder="ID e klientit" /></Field>
        <Field label="Rent" required><input style={inputSt} type="number" value={form.rent} onChange={e => set("rent", e.target.value)} placeholder="ex: 800" /></Field>
      </Row2>
      <Row2>
        <Field label="Deposit"><input style={inputSt} type="number" value={form.deposit} onChange={e => set("deposit", e.target.value)} placeholder="ex: 1600" /></Field>
        <Field label="Currency"><select style={selectSt} value={form.currency} onChange={e => set("currency", e.target.value)}>{CURRENCIES.map(c => <option key={c}>{c}</option>)}</select></Field>
      </Row2>
      <Row2>
        <Field label="Start Date" required><input style={inputSt} type="date" value={form.start_date} onChange={e => set("start_date", e.target.value)} /></Field>
        <Field label="End Date" required>
          <input style={{ ...inputSt, borderColor: dateError ? "#D85A30" : "rgba(138,125,94,0.25)", background: dateError ? "rgba(216,90,48,0.04)" : "#fff" }}
            type="date" value={form.end_date} min={form.start_date || undefined}
            onChange={e => {
              if (form.start_date && e.target.value <= form.start_date) { notify("End Date duhet të jetë pas Start Date.", "error"); return; }
              set("end_date", e.target.value);
            }} />
          {dateError && <p style={{ fontSize: 11, color: "#D85A30", margin: "4px 0 0" }}>⚠ {dateError}</p>}
        </Field>
      </Row2>
      {form.start_date && form.end_date && !dateError && (
        <div style={{ display: "flex", alignItems: "center", background: "rgba(29,158,117,0.06)", border: "1px solid rgba(29,158,117,0.2)", borderRadius: 10, padding: "10px 18px", marginBottom: 12 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#1D9E75", fontFamily: "'DM Sans', sans-serif" }}>START</div>
            <div style={{ fontSize: 12, color: "#8a7d5e", fontFamily: "'DM Sans', sans-serif" }}>{fmtDate(form.start_date)}</div>
          </div>
          <div style={{ flex: 1, height: 2, background: "linear-gradient(90deg,#1D9E75,#c9b87a)", margin: "0 14px", borderRadius: 999 }} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#1D9E75", fontFamily: "'DM Sans', sans-serif" }}>END</div>
            <div style={{ fontSize: 12, color: "#8a7d5e", fontFamily: "'DM Sans', sans-serif" }}>{fmtDate(form.end_date)}</div>
          </div>
        </div>
      )}
      <Field label="Contract File URL"><input style={inputSt} value={form.contract_file_url} onChange={e => set("contract_file_url", e.target.value)} placeholder="https://..." /></Field>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 6 }}>
        <button style={secondaryBtn} onClick={onClose}>Anulo</button>
        <button style={{ ...primaryBtn, opacity: dateError ? 0.55 : 1, cursor: dateError ? "not-allowed" : "pointer" }} onClick={handleSubmit} disabled={saving || !!dateError}>
          {saving ? "Duke ruajtur..." : initial ? "Ruaj ndryshimet" : "Krijo kontratë"}
        </button>
      </div>
    </Modal>
  );
}

// ─── Status Modal ─────────────────────────────────────────────────────────────
function StatusModal({ contract, onClose, onSuccess, notify }) {
  const opts = LEASE_STATUSES.filter(s => s !== contract.status);
  const [status, setStatus] = useState(opts[0] || "ACTIVE");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await api.patch(`/api/contracts/lease/${contract.id}/status`, { status });
      notify(`Statusi u ndryshua në ${status}`);
      onSuccess();
    } catch (err) {
      notify(err.response?.data?.message || "Gabim", "error");
    } finally { setSaving(false); }
  };

  const isCancel = status === "CANCELLED";
  return (
    <Modal title={`Ndrysho Statusin — #${contract.id}`} onClose={onClose}>
      <p style={{ fontSize: 13, color: "#8a7d5e", marginBottom: 16 }}>Aktual: <Badge label={contract.status} /></p>
      <Field label="Statusi i ri" required>
        <select style={selectSt} value={status} onChange={e => setStatus(e.target.value)}>
          {opts.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </Field>
      <div style={{
        background: isCancel ? "rgba(216,90,48,0.06)" : "rgba(29,158,117,0.06)",
        border: `1px solid ${isCancel ? "rgba(216,90,48,0.2)" : "rgba(29,158,117,0.2)"}`,
        borderRadius: 10, padding: "10px 14px", marginBottom: 20,
        fontSize: 13, color: isCancel ? "#D85A30" : "#1D9E75",
      }}>
        {isCancel ? "⚠️ Anulimi është i pakthyeshëm." : `✓ Kontrata do të shënohet si ${status}.`}
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button style={secondaryBtn} onClick={onClose}>Anulo</button>
        <button style={isCancel ? dangerBtn : primaryBtn} onClick={handleSubmit} disabled={saving}>
          {saving ? "Duke ndryshuar..." : `Konfirmo — ${status}`}
        </button>
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function AdminContracts() {
  const [filterMode, setFilterMode]   = useState("default");
  const [clientInput, setClientInput] = useState("");
  const [agentInput, setAgentInput]   = useState("");
  const [propertyInput, setPropertyInput] = useState("");
  const [expiring, setExpiring]       = useState(false);

  const [activeClientId, setActiveClientId]     = useState(null);
  const [activeAgentId, setActiveAgentId]       = useState(null);
  const [activePropertyId, setActivePropertyId] = useState(null);

  const [rows, setRows]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [page, setPage]             = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [statusF, setStatusF]       = useState("");

  const [createOpen, setCreateOpen]   = useState(false);
  const [editTarget, setEditTarget]   = useState(null);
  const [detailTarget, setDetail]     = useState(null);
  const [statusTarget, setStatusTgt] = useState(null);
  const [toast, setToast]             = useState(null);
  const [tick, setTick]               = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch]           = useState("");
  const [minRent, setMinRent]         = useState("");
  const [maxRent, setMaxRent]         = useState("");

  const notify = useCallback((msg, type = "success") => setToast({ msg, type, key: Date.now() }), []);

  const fetchContracts = useCallback(async () => {
    setLoading(true);
    try {
      let res;
      if (expiring) {
        res = await api.get("/api/contracts/lease/expiring");
        setRows(Array.isArray(res.data) ? res.data : []); setTotalPages(1);
      } else if (filterMode === "client" && activeClientId) {
        res = await api.get(`/api/contracts/lease/client/${activeClientId}?page=${page}&size=10`);
        setRows(res.data.content || []); setTotalPages(res.data.totalPages || 1);
      } else if (filterMode === "agent" && activeAgentId) {
        res = await api.get(`/api/contracts/lease/agent/${activeAgentId}?page=${page}&size=10`);
        setRows(res.data.content || []); setTotalPages(res.data.totalPages || 1);
      } else if (filterMode === "property" && activePropertyId) {
        res = await api.get(`/api/contracts/lease/property/${activePropertyId}`);
        setRows(Array.isArray(res.data) ? res.data : []); setTotalPages(1);
      } else {
        const userInfo = JSON.parse(localStorage.getItem("user_info") || "{}");
        const adminId  = userInfo.id;
        res = await api.get(`/api/contracts/lease/agent/${adminId}?page=${page}&size=10`);
        setRows(res.data.content || []); setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.error("fetch error:", err); setRows([]); setTotalPages(1);
    } finally { setLoading(false); }
  // eslint-disable-next-line
  }, [expiring, filterMode, activeClientId, activeAgentId, activePropertyId, page, tick]);

  useEffect(() => { fetchContracts(); }, [fetchContracts]);

  const applyClientFilter = () => {
    const id = parseInt(clientInput, 10);
    if (!clientInput.trim() || isNaN(id) || id <= 0) { notify("Shkruaj Client ID të vlefshëm", "error"); return; }
    setExpiring(false); setAgentInput(""); setPropertyInput("");
    setActiveAgentId(null); setActivePropertyId(null);
    setActiveClientId(id); setFilterMode("client"); setPage(0);
  };
  const applyAgentFilter = () => {
    const id = parseInt(agentInput, 10);
    if (!agentInput.trim() || isNaN(id) || id <= 0) { notify("Shkruaj Agent ID të vlefshëm", "error"); return; }
    setExpiring(false); setClientInput(""); setPropertyInput("");
    setActiveClientId(null); setActivePropertyId(null);
    setActiveAgentId(id); setFilterMode("agent"); setPage(0);
  };
  const applyPropertyFilter = () => {
    const id = parseInt(propertyInput, 10);
    if (!propertyInput.trim() || isNaN(id) || id <= 0) { notify("Shkruaj Property ID të vlefshëm", "error"); return; }
    setExpiring(false); setClientInput(""); setAgentInput("");
    setActiveClientId(null); setActiveAgentId(null);
    setActivePropertyId(id); setFilterMode("property"); setPage(0);
  };
  const toggleExpiring = () => {
    if (!expiring) {
      setActiveClientId(null); setActiveAgentId(null); setActivePropertyId(null);
      setClientInput(""); setAgentInput(""); setPropertyInput("");
      setFilterMode("expiring"); setPage(0); setExpiring(true);
    } else { setExpiring(false); setFilterMode("default"); setPage(0); }
  };
  const clearAllFilters = () => {
    setFilterMode("default"); setExpiring(false);
    setClientInput(""); setAgentInput(""); setPropertyInput("");
    setActiveClientId(null); setActiveAgentId(null); setActivePropertyId(null);
    setPage(0); setTick(t => t + 1);
  };
  const refetch = useCallback(() => { setPage(0); setTick(t => t + 1); }, []);

  const displayed = rows
    .filter(r => !statusF || r.status === statusF)
    .filter(r => {
      if (!search.trim()) return true;
      const s = search.trim();
      return String(r.id).includes(s) || String(r.property_id).includes(s);
    })
    .filter(r => {
      const rent = Number(r.rent);
      if (minRent && rent < Number(minRent)) return false;
      if (maxRent && rent > Number(maxRent)) return false;
      return true;
    });

  const counts = LEASE_STATUSES.reduce((acc, s) => ({ ...acc, [s]: rows.filter(r => r.status === s).length }), {});
  const statusColors = { ACTIVE: "#1D9E75", ENDED: "#888780", CANCELLED: "#D85A30", PENDING_SIGNATURE: "#c9b87a" };
  const hasActiveFilter = filterMode !== "default" || expiring;
  const activeFilterLabel = expiring ? "⏰ Expiring soon (30 days)"
    : filterMode === "client"   ? `Client #${activeClientId}`
    : filterMode === "agent"    ? `Agent #${activeAgentId}`
    : filterMode === "property" ? `Property #${activePropertyId}` : null;

  const filterInputStyle = (active) => ({
    width: 90, padding: "7px 10px", fontSize: 13,
    border: `1.5px solid ${active ? "rgba(201,184,122,0.5)" : "rgba(138,125,94,0.2)"}`,
    borderRadius: 9, outline: "none", color: "#1a1714",
    background: active ? "rgba(201,184,122,0.06)" : "#fff",
    fontFamily: "'DM Sans', sans-serif",
  });

  return (
    <MainLayout role="admin">
      <style>{CSS}</style>
      <div className="ac-wrap" style={{ padding: "1.5rem 0" }}>

        {/* ── Hero Header ─────────────────────────────────────────── */}
        <div style={{
          background: "linear-gradient(160deg, #141210 0%, #1e1a14 45%, #241e16 100%)",
          borderRadius: 16, padding: "28px 28px 24px", marginBottom: 22,
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.015) 1px,transparent 1px)", backgroundSize: "22px 22px", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: "-60px", left: "8%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle,rgba(201,184,122,0.07) 0%,transparent 70%)", pointerEvents: "none", animation: "ac-glow 4s ease-in-out infinite" }} />
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,#c9b87a 30%,#c9b87a 70%,transparent)" }} />
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap", position: "relative" }}>
            <div style={{ flex: 1, minWidth: 180 }}>
              <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 28, fontWeight: 700, color: "#f5f0e8", margin: "0 0 4px", letterSpacing: "-0.4px" }}>Lease Contracts</h1>
              <p style={{ fontSize: 13, color: "rgba(245,240,232,0.35)", margin: 0, fontFamily: "'DM Sans', sans-serif" }}>Admin view — shiko dhe filtro të gjitha kontratat e qirasë</p>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <button onClick={() => setShowFilters(v => !v)} className="ac-btn" style={{
                fontSize: 12, padding: "7px 14px", borderRadius: 9, cursor: "pointer",
                border: `1px solid ${hasActiveFilter ? "rgba(201,184,122,0.5)" : "rgba(245,240,232,0.12)"}`,
                background: hasActiveFilter ? "rgba(201,184,122,0.12)" : showFilters ? "rgba(245,240,232,0.06)" : "transparent",
                color: hasActiveFilter ? "#c9b87a" : "rgba(245,240,232,0.45)",
                fontFamily: "'DM Sans', sans-serif", fontWeight: hasActiveFilter ? 600 : 400,
              }}>
                🔍 Filters {hasActiveFilter ? "●" : ""}
              </button>
              {/* Search */}
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "rgba(245,240,232,0.06)", border: "1px solid rgba(245,240,232,0.1)",
                borderRadius: 9, padding: "6px 12px", minWidth: 200,
              }}>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="rgba(245,240,232,0.3)" strokeWidth={2}><circle cx={11} cy={11} r={8}/><path d="m21 21-4.35-4.35"/></svg>
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Kërko Contract ID ose Property ID..."
                  style={{ border: "none", background: "transparent", outline: "none", fontSize: 13, color: "#f5f0e8", width: "100%", fontFamily: "'DM Sans', sans-serif" }} />
                {search && <button onClick={() => setSearch("")} style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: 17, lineHeight: 1, padding: 0, color: "rgba(245,240,232,0.3)" }}>×</button>}
              </div>
            </div>
          </div>
        </div>

        {/* ── Stat cards ─────────────────────────────────────────── */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          {[
            { label: "Total",        val: rows.length, color: "#c9b87a" },
            ...LEASE_STATUSES.map(s => ({ label: s.replace("_", " "), val: counts[s], color: statusColors[s] })),
          ].map(s => (
            <div key={s.label} style={{ background: "#fff", borderRadius: 12, border: "1px solid rgba(138,125,94,0.15)", padding: "14px 18px", flex: "1 1 90px", minWidth: 80, boxShadow: "0 2px 12px rgba(20,16,10,0.05)" }}>
              <p style={{ fontSize: 10, color: "#b0a890", textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 4px", fontFamily: "'DM Sans', sans-serif" }}>{s.label}</p>
              <p style={{ fontSize: 22, fontWeight: 700, color: s.color, margin: 0, letterSpacing: "-0.04em", fontFamily: "'Cormorant Garamond', serif" }}>{s.val}</p>
            </div>
          ))}
        </div>

        {/* ── Filters panel ──────────────────────────────────────── */}
        {showFilters && (
          <div style={{ background: "linear-gradient(160deg,#141210 0%,#1e1a14 100%)", borderRadius: 12, border: "1px solid rgba(201,184,122,0.12)", padding: "18px 20px", marginBottom: 16, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,#c9b87a 30%,#c9b87a 70%,transparent)" }} />
            <p style={{ fontSize: 11, fontWeight: 600, color: "#c9b87a", margin: "0 0 14px", textTransform: "uppercase", letterSpacing: "0.8px" }}>Filtrat</p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
              {[
                { label: "Client ID",   val: clientInput,   set: setClientInput,   apply: applyClientFilter,   active: filterMode === "client" },
                { label: "Agent ID",    val: agentInput,    set: setAgentInput,    apply: applyAgentFilter,    active: filterMode === "agent"  },
                { label: "Property ID", val: propertyInput, set: setPropertyInput, apply: applyPropertyFilter, active: filterMode === "property" },
              ].map(({ label, val, set, apply, active }) => (
                <div key={label}>
                  <label style={{ fontSize: 10.5, fontWeight: 600, color: "rgba(245,240,232,0.38)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</label>
                  <div style={{ display: "flex", gap: 4 }}>
                    <input type="number" value={val} onChange={e => set(e.target.value)} onKeyDown={e => e.key === "Enter" && apply()} placeholder="ex: 1" style={filterInputStyle(active)} />
                    <button onClick={apply} style={{ ...secondaryBtn, padding: "7px 10px", fontSize: 12, border: "1.5px solid rgba(245,240,232,0.12)", color: "rgba(245,240,232,0.5)", background: "rgba(245,240,232,0.06)" }}>Load</button>
                  </div>
                </div>
              ))}

              <div>
                <label style={{ fontSize: 10.5, fontWeight: 600, color: "rgba(245,240,232,0.38)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>Expiring Soon</label>
                <button onClick={toggleExpiring} className="ac-btn" style={{
                  padding: "7px 14px", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: "pointer",
                  border: expiring ? "none" : "1.5px solid rgba(201,184,122,0.2)",
                  background: expiring ? "#c9b87a" : "rgba(201,184,122,0.06)",
                  color: expiring ? "#1a1714" : "#c9b87a", fontFamily: "'DM Sans', sans-serif",
                }}>
                  ⏰ {expiring ? "Expiring ON" : "Expiring OFF"}
                </button>
              </div>

              {hasActiveFilter && (
                <div style={{ marginLeft: "auto" }}>
                  <label style={{ fontSize: 10.5, color: "transparent", display: "block", marginBottom: 6 }}>.</label>
                  <button onClick={clearAllFilters} className="ac-btn" style={{ padding: "7px 12px", borderRadius: 9, fontSize: 12, border: "1px solid rgba(216,90,48,0.3)", background: "rgba(216,90,48,0.08)", color: "#D85A30", cursor: "pointer", fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
                    ✕ Clear filters
                  </button>
                </div>
              )}
            </div>

            {/* Rent range */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end", marginTop: 14, borderTop: "1px solid rgba(245,240,232,0.06)", paddingTop: 14 }}>
              {[
                { label: "Rent min (€)", val: minRent, set: setMinRent, placeholder: "ex: 300" },
                { label: "Rent max (€)", val: maxRent, set: setMaxRent, placeholder: "ex: 2000" },
              ].map(({ label, val, set, placeholder }) => (
                <div key={label}>
                  <label style={{ fontSize: 10.5, fontWeight: 600, color: "rgba(245,240,232,0.38)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</label>
                  <input type="number" value={val} onChange={e => set(e.target.value)} placeholder={placeholder}
                    style={{ width: 110, padding: "7px 10px", fontSize: 13, border: "1.5px solid rgba(245,240,232,0.1)", borderRadius: 9, outline: "none", color: "#f5f0e8", background: "rgba(245,240,232,0.06)", fontFamily: "'DM Sans', sans-serif" }} />
                </div>
              ))}
              {(minRent || maxRent) && (
                <button onClick={() => { setMinRent(""); setMaxRent(""); }} style={{ alignSelf: "flex-end", padding: "7px 10px", borderRadius: 9, border: "1px solid rgba(216,90,48,0.3)", background: "rgba(216,90,48,0.08)", color: "#D85A30", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
                  Clear rent ×
                </button>
              )}
            </div>

            {activeFilterLabel && (
              <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: "rgba(245,240,232,0.38)", fontFamily: "'DM Sans', sans-serif" }}>Filtri aktiv:</span>
                <span style={{ background: "rgba(201,184,122,0.12)", color: "#c9b87a", border: "1px solid rgba(201,184,122,0.25)", fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 999, fontFamily: "'DM Sans', sans-serif" }}>{activeFilterLabel}</span>
              </div>
            )}
          </div>
        )}

        {/* ── Main table card ────────────────────────────────────── */}
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid rgba(138,125,94,0.15)", overflow: "hidden", boxShadow: "0 2px 20px rgba(20,16,10,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid rgba(138,125,94,0.12)", flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <select value={statusF} onChange={e => setStatusF(e.target.value)} style={{ ...selectSt, width: 170, height: 36, padding: "0 10px" }}>
                <option value="">All statuses</option>
                {LEASE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <span style={{ fontSize: 12, color: "#b0a890", fontFamily: "'DM Sans', sans-serif" }}>{displayed.length} kontrata</span>
            </div>
            <button onClick={() => setCreateOpen(true)} style={primaryBtn}>+ New Contract</button>
          </div>

          {loading ? <Loader /> : displayed.length === 0 ? (
            <Empty icon="📋" text={hasActiveFilter || expiring ? "Nuk u gjet asnjë kontratë për filtrin e zgjedhur." : "Nuk ka lease contracts."} />
          ) : (
            <>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
                  <thead>
                    <tr>
                      {["#ID", "Property", "Listing", "Client", "Agent", "Rent", "Deposit", "Start", "End", "Status", "Created", "AI", "Actions"].map(h => <th key={h} style={TH}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {displayed.map(c => {
                      const days      = daysUntil(c.end_date);
                      const nearExpiry = days !== null && days <= 30 && days > 0 && c.status === "ACTIVE";
                      return (
                        <tr key={c.id} className="ac-row">
                          <td style={{ ...TD, fontFamily: "monospace", color: "#b0a890", fontSize: 11.5 }}>{c.id}</td>
                          <td style={TD}><span style={pillGold}>#{c.property_id}</span></td>
                          <td style={{ ...TD, color: "#8a7d5e" }}>{c.listing_id ? `#${c.listing_id}` : "—"}</td>
                          <td style={TD}>{c.client_id ? `#${c.client_id}` : "—"}</td>
                          <td style={{ ...TD, color: "#8a7d5e" }}>{c.agent_id ? `#${c.agent_id}` : "—"}</td>
                          <td style={{ ...TD, fontWeight: 600 }}>{fmtPrice(c.rent, c.currency)}</td>
                          <td style={TD}>{c.deposit ? fmtPrice(c.deposit, c.currency) : "—"}</td>
                          <td style={{ ...TD, color: "#8a7d5e" }}>{fmtDate(c.start_date)}</td>
                          <td style={{ ...TD, color: nearExpiry ? "#c9b87a" : "#8a7d5e", fontWeight: nearExpiry ? 600 : 400 }}>
                            {fmtDate(c.end_date)}
                            {nearExpiry && <span style={{ fontSize: 10, marginLeft: 4, color: "#c9b87a" }}>{days}d</span>}
                          </td>
                          <td style={TD}><Badge label={c.status} /></td>
                          <td style={{ ...TD, color: "#b0a890", fontSize: 12 }}>{fmtDate(c.created_at)}</td>
                          <td style={TD}><AiContractSummaryButton contract={c} /></td>
                          <td style={TD}>
                            <div style={{ display: "flex", gap: 5 }}>
                              <button className="ac-btn" style={btnSm("rgba(201,184,122,0.08)", "#c9b87a", "rgba(201,184,122,0.25)")} onClick={() => setDetail(c)}>Detail</button>
                              {(c.status === "ACTIVE" || c.status === "PENDING_SIGNATURE") && (
                                <>
                                  <button className="ac-btn" style={btnSm("rgba(29,158,117,0.08)", "#1D9E75", "rgba(29,158,117,0.25)")} onClick={() => setEditTarget(c)}>Edit</button>
                                  <button className="ac-btn" style={btnSm("rgba(201,184,122,0.08)", "#c9b87a", "rgba(201,184,122,0.25)")} onClick={() => setStatusTgt(c)}>Status</button>
                                </>
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

        {createOpen   && <ContractFormModal onClose={() => setCreateOpen(false)} onSuccess={() => { setCreateOpen(false); refetch(); notify("Kontrata u krijua"); }} notify={notify} />}
        {editTarget   && <ContractFormModal initial={editTarget} onClose={() => setEditTarget(null)} onSuccess={() => { setEditTarget(null); refetch(); notify("Kontrata u ndryshua"); }} notify={notify} />}
        {detailTarget && <ContractDetailModal contract={detailTarget} onClose={() => setDetail(null)} />}
        {statusTarget && <StatusModal contract={statusTarget} onClose={() => setStatusTgt(null)} onSuccess={() => { setStatusTgt(null); refetch(); notify("Statusi u ndryshua"); }} notify={notify} />}
        {toast        && <Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
      </div>
    </MainLayout>
  );
}
