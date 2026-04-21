import { useState, useEffect, useCallback } from "react";
import MainLayout from "../../components/layout/Layout";
import api from "../../api/axios";

// ─── Constants ────────────────────────────────────────────────────────────────

const SALE_STATUSES     = ["ACTIVE", "SOLD", "PENDING", "CANCELLED"];
const CONTRACT_STATUSES = ["PENDING", "COMPLETED", "CANCELLED"];
const PAYMENT_TYPES     = ["FULL", "DEPOSIT", "INSTALLMENT", "COMMISSION"];
const PAYMENT_METHODS   = ["BANK_TRANSFER", "CASH", "CARD", "CHECK", "ONLINE"];
const CURRENCIES        = ["EUR", "USD", "ALL", "GBP", "CHF"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtPrice = (v, cur = "EUR") =>
  v != null ? `€${Number(v).toLocaleString("de-DE")} ${cur}` : "—";

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" }) : "—";

const fmtDateTime = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—";

// ─── Badge config ─────────────────────────────────────────────────────────────

const BADGE_MAP = {
  ACTIVE:    { bg: "#EAF3DE", color: "#3B6D11" },
  SOLD:      { bg: "#E6F1FB", color: "#185FA5" },
  PENDING:   { bg: "#FAEEDA", color: "#854F0B" },
  CANCELLED: { bg: "#FCEBEB", color: "#A32D2D" },
  COMPLETED: { bg: "#EAF3DE", color: "#3B6D11" },
  PAID:      { bg: "#EAF3DE", color: "#3B6D11" },
  FAILED:    { bg: "#FCEBEB", color: "#A32D2D" },
  REFUNDED:  { bg: "#F1EFE8", color: "#5F5E5A" },
};

function Badge({ label }) {
  const s = BADGE_MAP[label] || { bg: "#F1EFE8", color: "#5F5E5A" };
  return (
    <span style={{
      background: s.bg, color: s.color,
      fontSize: 11, fontWeight: 500,
      padding: "3px 8px", borderRadius: 999,
      whiteSpace: "nowrap", display: "inline-block",
    }}>{label ?? "—"}</span>
  );
}

// ─── Shared modal wrapper ─────────────────────────────────────────────────────

function Modal({ title, onClose, children, maxWidth = 520 }) {
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(15,23,42,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        width: "100%", maxWidth,
        background: "#ffffff", borderRadius: 16,
        boxShadow: "0 20px 60px rgba(15,23,42,0.18)",
        maxHeight: "90vh", overflowY: "auto",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 24px", borderBottom: "1px solid #e8edf4",
          position: "sticky", top: 0, background: "#fff", zIndex: 1,
        }}>
          <span style={{ fontWeight: 600, fontSize: 15 }}>{title}</span>
          <button onClick={onClose} style={{
            width: 30, height: 30, display: "flex", alignItems: "center",
            justifyContent: "center", border: "none", background: "none",
            color: "#94a3b8", cursor: "pointer", fontSize: 16, borderRadius: 6,
          }}>✕</button>
        </div>
        <div style={{ padding: "22px 24px" }}>{children}</div>
      </div>
    </div>
  );
}

// ─── Form field helpers ───────────────────────────────────────────────────────

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

const inputSt = {
  width: "100%", padding: "8px 11px", fontSize: 13,
  border: "1px solid #d1d5db", borderRadius: 8,
  background: "#fff", color: "#0f172a", outline: "none",
  boxSizing: "border-box",
};
const selectSt = { ...inputSt, cursor: "pointer" };
const textareaSt = { ...inputSt, resize: "vertical", lineHeight: 1.5 };

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ msg, type = "success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, [onDone]);
  const bg = type === "error" ? "#fee2e2" : "#ecfdf5";
  const co = type === "error" ? "#b91c1c" : "#047857";
  return (
    <div style={{
      position: "fixed", bottom: 28, right: 28, zIndex: 9999,
      background: bg, color: co, padding: "12px 20px", borderRadius: 10,
      fontSize: 13, fontWeight: 500,
      boxShadow: "0 4px 18px rgba(0,0,0,0.12)", maxWidth: 340,
    }}>{msg}</div>
  );
}

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
      <div style={{
        width: 28, height: 28, margin: "0 auto",
        border: "3px solid #e8edf4", borderTop: "3px solid #6366f1",
        borderRadius: "50%", animation: "spin .7s linear infinite",
      }} />
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end", padding: "14px 16px 4px" }}>
      <button
        disabled={page === 0}
        onClick={() => onChange(page - 1)}
        style={pgBtn(false, page === 0)}
      >← Prev</button>
      <span style={{ fontSize: 13, color: "#64748b", padding: "0 6px" }}>
        {page + 1} / {totalPages}
      </span>
      <button
        disabled={page >= totalPages - 1}
        onClick={() => onChange(page + 1)}
        style={pgBtn(false, page >= totalPages - 1)}
      >Next →</button>
    </div>
  );
}

const pgBtn = (active, disabled) => ({
  fontSize: 13, padding: "5px 12px",
  borderRadius: 8, border: "0.5px solid #d1d5db",
  background: active ? "#6366f1" : "transparent",
  color: active ? "#fff" : disabled ? "#cbd5e1" : "#374151",
  cursor: disabled ? "default" : "pointer",
  opacity: disabled ? 0.5 : 1,
});

// ─── Tab navigation ───────────────────────────────────────────────────────────

