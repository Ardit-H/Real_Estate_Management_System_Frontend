import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/Layout";
import api from "../../api/axios";

// ─── DTOs (nga backend) ───────────────────────────────────────────────────────
// LeaseContractSummary: id, property_id, client_id, agent_id,
//   start_date, end_date, rent, currency, status, created_at
// LeaseContractResponse: + listing_id, deposit, contract_file_url, updated_at
// LeaseContractCreateRequest: property_id, listing_id*, client_id,
//   start_date, end_date, rent, deposit*, currency*, contract_file_url*
// LeaseContractUpdateRequest: start_date, end_date, rent, deposit, currency, contract_file_url
// LeaseStatusRequest: status (ACTIVE | ENDED | CANCELLED | PENDING_SIGNATURE)

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

  .lc * { box-sizing: border-box; margin: 0; padding: 0; }
  .lc { min-height: 100vh; background: #1a1714; font-family: 'DM Sans', sans-serif; color: #f5f0e8; padding: 32px 36px; }

  /* Header */
  .lc-eyebrow { font-size: 10.5px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: rgba(201,184,122,0.55); margin-bottom: 6px; }
  .lc-title { font-family: 'Cormorant Garamond', serif; font-size: 34px; font-weight: 700; color: #f5f0e8; line-height: 1.1; margin-bottom: 4px; }
  .lc-title span { color: #c9b87a; font-style: italic; }
  .lc-subtitle { font-size: 13px; color: rgba(245,240,232,0.38); margin-bottom: 28px; }

  /* Stats */
  .lc-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; margin-bottom: 28px; }
  .lc-stat { background: rgba(255,255,255,0.025); border: 1px solid rgba(201,184,122,0.1); border-radius: 14px; padding: 18px 20px; transition: all 0.2s; }
  .lc-stat:hover { background: rgba(201,184,122,0.05); border-color: rgba(201,184,122,0.2); transform: translateY(-1px); }
  .lc-stat-label { font-size: 10.5px; font-weight: 600; letter-spacing: 1.2px; text-transform: uppercase; color: rgba(245,240,232,0.3); margin-bottom: 8px; }
  .lc-stat-value { font-family: 'Cormorant Garamond', serif; font-size: 28px; font-weight: 700; line-height: 1; }
  .lc-stat-sub { font-size: 11px; color: rgba(245,240,232,0.3); margin-top: 4px; }

  /* Toolbar */
  .lc-toolbar { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
  .lc-search { flex: 1; min-width: 220px; max-width: 340px; display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.04); border: 1px solid rgba(201,184,122,0.12); border-radius: 10px; padding: 0 14px; height: 40px; transition: all 0.2s; }
  .lc-search:focus-within { border-color: rgba(201,184,122,0.3); box-shadow: 0 0 0 3px rgba(201,184,122,0.07); }
  .lc-search input { flex: 1; border: none; background: transparent; outline: none; font-size: 13px; color: #f5f0e8; font-family: 'DM Sans', sans-serif; }
  .lc-search input::placeholder { color: rgba(245,240,232,0.22); }

  .lc-select { height: 40px; padding: 0 12px; background: rgba(255,255,255,0.03); border: 1px solid rgba(201,184,122,0.12); border-radius: 10px; color: rgba(245,240,232,0.6); font-size: 12.5px; font-family: 'DM Sans', sans-serif; cursor: pointer; outline: none; }
  .lc-select option { background: #1a1714; }

  .lc-btn-add { height: 40px; padding: 0 18px; background: linear-gradient(135deg, #c9b87a, #b0983e); color: #1a1714; border: none; border-radius: 10px; font-size: 13px; font-weight: 700; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.17s; display: flex; align-items: center; gap: 7px; margin-left: auto; }
  .lc-btn-add:hover { opacity: 0.88; transform: translateY(-1px); }

  .lc-count { font-size: 12px; color: rgba(245,240,232,0.28); white-space: nowrap; }

  /* Table */
  .lc-table-wrap { background: rgba(255,255,255,0.02); border: 1px solid rgba(201,184,122,0.1); border-radius: 16px; overflow: hidden; margin-bottom: 20px; }
  .lc-table { width: 100%; border-collapse: collapse; }
  .lc-table thead tr { border-bottom: 1px solid rgba(201,184,122,0.1); background: rgba(255,255,255,0.02); }
  .lc-table th { padding: 13px 16px; text-align: left; font-size: 10.5px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: rgba(201,184,122,0.5); white-space: nowrap; }
  .lc-table th:last-child { text-align: right; }
  .lc-table tbody tr { border-bottom: 1px solid rgba(201,184,122,0.05); transition: background 0.15s; cursor: pointer; }
  .lc-table tbody tr:last-child { border-bottom: none; }
  .lc-table tbody tr:hover { background: rgba(201,184,122,0.04); }
  .lc-table td { padding: 14px 16px; vertical-align: middle; font-size: 13px; }
  .lc-table td:last-child { text-align: right; }

  /* Status badges */
  .lc-badge { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; white-space: nowrap; }
  .lc-badge-dot { width: 5px; height: 5px; border-radius: 50%; }
  .lc-badge-ACTIVE            { background: rgba(52,211,153,0.12);  color: #34d399; }
  .lc-badge-ACTIVE .lc-badge-dot            { background: #34d399; }
  .lc-badge-PENDING_SIGNATURE { background: rgba(251,191,36,0.12);  color: #fbbf24; }
  .lc-badge-PENDING_SIGNATURE .lc-badge-dot { background: #fbbf24; }
  .lc-badge-ENDED             { background: rgba(148,163,184,0.12); color: #94a3b8; }
  .lc-badge-ENDED .lc-badge-dot             { background: #94a3b8; }
  .lc-badge-CANCELLED         { background: rgba(248,113,113,0.12); color: #f87171; }
  .lc-badge-CANCELLED .lc-badge-dot         { background: #f87171; }

  /* Action buttons */
  .lc-actions { display: flex; align-items: center; gap: 7px; justify-content: flex-end; }
  .lc-btn { height: 30px; padding: 0 12px; border-radius: 7px; font-size: 11.5px; font-family: 'DM Sans', sans-serif; font-weight: 500; cursor: pointer; transition: all 0.17s; display: flex; align-items: center; gap: 5px; border: 1px solid transparent; }
  .lc-btn-view   { background: rgba(255,255,255,0.04); border-color: rgba(201,184,122,0.12); color: rgba(245,240,232,0.5); }
  .lc-btn-view:hover   { background: rgba(201,184,122,0.08); color: #c9b87a; border-color: rgba(201,184,122,0.25); }
  .lc-btn-edit   { background: rgba(56,189,248,0.08); border-color: rgba(56,189,248,0.2); color: #38bdf8; }
  .lc-btn-edit:hover   { background: rgba(56,189,248,0.15); }
  .lc-btn-status { background: rgba(167,139,250,0.08); border-color: rgba(167,139,250,0.2); color: #a78bfa; }
  .lc-btn-status:hover { background: rgba(167,139,250,0.15); }

  /* Pagination */
  .lc-pagination { display: flex; align-items: center; gap: 8px; justify-content: center; padding: 16px; }
  .lc-page-btn { height: 34px; min-width: 34px; padding: 0 10px; background: rgba(255,255,255,0.04); border: 1px solid rgba(201,184,122,0.12); border-radius: 8px; color: rgba(245,240,232,0.5); font-size: 12.5px; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.15s; display: flex; align-items: center; justify-content: center; }
  .lc-page-btn:hover:not(:disabled) { background: rgba(201,184,122,0.08); color: #c9b87a; }
  .lc-page-btn:disabled { opacity: 0.3; cursor: not-allowed; }
  .lc-page-btn.active { background: rgba(201,184,122,0.15); color: #c9b87a; border-color: rgba(201,184,122,0.3); }

  /* Empty / spinner */
  .lc-empty { padding: 64px 24px; text-align: center; color: rgba(245,240,232,0.28); }
  .lc-empty-icon { font-size: 36px; margin-bottom: 12px; }
  .lc-empty-text { font-size: 14px; }
  @keyframes lc-spin { to { transform: rotate(360deg); } }
  .lc-spinner { width: 22px; height: 22px; margin: 52px auto; border: 2px solid rgba(201,184,122,0.15); border-top-color: #c9b87a; border-radius: 50%; animation: lc-spin 0.7s linear infinite; }

  /* Modal */
  .lc-overlay { position: fixed; inset: 0; z-index: 600; background: rgba(0,0,0,0.78); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; padding: 20px; animation: lc-fade 0.18s ease; }
  @keyframes lc-fade { from{opacity:0} to{opacity:1} }
  @keyframes lc-up   { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  .lc-modal { background: #211d19; border: 1px solid rgba(201,184,122,0.15); border-radius: 18px; width: 100%; max-width: 580px; max-height: 92vh; overflow-y: auto; box-shadow: 0 36px 88px rgba(0,0,0,0.65); animation: lc-up 0.24s cubic-bezier(0.16,1,0.3,1); }
  .lc-modal-sm { max-width: 440px; }
  .lc-modal-header { padding: 22px 26px 16px; border-bottom: 1px solid rgba(201,184,122,0.08); background: rgba(255,255,255,0.02); position: sticky; top: 0; z-index: 1; display: flex; align-items: center; justify-content: space-between; }
  .lc-modal-title { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 700; color: #f5f0e8; }
  .lc-modal-sub { font-size: 12px; color: rgba(245,240,232,0.35); margin-top: 2px; }
  .lc-modal-close { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; width: 30px; height: 30px; cursor: pointer; color: rgba(245,240,232,0.5); font-size: 15px; display: flex; align-items: center; justify-content: center; transition: all 0.15s; flex-shrink: 0; }
  .lc-modal-close:hover { background: rgba(255,255,255,0.1); color: #f5f0e8; }
  .lc-modal-body { padding: 22px 26px; }
  .lc-modal-footer { display: flex; gap: 10px; justify-content: flex-end; padding-top: 18px; border-top: 1px solid rgba(201,184,122,0.08); margin-top: 4px; }

  /* Form fields */
  .lc-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .lc-field { margin-bottom: 14px; }
  .lc-label { display: block; font-size: 10.5px; font-weight: 600; letter-spacing: 0.8px; text-transform: uppercase; color: rgba(201,184,122,0.5); margin-bottom: 7px; }
  .lc-label span { color: #f87171; margin-left: 2px; }
  .lc-input { width: 100%; padding: 10px 13px; background: rgba(255,255,255,0.04); border: 1px solid rgba(201,184,122,0.14); border-radius: 9px; color: #f5f0e8; font-size: 13px; font-family: 'DM Sans', sans-serif; outline: none; transition: border-color 0.2s; }
  .lc-input:focus { border-color: rgba(201,184,122,0.4); box-shadow: 0 0 0 3px rgba(201,184,122,0.07); }
  .lc-input::placeholder { color: rgba(245,240,232,0.2); }
  .lc-input option { background: #1a1714; }

  /* Detail grid */
  .lc-detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 18px; }
  .lc-detail-item { background: rgba(255,255,255,0.03); border: 1px solid rgba(201,184,122,0.08); border-radius: 10px; padding: 12px 14px; }
  .lc-detail-item.full { grid-column: 1 / -1; }
  .lc-detail-label { font-size: 10px; font-weight: 600; letter-spacing: 0.8px; text-transform: uppercase; color: rgba(201,184,122,0.45); margin-bottom: 5px; }
  .lc-detail-value { font-size: 13.5px; color: rgba(245,240,232,0.82); }

  /* Buttons in modal footer */
  .lc-btn-cancel { height: 38px; padding: 0 18px; background: rgba(255,255,255,0.04); border: 1px solid rgba(201,184,122,0.12); border-radius: 10px; color: rgba(245,240,232,0.5); font-size: 13px; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.15s; }
  .lc-btn-cancel:hover { background: rgba(255,255,255,0.07); color: #f5f0e8; }
  .lc-btn-primary { height: 38px; padding: 0 22px; background: linear-gradient(135deg,#c9b87a,#b0983e); color: #1a1714; border: none; border-radius: 10px; font-size: 13px; font-weight: 700; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.15s; }
  .lc-btn-primary:hover { opacity: 0.88; }
  .lc-btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
  .lc-btn-danger { height: 38px; padding: 0 18px; background: rgba(248,113,113,0.12); border: 1px solid rgba(248,113,113,0.3); border-radius: 10px; color: #f87171; font-size: 13px; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.15s; }
  .lc-btn-danger:hover { background: rgba(248,113,113,0.2); }

  /* Toast */
  @keyframes lc-toast-in { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  .lc-toast { position: fixed; bottom: 28px; right: 28px; z-index: 9999; background: #211d19; border-radius: 12px; padding: 13px 18px; display: flex; align-items: center; gap: 10px; box-shadow: 0 16px 40px rgba(0,0,0,0.5); font-size: 13.5px; color: rgba(245,240,232,0.85); max-width: 340px; animation: lc-toast-in 0.25s ease; }
  .lc-toast.success { border: 1px solid rgba(52,211,153,0.3); }
  .lc-toast.error   { border: 1px solid rgba(248,113,113,0.3); }

  /* Expiring alert */
  .lc-alert { background: rgba(251,191,36,0.06); border: 1px solid rgba(251,191,36,0.2); border-radius: 12px; padding: 14px 18px; display: flex; align-items: center; gap: 12px; margin-bottom: 20px; font-size: 13px; color: rgba(245,240,232,0.7); }
  .lc-alert strong { color: #fbbf24; }
`;

const STATUS_LABELS = {
  ACTIVE:            "Active",
  PENDING_SIGNATURE: "Pending Signature",
  ENDED:             "Ended",
  CANCELLED:         "Cancelled",
};

const CURRENCIES = ["EUR","USD","GBP","CHF","ALL","MKD"];

const fmtMoney = (v, cur="EUR") =>
  v != null ? `${cur} ${Number(v).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—";

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const today = () => new Date().toISOString().split("T")[0];

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  return (
    <span className={`lc-badge lc-badge-${status}`}>
      <span className="lc-badge-dot" />
      {STATUS_LABELS[status] || status}
    </span>
  );
}

function Spinner() { return <div className="lc-spinner" />; }

function Toast({ msg, type, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3400); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className={`lc-toast ${type}`}>
      {type === "success" ? "✅" : "❌"} {msg}
    </div>
  );
}

function Field({ label, required, hint, children }) {
  return (
    <div className="lc-field">
      <label className="lc-label">{label}{required && <span>*</span>}</label>
      {children}
      {hint && <p style={{ fontSize: 11, color: "rgba(245,240,232,0.28)", marginTop: 4 }}>{hint}</p>}
    </div>
  );
}

// ─── CREATE MODAL ─────────────────────────────────────────────────────────────
function CreateModal({ onClose, onSuccess, notify }) {
  const [form, setForm] = useState({
    property_id: "", listing_id: "", client_id: "",
    start_date: "", end_date: "",
    rent: "", deposit: "", currency: "EUR", contract_file_url: "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.property_id || !form.client_id || !form.start_date || !form.end_date || !form.rent) {
      notify("Plotëso të gjitha fushat e detyrueshme", "error"); return;
    }
    if (form.end_date <= form.start_date) {
      notify("End date duhet të jetë pas start date", "error"); return;
    }
    setSaving(true);
    try {
      await api.post("/api/contracts/lease", {
        property_id:       Number(form.property_id),
        listing_id:        form.listing_id ? Number(form.listing_id) : null,
        client_id:         Number(form.client_id),
        start_date:        form.start_date,
        end_date:          form.end_date,
        rent:              Number(form.rent),
        deposit:           form.deposit ? Number(form.deposit) : null,
        currency:          form.currency || "EUR",
        contract_file_url: form.contract_file_url || null,
      });
      onSuccess();
    } catch (err) {
      notify(err.response?.data?.message || "Gabim gjatë krijimit", "error");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const h = e => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div className="lc-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="lc-modal">
        <div className="lc-modal-header">
          <div>
            <div className="lc-modal-title">New Lease Contract</div>
            <div className="lc-modal-sub">Krijo kontratë qiraje të re</div>
          </div>
          <button className="lc-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="lc-modal-body">
          <div className="lc-row2">
            <Field label="Property ID" required>
              <input className="lc-input" type="number" min="1" placeholder="1" value={form.property_id} onChange={e => set("property_id", e.target.value)} />
            </Field>
            <Field label="Listing ID" hint="Opcional">
              <input className="lc-input" type="number" min="1" placeholder="—" value={form.listing_id} onChange={e => set("listing_id", e.target.value)} />
            </Field>
          </div>
          <Field label="Client ID" required>
            <input className="lc-input" type="number" min="1" placeholder="ID e klientit" value={form.client_id} onChange={e => set("client_id", e.target.value)} />
          </Field>
          <div className="lc-row2">
            <Field label="Start Date" required>
              <input className="lc-input" type="date" min={today()} value={form.start_date} onChange={e => set("start_date", e.target.value)} />
            </Field>
            <Field label="End Date" required>
              <input className="lc-input" type="date" min={form.start_date || today()} value={form.end_date} onChange={e => set("end_date", e.target.value)} />
            </Field>
          </div>
          <div className="lc-row2">
            <Field label="Rent / month" required>
              <input className="lc-input" type="number" min="0" step="0.01" placeholder="450.00" value={form.rent} onChange={e => set("rent", e.target.value)} />
            </Field>
            <Field label="Deposit" hint="Opcional">
              <input className="lc-input" type="number" min="0" step="0.01" placeholder="900.00" value={form.deposit} onChange={e => set("deposit", e.target.value)} />
            </Field>
          </div>
          <div className="lc-row2">
            <Field label="Currency">
              <select className="lc-input" value={form.currency} onChange={e => set("currency", e.target.value)}>
                {CURRENCIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Contract File URL" hint="Opcional">
              <input className="lc-input" type="text" placeholder="https://..." value={form.contract_file_url} onChange={e => set("contract_file_url", e.target.value)} />
            </Field>
          </div>
          <div className="lc-modal-footer">
            <button className="lc-btn-cancel" onClick={onClose}>Anulo</button>
            <button className="lc-btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? "Duke krijuar..." : "✓ Krijo Kontratë"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── EDIT MODAL ───────────────────────────────────────────────────────────────
function EditModal({ contract, onClose, onSuccess, notify }) {
  const [form, setForm] = useState({
    start_date:        contract.start_date?.split("T")[0] || "",
    end_date:          contract.end_date?.split("T")[0]   || "",
    rent:              contract.rent     || "",
    deposit:           contract.deposit  || "",
    currency:          contract.currency || "EUR",
    contract_file_url: contract.contract_file_url || "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (form.start_date && form.end_date && form.end_date <= form.start_date) {
      notify("End date duhet të jetë pas start date", "error"); return;
    }
    setSaving(true);
    try {
      await api.put(`/api/contracts/lease/${contract.id}`, {
        start_date:        form.start_date        || null,
        end_date:          form.end_date          || null,
        rent:              form.rent ? Number(form.rent)    : null,
        deposit:           form.deposit ? Number(form.deposit) : null,
        currency:          form.currency          || null,
        contract_file_url: form.contract_file_url || null,
      });
      onSuccess();
    } catch (err) {
      notify(err.response?.data?.message || "Gabim gjatë ruajtjes", "error");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const h = e => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div className="lc-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="lc-modal">
        <div className="lc-modal-header">
          <div>
            <div className="lc-modal-title">Edit Contract #{contract.id}</div>
            <div className="lc-modal-sub">Ndrysho të dhënat e kontratës</div>
          </div>
          <button className="lc-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="lc-modal-body">
          <div className="lc-row2">
            <Field label="Start Date">
              <input className="lc-input" type="date" value={form.start_date} onChange={e => set("start_date", e.target.value)} />
            </Field>
            <Field label="End Date">
              <input className="lc-input" type="date" value={form.end_date} onChange={e => set("end_date", e.target.value)} />
            </Field>
          </div>
          <div className="lc-row2">
            <Field label="Rent / month">
              <input className="lc-input" type="number" min="0" step="0.01" value={form.rent} onChange={e => set("rent", e.target.value)} />
            </Field>
            <Field label="Deposit">
              <input className="lc-input" type="number" min="0" step="0.01" value={form.deposit} onChange={e => set("deposit", e.target.value)} />
            </Field>
          </div>
          <div className="lc-row2">
            <Field label="Currency">
              <select className="lc-input" value={form.currency} onChange={e => set("currency", e.target.value)}>
                {CURRENCIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Contract File URL">
              <input className="lc-input" type="text" placeholder="https://..." value={form.contract_file_url} onChange={e => set("contract_file_url", e.target.value)} />
            </Field>
          </div>
          <div className="lc-modal-footer">
            <button className="lc-btn-cancel" onClick={onClose}>Anulo</button>
            <button className="lc-btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? "Duke ruajtur..." : "✓ Ruaj Ndryshimet"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── STATUS MODAL ─────────────────────────────────────────────────────────────
function StatusModal({ contract, onClose, onSuccess, notify }) {
  const [status, setStatus] = useState(contract.status);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (status === contract.status) { onClose(); return; }
    setSaving(true);
    try {
      await api.patch(`/api/contracts/lease/${contract.id}/status`, { status });
      onSuccess();
    } catch (err) {
      notify(err.response?.data?.message || "Gabim gjatë ndryshimit", "error");
    } finally {
      setSaving(false);
    }
  };

  const STATUSES = ["ACTIVE","PENDING_SIGNATURE","ENDED","CANCELLED"];

  return (
    <div className="lc-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="lc-modal lc-modal-sm">
        <div className="lc-modal-header">
          <div>
            <div className="lc-modal-title">Change Status</div>
            <div className="lc-modal-sub">Contract #{contract.id}</div>
          </div>
          <button className="lc-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="lc-modal-body">
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
            {STATUSES.map(s => (
              <label key={s} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: status === s ? "rgba(201,184,122,0.08)" : "rgba(255,255,255,0.02)", border: `1px solid ${status === s ? "rgba(201,184,122,0.25)" : "rgba(201,184,122,0.08)"}`, borderRadius: 10, cursor: "pointer", transition: "all 0.15s" }}>
                <input type="radio" name="status" value={s} checked={status === s} onChange={() => setStatus(s)} style={{ accentColor: "#c9b87a" }} />
                <StatusBadge status={s} />
              </label>
            ))}
          </div>
          {status === "ACTIVE" && contract.status === "PENDING_SIGNATURE" && (
            <div style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.18)", borderRadius: 9, padding: "10px 13px", fontSize: 12.5, color: "rgba(245,240,232,0.6)", marginBottom: 16, lineHeight: 1.6 }}>
              ℹ️ Aktivizimi i kontratës do të krijojë automatikisht pagesat e komisionit.
            </div>
          )}
          <div className="lc-modal-footer">
            <button className="lc-btn-cancel" onClick={onClose}>Anulo</button>
            <button className="lc-btn-primary" onClick={handleSubmit} disabled={saving || status === contract.status}>
              {saving ? "Duke ndryshuar..." : "✓ Ndrysho Statusin"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── VIEW MODAL ───────────────────────────────────────────────────────────────
function ViewModal({ contract, onClose, onEdit, onStatus }) {
  return (
    <div className="lc-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="lc-modal">
        <div className="lc-modal-header">
          <div>
            <div className="lc-modal-title">Contract #{contract.id}</div>
            <div className="lc-modal-sub">Detajet e plota të kontratës</div>
          </div>
          <button className="lc-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="lc-modal-body">
          {/* Status hero */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(201,184,122,0.1)", borderRadius: 12, padding: "14px 16px", marginBottom: 18 }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 11, color: "rgba(245,240,232,0.35)", textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: 600, marginBottom: 6 }}>Status</p>
              <StatusBadge status={contract.status} />
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 11, color: "rgba(245,240,232,0.35)", textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: 600, marginBottom: 4 }}>Monthly Rent</p>
              <p style={{ fontSize: 22, fontWeight: 700, color: "#c9b87a", fontFamily: "'Cormorant Garamond', serif" }}>
                {fmtMoney(contract.rent, contract.currency)}
              </p>
            </div>
          </div>

          <div className="lc-detail-grid">
            <div className="lc-detail-item">
              <div className="lc-detail-label">Property ID</div>
              <div className="lc-detail-value">#{contract.property_id || "—"}</div>
            </div>
            <div className="lc-detail-item">
              <div className="lc-detail-label">Client ID</div>
              <div className="lc-detail-value">#{contract.client_id || "—"}</div>
            </div>
            <div className="lc-detail-item">
              <div className="lc-detail-label">Agent ID</div>
              <div className="lc-detail-value">#{contract.agent_id || "—"}</div>
            </div>
            <div className="lc-detail-item">
              <div className="lc-detail-label">Listing ID</div>
              <div className="lc-detail-value">{contract.listing_id ? `#${contract.listing_id}` : "—"}</div>
            </div>
            <div className="lc-detail-item">
              <div className="lc-detail-label">Start Date</div>
              <div className="lc-detail-value">{fmtDate(contract.start_date)}</div>
            </div>
            <div className="lc-detail-item">
              <div className="lc-detail-label">End Date</div>
              <div className="lc-detail-value">{fmtDate(contract.end_date)}</div>
            </div>
            <div className="lc-detail-item">
              <div className="lc-detail-label">Deposit</div>
              <div className="lc-detail-value">{fmtMoney(contract.deposit, contract.currency)}</div>
            </div>
            <div className="lc-detail-item">
              <div className="lc-detail-label">Currency</div>
              <div className="lc-detail-value">{contract.currency || "EUR"}</div>
            </div>
            <div className="lc-detail-item">
              <div className="lc-detail-label">Created At</div>
              <div className="lc-detail-value">{fmtDate(contract.created_at)}</div>
            </div>
            <div className="lc-detail-item">
              <div className="lc-detail-label">Updated At</div>
              <div className="lc-detail-value">{fmtDate(contract.updated_at)}</div>
            </div>
            {contract.contract_file_url && (
              <div className="lc-detail-item full">
                <div className="lc-detail-label">Contract File</div>
                <div className="lc-detail-value">
                  <a href={contract.contract_file_url} target="_blank" rel="noopener noreferrer"
                    style={{ color: "#38bdf8", fontSize: 12.5 }}>
                    {contract.contract_file_url}
                  </a>
                </div>
              </div>
            )}
          </div>

          <div className="lc-modal-footer">
            <button className="lc-btn-cancel" onClick={onClose}>Mbyll</button>
            <button className="lc-btn-edit lc-btn" style={{ height: 38, padding: "0 16px", fontSize: 13 }} onClick={() => { onClose(); onStatus(contract); }}>
              ⚡ Status
            </button>
            <button className="lc-btn-primary" onClick={() => { onClose(); onEdit(contract); }}>
              ✏️ Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function AdminContracts() {
  const navigate = useNavigate();

  const [contracts,     setContracts]     = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [page,          setPage]          = useState(0);
  const [totalPages,    setTotalPages]    = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [search,        setSearch]        = useState("");
  const [statusFilter,  setStatusFilter]  = useState("ALL");
  const [expiring,      setExpiring]      = useState([]);

  const [createOpen,    setCreateOpen]    = useState(false);
  const [viewTarget,    setViewTarget]    = useState(null);
  const [editTarget,    setEditTarget]    = useState(null);
  const [statusTarget,  setStatusTarget]  = useState(null);
  const [detailCache,   setDetailCache]   = useState({});

  const [toast, setToast] = useState(null);
  const notify = (msg, type = "success") => setToast({ msg, type, key: Date.now() });

  const PAGE_SIZE = 10;

  const fetchContracts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/contracts/lease?page=${page}&size=${PAGE_SIZE}`);
      setContracts(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setTotalElements(res.data.totalElements || 0);
    } catch {
      notify("Gabim gjatë ngarkimit të kontratave", "error");
    } finally {
      setLoading(false);
    }
  }, [page]);

  const fetchExpiring = useCallback(async () => {
    try {
      const res = await api.get("/api/contracts/lease/expiring");
      setExpiring(Array.isArray(res.data) ? res.data : []);
    } catch {}
  }, []);

  useEffect(() => { fetchContracts(); }, [fetchContracts]);
  useEffect(() => { fetchExpiring(); }, [fetchExpiring]);

  const handleViewContract = async (c) => {
    if (detailCache[c.id]) { setViewTarget(detailCache[c.id]); return; }
    try {
      const res = await api.get(`/api/contracts/lease/${c.id}`);
      setDetailCache(prev => ({ ...prev, [c.id]: res.data }));
      setViewTarget(res.data);
    } catch {
      notify("Nuk u gjet kontrata", "error");
    }
  };

  const handleSuccess = (msg = "Operacioni u krye me sukses") => {
    setCreateOpen(false);
    setEditTarget(null);
    setStatusTarget(null);
    setDetailCache({});
    notify(msg);
    fetchContracts();
    fetchExpiring();
  };

  // Filter client-side për search dhe status
  const filtered = contracts.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      String(c.id).includes(q) ||
      String(c.property_id).includes(q) ||
      String(c.client_id).includes(q) ||
      String(c.agent_id).includes(q);
    const matchStatus = statusFilter === "ALL" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Stats nga lista aktuale
  const stats = {
    total:    totalElements,
    active:   contracts.filter(c => c.status === "ACTIVE").length,
    pending:  contracts.filter(c => c.status === "PENDING_SIGNATURE").length,
    expiring: expiring.length,
  };

  return (
    <MainLayout role="admin">
      <style>{CSS}</style>
      <div className="lc">

        {/* ── Header ── */}
        <p className="lc-eyebrow">Finance Management</p>
        <h1 className="lc-title">Lease <span>Contracts</span></h1>
        <p className="lc-subtitle">Menaxho të gjitha kontratat e qirasë — krijo, edito dhe ndrysho statusin</p>

        {/* ── Stats ── */}
        <div className="lc-stats">
          {[
            { label: "Total Contracts",    value: stats.total,    sub: "në sistem",          color: "#f5f0e8" },
            { label: "Active",             value: stats.active,   sub: "aktive tani",         color: "#34d399" },
            { label: "Pending Signature",  value: stats.pending,  sub: "në pritje firme",     color: "#fbbf24" },
            { label: "Expiring (30 days)", value: stats.expiring, sub: "skadojnë së shpejti", color: stats.expiring > 0 ? "#f87171" : "#94a3b8" },
          ].map(s => (
            <div className="lc-stat" key={s.label}>
              <p className="lc-stat-label">{s.label}</p>
              <p className="lc-stat-value" style={{ color: s.color }}>{s.value}</p>
              <p className="lc-stat-sub">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Expiring alert ── */}
        {expiring.length > 0 && (
          <div className="lc-alert">
            <span style={{ fontSize: 18 }}>⚠️</span>
            <div>
              <strong>{expiring.length} kontrata</strong> skadojnë brenda 30 ditëve —{" "}
              {expiring.slice(0, 3).map(c => `#${c.id}`).join(", ")}
              {expiring.length > 3 ? ` dhe ${expiring.length - 3} të tjera` : ""}
            </div>
          </div>
        )}

        {/* ── Toolbar ── */}
        <div className="lc-toolbar">
          <div className="lc-search">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(245,240,232,0.25)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Kërko sipas ID, pronës, klientit..." />
          </div>
          <select className="lc-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(0); }}>
            <option value="ALL">Të gjitha statuset</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING_SIGNATURE">Pending Signature</option>
            <option value="ENDED">Ended</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <span className="lc-count">{filtered.length} kontrata</span>
          <button className="lc-btn-add" onClick={() => setCreateOpen(true)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Contract
          </button>
        </div>

        {/* ── Table ── */}
        <div className="lc-table-wrap">
          {loading ? <Spinner /> :
           filtered.length === 0 ? (
            <div className="lc-empty">
              <div className="lc-empty-icon">📋</div>
              <div className="lc-empty-text">
                {search || statusFilter !== "ALL" ? "Nuk u gjet asnjë kontratë" : "Nuk ka kontrata ende"}
              </div>
            </div>
          ) : (
            <table className="lc-table">
              <thead>
                <tr>
                  <th>#ID</th>
                  <th>Property</th>
                  <th>Client</th>
                  <th>Agent</th>
                  <th>Period</th>
                  <th>Rent / mo</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => {
                  const isExpiring = expiring.some(e => e.id === c.id);
                  return (
                    <tr key={c.id} onClick={() => handleViewContract(c)}>
                      <td>
                        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15, fontWeight: 700, color: "#c9b87a" }}>
                          #{c.id}
                        </span>
                      </td>
                      <td>
                        <span style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(201,184,122,0.1)", padding: "3px 9px", borderRadius: 7, fontSize: 12, color: "rgba(245,240,232,0.6)" }}>
                          Prop #{c.property_id}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: 12.5, color: "rgba(245,240,232,0.55)" }}>Client #{c.client_id}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: 12.5, color: "rgba(245,240,232,0.45)" }}>
                          {c.agent_id ? `Agent #${c.agent_id}` : "—"}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: 12, color: "rgba(245,240,232,0.5)" }}>
                          {fmtDate(c.start_date)} → {fmtDate(c.end_date)}
                        </span>
                        {isExpiring && (
                          <span style={{ marginLeft: 6, fontSize: 10, background: "rgba(251,191,36,0.12)", color: "#fbbf24", padding: "1px 6px", borderRadius: 10 }}>
                            ⚠️ Expiring
                          </span>
                        )}
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: "#c9b87a", fontSize: 13 }}>
                          {fmtMoney(c.rent, c.currency)}
                        </span>
                      </td>
                      <td><StatusBadge status={c.status} /></td>
                      <td>
                        <span style={{ fontSize: 12, color: "rgba(245,240,232,0.35)" }}>
                          {fmtDate(c.created_at)}
                        </span>
                      </td>
                      <td onClick={e => e.stopPropagation()}>
                        <div className="lc-actions">
                          <button className="lc-btn lc-btn-view" onClick={() => handleViewContract(c)}>
                            👁 View
                          </button>
                          <button className="lc-btn lc-btn-edit" onClick={() => setEditTarget(c)}>
                            ✏️ Edit
                          </button>
                          <button className="lc-btn lc-btn-status" onClick={() => setStatusTarget(c)}>
                            ⚡ Status
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="lc-pagination">
            <button className="lc-page-btn" disabled={page === 0} onClick={() => setPage(p => p - 1)}>← Prev</button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const p = page <= 3 ? i : page - 3 + i;
              if (p >= totalPages) return null;
              return (
                <button key={p} className={`lc-page-btn ${p === page ? "active" : ""}`} onClick={() => setPage(p)}>
                  {p + 1}
                </button>
              );
            })}
            <button className="lc-page-btn" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next →</button>
          </div>
        )}

      </div>

      {/* ── Modals ── */}
      {createOpen && (
        <CreateModal
          onClose={() => setCreateOpen(false)}
          onSuccess={() => handleSuccess("Kontrata u krijua me sukses ✓")}
          notify={notify}
        />
      )}

      {viewTarget && (
        <ViewModal
          contract={viewTarget}
          onClose={() => setViewTarget(null)}
          onEdit={c => setEditTarget(c)}
          onStatus={c => setStatusTarget(c)}
        />
      )}

      {editTarget && (
        <EditModal
          contract={editTarget}
          onClose={() => setEditTarget(null)}
          onSuccess={() => handleSuccess("Kontrata u ndryshua me sukses ✓")}
          notify={notify}
        />
      )}

      {statusTarget && (
        <StatusModal
          contract={statusTarget}
          onClose={() => setStatusTarget(null)}
          onSuccess={() => handleSuccess("Statusi u ndryshua me sukses ✓")}
          notify={notify}
        />
      )}

      {toast && (
        <Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />
      )}
    </MainLayout>
  );
}