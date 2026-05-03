import { useState, useEffect, useCallback, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MainLayout from "../../components/layout/Layout";
import { AuthContext } from "../../context/AuthProvider";
import api from "../../api/axios";
import { AiContractSummaryButton } from "../shared/AiFeatures";



const LEASE_STATUSES = ["ACTIVE", "ENDED", "CANCELLED", "PENDING_SIGNATURE"];
const CURRENCIES     = ["EUR", "USD", "ALL"];

const STATUS_STYLE = {
  ACTIVE:            { bg: "#ecfdf5", color: "#059669" },
  ENDED:             { bg: "#f1f5f9", color: "#64748b" },
  CANCELLED:         { bg: "#fef2f2", color: "#dc2626" },
  PENDING_SIGNATURE: { bg: "#fffbeb", color: "#d97706" },
};

const fmtDate  = (d) => d ? new Date(d).toLocaleDateString("sq-AL") : "—";
const fmtDT    = (d) => d ? new Date(d).toLocaleString("sq-AL", {
  day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
const fmtMoney = (v, cur = "EUR") =>
  v != null ? `€${Number(v).toLocaleString("de-DE")} ${cur}` : "—";

function daysUntil(dateStr) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
}

// ─── Validim qendror për ContractModal ───────────────────────────────────────
function validateContractForm(form, notify) {
  if (!form.property_id || isNaN(Number(form.property_id)) || Number(form.property_id) <= 0) {
    notify("Property ID duhet të jetë numër pozitiv", "error"); return false;
  }
  if (form.listing_id && (isNaN(Number(form.listing_id)) || Number(form.listing_id) <= 0)) {
    notify("Listing ID duhet të jetë numër pozitiv", "error"); return false;
  }
  if (!form.client_id || isNaN(Number(form.client_id)) || Number(form.client_id) <= 0) {
    notify("Client ID duhet të jetë numër pozitiv", "error"); return false;
  }
  if (!form.start_date) {
    notify("Data e fillimit është e detyrueshme", "error"); return false;
  }
  if (!form.end_date) {
    notify("Data e mbarimit është e detyrueshme", "error"); return false;
  }
  if (new Date(form.end_date) <= new Date(form.start_date)) {
    notify("Data e mbarimit duhet të jetë pas datës së fillimit", "error"); return false;
  }
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  if (new Date(form.start_date) < oneYearAgo) {
    notify("Data e fillimit nuk mund të jetë më shumë se 1 vit në të shkuarën", "error"); return false;
  }
  if (!form.rent || isNaN(Number(form.rent)) || Number(form.rent) <= 0) {
    notify("Qiraja mujore duhet të jetë më e madhe se 0", "error"); return false;
  }
  if (Number(form.rent) > 999999999) {
    notify("Qiraja është shumë e madhe", "error"); return false;
  }
  if (form.deposit && (isNaN(Number(form.deposit)) || Number(form.deposit) < 0)) {
    notify("Depozita nuk mund të jetë negative", "error"); return false;
  }
  if (form.contract_file_url && form.contract_file_url.length > 500) {
    notify("URL e kontratës nuk mund të kalojë 500 karaktere", "error"); return false;
  }
  if (form.contract_file_url && !form.contract_file_url.startsWith("http")) {
    notify("URL e kontratës duhet të fillojë me http/https", "error"); return false;
  }
  return true;
}

// ─── Shared UI ────────────────────────────────────────────────────────────────
function Toast({ msg, type = "success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{ position: "fixed", bottom: 28, right: 28, zIndex: 9999,
      background: type === "error" ? "#fee2e2" : "#ecfdf5",
      color: type === "error" ? "#b91c1c" : "#047857",
      padding: "12px 20px", borderRadius: 10, fontSize: 13.5, fontWeight: 500,
      boxShadow: "0 4px 18px rgba(0,0,0,0.12)", maxWidth: 340 }}>{msg}</div>
  );
}
function Loader() {
  return (
    <div style={{ textAlign: "center", padding: "52px 0" }}>
      <div style={{ width: 30, height: 30, margin: "0 auto",
        border: "3px solid #e8edf4", borderTop: "3px solid #6366f1",
        borderRadius: "50%", animation: "spin .7s linear infinite" }} />
    </div>
  );
}
function EmptyState({ icon, text }) {
  return (
    <div style={{ textAlign: "center", padding: "52px 20px", color: "#94a3b8" }}>
      <div style={{ fontSize: 36, marginBottom: 10 }}>{icon}</div>
      <p style={{ fontSize: 14 }}>{text}</p>
    </div>
  );
}
function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || { bg: "#f1f5f9", color: "#64748b" };
  return (
    <span style={{ background: s.bg, color: s.color,
      padding: "3px 10px", borderRadius: 20, fontSize: 11.5, fontWeight: 600 }}>
      {status?.replace("_", " ")}
    </span>
  );
}
function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6,
      justifyContent: "flex-end", padding: "14px 16px" }}>
      <button className="btn btn--secondary btn--sm" disabled={page === 0}
        onClick={() => onChange(page - 1)}>← Prev</button>
      <span style={{ fontSize: 13, color: "#64748b", padding: "0 8px" }}>
        {page + 1} / {totalPages}
      </span>
      <button className="btn btn--secondary btn--sm" disabled={page >= totalPages - 1}
        onClick={() => onChange(page + 1)}>Next →</button>
    </div>
  );
}
function Field({ label, children, required, hint }) {
  return (
    <div className="form-group">
      <label className="form-label">
        {label}{required && <span style={{ color: "#ef4444", marginLeft: 2 }}>*</span>}
      </label>
      {children}
      {hint && <p style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 4 }}>{hint}</p>}
    </div>
  );
}
function Row2({ children }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>{children}</div>;
}
function Modal({ title, onClose, children, wide = false }) {
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(15,23,42,0.45)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ width: "100%", maxWidth: wide ? 700 : 520,
        background: "#fff", borderRadius: 16,
        boxShadow: "0 20px 60px rgba(15,23,42,0.18)",
        maxHeight: "90vh", overflowY: "auto", animation: "fadeUp .2s ease" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 24px", borderBottom: "1px solid #e8edf4" }}>
          <span style={{ fontWeight: 600, fontSize: 15 }}>{title}</span>
          <button onClick={onClose} style={{ width: 30, height: 30, border: "none",
            background: "none", color: "#94a3b8", cursor: "pointer", fontSize: 16 }}>✕</button>
        </div>
        <div style={{ padding: "22px 24px" }}>{children}</div>
      </div>
    </div>
  );
}

