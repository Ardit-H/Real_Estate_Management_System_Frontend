import { useState, useEffect, useCallback } from "react";
import MainLayout from "../../components/layout/Layout";
import api from "../../api/axios";

// ─── Constants ────────────────────────────────────────────────────────────────

const RENTAL_STATUSES = ["ACTIVE", "INACTIVE", "EXPIRED", "RENTED"];
const PRICE_PERIODS   = ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"];
const CURRENCIES      = ["EUR", "USD", "GBP", "CHF", "ALL", "MKD"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtPrice = (v, cur = "EUR") =>
  v != null ? `€${Number(v).toLocaleString("de-DE")} ${cur}` : "—";

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" }) : "—";

const fmtDateTime = (d) =>
  d ? new Date(d).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—";

// ─── Badge ────────────────────────────────────────────────────────────────────

const BADGE_CFG = {
  ACTIVE:   { bg: "#EAF3DE", color: "#3B6D11" },
  INACTIVE: { bg: "#F1EFE8", color: "#5F5E5A" },
  EXPIRED:  { bg: "#FAEEDA", color: "#854F0B" },
  RENTED:   { bg: "#E6F1FB", color: "#185FA5" },
};

function Badge({ label }) {
  const s = BADGE_CFG[label] || { bg: "#F1EFE8", color: "#5F5E5A" };
  return (
    <span style={{
      background: s.bg, color: s.color, fontSize: 11, fontWeight: 500,
      padding: "3px 8px", borderRadius: 999, whiteSpace: "nowrap", display: "inline-block",
    }}>{label ?? "—"}</span>
  );
}

// ─── Shared modal ─────────────────────────────────────────────────────────────

function Modal({ title, onClose, children, maxWidth = 560 }) {
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(15,23,42,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
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

// ─── Form helpers ─────────────────────────────────────────────────────────────

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

function Row({ children }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>{children}</div>;
}

const inputSt    = { width: "100%", padding: "8px 11px", fontSize: 13, border: "1px solid #d1d5db", borderRadius: 8, background: "#fff", color: "#0f172a", outline: "none", boxSizing: "border-box" };
const selectSt   = { ...inputSt, cursor: "pointer" };
const textareaSt = { ...inputSt, resize: "vertical", lineHeight: 1.6 };

// ─── Toast ────────────────────────────────────────────────────────────────────

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

// ─── Shared table styles ──────────────────────────────────────────────────────

const TH = { padding: "10px 12px", textAlign: "left", fontWeight: 500, fontSize: 12, color: "#64748b", borderBottom: "1px solid #e8edf4", background: "#f8fafc", whiteSpace: "nowrap" };
const TD = { padding: "10px 12px", borderBottom: "1px solid #f1f5f9", fontSize: 13, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" };

// ─── Empty / Loader ───────────────────────────────────────────────────────────

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

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end", padding: "14px 16px 4px" }}>
      <button disabled={page === 0} onClick={() => onChange(page - 1)} style={pgBtn(page === 0)}>← Prev</button>
      <span style={{ fontSize: 13, color: "#64748b", padding: "0 6px" }}>{page + 1} / {totalPages}</span>
      <button disabled={page >= totalPages - 1} onClick={() => onChange(page + 1)} style={pgBtn(page >= totalPages - 1)}>Next →</button>
    </div>
  );
}

const pgBtn = (disabled) => ({
  fontSize: 13, padding: "5px 12px", borderRadius: 8,
  border: "0.5px solid #d1d5db", background: "transparent",
  color: disabled ? "#cbd5e1" : "#374151", cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.5 : 1,
});

// ─── Delete confirm modal ─────────────────────────────────────────────────────

function DeleteModal({ id, label, onCancel, onConfirm, loading }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(15,23,42,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={(e) => e.target === e.currentTarget && !loading && onCancel()}>
      <div style={{ width: "100%", maxWidth: 440, background: "#fff", borderRadius: 16, boxShadow: "0 20px 60px rgba(15,23,42,0.18)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid #e8edf4" }}>
          <span style={{ fontWeight: 600, fontSize: 15 }}>Konfirmo fshirjen</span>
          <button onClick={onCancel} style={{ width: 30, height: 30, border: "none", background: "none", color: "#94a3b8", cursor: "pointer", fontSize: 16, borderRadius: 6 }}>✕</button>
        </div>
        <div style={{ padding: "22px 24px" }}>
          <p style={{ fontSize: 14, color: "#475569", marginBottom: 18 }}>
            A jeni i sigurt që dëshironi të fshini <strong>{label} #{id}</strong>?
          </p>
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", marginBottom: 20, fontSize: 13, color: "#b91c1c" }}>
            Soft delete — rekordi shënohet me <code style={{ background: "#fecaca", padding: "1px 5px", borderRadius: 3, fontSize: 12 }}>deleted_at</code> dhe nuk shfaqet më.
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button className="btn btn--secondary" onClick={onCancel} disabled={loading}>Anulo</button>
            <button className="btn btn--danger" onClick={onConfirm} disabled={loading}>{loading ? "Duke fshirë..." : "Fshi"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Button helpers ───────────────────────────────────────────────────────────

const btnPrimary   = { fontSize: 13, padding: "7px 14px", borderRadius: 8, border: "none", background: "#6366f1", color: "#fff", cursor: "pointer", fontWeight: 500, whiteSpace: "nowrap" };
const btnSm = (bg, color, border) => ({ fontSize: 11, padding: "4px 9px", borderRadius: 6, border: `1px solid ${border}`, background: bg, color, cursor: "pointer", whiteSpace: "nowrap", fontWeight: 500 });
const pillIndigo = { background: "#eef2ff", color: "#6366f1", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500 };

// ─── Listing detail modal ─────────────────────────────────────────────────────

function ListingDetailModal({ listing: l, onClose }) {
  return (
    <Modal title={`Rental Listing #${l.id} — Detaje`} onClose={onClose} maxWidth={600}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px", marginBottom: 16 }}>
        {[
          ["ID", `#${l.id}`],
          ["Property", `#${l.property_id}`],
          ["Agent", l.agent_id ? `#${l.agent_id}` : "—"],
          ["Price", `${fmtPrice(l.price, l.currency)} / ${l.price_period || "MONTHLY"}`],
          ["Deposit", fmtPrice(l.deposit, l.currency)],
          ["Min Lease", l.min_lease_months ? `${l.min_lease_months} muaj` : "—"],
          ["Available From", fmtDate(l.available_from)],
          ["Available Until", fmtDate(l.available_until)],
          ["Status", "badge"],
          ["Created", fmtDateTime(l.created_at)],
          ["Updated", fmtDateTime(l.updated_at)],
        ].map(([label, val]) => (
          <div key={label}>
            <p style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 3px" }}>{label}</p>
            {val === "badge" ? <Badge label={l.status} /> : <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>{val}</p>}
          </div>
        ))}
      </div>
      {l.title && (
        <div style={{ marginBottom: 10 }}>
          <p style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 4px" }}>Title</p>
          <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>{l.title}</p>
        </div>
      )}
      {l.description && (
        <div>
          <p style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 4px" }}>Description</p>
          <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.6, margin: 0 }}>{l.description}</p>
        </div>
      )}
    </Modal>
  );
}

// ─── Listing form modal (create + edit) ───────────────────────────────────────

function ListingFormModal({ initial, onClose, onSuccess, notify }) {
  const [form, setForm] = useState({
    property_id:      initial?.property_id      ?? "",
    title:            initial?.title            ?? "",
    description:      initial?.description      ?? "",
    available_from:   initial?.available_from   ?? "",
    available_until:  initial?.available_until  ?? "",
    price:            initial?.price            ?? "",
    currency:         initial?.currency         ?? "EUR",
    deposit:          initial?.deposit          ?? "",
    price_period:     initial?.price_period     ?? "MONTHLY",
    min_lease_months: initial?.min_lease_months ?? 12,
    status:           initial?.status           ?? "ACTIVE",
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((p) => {
    const next = { ...p, [k]: v };
    // Auto-clear available_until if it would become before available_from
    if (k === "available_from" && next.available_until && next.available_until < v) {
      next.available_until = "";
    }
    return next;
  });

  const dateError = form.available_from && form.available_until && form.available_until < form.available_from
    ? "Available Until nuk mund të jetë para Available From." : null;

  const handleSubmit = async () => {
    if (!form.property_id || !form.price) {
      notify("Property ID dhe çmimi janë të detyrueshme", "error"); return;
    }
    if (dateError) { notify(dateError, "error"); return; }
    setSaving(true);
    try {
      const payload = {
        property_id:      Number(form.property_id),
        title:            form.title            || null,
        description:      form.description      || null,
        available_from:   form.available_from   || null,
        available_until:  form.available_until  || null,
        price:            Number(form.price),
        currency:         form.currency,
        deposit:          form.deposit ? Number(form.deposit) : null,
        price_period:     form.price_period,
        min_lease_months: Number(form.min_lease_months),
        ...(initial && { status: form.status }),
      };
      if (initial) {
        await api.put(`/api/rentals/listings/${initial.id}`, payload);
      } else {
        await api.post("/api/rentals/listings", payload);
      }
      onSuccess();
    } catch (err) {
      notify(err.response?.data?.message || "Gabim gjatë ruajtjes", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={initial ? `Edit Listing #${initial.id}` : "New Rental Listing"} onClose={onClose} maxWidth={620}>
      <Row>
        <Field label="Property ID" required>
          <input style={inputSt} type="number" value={form.property_id}
            onChange={(e) => set("property_id", e.target.value)}
            disabled={!!initial} placeholder="ex: 42" />
        </Field>
        <Field label="Title">
          <input style={inputSt} value={form.title}
            onChange={(e) => set("title", e.target.value)} placeholder="Apartament 2+1 Tirana" />
        </Field>
      </Row>
      <Row>
        <Field label="Price (€)" required>
          <input style={inputSt} type="number" value={form.price}
            onChange={(e) => set("price", e.target.value)} placeholder="ex: 800" />
        </Field>
        <Field label="Price Period">
          <select style={selectSt} value={form.price_period} onChange={(e) => set("price_period", e.target.value)}>
            {PRICE_PERIODS.map((p) => <option key={p}>{p}</option>)}
          </select>
        </Field>
      </Row>
      <Row>
        <Field label="Deposit (€)">
          <input style={inputSt} type="number" value={form.deposit}
            onChange={(e) => set("deposit", e.target.value)} placeholder="ex: 1600" />
        </Field>
        <Field label="Currency">
          <select style={selectSt} value={form.currency} onChange={(e) => set("currency", e.target.value)}>
            {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
      </Row>
      <Row>
        <Field label="Min Lease (muaj)">
          <input style={inputSt} type="number" value={form.min_lease_months}
            onChange={(e) => set("min_lease_months", e.target.value)} placeholder="12" />
        </Field>
        {initial && (
          <Field label="Status">
            <select style={selectSt} value={form.status} onChange={(e) => set("status", e.target.value)}>
              {RENTAL_STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
        )}
      </Row>
      <Row>
        <Field label="Available From">
          <input style={inputSt} type="date" value={form.available_from}
            onChange={(e) => set("available_from", e.target.value)} />
        </Field>
        <Field label="Available Until">
          <input
            style={{ ...inputSt, borderColor: dateError ? "#f87171" : "#d1d5db", background: dateError ? "#fff7f7" : "#fff" }}
            type="date" value={form.available_until}
            min={form.available_from || undefined}
            onChange={(e) => {
              if (form.available_from && e.target.value < form.available_from) {
                notify("Available Until nuk mund të jetë para Available From.", "error"); return;
              }
              set("available_until", e.target.value);
            }}
          />
          {dateError && <p style={{ fontSize: 11, color: "#ef4444", margin: "4px 0 0" }}>⚠ {dateError}</p>}
        </Field>
      </Row>
      <Field label="Description">
        <textarea style={textareaSt} rows={3} value={form.description}
          onChange={(e) => set("description", e.target.value)} placeholder="Përshkrim i listingut..." />
      </Field>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
        <button className="btn btn--secondary" onClick={onClose}>Anulo</button>
        <button className="btn btn--primary" onClick={handleSubmit} disabled={saving || !!dateError}
          style={{ opacity: dateError ? 0.55 : 1, cursor: dateError ? "not-allowed" : "pointer" }}>
          {saving ? "Duke ruajtur..." : initial ? "Ruaj ndryshimet" : "Krijo listing"}
        </button>
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export default function AdminRentals() {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage]       = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal]     = useState(0);
  const [statusF, setStatusF] = useState("");
  const [search, setSearch]   = useState("");

  const [createOpen, setCreateOpen]   = useState(false);
  const [editTarget, setEditTarget]   = useState(null);
  const [detailTarget, setDetail]     = useState(null);
  const [deleteId, setDeleteId]       = useState(null);
  const [deleting, setDeleting]       = useState(false);

  const [toast, setToast] = useState(null);
  const notify = useCallback((msg, type = "success") => setToast({ msg, type, key: Date.now() }), []);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, size: 10 };
      if (statusF) params.status = statusF;
      const res = await api.get("/api/rentals/listings", { params });
      const d = res.data;
      const content = d.content ?? (Array.isArray(d) ? d : []);
      setRows(content);
      setTotalPages(d.totalPages ?? 1);
      setTotal(d.totalElements ?? content.length);
    } catch (err) {
      notify(err.response?.data?.message || "Gabim gjatë ngarkimit", "error");
    } finally {
      setLoading(false);
    }
  }, [page, statusF, notify]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/api/rentals/listings/${deleteId}`);
      notify("Listing u fshi me sukses");
      setDeleteId(null);
      fetch();
    } catch (err) {
      notify(err.response?.data?.message || "Gabim gjatë fshirjes", "error");
    } finally {
      setDeleting(false);
    }
  };

  // Client-side filter — status + search
  const displayed = rows
    .filter((r) => !statusF || r.status === statusF)
    .filter((r) =>
      !search.trim() ||
      String(r.id).includes(search) ||
      (r.title && r.title.toLowerCase().includes(search.toLowerCase())) ||
      String(r.property_id).includes(search) ||
      String(r.agent_id || "").includes(search)
    );

  const activeCount  = rows.filter((r) => r.status === "ACTIVE").length;
  const rentedCount  = rows.filter((r) => r.status === "RENTED").length;
  const expiredCount = rows.filter((r) => r.status === "EXPIRED").length;

  return (
    <MainLayout role="admin">
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, margin: "0 0 4px" }}>Rental Listings</h1>
        <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>
          Admin view — full CRUD access të gjitha listings ({total} gjithsej)
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { label: "Total", val: total,        color: "#6366f1" },
          { label: "Active",  val: activeCount,  color: "#22c55e" },
          { label: "Rented",  val: rentedCount,  color: "#3b82f6" },
          { label: "Expired", val: expiredCount, color: "#f59e0b" },
        ].map((s) => (
          <div key={s.label} style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8edf4", padding: "12px 18px", flex: "1 1 100px", minWidth: 90 }}>
            <p style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 4px" }}>{s.label}</p>
            <p style={{ fontSize: 24, fontWeight: 700, color: s.color, margin: 0, letterSpacing: "-0.02em" }}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e8edf4", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #e8edf4", flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            {/* Search */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#f8fafc", border: "1px solid #e8edf4", borderRadius: 8, padding: "6px 11px", minWidth: 220 }}>
              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth={2}>
                <circle cx={11} cy={11} r={8}/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Kërko ID, title, property..."
                style={{ border: "none", background: "transparent", outline: "none", fontSize: 13, color: "#0f172a", width: "100%" }}
              />
              {search && <button onClick={() => setSearch("")} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 15, color: "#94a3b8", padding: 0 }}>×</button>}
            </div>
            {/* Status filter */}
            <select value={statusF} onChange={(e) => { setStatusF(e.target.value); setPage(0); }}
              style={{ ...selectSt, width: 150, height: 34, padding: "0 10px" }}>
              <option value="">All statuses</option>
              {RENTAL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button onClick={() => setCreateOpen(true)} style={btnPrimary}>+ New Listing</button>
        </div>

        {/* Table */}
        {loading ? <Loader /> : displayed.length === 0 ? (
          <Empty icon="🏠" text={search ? "Nuk u gjet asnjë listing." : "Nuk ka rental listings."} />
        ) : (
          <>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 850 }}>
                <thead>
                  <tr>
                    {["#ID", "Property", "Agent", "Title", "Price / Period", "Deposit", "Available", "Status", "Created", "Actions"].map((h) => (
                      <th key={h} style={TH}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayed.map((l) => (
                    <tr key={l.id}
                      onMouseEnter={(e) => Array.from(e.currentTarget.cells).forEach((c) => (c.style.background = "#f8fafc"))}
                      onMouseLeave={(e) => Array.from(e.currentTarget.cells).forEach((c) => (c.style.background = ""))}>
                      <td style={{ ...TD, fontFamily: "monospace", color: "#94a3b8", fontSize: 12 }}>{l.id}</td>
                      <td style={TD}><span style={pillIndigo}>#{l.property_id}</span></td>
                      <td style={{ ...TD, color: "#64748b" }}>{l.agent_id ? `#${l.agent_id}` : "—"}</td>
                      <td style={{ ...TD, maxWidth: 160 }} title={l.title || ""}>{l.title || <span style={{ color: "#94a3b8" }}>—</span>}</td>
                      <td style={{ ...TD, fontWeight: 600 }}>
                        {fmtPrice(l.price, l.currency)}
                        <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 400, marginLeft: 4 }}>/ {l.price_period || "MONTHLY"}</span>
                      </td>
                      <td style={TD}>{fmtPrice(l.deposit, l.currency)}</td>
                      <td style={{ ...TD, color: "#64748b", fontSize: 12 }}>
                        {l.available_from || l.available_until
                          ? `${fmtDate(l.available_from)} → ${fmtDate(l.available_until)}`
                          : "—"}
                      </td>
                      <td style={TD}><Badge label={l.status} /></td>
                      <td style={{ ...TD, color: "#94a3b8", fontSize: 12 }}>{fmtDate(l.created_at)}</td>
                      <td style={TD}>
                        <div style={{ display: "flex", gap: 5 }}>
                          <button style={btnSm("#eef2ff", "#6366f1", "#c7d7fe")} onClick={() => setDetail(l)}>Detail</button>
                          <button style={btnSm("#f0fdf4", "#047857", "#a7f3d0")} onClick={() => setEditTarget(l)}>Edit</button>
                          <button style={btnSm("#fef2f2", "#b91c1c", "#fecaca")} onClick={() => setDeleteId(l.id)}>Del</button>
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

      {createOpen   && <ListingFormModal onClose={() => setCreateOpen(false)} onSuccess={() => { setCreateOpen(false); setPage(0); fetch(); notify("Listing u krijua"); }} notify={notify} />}
      {editTarget   && <ListingFormModal initial={editTarget} onClose={() => setEditTarget(null)} onSuccess={() => { setEditTarget(null); fetch(); notify("Listing u ndryshua"); }} notify={notify} />}
      {detailTarget && <ListingDetailModal listing={detailTarget} onClose={() => setDetail(null)} />}
      {deleteId     && <DeleteModal id={deleteId} label="Listing" onCancel={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleting} />}
      {toast        && <Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </MainLayout>
  );
}
