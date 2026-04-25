import { useState, useEffect, useCallback } from "react";
import MainLayout from "../../components/layout/Layout";
import api from "../../api/axios";

// ─── Constants ────────────────────────────────────────────────────────────────
const LEASE_STATUSES = ["ACTIVE", "ENDED", "CANCELLED", "PENDING_SIGNATURE"];
const CURRENCIES     = ["EUR", "USD", "GBP", "CHF", "ALL", "MKD"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtPrice = (v, cur = "EUR") =>
  v != null ? `€${Number(v).toLocaleString("de-DE")} ${cur}` : "—";

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" }) : "—";

const fmtDateTime = (d) =>
  d ? new Date(d).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "2-digit",
    hour: "2-digit", minute: "2-digit",
  }) : "—";

// ─── Badge ────────────────────────────────────────────────────────────────────
const BADGE_CFG = {
  ACTIVE:            { bg: "#EAF3DE", color: "#3B6D11" },
  ENDED:             { bg: "#F1EFE8", color: "#5F5E5A" },
  CANCELLED:         { bg: "#FCEBEB", color: "#A32D2D" },
  PENDING_SIGNATURE: { bg: "#FAEEDA", color: "#854F0B" },
};

function Badge({ label }) {
  const s = BADGE_CFG[label] || { bg: "#F1EFE8", color: "#5F5E5A" };
  return (
    <span style={{
      background: s.bg, color: s.color, fontSize: 11, fontWeight: 500,
      padding: "3px 8px", borderRadius: 999, whiteSpace: "nowrap", display: "inline-block",
    }}>
      {label ?? "—"}
    </span>
  );
}

// ─── Shared UI ────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children, maxWidth = 560 }) {
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(15,23,42,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ width: "100%", maxWidth, background: "#fff", borderRadius: 16, boxShadow: "0 20px 60px rgba(15,23,42,0.18)", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid #e8edf4", position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
          <span style={{ fontWeight: 600, fontSize: 15 }}>{title}</span>
          <button onClick={onClose} style={{ width: 30, height: 30, border: "none", background: "none", color: "#94a3b8", cursor: "pointer", fontSize: 16, borderRadius: 6 }}>✕</button>
        </div>
        <div style={{ padding: "22px 24px" }}>{children}</div>
      </div>
    </div>
  );
}

function Toast({ msg, type = "success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{
      position: "fixed", bottom: 28, right: 28, zIndex: 9999,
      background: type === "error" ? "#fee2e2" : "#ecfdf5",
      color: type === "error" ? "#b91c1c" : "#047857",
      padding: "12px 20px", borderRadius: 10, fontSize: 13, fontWeight: 500,
      boxShadow: "0 4px 18px rgba(0,0,0,0.12)", maxWidth: 340,
    }}>{msg}</div>
  );
}

const TH = { padding: "10px 12px", textAlign: "left", fontWeight: 500, fontSize: 12, color: "#64748b", borderBottom: "1px solid #e8edf4", background: "#f8fafc", whiteSpace: "nowrap" };
const TD = { padding: "10px 12px", borderBottom: "1px solid #f1f5f9", fontSize: 13, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" };
const inputSt  = { width: "100%", padding: "8px 11px", fontSize: 13, border: "1px solid #d1d5db", borderRadius: 8, background: "#fff", color: "#0f172a", outline: "none", boxSizing: "border-box" };
const selectSt = { ...inputSt, cursor: "pointer" };
const btnPrimary = { fontSize: 13, padding: "7px 14px", borderRadius: 8, border: "none", background: "#6366f1", color: "#fff", cursor: "pointer", fontWeight: 500, whiteSpace: "nowrap" };
const btnSm = (bg, color, border) => ({ fontSize: 11, padding: "4px 9px", borderRadius: 6, border: `1px solid ${border}`, background: bg, color, cursor: "pointer", whiteSpace: "nowrap", fontWeight: 500 });

function Field({ label, children, required }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 12, fontWeight: 500, color: "#374151", display: "block", marginBottom: 5 }}>
        {label}{required && <span style={{ color: "#ef4444", marginLeft: 2 }}>*</span>}
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
    <div style={{ textAlign: "center", padding: "52px 20px", color: "#94a3b8" }}>
      <div style={{ fontSize: 34, marginBottom: 12 }}>{icon}</div>
      <p style={{ fontSize: 14 }}>{text}</p>
    </div>
  );
}