// ─── Contract Modal ───────────────────────────────────────────────────────────
function ContractModal({ initial, initialPropertyId, initialListingId, initialClientId, onClose, onSuccess, notify }) {
  const [form, setForm] = useState({
    property_id:       initial?.property_id       ? String(initial.property_id) : (initialPropertyId || ""),
    listing_id:        initial?.listing_id        ? String(initial.listing_id)  : (initialListingId  || ""),
    client_id:         initial?.client_id         ? String(initial.client_id)   : (initialClientId   || ""),
    start_date:        initial?.start_date        ?? "",
    end_date:          initial?.end_date          ?? "",
    rent:              initial?.rent              ? String(initial.rent)         : "",
    deposit:           initial?.deposit           ? String(initial.deposit)      : "",
    currency:          initial?.currency          ?? "EUR",
    contract_file_url: initial?.contract_file_url ?? "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!validateContractForm(form, notify)) return;
    setSaving(true);
    try {
      const payload = {
        property_id:       Number(form.property_id),
        listing_id:        form.listing_id        ? Number(form.listing_id)  : null,
        client_id:         Number(form.client_id),
        start_date:        form.start_date,
        end_date:          form.end_date,
        rent:              Number(form.rent),
        deposit:           form.deposit           ? Number(form.deposit)     : null,
        currency:          form.currency,
        contract_file_url: form.contract_file_url || null,
      };
      initial ? await api.put(`/api/contracts/lease/${initial.id}`, payload)
              : await api.post("/api/contracts/lease", payload);
      onSuccess();
    } catch (err) {
      notify(err.response?.data?.message || "Gabim gjatë ruajtjes", "error");
    } finally {
      setSaving(false);
    }
  };

  const minEndDate = form.start_date
    ? new Date(new Date(form.start_date).getTime() + 86400000).toISOString().split("T")[0]
    : undefined;

  return (
    <Modal title={initial ? `Edit Kontratë #${initial.id}` : "New Lease Contract"}
      onClose={onClose} wide>
      {(initialPropertyId || initialListingId) && !initial && (
        <div style={{ background: "#f0f4ff", border: "1px solid #c7d7fe",
          borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#4338ca" }}>
          📋 Po krijon kontratë
          {initialPropertyId && ` për Property #${initialPropertyId}`}
          {initialListingId  && ` · Listing #${initialListingId}`}
          {initialClientId   && ` · Client #${initialClientId}`}
        </div>
      )}
      <Row2>
        <Field label="Property ID" required hint="ID numerike e pronës">
          <input className="form-input" type="number" min="1" value={form.property_id}
            onChange={e => set("property_id", e.target.value)} placeholder="42" />
        </Field>
        <Field label="Listing ID" hint="Opcionale">
          <input className="form-input" type="number" min="1" value={form.listing_id}
            onChange={e => set("listing_id", e.target.value)} placeholder="(opcional)" />
        </Field>
      </Row2>
      <Field label="Client ID" required hint="ID numerike e klientit">
        <input className="form-input" type="number" min="1" value={form.client_id}
          onChange={e => set("client_id", e.target.value)} placeholder="ID e klientit" />
      </Field>
      <Row2>
        <Field label="Data fillimit" required>
          <input className="form-input" type="date" value={form.start_date}
            onChange={e => set("start_date", e.target.value)} />
        </Field>
        <Field label="Data mbarimit" required hint="Duhet të jetë pas datës fillimit">
          <input className="form-input" type="date" value={form.end_date}
            onChange={e => set("end_date", e.target.value)} min={minEndDate} />
        </Field>
      </Row2>
      <Row2>
        <Field label="Qiraja mujore" required hint="Duhet të jetë > 0">
          <input className="form-input" type="number" min="0.01" step="0.01" value={form.rent}
            onChange={e => set("rent", e.target.value)} placeholder="450" />
        </Field>
        <Field label="Depozita" hint="Opcionale, nuk mund të jetë negative">
          <input className="form-input" type="number" min="0" step="0.01" value={form.deposit}
            onChange={e => set("deposit", e.target.value)} placeholder="900" />
        </Field>
      </Row2>
      <Row2>
        <Field label="Monedha">
          <select className="form-select" value={form.currency}
            onChange={e => set("currency", e.target.value)}>
            {CURRENCIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="URL Kontratë" hint="Duhet të fillojë me http/https">
          <input className="form-input" value={form.contract_file_url}
            onChange={e => set("contract_file_url", e.target.value)}
            placeholder="https://..." maxLength={500} />
        </Field>
      </Row2>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 6 }}>
        <button className="btn btn--secondary" onClick={onClose}>Anulo</button>
        <button className="btn btn--primary" onClick={handleSubmit} disabled={saving}>
          {saving ? "Duke ruajtur..." : initial ? "Ruaj ndryshimet" : "Krijo kontratë"}
        </button>
      </div>
    </Modal>
  );
}

// ─── Status Modal — me njoftim komisioni kur ACTIVE ──────────────────────────
function StatusModal({ contract, onClose, onSuccess, notify }) {
  const [status, setStatus] = useState("ACTIVE");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await api.patch(`/api/contracts/lease/${contract.id}/status`, { status });
      onSuccess();
    } catch (err) { notify(err.response?.data?.message || "Gabim", "error"); }
    finally { setSaving(false); }
  };

  // Llogarit komisionin për preview (3% e qirasë)
  const commissionTotal = contract.rent
    ? (Number(contract.rent) * 0.03).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : null;

  return (
    <Modal title={`Ndrysho statusin — Kontratë #${contract.id}`} onClose={onClose}>
      <p style={{ fontSize: 13.5, color: "#475569", marginBottom: 16 }}>
        Statusi aktual: <StatusBadge status={contract.status} />
      </p>
      <Field label="Statusi i ri" required>
        <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
          {LEASE_STATUSES.filter(s => s !== contract.status).map(s => <option key={s}>{s}</option>)}
        </select>
      </Field>

      {/* ── Njoftim komisioni kur ACTIVE — identik me Sales COMPLETED ── */}
      {status === "ACTIVE" && contract.status === "PENDING_SIGNATURE" && (
        <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe",
          borderRadius: 8, padding: "10px 14px", marginBottom: 14,
          fontSize: 13, color: "#1e40af" }}>
          💡 Duke shënuar ACTIVE, sistemi do të krijojë automatikisht
          pagesat e komisionit (3% e qirasë mujore
          {commissionTotal ? ` = €${commissionTotal}` : ""}).
        </div>
      )}

      {(status === "CANCELLED" || status === "ENDED") && (
        <div style={{ background: "#fffbeb", border: "1px solid #fde68a",
          borderRadius: 8, padding: "10px 14px", marginBottom: 14,
          fontSize: 13, color: "#92400e" }}>
          ⚠️ Ky veprim nuk mund të kthehet pas konfirmimit.
        </div>
      )}

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button className="btn btn--secondary" onClick={onClose}>Anulo</button>
        <button className={`btn ${status === "CANCELLED" ? "btn--danger" : "btn--primary"}`}
          onClick={handleSubmit} disabled={saving}>
          {saving ? "Duke ndryshuar..." : `Konfirmo — ${status}`}
        </button>
      </div>
    </Modal>
  );
}