function Tabs({ active, onChange }) {
  const tabs = [
    { id: "listings",  label: "Sale Listings",  icon: "🏷️" },
    { id: "contracts", label: "Contracts",       icon: "📄" },
    { id: "payments",  label: "Payments",        icon: "💳" },
  ];
  return (
    <div style={{
      display: "flex", gap: 4, marginBottom: 24,
      borderBottom: "1px solid #e8edf4", paddingBottom: 0,
    }}>
      {tabs.map((t) => (
        <button key={t.id} onClick={() => onChange(t.id)} style={{
          padding: "10px 18px", border: "none",
          borderBottom: active === t.id ? "2px solid #6366f1" : "2px solid transparent",
          background: "none",
          color: active === t.id ? "#6366f1" : "#64748b",
          fontWeight: active === t.id ? 600 : 400,
          fontSize: 14, cursor: "pointer",
          fontFamily: "inherit", marginBottom: -1,
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <span style={{ fontSize: 15 }}>{t.icon}</span> {t.label}
        </button>
      ))}
    </div>
  );
}

// ─── Shared table styles ──────────────────────────────────────────────────────

const TH = {
  padding: "10px 12px", textAlign: "left",
  fontWeight: 500, fontSize: 12, color: "#64748b",
  borderBottom: "1px solid #e8edf4",
  background: "#f8fafc", whiteSpace: "nowrap",
};
const TD = {
  padding: "10px 12px",
  borderBottom: "1px solid #f1f5f9",
  fontSize: 13, color: "#0f172a",
  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
};

// ─── Delete confirm modal ─────────────────────────────────────────────────────

function DeleteModal({ id, label, onCancel, onConfirm, loading }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(15,23,42,0.45)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }}
      onClick={(e) => e.target === e.currentTarget && !loading && onCancel()}
    >
      <div style={{
        width: "100%", maxWidth: 440,
        background: "#fff", borderRadius: 16,
        boxShadow: "0 20px 60px rgba(15,23,42,0.18)",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 24px", borderBottom: "1px solid #e8edf4",
        }}>
          <span style={{ fontWeight: 600, fontSize: 15 }}>Konfirmo fshirjen</span>
          <button onClick={onCancel} disabled={loading} style={{
            width: 30, height: 30, border: "none", background: "none",
            color: "#94a3b8", cursor: "pointer", fontSize: 16, borderRadius: 6,
          }}>✕</button>
        </div>
        <div style={{ padding: "22px 24px" }}>
          <p style={{ fontSize: 14, color: "#475569", marginBottom: 18 }}>
            A jeni i sigurt që dëshironi të fshini{" "}
            <strong>{label} #{id}</strong>?
            Ky veprim nuk mund të kthehet.
          </p>
          <div style={{
            background: "#fef2f2", border: "1px solid #fecaca",
            borderRadius: 8, padding: "10px 14px", marginBottom: 20,
            fontSize: 13, color: "#b91c1c",
          }}>
            Soft delete — rekordi shënohet me <code style={{ background: "#fecaca", padding: "1px 5px", borderRadius: 3, fontSize: 12 }}>deleted_at</code> dhe nuk shfaqet më.
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button className="btn btn--secondary" onClick={onCancel} disabled={loading}>Anulo</button>
            <button className="btn btn--danger" onClick={onConfirm} disabled={loading}>
              {loading ? "Duke fshirë..." : "Fshi"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LISTINGS SECTION
// ═══════════════════════════════════════════════════════════════════════════════

function ListingsSection({ onGoContract, notify }) {
  const [rows, setRows]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [page, setPage]           = useState(0);
  const [totalPages, setTotalPg]  = useState(0);
  const [total, setTotal]         = useState(0);
  const [statusF, setStatusF]     = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [detailTarget, setDetail]   = useState(null);
  const [deleteId, setDeleteId]     = useState(null);
  const [deleting, setDeleting]     = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const url = statusF
        ? `/api/sales/listings/status/${statusF}?page=${page}&size=10`
        : `/api/sales/listings?page=${page}&size=10&sortBy=createdAt&sortDir=desc`;
      const res = await api.get(url);
      const d = res.data;
      setRows(d.content || []);
      setTotalPg(d.totalPages || 0);
      setTotal(d.totalElements || 0);
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
      await api.delete(`/api/sales/listings/${deleteId}`);
      notify("Listing u fshi me sukses");
      setDeleteId(null);
      fetch();
    } catch (err) {
      notify(err.response?.data?.message || "Gabim gjatë fshirjes", "error");
    } finally {
      setDeleting(false);
    }
  };

  // Stats summary
  const activeCount = rows.filter((r) => r.status === "ACTIVE").length;

  return (
    <>
      {/* Card */}
      <div style={card}>
        {/* Header */}
        <div style={cardHeader}>
          <div>
            <h2 style={cardTitle}>Sale Listings</h2>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>
              {total} total · {activeCount} active on this page
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <select
              value={statusF}
              onChange={(e) => { setStatusF(e.target.value); setPage(0); }}
              style={{ ...selectSt, width: 150, height: 34, padding: "0 10px" }}
            >
              <option value="">All statuses</option>
              {SALE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <button
              onClick={() => setCreateOpen(true)}
              style={btnPrimary}
            >
              + New Listing
            </button>
          </div>
        </div>

        {/* Table */}
        {loading ? <Loader /> : rows.length === 0 ? (
          <Empty icon="🏷️" text="Nuk ka sale listings. Krijo listingun e parë." />
        ) : (
          <>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
                <thead>
                  <tr>
                    {["#ID", "Property ID", "Agent ID", "Price", "Negotiable", "Status", "Created", "Actions"].map((h) => (
                      <th key={h} style={TH}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((l) => (
                    <tr key={l.id}
                      onMouseEnter={(e) => Array.from(e.currentTarget.cells).forEach((c) => (c.style.background = "#f8fafc"))}
                      onMouseLeave={(e) => Array.from(e.currentTarget.cells).forEach((c) => (c.style.background = ""))}
                    >
                      <td style={{ ...TD, fontFamily: "monospace", color: "#94a3b8", fontSize: 12 }}>{l.id}</td>
                      <td style={TD}>
                        <span style={pillIndigo}>#{l.property_id}</span>
                      </td>
                      <td style={{ ...TD, color: "#64748b" }}>
                        {l.agent_id ? `#${l.agent_id}` : "—"}
                      </td>
                      <td style={{ ...TD, fontWeight: 600 }}>{fmtPrice(l.price, l.currency)}</td>
                      <td style={TD}>
                        <span style={{ fontSize: 12, fontWeight: 500, color: l.negotiable ? "#059669" : "#94a3b8" }}>
                          {l.negotiable ? "✓ Yes" : "No"}
                        </span>
                      </td>
                      <td style={TD}><Badge label={l.status} /></td>
                      <td style={{ ...TD, color: "#94a3b8" }}>{fmtDate(l.created_at)}</td>
                      <td style={TD}>
                        <div style={{ display: "flex", gap: 5 }}>
                          <button style={btnSm("#eef2ff", "#6366f1", "#c7d7fe")}
                            onClick={() => setDetail(l)}>Detail</button>
                          <button style={btnSm("#f0fdf4", "#047857", "#a7f3d0")}
                            onClick={() => setEditTarget(l)}>Edit</button>
                          <button style={btnSm("#eef2ff", "#6366f1", "#c7d7fe")}
                            onClick={() => onGoContract({ listingId: l.id, propertyId: l.property_id, price: l.price })}>
                            Contract →
                          </button>
                          <button style={btnSm("#fef2f2", "#b91c1c", "#fecaca")}
                            onClick={() => setDeleteId(l.id)}>Del</button>
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

      {/* Create modal */}
      {createOpen && (
        <ListingFormModal
          onClose={() => setCreateOpen(false)}
          onSuccess={() => { setCreateOpen(false); fetch(); notify("Listing u krijua me sukses"); }}
          notify={notify}
        />
      )}

      {/* Edit modal */}
      {editTarget && (
        <ListingFormModal
          initial={editTarget}
          onClose={() => setEditTarget(null)}
          onSuccess={() => { setEditTarget(null); fetch(); notify("Listing u ndryshua"); }}
          notify={notify}
        />
      )}

      {/* Detail modal */}
      {detailTarget && (
        <ListingDetailModal listing={detailTarget} onClose={() => setDetail(null)} />
      )}

      {/* Delete confirm */}
      {deleteId && (
        <DeleteModal
          id={deleteId} label="Listing"
          onCancel={() => setDeleteId(null)}
          onConfirm={handleDelete}
          loading={deleting}
        />
      )}
    </>
  );
}

function ListingFormModal({ initial, onClose, onSuccess, notify }) {
  const [form, setForm] = useState({
    property_id:  initial?.property_id  ?? "",
    price:        initial?.price        ?? "",
    currency:     initial?.currency     ?? "EUR",
    negotiable:   initial?.negotiable   ?? true,
    description:  initial?.description  ?? "",
    highlights:   initial?.highlights   ?? "",
    status:       initial?.status       ?? "ACTIVE",
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.property_id || !form.price) {
      notify("Property ID dhe çmimi janë të detyrueshme", "error"); return;
    }
    setSaving(true);
    try {
      const payload = {
        property_id:  Number(form.property_id),
        price:        Number(form.price),
        currency:     form.currency,
        negotiable:   form.negotiable,
        description:  form.description || null,
        highlights:   form.highlights  || null,
        ...(initial && { status: form.status }),
      };
      if (initial) {
        await api.put(`/api/sales/listings/${initial.id}`, payload);
      } else {
        await api.post("/api/sales/listings", payload);
      }
      onSuccess();
    } catch (err) {
      notify(err.response?.data?.message || "Gabim gjatë ruajtjes", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={initial ? `Edit Listing #${initial.id}` : "New Sale Listing"} onClose={onClose}>
      <Row>
        <Field label="Property ID" required>
          <input style={inputSt} type="number" value={form.property_id}
            onChange={(e) => set("property_id", e.target.value)}
            disabled={!!initial} placeholder="ex: 42" />
        </Field>
        <Field label="Price (€)" required>
          <input style={inputSt} type="number" value={form.price}
            onChange={(e) => set("price", e.target.value)} placeholder="ex: 145000" />
        </Field>
      </Row>
      <Row>
        <Field label="Currency">
          <select style={selectSt} value={form.currency} onChange={(e) => set("currency", e.target.value)}>
            {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Negotiable">
          <select style={selectSt} value={String(form.negotiable)}
            onChange={(e) => set("negotiable", e.target.value === "true")}>
            <option value="true">Po (Yes)</option>
            <option value="false">Jo (No)</option>
          </select>
        </Field>
      </Row>
      {initial && (
        <Field label="Status">
          <select style={selectSt} value={form.status} onChange={(e) => set("status", e.target.value)}>
            {SALE_STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>
      )}
      <Field label="Description">
        <textarea style={{ ...textareaSt }} rows={3} value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Përshkrim i pronës..." />
      </Field>
      <Field label="Highlights">
        <textarea style={{ ...textareaSt }} rows={2} value={form.highlights}
          onChange={(e) => set("highlights", e.target.value)}
          placeholder="Tiparet kryesore..." />
      </Field>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
        <button className="btn btn--secondary" onClick={onClose}>Anulo</button>
        <button className="btn btn--primary" onClick={handleSubmit} disabled={saving}>
          {saving ? "Duke ruajtur..." : initial ? "Ruaj ndryshimet" : "Krijo listing"}
        </button>
      </div>
    </Modal>
  );
}

function ListingDetailModal({ listing: l, onClose }) {
  return (
    <Modal title={`Listing #${l.id} — Detaje`} onClose={onClose}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 20px", marginBottom: 16 }}>
        {[
          ["ID", `#${l.id}`],
          ["Property", `#${l.property_id}`],
          ["Agent", l.agent_id ? `#${l.agent_id}` : "—"],
          ["Price", fmtPrice(l.price, l.currency)],
          ["Negotiable", l.negotiable ? "Yes" : "No"],
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
      {l.description && (
        <div style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 5px" }}>Description</p>
          <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.6, margin: 0 }}>{l.description}</p>
        </div>
      )}
      {l.highlights && (
        <div>
          <p style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 5px" }}>Highlights</p>
          <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.6, margin: 0 }}>{l.highlights}</p>
        </div>
      )}
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONTRACTS SECTION
// ═══════════════════════════════════════════════════════════════════════════════

function ContractsSection({ prefill, onGoPayment, notify }) {
  const [rows, setRows]          = useState([]);
  const [loading, setLoading]    = useState(true);
  const [page, setPage]          = useState(0);
  const [totalPages, setTotalPg] = useState(0);
  const [total, setTotal]        = useState(0);

  const [createOpen, setCreateOpen]   = useState(false);
  const [editTarget, setEditTarget]   = useState(null);
  const [detailTarget, setDetail]     = useState(null);
  const [statusTarget, setStatusTgt]  = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/sales/contracts?page=${page}&size=10`);
      const d = res.data;
      setRows(d.content || []);
      setTotalPg(d.totalPages || 0);
      setTotal(d.totalElements || 0);
    } catch (err) {
      notify(err.response?.data?.message || "Gabim gjatë ngarkimit të kontratave", "error");
    } finally {
      setLoading(false);
    }
  }, [page, notify]);

  useEffect(() => { fetch(); }, [fetch]);

  // Open create when coming from listings
  useEffect(() => {
    if (prefill?.listingId) {
      setEditTarget(null);
      setCreateOpen(true);
    }
  }, [prefill]);

  return (
    <>
      <div style={card}>
        <div style={cardHeader}>
          <div>
            <h2 style={cardTitle}>Sale Contracts</h2>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>{total} kontrata gjithsej</p>
          </div>
          <button onClick={() => { setEditTarget(null); setCreateOpen(true); }} style={btnPrimary}>
            + New Contract
          </button>
        </div>

        {loading ? <Loader /> : rows.length === 0 ? (
          <Empty icon="📄" text="Nuk ka kontrata shitjeje." />
        ) : (
          <>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
                <thead>
                  <tr>
                    {["#ID", "Property", "Listing", "Buyer", "Agent", "Sale Price", "Contract Date", "Handover", "Status", "Actions"].map((h) => (
                      <th key={h} style={TH}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((c) => (
                    <tr key={c.id}
                      onMouseEnter={(e) => Array.from(e.currentTarget.cells).forEach((td) => (td.style.background = "#f8fafc"))}
                      onMouseLeave={(e) => Array.from(e.currentTarget.cells).forEach((td) => (td.style.background = ""))}
                    >
                      <td style={{ ...TD, fontFamily: "monospace", color: "#94a3b8", fontSize: 12 }}>{c.id}</td>
                      <td style={TD}><span style={pillIndigo}>#{c.property_id}</span></td>
                      <td style={{ ...TD, color: "#64748b" }}>{c.listing_id ? `#${c.listing_id}` : "—"}</td>
                      <td style={TD}>{c.buyer_id ? `#${c.buyer_id}` : "—"}</td>
                      <td style={{ ...TD, color: "#64748b" }}>{c.agent_id ? `#${c.agent_id}` : "—"}</td>
                      <td style={{ ...TD, fontWeight: 600 }}>{fmtPrice(c.sale_price, c.currency)}</td>
                      <td style={{ ...TD, color: "#64748b" }}>{fmtDate(c.contract_date)}</td>
                      <td style={{ ...TD, color: "#64748b" }}>{fmtDate(c.handover_date)}</td>
                      <td style={TD}><Badge label={c.status} /></td>
                      <td style={TD}>
                        <div style={{ display: "flex", gap: 5, flexWrap: "nowrap" }}>
                          <button style={btnSm("#eef2ff", "#6366f1", "#c7d7fe")}
                            onClick={() => setDetail(c)}>Detail</button>
                          {c.status === "PENDING" && (
                            <>
                              <button style={btnSm("#f0fdf4", "#047857", "#a7f3d0")}
                                onClick={() => setEditTarget(c)}>Edit</button>
                              <button style={btnSm("#fffbeb", "#92400e", "#fde68a")}
                                onClick={() => setStatusTgt(c)}>Status</button>
                            </>
                          )}
                          <button style={btnSm("#eef2ff", "#6366f1", "#c7d7fe")}
                            onClick={() => onGoPayment({ contractId: c.id, salePrice: c.sale_price })}>
                            Payments →
                          </button>
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

      {createOpen && (
        <ContractFormModal
          prefill={prefill}
          onClose={() => setCreateOpen(false)}
          onSuccess={() => { setCreateOpen(false); fetch(); notify("Kontrata u krijua me sukses"); }}
          notify={notify}
        />
      )}

      {editTarget && (
        <ContractFormModal
          initial={editTarget}
          onClose={() => setEditTarget(null)}
          onSuccess={() => { setEditTarget(null); fetch(); notify("Kontrata u ndryshua"); }}
          notify={notify}
        />
      )}

      {detailTarget && (
        <ContractDetailModal contract={detailTarget} onClose={() => setDetail(null)} />
      )}

      {statusTarget && (
        <ContractStatusModal
          contract={statusTarget}
          onClose={() => setStatusTgt(null)}
          onSuccess={() => { setStatusTgt(null); fetch(); notify("Statusi i kontratës u ndryshua"); }}
          notify={notify}
        />
      )}
    </>
  );
}

function ContractFormModal({ initial, prefill, onClose, onSuccess, notify }) {
  const [form, setForm] = useState({
    property_id:       initial?.property_id       ?? prefill?.propertyId ?? "",
    listing_id:        initial?.listing_id        ?? prefill?.listingId  ?? "",
    buyer_id:          initial?.buyer_id          ?? "",
    sale_price:        initial?.sale_price        ?? prefill?.price       ?? "",
    currency:          initial?.currency          ?? "EUR",
    contract_date:     initial?.contract_date     ?? "",
    handover_date:     initial?.handover_date     ?? "",
    contract_file_url: initial?.contract_file_url ?? "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.property_id || !form.buyer_id || !form.sale_price) {
      notify("Property ID, Buyer ID dhe çmimi janë të detyrueshme", "error"); return;
    }
    setSaving(true);
    try {
      const payload = {
        property_id:       Number(form.property_id),
        listing_id:        form.listing_id ? Number(form.listing_id) : null,
        buyer_id:          Number(form.buyer_id),
        sale_price:        Number(form.sale_price),
        currency:          form.currency,
        contract_date:     form.contract_date     || null,
        handover_date:     form.handover_date     || null,
        contract_file_url: form.contract_file_url || null,
      };
      if (initial) {
        await api.put(`/api/sales/contracts/${initial.id}`, payload);
      } else {
        await api.post("/api/sales/contracts", payload);
      }
      onSuccess();
    } catch (err) {
      notify(err.response?.data?.message || "Gabim gjatë ruajtjes", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={initial ? `Edit Contract #${initial.id}` : "New Sale Contract"} onClose={onClose} maxWidth={620}>
      <Row>
        <Field label="Property ID" required>
          <input style={inputSt} type="number" value={form.property_id}
            onChange={(e) => set("property_id", e.target.value)}
            disabled={!!initial} placeholder="ex: 42" />
        </Field>
        <Field label="Listing ID">
          <input style={inputSt} type="number" value={form.listing_id}
            onChange={(e) => set("listing_id", e.target.value)} placeholder="(opcional)" />
        </Field>
      </Row>
      <Row>
        <Field label="Buyer ID" required>
          <input style={inputSt} type="number" value={form.buyer_id}
            onChange={(e) => set("buyer_id", e.target.value)}
            disabled={!!initial} placeholder="ID e blerësit" />
        </Field>
        <Field label="Sale Price (€)" required>
          <input style={inputSt} type="number" value={form.sale_price}
            onChange={(e) => set("sale_price", e.target.value)} placeholder="ex: 145000" />
        </Field>
      </Row>
      <Row>
        <Field label="Currency">
          <select style={selectSt} value={form.currency} onChange={(e) => set("currency", e.target.value)}>
            {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Contract Date">
          <input style={inputSt} type="date" value={form.contract_date}
            onChange={(e) => set("contract_date", e.target.value)} />
        </Field>
      </Row>
      <Row>
        <Field label="Handover Date">
          <input style={inputSt} type="date" value={form.handover_date}
            onChange={(e) => set("handover_date", e.target.value)} />
        </Field>
        <Field label="Contract File URL">
          <input style={inputSt} value={form.contract_file_url}
            onChange={(e) => set("contract_file_url", e.target.value)} placeholder="https://..." />
        </Field>
      </Row>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
        <button className="btn btn--secondary" onClick={onClose}>Anulo</button>
        <button className="btn btn--primary" onClick={handleSubmit} disabled={saving}>
          {saving ? "Duke ruajtur..." : initial ? "Ruaj ndryshimet" : "Krijo kontratë"}
        </button>
      </div>
    </Modal>
  );
}

function ContractDetailModal({ contract: c, onClose }) {
  return (
    <Modal title={`Contract #${c.id} — Detaje`} onClose={onClose} maxWidth={560}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 20px", marginBottom: 16 }}>
        {[
          ["ID", `#${c.id}`],
          ["Property", `#${c.property_id}`],
          ["Listing", c.listing_id ? `#${c.listing_id}` : "—"],
          ["Buyer", c.buyer_id ? `#${c.buyer_id}` : "—"],
          ["Agent", c.agent_id ? `#${c.agent_id}` : "—"],
          ["Sale Price", fmtPrice(c.sale_price, c.currency)],
          ["Contract Date", fmtDate(c.contract_date)],
          ["Handover Date", fmtDate(c.handover_date)],
          ["Status", "badge"],
          ["Created", fmtDateTime(c.created_at)],
          ["Updated", fmtDateTime(c.updated_at)],
        ].map(([label, val]) => (
          <div key={label}>
            <p style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 3px" }}>{label}</p>
            {val === "badge" ? <Badge label={c.status} /> : <p style={{ fontSize: 14, fontWeight: 500, margin: 0, wordBreak: "break-all" }}>{val}</p>}
          </div>
        ))}
      </div>
      {c.contract_file_url && (
        <div>
          <p style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 5px" }}>Contract File</p>
          <a href={c.contract_file_url} target="_blank" rel="noreferrer"
            style={{ fontSize: 13, color: "#6366f1" }}>
            📎 Open file
          </a>
        </div>
      )}
    </Modal>
  );
}

function ContractStatusModal({ contract, onClose, onSuccess, notify }) {
  const [status, setStatus] = useState("COMPLETED");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await api.patch(`/api/sales/contracts/${contract.id}/status`, { status });
      onSuccess();
    } catch (err) {
      notify(err.response?.data?.message || "Gabim gjatë ndryshimit të statusit", "error");
    } finally {
      setSaving(false);
    }
  };

  const isCancel = status === "CANCELLED";
  return (
    <Modal title={`Ndrysho Statusin — Contract #${contract.id}`} onClose={onClose}>
      <p style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>
        Statusi aktual: <Badge label={contract.status} />
      </p>
      <Field label="Statusi i ri" required>
        <select style={selectSt} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="COMPLETED">COMPLETED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </Field>
      <div style={{
        background: isCancel ? "#fef2f2" : "#ecfdf5",
        border: `1px solid ${isCancel ? "#fecaca" : "#a7f3d0"}`,
        borderRadius: 8, padding: "10px 14px", marginBottom: 20,
        fontSize: 13, color: isCancel ? "#b91c1c" : "#047857",
      }}>
        {isCancel
          ? "⚠️ Anulimi i kontratës është i pakthyeshëm."
          : "✓ Kontrata do të shënohet si e përfunduar me sukses."}
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button className="btn btn--secondary" onClick={onClose}>Anulo</button>
        <button
          className={`btn ${isCancel ? "btn--danger" : "btn--primary"}`}
          onClick={handleSubmit} disabled={saving}
        >
          {saving ? "Duke ndryshuar..." : `Konfirmo — ${status}`}
        </button>
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAYMENTS SECTION
// ═══════════════════════════════════════════════════════════════════════════════

function PaymentsSection({ prefill, notify }) {
  const [contractId, setContractId] = useState(prefill?.contractId ?? "");
  const [inputId, setInputId]       = useState(prefill?.contractId ? String(prefill.contractId) : "");
  const [payments, setPayments]     = useState([]);
  const [summary, setSummary]       = useState(null);
  const [loading, setLoading]       = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [payTarget, setPayTarget]   = useState(null);

  const fetchPayments = useCallback(async () => {
    if (!contractId) return;
    setLoading(true);
    try {
      const [listRes, sumRes] = await Promise.all([
        api.get(`/api/sales/payments/contract/${contractId}`),
        api.get(`/api/sales/payments/contract/${contractId}/summary`),
      ]);
      setPayments(listRes.data || []);
      setSummary(sumRes.data);
    } catch (err) {
      notify(err.response?.data?.message || "Gabim gjatë ngarkimit të pagesave", "error");
    } finally {
      setLoading(false);
    }
  }, [contractId, notify]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  // Auto-load from contracts tab
  useEffect(() => {
    if (prefill?.contractId) {
      setInputId(String(prefill.contractId));
      setContractId(prefill.contractId);
    }
  }, [prefill]);

  const handleMarkPaid = async (data) => {
    try {
      await api.patch(`/api/sales/payments/${payTarget.id}/pay`, data);
      notify("Pagesa u shënua si PAID");
      setPayTarget(null);
      fetchPayments();
    } catch (err) {
      notify(err.response?.data?.message || "Gabim", "error");
    }
  };

  const totalPaid   = summary ? Number(summary.total_paid) : 0;
  const salePrice   = prefill?.salePrice ? Number(prefill.salePrice) : 0;
  const paidPct     = salePrice > 0 ? Math.min(100, Math.round((totalPaid / salePrice) * 100)) : null;

  const pendingCount = payments.filter((p) => p.status === "PENDING").length;
  const paidCount    = payments.filter((p) => p.status === "PAID").length;

  return (
    <>
      <div style={card}>
        <div style={cardHeader}>
          <div>
            <h2 style={cardTitle}>Sale Payments</h2>
            {summary && (
              <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>
                {summary.total_payments} pagesa · {paidCount} PAID · {pendingCount} PENDING
              </p>
            )}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <label style={{ fontSize: 13, color: "#64748b" }}>Contract #</label>
            <input
              type="number" value={inputId}
              onChange={(e) => setInputId(e.target.value)}
              placeholder="ID..."
              style={{ ...inputSt, width: 100, height: 34, padding: "0 10px" }}
            />
            <button style={btnSecondary}
              onClick={() => setContractId(inputId ? Number(inputId) : "")}>
              Load
            </button>
            {contractId && (
              <button style={btnPrimary} onClick={() => setCreateOpen(true)}>
                + Add Payment
              </button>
            )}
          </div>
        </div>

        {/* Payment summary bar */}
        {summary && contractId && (
          <div style={{
            display: "flex", gap: 16, padding: "14px 20px",
            background: "#f8fafc", borderBottom: "1px solid #e8edf4",
            alignItems: "center", flexWrap: "wrap",
          }}>
            <div style={sumItem}>
              <span style={sumLabel}>Total Payments</span>
              <span style={sumVal}>{summary.total_payments}</span>
            </div>
            <div style={divider} />
            <div style={sumItem}>
              <span style={sumLabel}>Total Paid</span>
              <span style={{ ...sumVal, color: "#059669" }}>
                €{totalPaid.toLocaleString("de-DE")}
              </span>
            </div>
            {paidPct !== null && (
              <>
                <div style={divider} />
                <div style={{ flex: 1, minWidth: 160 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={sumLabel}>Paguar nga çmimi i shitjes</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#6366f1" }}>{paidPct}%</span>
                  </div>
                  <div style={{ height: 6, background: "#e8edf4", borderRadius: 999 }}>
                    <div style={{
                      height: "100%", borderRadius: 999,
                      width: `${paidPct}%`,
                      background: paidPct === 100 ? "#10b981" : "#6366f1",
                      transition: "width .4s",
                    }} />
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {!contractId ? (
          <Empty icon="💳" text="Shkruaj Contract ID dhe kliko Load për të parë pagesat." />
        ) : loading ? <Loader /> : payments.length === 0 ? (
          <Empty icon="💳" text="Nuk ka pagesa për këtë kontratë." />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
              <thead>
                <tr>
                  {["#ID", "Amount", "Type", "Method", "Paid Date", "Ref", "Status", "Actions"].map((h) => (
                    <th key={h} style={TH}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}
                    onMouseEnter={(e) => Array.from(e.currentTarget.cells).forEach((c) => (c.style.background = "#f8fafc"))}
                    onMouseLeave={(e) => Array.from(e.currentTarget.cells).forEach((c) => (c.style.background = ""))}
                  >
                    <td style={{ ...TD, fontFamily: "monospace", color: "#94a3b8", fontSize: 12 }}>{p.id}</td>
                    <td style={{ ...TD, fontWeight: 600 }}>{fmtPrice(p.amount, p.currency)}</td>
                    <td style={TD}>
                      <span style={{ background: "#f1f5f9", color: "#475569", padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 500 }}>
                        {p.payment_type}
                      </span>
                    </td>
                    <td style={{ ...TD, color: "#64748b" }}>{p.payment_method || "—"}</td>
                    <td style={{ ...TD, color: "#64748b" }}>{fmtDate(p.paid_date)}</td>
                    <td style={{ ...TD, fontSize: 12, color: "#94a3b8", maxWidth: 120 }}
                      title={p.transaction_ref || ""}>
                      {p.transaction_ref || "—"}
                    </td>
                    <td style={TD}><Badge label={p.status} /></td>
                    <td style={TD}>
                      {p.status === "PENDING" && (
                        <button style={btnSm("#ecfdf5", "#047857", "#a7f3d0")}
                          onClick={() => setPayTarget(p)}>
                          Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {createOpen && (
        <PaymentCreateModal
          contractId={contractId}
          onClose={() => setCreateOpen(false)}
          onSuccess={() => { setCreateOpen(false); fetchPayments(); notify("Pagesa u krijua"); }}
          notify={notify}
        />
      )}

      {payTarget && (
        <MarkPaidModal
          payment={payTarget}
          onClose={() => setPayTarget(null)}
          onSubmit={handleMarkPaid}
          notify={notify}
        />
      )}
    </>
  );
}

function PaymentCreateModal({ contractId, onClose, onSuccess, notify }) {
  const [form, setForm] = useState({
    amount:         "",
    currency:       "EUR",
    payment_type:   "FULL",
    payment_method: "BANK_TRANSFER",
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.amount) { notify("Shuma është e detyrueshme", "error"); return; }
    setSaving(true);
    try {
      await api.post("/api/sales/payments", {
        contract_id:    Number(contractId),
        amount:         Number(form.amount),
        currency:       form.currency,
        payment_type:   form.payment_type,
        payment_method: form.payment_method,
      });
      onSuccess();
    } catch (err) {
      notify(err.response?.data?.message || "Gabim gjatë krijimit", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={`New Payment — Contract #${contractId}`} onClose={onClose}>
      <Row>
        <Field label="Amount (€)" required>
          <input style={inputSt} type="number" value={form.amount}
            onChange={(e) => set("amount", e.target.value)} placeholder="ex: 14500" />
        </Field>
        <Field label="Currency">
          <select style={selectSt} value={form.currency} onChange={(e) => set("currency", e.target.value)}>
            {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
      </Row>
      <Row>
        <Field label="Payment Type">
          <select style={selectSt} value={form.payment_type} onChange={(e) => set("payment_type", e.target.value)}>
            {PAYMENT_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Payment Method">
          <select style={selectSt} value={form.payment_method} onChange={(e) => set("payment_method", e.target.value)}>
            {PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}
          </select>
        </Field>
      </Row>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
        <button className="btn btn--secondary" onClick={onClose}>Anulo</button>
        <button className="btn btn--primary" onClick={handleSubmit} disabled={saving}>
          {saving ? "Duke krijuar..." : "Krijo pagesë"}
        </button>
      </div>
    </Modal>
  );
}

function MarkPaidModal({ payment, onClose, onSubmit, notify }) {
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
      await onSubmit({
        payment_method:  form.payment_method,
        transaction_ref: form.transaction_ref || null,
        paid_date:       form.paid_date,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={`Mark Payment #${payment.id} as PAID`} onClose={onClose}>
      <div style={{
        background: "#ecfdf5", border: "1px solid #a7f3d0",
        borderRadius: 8, padding: "10px 14px", marginBottom: 18,
        fontSize: 13, color: "#047857",
      }}>
        Shuma: <strong>{fmtPrice(payment.amount, payment.currency)}</strong>
      </div>
      <Field label="Payment Method">
        <select style={selectSt} value={form.payment_method} onChange={(e) => set("payment_method", e.target.value)}>
          {PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}
        </select>
      </Field>
      <Row>
        <Field label="Transaction Ref">
          <input style={inputSt} value={form.transaction_ref}
            onChange={(e) => set("transaction_ref", e.target.value)} placeholder="TXN-12345" />
        </Field>
        <Field label="Paid Date">
          <input style={inputSt} type="date" value={form.paid_date}
            onChange={(e) => set("paid_date", e.target.value)} />
        </Field>
      </Row>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
        <button className="btn btn--secondary" onClick={onClose}>Anulo</button>
        <button className="btn btn--primary" onClick={handleSubmit} disabled={saving}>
          {saving ? "Duke shënuar..." : "✓ Konfirmo PAID"}
        </button>
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export default function SalesAdminModule() {
  const [tab, setTab]     = useState("listings");
  const [toast, setToast] = useState(null);

  const [contractPrefill, setContractPrefill] = useState(null);
  const [paymentPrefill,  setPaymentPrefill]  = useState(null);

  const notify = useCallback((msg, type = "success") =>
    setToast({ msg, type, key: Date.now() }), []);

  const goToContract = (pf) => { setContractPrefill(pf); setTab("contracts"); };
  const goToPayment  = (pf) => { setPaymentPrefill(pf);  setTab("payments");  };

  // Summary stats cards (static labels — data comes from sections)
  const statCards = [
    { label: "Sale Listings",  icon: "🏷️", desc: "Menaxho të gjitha listings" },
    { label: "Contracts",      icon: "📄", desc: "Krijo dhe menaxho kontratat" },
    { label: "Payments",       icon: "💳", desc: "Gjurmo pagesat e shitjes" },
  ];

  return (
    <MainLayout role="admin">
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none} }
      `}</style>

      {/* Page header */}
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, margin: "0 0 4px" }}>Sales Management</h1>
        <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>
          Admin view — full control over sale listings, contracts and payments.{" "}
          <span style={{ color: "#6366f1", fontWeight: 500 }}>Listing → Contract → Payment</span>
        </p>
      </div>

      {/* Workflow guide */}
      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        marginBottom: 22, padding: "11px 16px",
        background: "#f0f4ff", borderRadius: 10,
        border: "1px solid #c7d7fe", fontSize: 13, flexWrap: "wrap",
      }}>
        {["🏷️ 1. Listing", "────", "📄 2. Contract", "────", "💳 3. Payment"].map((t, i) => (
          <span key={i} style={{
            fontWeight: t.includes(".")  ? 600 : 400,
            color: t.includes(".")
              ? (
                  (t.includes("1") && tab === "listings")  ||
                  (t.includes("2") && tab === "contracts") ||
                  (t.includes("3") && tab === "payments")
                ) ? "#6366f1" : "#94a3b8"
              : "#c7d7fe",
          }}>{t}</span>
        ))}
        <span style={{ marginLeft: "auto", color: "#6366f1", fontSize: 12 }}>
          Kliko "Contract →" ose "Payments →" për workflow të shpejtë
        </span>
      </div>

      {/* Tabs */}
      <Tabs active={tab} onChange={setTab} />

      {/* Sections */}
      {tab === "listings"  && <ListingsSection  onGoContract={goToContract} notify={notify} />}
      {tab === "contracts" && <ContractsSection prefill={contractPrefill} onGoPayment={goToPayment} notify={notify} />}
      {tab === "payments"  && <PaymentsSection  prefill={paymentPrefill} notify={notify} />}

      {toast && (
        <Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />
      )}
    </MainLayout>
  );
}

// ─── Inline style objects ─────────────────────────────────────────────────────

const card       = { background: "#fff", borderRadius: 14, border: "1px solid #e8edf4", overflow: "hidden" };
const cardHeader = { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px", borderBottom: "1px solid #e8edf4", flexWrap: "wrap", gap: 10 };
const cardTitle  = { fontSize: 16, fontWeight: 600, margin: 0 };
const pillIndigo = { background: "#eef2ff", color: "#6366f1", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500 };

const btnPrimary   = { fontSize: 13, padding: "7px 14px", borderRadius: 8, border: "none", background: "#6366f1", color: "#fff", cursor: "pointer", fontWeight: 500, whiteSpace: "nowrap" };
const btnSecondary = { fontSize: 13, padding: "7px 14px", borderRadius: 8, border: "1px solid #d1d5db", background: "#fff", color: "#374151", cursor: "pointer", whiteSpace: "nowrap" };
const btnSm = (bg, color, border) => ({ fontSize: 11, padding: "4px 9px", borderRadius: 6, border: `1px solid ${border}`, background: bg, color, cursor: "pointer", whiteSpace: "nowrap", fontWeight: 500 });

const sumItem  = { display: "flex", flexDirection: "column", gap: 3 };
const sumLabel = { fontSize: 11, color: "#94a3b8", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" };
const sumVal   = { fontSize: 22, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.02em" };
const divider  = { width: 1, height: 36, background: "#e8edf4" };