function Loader() {
  return (
    <div style={{ textAlign: "center", padding: "48px 0" }}>
      <div style={{ width: 28, height: 28, margin: "0 auto", border: "3px solid #e8edf4", borderTop: "3px solid #6366f1", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
    </div>
  );
}

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const dis = (d) => ({ fontSize: 13, padding: "5px 12px", borderRadius: 8, border: "0.5px solid #d1d5db", background: "transparent", color: d ? "#cbd5e1" : "#374151", cursor: d ? "default" : "pointer", opacity: d ? 0.5 : 1 });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end", padding: "14px 16px 4px" }}>
      <button disabled={page === 0} onClick={() => onChange(page - 1)} style={dis(page === 0)}>← Prev</button>
      <span style={{ fontSize: 13, color: "#64748b", padding: "0 6px" }}>{page + 1} / {totalPages}</span>
      <button disabled={page >= totalPages - 1} onClick={() => onChange(page + 1)} style={dis(page >= totalPages - 1)}>Next →</button>
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
  const d = detail || c;
  return (
    <Modal title={`Lease Contract #${c.id} — Detaje`} onClose={onClose} maxWidth={600}>
      {!detail ? <Loader /> : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" }}>
          {[
            ["ID", `#${d.id}`],
            ["Property", `#${d.property_id}`],
            ["Listing", d.listing_id ? `#${d.listing_id}` : "—"],
            ["Client", `#${d.client_id}`],
            ["Agent", d.agent_id ? `#${d.agent_id}` : "—"],
            ["Rent", fmtPrice(d.rent, d.currency)],
            ["Deposit", fmtPrice(d.deposit, d.currency)],
            ["Start Date", fmtDate(d.start_date)],
            ["End Date", fmtDate(d.end_date)],
            ["Status", "badge"],
            ["Created", fmtDateTime(d.created_at)],
            ["Updated", fmtDateTime(d.updated_at)],
          ].map(([label, val]) => (
            <div key={label}>
              <p style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 3px" }}>{label}</p>
              {val === "badge"
                ? <Badge label={d.status} />
                : <p style={{ fontSize: 14, fontWeight: 500, margin: 0, wordBreak: "break-all" }}>{val}</p>}
            </div>
          ))}
          {d.contract_file_url && (
            <div style={{ gridColumn: "1/-1" }}>
              <p style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 5px" }}>File</p>
              <a href={d.contract_file_url} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: "#6366f1" }}>📎 Open</a>
            </div>
          )}
        </div>
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
      notify("Property ID, Client ID, Rent, Start Date dhe End Date janë të detyrueshme", "error");
      return;
    }
    if (dateError) { notify(dateError, "error"); return; }
    setSaving(true);
    try {
      const payload = {
        property_id:       Number(form.property_id),
        listing_id:        form.listing_id ? Number(form.listing_id) : null,
        client_id:         Number(form.client_id),
        start_date:        form.start_date,
        end_date:          form.end_date,
        rent:              Number(form.rent),
        deposit:           form.deposit ? Number(form.deposit) : null,
        currency:          form.currency,
        contract_file_url: form.contract_file_url || null,
      };
      if (initial) {
        await api.put(`/api/contracts/lease/${initial.id}`, payload);
        onSuccess(null);
      } else {
        const res = await api.post("/api/contracts/lease", payload);
        onSuccess(res.data?.id ?? null);
      }
    } catch (err) {
      notify(err.response?.data?.message || "Gabim gjatë ruajtjes", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={initial ? `Edit Contract #${initial.id}` : "New Lease Contract"} onClose={onClose} maxWidth={620}>
      <Row2>
        <Field label="Property ID" required>
          <input style={inputSt} type="number" value={form.property_id}
            onChange={e => set("property_id", e.target.value)} disabled={!!initial} placeholder="ex: 1" />
        </Field>
        <Field label="Listing ID">
          <input style={inputSt} type="number" value={form.listing_id}
            onChange={e => set("listing_id", e.target.value)} placeholder="(opcional)" />
        </Field>
      </Row2>
      <Row2>
        <Field label="Client ID" required>
          <input style={inputSt} type="number" value={form.client_id}
            onChange={e => set("client_id", e.target.value)} disabled={!!initial} placeholder="ID e klientit" />
        </Field>
        <Field label="Rent" required>
          <input style={inputSt} type="number" value={form.rent}
            onChange={e => set("rent", e.target.value)} placeholder="ex: 800" />
        </Field>
      </Row2>
      <Row2>
        <Field label="Deposit">
          <input style={inputSt} type="number" value={form.deposit}
            onChange={e => set("deposit", e.target.value)} placeholder="ex: 1600" />
        </Field>
        <Field label="Currency">
          <select style={selectSt} value={form.currency} onChange={e => set("currency", e.target.value)}>
            {CURRENCIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </Field>
      </Row2>
      <Row2>
        <Field label="Start Date" required>
          <input style={inputSt} type="date" value={form.start_date}
            onChange={e => set("start_date", e.target.value)} />
        </Field>
        <Field label="End Date" required>
          <input
            style={{ ...inputSt, borderColor: dateError ? "#f87171" : "#d1d5db" }}
            type="date" value={form.end_date}
            min={form.start_date || undefined}
            onChange={e => {
              if (form.start_date && e.target.value <= form.start_date) {
                notify("End Date duhet të jetë pas Start Date.", "error"); return;
              }
              set("end_date", e.target.value);
            }}
          />
          {dateError && <p style={{ fontSize: 11, color: "#ef4444", margin: "4px 0 0" }}>⚠ {dateError}</p>}
        </Field>
      </Row2>
      {form.start_date && form.end_date && !dateError && (
        <div style={{ display: "flex", alignItems: "center", background: "#f0fdf4", border: "1px solid #a7f3d0", borderRadius: 10, padding: "10px 18px", marginBottom: 12 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#047857" }}>START</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>{fmtDate(form.start_date)}</div>
          </div>
          <div style={{ flex: 1, height: 2, background: "#34d399", margin: "0 14px", borderRadius: 999 }} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#047857" }}>END</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>{fmtDate(form.end_date)}</div>
          </div>
        </div>
      )}
      <Field label="Contract File URL">
        <input style={inputSt} value={form.contract_file_url}
          onChange={e => set("contract_file_url", e.target.value)} placeholder="https://..." />
      </Field>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
        <button className="btn btn--secondary" onClick={onClose}>Anulo</button>
        <button className="btn btn--primary" onClick={handleSubmit} disabled={saving || !!dateError}
          style={{ opacity: dateError ? 0.55 : 1 }}>
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
    } finally {
      setSaving(false);
    }
  };

  const isCancel = status === "CANCELLED";
  return (
    <Modal title={`Ndrysho Statusin — #${contract.id}`} onClose={onClose}>
      <p style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>Aktual: <Badge label={contract.status} /></p>
      <Field label="Statusi i ri" required>
        <select style={selectSt} value={status} onChange={e => setStatus(e.target.value)}>
          {opts.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </Field>
      <div style={{ background: isCancel ? "#fef2f2" : "#f0fdf4", border: `1px solid ${isCancel ? "#fecaca" : "#a7f3d0"}`, borderRadius: 8, padding: "10px 14px", marginBottom: 20, fontSize: 13, color: isCancel ? "#b91c1c" : "#047857" }}>
        {isCancel ? "⚠️ Anulimi është i pakthyeshëm." : `✓ Kontrata do të shënohet si ${status}.`}
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button className="btn btn--secondary" onClick={onClose}>Anulo</button>
        <button className={`btn ${isCancel ? "btn--danger" : "btn--primary"}`} onClick={handleSubmit} disabled={saving}>
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
  const [rows, setRows]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [page, setPage]             = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]           = useState(0);
  const [statusF, setStatusF]       = useState("");
  const [search, setSearch]         = useState("");
  const [tick, setTick]             = useState(0);

  const [createOpen, setCreateOpen]   = useState(false);
  const [editTarget, setEditTarget]   = useState(null);
  const [detailTarget, setDetail]     = useState(null);
  const [statusTarget, setStatusTgt] = useState(null);
  const [toast, setToast]             = useState(null);

  const notify = useCallback((msg, type = "success") =>
    setToast({ msg, type, key: Date.now() }), []);

  const fetchContracts = useCallback(async () => {
    setLoading(true);
    try {
      // getAll() returns only ACTIVE — workaround: use agent endpoint
      // which returns ALL statuses for that agent
      const userInfo = JSON.parse(localStorage.getItem("user_info") || "{}");
      const agentId = userInfo.id;
      const res = await api.get(`/api/contracts/lease/agent/${agentId}?page=${page}&size=50`);
      setRows(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setTotal(res.data.totalElements || 0);
    } catch {
      notify("Gabim gjatë ngarkimit të kontratave", "error");
    } finally {
      setLoading(false);
    }
  }, [page, tick, notify]);

  useEffect(() => { fetchContracts(); }, [fetchContracts]);

  const refetch = useCallback(() => {
    setPage(0);
    setTick(t => t + 1);
  }, []);

  // ── FILTER CLIENT-SIDE ─────────────────────────────────────────────────────
  const displayed = rows
    .filter(r => !statusF || r.status === statusF)
    .filter(r =>
      !search.trim() ||
      String(r.id).includes(search) ||
      String(r.property_id).includes(search) ||
      String(r.client_id).includes(search) ||
      String(r.agent_id ?? "").includes(search)
    );

  const counts = LEASE_STATUSES.reduce((acc, s) =>
    ({ ...acc, [s]: rows.filter(r => r.status === s).length }), {});
  const statusColors = {
    ACTIVE: "#22c55e", ENDED: "#94a3b8",
    CANCELLED: "#ef4444", PENDING_SIGNATURE: "#f59e0b",
  };

  return (
    <MainLayout role="admin">
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, margin: "0 0 4px" }}>Lease Contracts</h1>
        <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>
          Admin view — menaxho të gjitha kontratat e qirasë ({rows.length} gjithsej)
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { label: "Total", val: rows.length, color: "#6366f1" },
          ...LEASE_STATUSES.map(s => ({ label: s.replace("_", " "), val: counts[s], color: statusColors[s] })),
        ].map(s => (
          <div key={s.label} style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8edf4", padding: "12px 18px", flex: "1 1 100px", minWidth: 90 }}>
            <p style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 4px" }}>{s.label}</p>
            <p style={{ fontSize: 24, fontWeight: 700, color: s.color, margin: 0, letterSpacing: "-0.02em" }}>{s.val}</p>
          </div>
        ))}
      </div>

      

      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e8edf4", overflow: "hidden" }}>
        {/* Toolbar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #e8edf4", flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#f8fafc", border: "1px solid #e8edf4", borderRadius: 8, padding: "6px 11px", minWidth: 220 }}>
              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth={2}><circle cx={11} cy={11} r={8}/><path d="m21 21-4.35-4.35"/></svg>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Kërko ID, property, client..."
                style={{ border: "none", background: "transparent", outline: "none", fontSize: 13, color: "#0f172a", width: "100%" }} />
              {search && <button onClick={() => setSearch("")} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 15, color: "#94a3b8", padding: 0 }}>×</button>}
            </div>
            <select value={statusF} onChange={e => setStatusF(e.target.value)}
              style={{ ...selectSt, width: 180, height: 34, padding: "0 10px" }}>
              <option value="">All statuses</option>
              {LEASE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button onClick={() => setCreateOpen(true)} style={btnPrimary}>+ New Contract</button>
        </div>

        {/* Table */}
        {loading ? <Loader /> : displayed.length === 0 ? (
          <Empty icon="📋" text={search || statusF ? "Nuk u gjet asnjë kontratë." : "Nuk ka lease contracts."} />
        ) : (
          <>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
                <thead>
                  <tr>
                    {["#ID","Property","Listing","Client","Agent","Rent","Deposit","Start","End","Status","Created","Actions"].map(h => (
                      <th key={h} style={TH}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayed.map(c => (
                    <tr key={c.id}
                      onMouseEnter={e => Array.from(e.currentTarget.cells).forEach(td => (td.style.background = "#f8fafc"))}
                      onMouseLeave={e => Array.from(e.currentTarget.cells).forEach(td => (td.style.background = ""))}>
                      <td style={{ ...TD, fontFamily: "monospace", color: "#94a3b8", fontSize: 12 }}>{c.id}</td>
                      <td style={TD}>
                        <span style={{ background: "#eef2ff", color: "#6366f1", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500 }}>
                          #{c.property_id}
                        </span>
                      </td>
                      <td style={{ ...TD, color: "#64748b" }}>{c.listing_id ? `#${c.listing_id}` : "—"}</td>
                      <td style={TD}>{c.client_id ? `#${c.client_id}` : "—"}</td>
                      <td style={{ ...TD, color: "#64748b" }}>{c.agent_id ? `#${c.agent_id}` : "—"}</td>
                      <td style={{ ...TD, fontWeight: 600 }}>{fmtPrice(c.rent, c.currency)}</td>
                      <td style={TD}>{c.deposit ? fmtPrice(c.deposit, c.currency) : "—"}</td>
                      <td style={{ ...TD, color: "#64748b" }}>{fmtDate(c.start_date)}</td>
                      <td style={{ ...TD, color: "#64748b" }}>{fmtDate(c.end_date)}</td>
                      <td style={TD}><Badge label={c.status} /></td>
                      <td style={{ ...TD, color: "#94a3b8", fontSize: 12 }}>{fmtDate(c.created_at)}</td>
                      <td style={TD}>
                        <div style={{ display: "flex", gap: 5 }}>
                          <button style={btnSm("#eef2ff","#6366f1","#c7d7fe")} onClick={() => setDetail(c)}>Detail</button>
                          {(c.status === "ACTIVE" || c.status === "PENDING_SIGNATURE") && (
                            <>
                              <button style={btnSm("#f0fdf4","#047857","#a7f3d0")} onClick={() => setEditTarget(c)}>Edit</button>
                              <button style={btnSm("#fffbeb","#92400e","#fde68a")} onClick={() => setStatusTgt(c)}>Status</button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </>
        )}
      </div>

      {createOpen   && <ContractFormModal onClose={() => setCreateOpen(false)} onSuccess={async (newId) => { setCreateOpen(false); fetchContracts(); notify("Kontrata u krijua"); }} notify={notify} />}
      {editTarget   && <ContractFormModal initial={editTarget} onClose={() => setEditTarget(null)} onSuccess={() => { setEditTarget(null); fetchContracts(); notify("Kontrata u ndryshua"); }} notify={notify} />}
      {detailTarget && <ContractDetailModal contract={detailTarget} onClose={() => setDetail(null)} />}
      {statusTarget && <StatusModal contract={statusTarget} onClose={() => setStatusTgt(null)} onSuccess={() => { setStatusTgt(null); fetchContracts(); notify("Statusi u ndryshua"); }} notify={notify} />}
      {toast        && <Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </MainLayout>
  );
}
