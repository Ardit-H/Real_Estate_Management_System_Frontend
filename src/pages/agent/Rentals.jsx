import { useState, useEffect, useCallback } from "react";
import MainLayout from "../../components/layout/Layout";
import api from "../../api/axios";

// ─── Constants ────────────────────────────────────────────────────────────────
const LISTING_STATUSES = ["ACTIVE", "INACTIVE", "EXPIRED", "RENTED"];
const PRICE_PERIODS    = ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"];
const CURRENCIES       = ["EUR", "USD", "ALL"];

const STATUS_STYLE = {
  ACTIVE:   { bg: "#ecfdf5", color: "#059669" },
  INACTIVE: { bg: "#f1f5f9", color: "#64748b" },
  EXPIRED:  { bg: "#fffbeb", color: "#d97706" },
  RENTED:   { bg: "#eff6ff", color: "#2563eb" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtPrice  = (v, cur = "EUR", period = "MONTHLY") =>
  v != null ? `€${Number(v).toLocaleString("de-DE")} / ${period.toLowerCase()}` : "—";
const fmtDate   = (d) => d ? new Date(d).toLocaleDateString("sq-AL") : "—";
const fmtMoney  = (v) => v != null ? `€${Number(v).toLocaleString("de-DE")}` : "—";

// ─── Shared UI ────────────────────────────────────────────────────────────────
function Toast({ msg, type = "success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{
      position: "fixed", bottom: 28, right: 28, zIndex: 9999,
      background: type === "error" ? "#fee2e2" : "#ecfdf5",
      color: type === "error" ? "#b91c1c" : "#047857",
      padding: "12px 20px", borderRadius: 10, fontSize: 13.5, fontWeight: 500,
      boxShadow: "0 4px 18px rgba(0,0,0,0.12)", maxWidth: 340, animation: "fadeUp .25s ease",
    }}>{msg}</div>
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
      {status}
    </span>
  );
}

function Field({ label, children, required }) {
  return (
    <div className="form-group">
      <label className="form-label">
        {label}{required && <span style={{ color: "#ef4444", marginLeft: 2 }}>*</span>}
      </label>
      {children}
    </div>
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

// ─── Modal ────────────────────────────────────────────────────────────────────
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
            background: "none", color: "#94a3b8", cursor: "pointer",
            fontSize: 16, borderRadius: 6 }}>✕</button>
        </div>
        <div style={{ padding: "22px 24px" }}>{children}</div>
      </div>
    </div>
  );
}

function Row2({ children }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>{children}</div>;
}

// ─── Listing Form Modal ───────────────────────────────────────────────────────
function ListingModal({ initial, onClose, onSuccess, notify }) {
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
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.property_id || !form.price) {
      notify("Property ID dhe çmimi janë të detyrueshme", "error");
      return;
    }
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
    <Modal title={initial ? `Edit Listing #${initial.id}` : "New Rental Listing"}
      onClose={onClose} wide>
      <Row2>
        <Field label="Property ID" required>
          <input className="form-input" type="number" value={form.property_id}
            onChange={e => set("property_id", e.target.value)}
            disabled={!!initial} placeholder="42" />
        </Field>
        <Field label="Titull">
          <input className="form-input" value={form.title}
            onChange={e => set("title", e.target.value)}
            placeholder="2BR Apartment, Prishtinë" />
        </Field>
      </Row2>
      <Row2>
        <Field label="Çmimi / periudha" required>
          <input className="form-input" type="number" value={form.price}
            onChange={e => set("price", e.target.value)} placeholder="450" />
        </Field>
        <Field label="Periudha">
          <select className="form-select" value={form.price_period}
            onChange={e => set("price_period", e.target.value)}>
            {PRICE_PERIODS.map(p => <option key={p}>{p}</option>)}
          </select>
        </Field>
      </Row2>
      <Row2>
        <Field label="Depozita">
          <input className="form-input" type="number" value={form.deposit}
            onChange={e => set("deposit", e.target.value)} placeholder="900" />
        </Field>
        <Field label="Monedha">
          <select className="form-select" value={form.currency}
            onChange={e => set("currency", e.target.value)}>
            {CURRENCIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </Field>
      </Row2>
      <Row2>
        <Field label="Disponueshëm nga">
          <input className="form-input" type="date" value={form.available_from}
            onChange={e => set("available_from", e.target.value)} />
        </Field>
        <Field label="Disponueshëm deri">
          <input className="form-input" type="date" value={form.available_until}
            onChange={e => set("available_until", e.target.value)} />
        </Field>
      </Row2>
      <Row2>
        <Field label="Min. muaj qira">
          <input className="form-input" type="number" min="1"
            value={form.min_lease_months}
            onChange={e => set("min_lease_months", e.target.value)} />
        </Field>
        {initial && (
          <Field label="Statusi">
            <select className="form-select" value={form.status}
              onChange={e => set("status", e.target.value)}>
              {LISTING_STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </Field>
        )}
      </Row2>
      <Field label="Përshkrim">
        <textarea value={form.description} onChange={e => set("description", e.target.value)}
          rows={3} placeholder="Përshkrim i apartamentit..."
          style={{ width: "100%", padding: "9px 12px", border: "1px solid #cbd5e1",
            borderRadius: 10, fontSize: 14, fontFamily: "inherit", resize: "vertical", outline: "none" }} />
      </Field>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 }}>
        <button className="btn btn--secondary" onClick={onClose}>Anulo</button>
        <button className="btn btn--primary" onClick={handleSubmit} disabled={saving}>
          {saving ? "Duke ruajtur..." : initial ? "Ruaj ndryshimet" : "Krijo listing"}
        </button>
      </div>
    </Modal>
  );
}