function ContractDetailModal({ contract, onClose, onEdit, onStatusChange, onGoToPayments }) {
  const days     = daysUntil(contract.end_date);
  const expiring = days !== null && days <= 30 && days > 0 && contract.status === "ACTIVE";
  return (
    <Modal title={`Kontratë #${contract.id}`} onClose={onClose} wide>
      {expiring && (
        <div style={{ background: "#fffbeb", border: "1px solid #fde68a",
          borderRadius: 8, padding: "10px 14px", marginBottom: 18, fontSize: 13, color: "#92400e" }}>
          ⚠️ Kjo kontratë skadon pas <strong>{days}</strong> ditësh!
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
        {[
          { label: "Property ID",   value: `#${contract.property_id}` },
          { label: "Client ID",     value: `#${contract.client_id}` },
          { label: "Agjent ID",     value: contract.agent_id ? `#${contract.agent_id}` : "—" },
          { label: "Statusi",       value: <StatusBadge status={contract.status} /> },
          { label: "Data fillimit", value: fmtDate(contract.start_date) },
          { label: "Data mbarimit", value: fmtDate(contract.end_date) },
          { label: "Qiraja",        value: fmtMoney(contract.rent, contract.currency) },
          { label: "Depozita",      value: fmtMoney(contract.deposit, contract.currency) },
          { label: "Krijuar",       value: fmtDT(contract.created_at) },
          { label: "Ndryshuar",     value: fmtDT(contract.updated_at) },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: "#f8fafc", borderRadius: 8,
            padding: "10px 14px", border: "1px solid #e8edf4" }}>
            <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600,
              textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{label}</p>
            <div style={{ fontSize: 13.5, fontWeight: 500 }}>{value}</div>
          </div>
        ))}
      </div>
      {contract.contract_file_url && (
        <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd",
          borderRadius: 8, padding: "10px 14px", marginBottom: 18 }}>
          <a href={contract.contract_file_url} target="_blank" rel="noopener noreferrer"
            style={{ color: "#0ea5e9", fontSize: 13.5, fontWeight: 500, textDecoration: "none" }}>
            📄 Hap fajllin e kontratës ↗
          </a>
        </div>
      )}
      <div style={{ background: "#f0f4ff", border: "1px solid #c7d7fe",
        borderRadius: 8, padding: "12px 16px", marginBottom: 16,
        display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 13, color: "#4338ca", fontWeight: 500 }}>
          💳 Pagesat e kësaj kontrate
        </span>

        <button className="btn btn--sm"
          style={{ background: "#6366f1", color: "white", border: "none" }}
          onClick={() => onGoToPayments(String(contract.id))}>
          Shiko Pagesat →
        </button>
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end",
        borderTop: "1px solid #e8edf4", paddingTop: 18 }}>
        {contract.status !== "ENDED" && contract.status !== "CANCELLED" && (
          <>
            <button className="btn btn--secondary" onClick={() => onEdit(contract)}>Edit</button>
            <button className="btn btn--primary" onClick={() => onStatusChange(contract)}>
              Ndrysho statusin
            </button>
          </>
        )}
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function AgentContracts() {
  const { user }   = useContext(AuthContext);
  const navigate   = useNavigate();
  const location   = useLocation();

  const fromPropertyId = location.state?.fromPropertyId || null;
  const fromListingId  = location.state?.fromListingId  || null;
  const fromClientId   = location.state?.fromClientId   || null;

  const [tab, setTab]               = useState("my");
  const [contracts, setContracts]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [page, setPage]             = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [createOpen, setCreateOpen]     = useState(!!(fromPropertyId || fromListingId));
  const [editTarget, setEditTarget]     = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);
  const [detailTarget, setDetailTarget] = useState(null);
  const [toast, setToast]               = useState(null);

  const notify = useCallback((msg, type = "success") =>
    setToast({ msg, type, key: Date.now() }), []);

  const fetchContracts = useCallback(async () => {
    setLoading(true);
    try {
      let res;
      if (tab === "my" && user?.id) {
        res = await api.get(`/api/contracts/lease/agent/${user.id}?page=${page}&size=10`);
        setContracts(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
      } else if (tab === "all") {
        res = await api.get(`/api/contracts/lease?page=${page}&size=10`);
        setContracts(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
      } else if (tab === "expiring") {
        res = await api.get("/api/contracts/lease/expiring");
        setContracts(Array.isArray(res.data) ? res.data : []);
        setTotalPages(1);
      }
    } catch {
      notify("Gabim gjatë ngarkimit të kontratave", "error");
    } finally {
      setLoading(false);
    }
  }, [tab, page, user?.id, notify]);

  useEffect(() => { fetchContracts(); }, [fetchContracts]);

  const goToPayments = (contractId) => {
    navigate("/agent/payments", { state: { fromContractId: contractId } });
  };

  const handleSuccess = (msg) => {
    setCreateOpen(false); setEditTarget(null);
    setStatusTarget(null); setDetailTarget(null);
    fetchContracts(); notify(msg);
  };

  const tabs = [
    { id: "my",       label: "My Contracts",  icon: "📋" },
    { id: "all",      label: "All Active",    icon: "🗂️" },
    { id: "expiring", label: "Expiring Soon", icon: "⚠️" },
  ];

  return (
    <MainLayout role="agent">
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>

      <div className="page-header">
        <div>
          <h1 className="page-title">Lease Contracts</h1>
          <p className="page-subtitle">Menaxho kontratat e qirasë dhe gjurmo afatet</p>
        </div>
        <button className="btn btn--primary" onClick={() => setCreateOpen(true)}>+ New Contract</button>
      </div>

      <div style={{ display: "flex", gap: 4, borderBottom: "1px solid #e8edf4", marginBottom: 20 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); setPage(0); }}
            style={{ padding: "9px 16px", border: "none",
              borderBottom: tab === t.id ? "2px solid #6366f1" : "2px solid transparent",
              background: "none", color: tab === t.id ? "#6366f1" : "#64748b",
              fontWeight: tab === t.id ? 600 : 400, fontSize: 13.5,
              cursor: "pointer", fontFamily: "inherit", marginBottom: -1,
              display: "flex", alignItems: "center", gap: 5 }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="card__header">
          <h2 className="card__title">{tabs.find(t => t.id === tab)?.label}</h2>
          {contracts.length > 0 && (
            <span style={{ background: "#eef2ff", color: "#6366f1",
              padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500 }}>
              {contracts.length}
            </span>
          )}
        </div>

        {loading ? <Loader /> : contracts.length === 0 ? (
          <EmptyState icon="📄"
            text={tab === "expiring" ? "Nuk ka kontrata që skadojnë së shpejti" : "Nuk ka kontrata"} />
        ) : (
          <>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th><th>Property</th><th>Client</th><th>Qiraja</th>
                    <th>Periudha</th><th>Statusi</th><th>Skadon</th><th>Veprime</th>
                  </tr>
                </thead>
                <tbody>
                  {contracts.map(c => {
                    const days     = daysUntil(c.end_date);
                    const expiring = days !== null && days <= 30 && days > 0 && c.status === "ACTIVE";
                    return (
                      <tr key={c.id}>
                        <td style={{ color: "#94a3b8", fontSize: 12 }}>{c.id}</td>
                        <td><span style={{ background: "#eef2ff", color: "#6366f1",
                          padding: "2px 7px", borderRadius: 20, fontSize: 12 }}>#{c.property_id}</span></td>
                        <td><span style={{ background: "#f0f9ff", color: "#0ea5e9",
                          padding: "2px 7px", borderRadius: 20, fontSize: 12 }}>#{c.client_id}</span></td>
                        <td style={{ fontWeight: 600 }}>{fmtMoney(c.rent, c.currency)}</td>
                        <td>
                          <p style={{ fontSize: 12, color: "#64748b" }}>{fmtDate(c.start_date)}</p>
                          <p style={{ fontSize: 12, color: "#64748b" }}>→ {fmtDate(c.end_date)}</p>
                        </td>
                        <td><StatusBadge status={c.status} /></td>
                        <td>
                          {days !== null && c.status === "ACTIVE" ? (
                            <span style={{ fontWeight: 600, fontSize: 12.5,
                              color: expiring ? "#d97706" : "#64748b" }}>
                              {expiring ? `⚠️ ${days}d` : `${days}d`}
                            </span>
                          ) : "—"}
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 5 }}>
                            <button className="btn btn--ghost btn--sm"
                              onClick={() => setDetailTarget(c)}>View</button>
                              <AiContractSummaryButton contract={c} />
                            <button className="btn btn--secondary btn--sm"
                              title="Shiko pagesat"
                              onClick={() => goToPayments(String(c.id))}
                              style={{ background: "#eef2ff", color: "#6366f1", border: "1px solid #c7d7fe" }}>
                              💳
                            </button>
                            {c.status !== "ENDED" && c.status !== "CANCELLED" && (
                              <button className="btn btn--secondary btn--sm"
                                onClick={() => setEditTarget(c)}>Edit</button>
                            )}
                          </div>
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

      {createOpen && (
        <ContractModal
          initial={editTarget || null}
          initialPropertyId={fromPropertyId}
          initialListingId={fromListingId}
          initialClientId={fromClientId}
          onClose={() => { setCreateOpen(false); setEditTarget(null); }}
          onSuccess={() => handleSuccess(editTarget ? "Kontrata u ndryshua" : "Kontrata u krijua")}
          notify={notify}
        />
      )}
      {editTarget && !createOpen && (
        <ContractModal initial={editTarget} onClose={() => setEditTarget(null)}
          onSuccess={() => handleSuccess("Kontrata u ndryshua")} notify={notify} />
      )}
      {statusTarget && (
        <StatusModal contract={statusTarget} onClose={() => setStatusTarget(null)}
          onSuccess={() => handleSuccess("Statusi u ndryshua")} notify={notify} />
      )}
      {detailTarget && (
        <ContractDetailModal contract={detailTarget} onClose={() => setDetailTarget(null)}
          onEdit={(c) => { setDetailTarget(null); setEditTarget(c); }}
          onStatusChange={(c) => { setDetailTarget(null); setStatusTarget(c); }}
          onGoToPayments={goToPayments} />
      )}
      {toast && <Toast key={toast.key} msg={toast.msg} type={toast.type}
        onDone={() => setToast(null)} />}
    </MainLayout>
  );
}