// ─── Applications Panel ───────────────────────────────────────────────────────
function ApplicationsPanel({ listing, onClose, notify }) {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(null); // app being reviewed

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/rentals/applications/listing/${listing.id}`);
        setApps(res.data || []);
      } catch {
        notify("Gabim gjatë ngarkimit të aplikimeve", "error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [listing.id, notify]);

  const handleReview = async (appId, status, reason = null) => {
    try {
      await api.patch(`/api/rentals/applications/${appId}/review`, {
        status,
        rejection_reason: reason,
      });
      setApps(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
      notify(`Aplikimi #${appId} → ${status}`);
      setReviewing(null);
    } catch (err) {
      notify(err.response?.data?.message || "Gabim", "error");
    }
  };

  const APP_STATUS = {
    PENDING:   { bg: "#fffbeb", color: "#d97706" },
    APPROVED:  { bg: "#ecfdf5", color: "#059669" },
    REJECTED:  { bg: "#fef2f2", color: "#dc2626" },
    CANCELLED: { bg: "#f1f5f9", color: "#64748b" },
  };

  return (
    <Modal title={`Aplikimet — Listing #${listing.id}: ${listing.title || ""}`}
      onClose={onClose} wide>
      {loading ? <Loader /> : apps.length === 0 ? (
        <EmptyState icon="📭" text="Nuk ka aplikime për këtë listing" />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {apps.map(app => (
            <div key={app.id} style={{
              border: "1px solid #e8edf4", borderRadius: 10,
              padding: "14px 16px", background: "#f8fafc",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between",
                alignItems: "flex-start", marginBottom: 10 }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>
                    Aplikim #{app.id} — Client #{app.client_id}
                  </p>
                  <p style={{ fontSize: 12.5, color: "#64748b" }}>
                    {new Date(app.created_at).toLocaleDateString("sq-AL")}
                    {app.income && ` · Të ardhura: €${Number(app.income).toLocaleString()}`}
                    {app.move_in_date && ` · Move-in: ${fmtDate(app.move_in_date)}`}
                  </p>
                </div>
                <span style={{
                  ...(APP_STATUS[app.status] || { bg: "#f1f5f9", color: "#64748b" }),
                  padding: "3px 10px", borderRadius: 20, fontSize: 11.5, fontWeight: 600,
                }}>{app.status}</span>
              </div>
              {app.message && (
                <p style={{ fontSize: 13, color: "#374151", marginBottom: 10,
                  fontStyle: "italic" }}>"{app.message}"</p>
              )}
              {app.status === "PENDING" && (
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn--sm"
                    style={{ background: "#ecfdf5", color: "#059669", border: "1px solid #a7f3d0" }}
                    onClick={() => handleReview(app.id, "APPROVED")}>
                    ✓ Aprovo
                  </button>
                  <button className="btn btn--danger btn--sm"
                    onClick={() => setReviewing(app)}>
                    ✕ Refuzo
                  </button>
                </div>
              )}
              {app.rejection_reason && (
                <p style={{ fontSize: 12, color: "#dc2626", marginTop: 6 }}>
                  Arsyeja: {app.rejection_reason}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Rejection reason dialog */}
      {reviewing && (
        <RejectDialog
          app={reviewing}
          onConfirm={(reason) => handleReview(reviewing.id, "REJECTED", reason)}
          onClose={() => setReviewing(null)}
        />
      )}
    </Modal>
  );
}

function RejectDialog({ app, onConfirm, onClose }) {
  const [reason, setReason] = useState("");
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 2000,
      background: "rgba(15,23,42,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 14, padding: 24, maxWidth: 420, width: "100%" }}>
        <h3 style={{ fontWeight: 600, marginBottom: 14 }}>Refuzo aplikimin #{app.id}</h3>
        <Field label="Arsyeja e refuzimit">
          <textarea value={reason} onChange={e => setReason(e.target.value)}
            rows={3} placeholder="Shkruaj arsyen..."
            style={{ width: "100%", padding: "9px 12px", border: "1px solid #cbd5e1",
              borderRadius: 10, fontSize: 14, fontFamily: "inherit",
              resize: "vertical", outline: "none" }} />
        </Field>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 10 }}>
          <button className="btn btn--secondary" onClick={onClose}>Anulo</button>
          <button className="btn btn--danger" onClick={() => onConfirm(reason || null)}>
            Konfirmo refuzimin
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function AgentRentals() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [appsTarget, setAppsTarget] = useState(null);
  const [toast, setToast] = useState(null);

  const notify = useCallback((msg, type = "success") =>
    setToast({ msg, type, key: Date.now() }), []);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/rentals/listings?page=${page}&size=12&sortBy=createdAt&sortDir=desc`);
      setListings(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
    } catch {
      notify("Gabim gjatë ngarkimit", "error");
    } finally {
      setLoading(false);
    }
  }, [page, notify]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  const handleDelete = async () => {
    try {
      await api.delete(`/api/rentals/listings/${deleteId}`);
      notify("Listing u fshi me sukses");
      setDeleteId(null);
      fetchListings();
    } catch (err) {
      notify(err.response?.data?.message || "Gabim gjatë fshirjes", "error");
    }
  };

  return (
    <MainLayout role="agent">
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px);} to{opacity:1;transform:translateY(0);} }
        @keyframes spin { to { transform:rotate(360deg); } }
      `}</style>

      <div className="page-header">
        <div>
          <h1 className="page-title">Rental Listings</h1>
          <p className="page-subtitle">Menaxho listat e qirasë dhe aplikimet e klientëve</p>
        </div>
        <button className="btn btn--primary"
          onClick={() => { setEditTarget(null); setModalOpen(true); }}>
          + New Listing
        </button>
      </div>

      <div className="card">
        <div className="card__header">
          <h2 className="card__title">Të gjitha Rental Listings</h2>
          {listings.length > 0 && (
            <span style={{ background: "#eef2ff", color: "#6366f1",
              padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500 }}>
              {listings.length} listings
            </span>
          )}
        </div>

        {loading ? <Loader /> : listings.length === 0 ? (
          <EmptyState icon="🔑" text="Nuk ka rental listings. Krijo listingun e parë." />
        ) : (
          <>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Titull / Property</th>
                    <th>Çmimi</th>
                    <th>Depozita</th>
                    <th>Disponueshëm</th>
                    <th>Min. muaj</th>
                    <th>Statusi</th>
                    <th>Veprime</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map(l => (
                    <tr key={l.id}>
                      <td style={{ color: "#94a3b8", fontSize: 12 }}>{l.id}</td>
                      <td>
                        <p style={{ fontWeight: 500, fontSize: 13.5 }}>
                          {l.title || `Listing #${l.id}`}
                        </p>
                        <span style={{ background: "#eef2ff", color: "#6366f1",
                          padding: "1px 7px", borderRadius: 20, fontSize: 11 }}>
                          #{l.property_id}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {fmtPrice(l.price, l.currency, l.price_period)}
                      </td>
                      <td>{fmtMoney(l.deposit)}</td>
                      <td>
                        <p style={{ fontSize: 12.5, color: "#64748b" }}>
                          {fmtDate(l.available_from)} →
                        </p>
                        <p style={{ fontSize: 12.5, color: "#64748b" }}>
                          {fmtDate(l.available_until)}
                        </p>
                      </td>
                      <td style={{ textAlign: "center" }}>{l.min_lease_months || "—"}</td>
                      <td><StatusBadge status={l.status} /></td>
                      <td>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          <button className="btn btn--ghost btn--sm"
                            onClick={() => setAppsTarget(l)}>
                            Aplikimet
                          </button>
                          <button className="btn btn--secondary btn--sm"
                            onClick={() => { setEditTarget(l); setModalOpen(true); }}>
                            Edit
                          </button>
                          <button className="btn btn--danger btn--sm"
                            onClick={() => setDeleteId(l.id)}>
                            Del
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

      {modalOpen && (
        <ListingModal
          initial={editTarget}
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            setModalOpen(false);
            fetchListings();
            notify(editTarget ? "Listing u ndryshua" : "Listing u krijua");
          }}
          notify={notify}
        />
      )}

      {deleteId && (
        <Modal title="Konfirmo fshirjen" onClose={() => setDeleteId(null)}>
          <p style={{ fontSize: 14, color: "#475569", marginBottom: 20 }}>
            A jeni i sigurt që dëshironi të fshini listing <strong>#{deleteId}</strong>?
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button className="btn btn--secondary" onClick={() => setDeleteId(null)}>Anulo</button>
            <button className="btn btn--danger" onClick={handleDelete}>Fshi</button>
          </div>
        </Modal>
      )}

      {appsTarget && (
        <ApplicationsPanel
          listing={appsTarget}
          onClose={() => setAppsTarget(null)}
          notify={notify}
        />
      )}

      {toast && <Toast key={toast.key} msg={toast.msg} type={toast.type}
        onDone={() => setToast(null)} />}
    </MainLayout>
  );
}
