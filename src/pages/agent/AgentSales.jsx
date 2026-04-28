import { useState, useEffect, useCallback,  useContext } from "react";
import { AuthContext } from "../../context/AuthProvider";
import MainLayout from "../../components/layout/Layout";
import api from "../../api/axios";
 
// ─── Constants ───────────────────────────────────────────────────────────────
 
const SALE_STATUSES   = ["ACTIVE", "SOLD", "PENDING", "CANCELLED"];
const CONTRACT_STATUSES = ["PENDING", "COMPLETED", "CANCELLED"];
const PAYMENT_TYPES   = ["FULL", "DEPOSIT", "INSTALLMENT", "COMMISSION","AGENT_COMMISSION", "CLIENT_BONUS"];
const PAYMENT_METHODS = ["BANK_TRANSFER", "CASH", "CARD", "CHECK"];
const MANUAL_PAYMENT_TYPES = ["DEPOSIT", "INSTALLMENT"];
const TYPE_COLORS = {
  FULL:             { bg: "#eef2ff", color: "#6366f1" },
  DEPOSIT:          { bg: "#fef9c3", color: "#854d0e" },
  INSTALLMENT:      { bg: "#f1f5f9", color: "#475569" },
  COMMISSION:       { bg: "#f0fdf4", color: "#166534" },
  AGENT_COMMISSION: { bg: "#eff6ff", color: "#1d4ed8" },
  CLIENT_BONUS:     { bg: "#fdf4ff", color: "#7e22ce" },
};
 
// ─── Small helpers ────────────────────────────────────────────────────────────
 
const fmtPrice = (v, cur = "EUR") =>
  v != null ? `€${Number(v).toLocaleString("de-DE")} ${cur}` : "—";
 
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("sq-AL") : "—");
 
const STATUS_BADGE = {
  ACTIVE:    "badge badge--green",
  SOLD:      "badge badge--blue",
  PENDING:   "badge badge--amber",
  CANCELLED: "badge badge--red",
  COMPLETED: "badge badge--green",
  PAID:      "badge badge--green",
  FAILED:    "badge badge--red",
  REFUNDED:  "badge badge--gray",
};
 
function Badge({ label }) {
  return <span className={STATUS_BADGE[label] || "badge badge--gray"}>{label}</span>;
}
 
// ─── Shared UI ────────────────────────────────────────────────────────────────
 
function Modal({ title, onClose, children, wide = false }) {
  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);
 
  return (
    <div style={overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ ...modalBox, maxWidth: wide ? 720 : 520 }}>
        <div style={modalHead}>
          <span style={{ fontWeight: 600, fontSize: 15 }}>{title}</span>
          <button onClick={onClose} style={closeBtn}>✕</button>
        </div>
        <div style={{ padding: "22px 24px" }}>{children}</div>
      </div>
    </div>
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
 
function FormRow({ children }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>{children}</div>;
}
 
function Toast({ msg, type = "success", onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3200);
    return () => clearTimeout(t);
  }, [onDone]);
  const bg = type === "error" ? "#fee2e2" : "#ecfdf5";
  const co = type === "error" ? "#b91c1c" : "#047857";
  return (
    <div style={{
      position: "fixed", bottom: 28, right: 28, zIndex: 9999,
      background: bg, color: co, padding: "12px 20px", borderRadius: 10,
      fontSize: 13.5, fontWeight: 500, boxShadow: "0 4px 18px rgba(0,0,0,0.12)",
      animation: "fadeUp .25s ease", maxWidth: 340,
    }}>
      {msg}
    </div>
  );
}
 
function EmptyState({ icon, text }) {
  return (
    <div style={{ textAlign: "center", padding: "52px 20px", color: "#94a3b8" }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>{icon}</div>
      <p style={{ fontSize: 14 }}>{text}</p>
    </div>
  );
}
 
function Loader() {
  return (
    <div style={{ textAlign: "center", padding: "48px 0", color: "#94a3b8" }}>
      <div style={spinnerStyle} />
    </div>
  );
}
 
function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end", padding: "14px 16px" }}>
      <button
        className="btn btn--secondary btn--sm"
        disabled={page === 0}
        onClick={() => onChange(page - 1)}
      >← Prev</button>
      <span style={{ fontSize: 13, color: "#64748b", padding: "0 8px" }}>
        {page + 1} / {totalPages}
      </span>
      <button
        className="btn btn--secondary btn--sm"
        disabled={page >= totalPages - 1}
        onClick={() => onChange(page + 1)}
      >Next →</button>
    </div>
  );
}
 
// ─── Section header tabs ──────────────────────────────────────────────────────
 
function SectionTabs({ active, onChange }) {
  const tabs = [
    { id: "listings", label: "Sale Listings", icon: "🏷️" },
    { id: "contracts", label: "Contracts", icon: "📄" },
    { id: "payments", label: "Payments", icon: "💳" },
  ];
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 24, borderBottom: "1px solid #e8edf4", paddingBottom: 0 }}>
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          style={{
            padding: "10px 18px",
            border: "none",
            borderBottom: active === t.id ? "2px solid #6366f1" : "2px solid transparent",
            background: "none",
            color: active === t.id ? "#6366f1" : "#64748b",
            fontWeight: active === t.id ? 600 : 400,
            fontSize: 14,
            cursor: "pointer",
            fontFamily: "inherit",
            marginBottom: -1,
            display: "flex",
            alignItems: "center",
            gap: 6,
            transition: "color .15s ease",
          }}
        >
          <span>{t.icon}</span> {t.label}
        </button>
      ))}
    </div>
  );
}
 
// ═══════════════════════════════════════════════════════════════════════════════
// LISTINGS SECTION
// ═══════════════════════════════════════════════════════════════════════════════
 
function ListingsSection({ onSelectContract, notify, currentUserId }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [showOnlyMine, setShowOnlyMine] = useState(true);
  const [agentNames, setAgentNames] = useState({});
 
  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const url = showOnlyMine
        ? `/api/sales/listings/agent/me?page=${page}&size=10`
        : statusFilter
          ? `/api/sales/listings/status/${statusFilter}?page=${page}&size=10`
          : `/api/sales/listings?page=${page}&size=10&sortBy=createdAt&sortDir=desc`;
      const res = await api.get(url);
      const data = res.data;
      setListings(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch {
      notify("Gabim gjatë ngarkimit të listings", "error");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, showOnlyMine, notify]);
 
  useEffect(() => { fetchListings(); }, [fetchListings]);
  useEffect(() => {
    api.get("/api/users/agents/list")
      .then(res => {
        const map = {};
        (res.data || []).forEach(u => {
          map[u.id] = `${u.first_name} ${u.last_name}`.trim() || `Agjent #${u.id}`;
        });
        setAgentNames(map);
      })
      .catch(() => {}); // silent fail — nuk e bllokon UI-n
  }, []);
 
  const handleDelete = async () => {
    try {
      await api.delete(`/api/sales/listings/${deleteId}`);
      notify("Listing u fshi me sukses");
      setDeleteId(null);
      fetchListings();
    } catch {
      notify("Gabim gjatë fshirjes", "error");
    }
  };
 
  return (
    <>
      <div className="card">
        <div className="card__header">
          <h2 className="card__title">Sale Listings</h2>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <button
              onClick={() => { setShowOnlyMine(p => !p); setPage(0); }}
              style={{
                padding:"5px 14px", borderRadius:20, fontSize:12.5, fontWeight:500,
                cursor:"pointer", border:"1px solid",
                background: showOnlyMine ? "#eef2ff" : "#f1f5f9",
                color:       showOnlyMine ? "#6366f1" : "#64748b",
                borderColor: showOnlyMine ? "#c7d7fe" : "#e2e8f0",
              }}>
              {showOnlyMine ? "👤 My Listings" : "🌐 All Listings"}
            </button>

            {/* filtri i statusit — vetëm kur shikon të gjitha */}
            {!showOnlyMine && (
              <select
                className="form-select"
                style={{ width:160, height:34, padding:"0 10px", fontSize:13 }}
                value={statusFilter}
                onChange={e => { setStatusFilter(e.target.value); setPage(0); }}>
                <option value="">All statuses</option>
                {SALE_STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            )}

            <button className="btn btn--primary btn--sm"
              onClick={() => { setEditTarget(null); setModalOpen(true); }}>
              + New Listing
            </button>
          </div>
        </div>
 
        {loading ? <Loader /> : listings.length === 0 ? (
          <EmptyState icon="🏷️" text="Nuk ka listings. Krijo listingun e parë." />
        ) : (
          <>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Property ID</th>
                    {!showOnlyMine && <th>Agjenti</th>}
                    <th>Price</th>
                    <th>Negotiable</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((l) => {
                    const isOwner = l.agent_id === currentUserId;  // ← kontrolli kryesor
                    return (
                      <tr key={l.id}>
                      <td style={{ color: "#94a3b8", fontSize: 12 }}>{l.id}</td>
                      <td>
                        <span style={{
                          background: "#eef2ff", color: "#6366f1",
                          padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500,
                        }}>
                          #{l.property_id}
                        </span>
                      </td>
                      {!showOnlyMine && (
                          <td style={{ fontSize:12.5, color:"#64748b" }}>
                            {l.agent_id === currentUserId
                              ? <span style={{ color:"#6366f1", fontWeight:500 }}>👤 Unë</span>
                              : <span style={{ color:"#475569" }}>{agentNames[l.agent_id] || `Agjent #${l.agent_id}`}</span>}
                          </td>
                        )}
                      <td style={{ fontWeight: 600 }}>{fmtPrice(l.price, l.currency)}</td>
                      <td>
                        <span style={{
                          fontSize: 12, fontWeight: 500,
                          color: l.negotiable ? "#059669" : "#94a3b8",
                        }}>
                          {l.negotiable ? "✓ Yes" : "No"}
                        </span>
                      </td>
                      <td><Badge label={l.status} /></td>
                      <td className="text-muted">{fmtDate(l.created_at)}</td>
                            
                            <td>
        <div className="flex gap-2">
          {isOwner ? (
            // Veprimet e plota — vetëm për listings e veta
            <>
              <button className="btn btn--secondary btn--sm"
                onClick={() => { setEditTarget(l); setModalOpen(true); }}>
                Edit
              </button>
              <button className="btn btn--primary btn--sm"
                onClick={() => onSelectContract({ listingId:l.id, propertyId:l.property_id, price:l.price })}>
                Contract →
              </button>
              <button className="btn btn--danger btn--sm"
                onClick={() => setDeleteId(l.id)}>
                Del
              </button>
            </>
          ) : (
            // Vetëm "View" për listings të agjentëve të tjerë
            <span style={{
              fontSize:11.5, color:"#94a3b8", background:"#f1f5f9",
              padding:"3px 10px", borderRadius:20, fontStyle:"italic"
            }}>
              Vetëm shiko
            </span>
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
 
      {/* Create / Edit Modal */}
      {modalOpen && (
        <ListingModal
          initial={editTarget}
          onClose={() => setModalOpen(false)}
          onSuccess={() => { setModalOpen(false); fetchListings(); notify(editTarget ? "Listing u ndryshua" : "Listing u krijua"); }}
          notify={notify}
        />
      )}
 
      {/* Delete confirm */}
      {deleteId && (
        <Modal title="Konfirmo fshirjen" onClose={() => setDeleteId(null)}>
          <p style={{ fontSize: 14, color: "#475569", marginBottom: 20 }}>
            A jeni i sigurt që dëshironi të fshini listing <strong>#{deleteId}</strong>? Ky veprim nuk mund të kthehet.
          </p>
          <div className="flex gap-2" style={{ justifyContent: "flex-end" }}>
            <button className="btn btn--secondary" onClick={() => setDeleteId(null)}>Anulo</button>
            <button className="btn btn--danger" onClick={handleDelete}>Fshi</button>
          </div>
        </Modal>
      )}
    </>
  );
}
 
function ListingModal({ initial, onClose, onSuccess, notify }) {
  const [form, setForm] = useState({
    property_id: initial?.property_id ?? "",
    price: initial?.price ?? "",
    currency: initial?.currency ?? "EUR",
    negotiable: initial?.negotiable ?? true,
    description: initial?.description ?? "",
    highlights: initial?.highlights ?? "",
    status: initial?.status ?? "ACTIVE",
  });
  const [saving, setSaving] = useState(false);
 
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
 
  const handleSubmit = async () => {
    if (!form.property_id || !form.price) {
      notify("Property ID dhe çmimi janë të detyrueshme", "error");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        property_id: Number(form.property_id),
        price: Number(form.price),
        currency: form.currency,
        negotiable: form.negotiable,
        description: form.description || null,
        highlights: form.highlights || null,
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
      <FormRow>
        <Field label="Property ID" required>
          <input className="form-input" type="number" value={form.property_id}
            onChange={(e) => set("property_id", e.target.value)}
            placeholder="ex: 42" disabled={!!initial} />
        </Field>
        <Field label="Price" required>
          <input className="form-input" type="number" value={form.price}
            onChange={(e) => set("price", e.target.value)}
            placeholder="ex: 145000" />
        </Field>
      </FormRow>
      <FormRow>
        <Field label="Currency">
          <select className="form-select" value={form.currency}
            onChange={(e) => set("currency", e.target.value)}>
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
            <option value="ALL">ALL</option>
          </select>
        </Field>
        <Field label="Negotiable">
          <select className="form-select" value={String(form.negotiable)}
            onChange={(e) => set("negotiable", e.target.value === "true")}>
            <option value="true">Po</option>
            <option value="false">Jo</option>
          </select>
        </Field>
      </FormRow>
      {initial && (
        <Field label="Status">
          <select className="form-select" value={form.status}
            onChange={(e) => set("status", e.target.value)}>
            {SALE_STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>
      )}
      <Field label="Description">
        <textarea className="form-textarea" rows={3} value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Përshkrim i pronës..." />
      </Field>
      <Field label="Highlights">
        <textarea className="form-textarea" rows={2} value={form.highlights}
          onChange={(e) => set("highlights", e.target.value)}
          placeholder="Tiparet kryesore..." />
      </Field>
      <div className="flex gap-2" style={{ justifyContent: "flex-end", marginTop: 6 }}>
        <button className="btn btn--secondary" onClick={onClose}>Anulo</button>
        <button className="btn btn--primary" onClick={handleSubmit} disabled={saving}>
          {saving ? "Duke ruajtur..." : initial ? "Ruaj ndryshimet" : "Krijo listing"}
        </button>
      </div>
    </Modal>
  );
}
 
// ═══════════════════════════════════════════════════════════════════════════════
// CONTRACTS SECTION
// ═══════════════════════════════════════════════════════════════════════════════
 
function ContractsSection({ prefill, onSelectPayment, notify, currentUserId }) {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);
 
  const fetchContracts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/sales/contracts?page=${page}&size=10`);
      const data = res.data;
      setContracts(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch {
      notify("Gabim gjatë ngarkimit të kontratave", "error");
    } finally {
      setLoading(false);
    }
  }, [page, notify]);
 
  useEffect(() => { fetchContracts(); }, [fetchContracts]);
 
  // Open create modal pre-filled from listing
  useEffect(() => {
    if (prefill?.listingId) {
      setEditTarget(null);
      setModalOpen(true);
    }
  }, [prefill]);
 
  return (
    <>
      <div className="card">
        <div className="card__header">
          <h2 className="card__title">Sale Contracts</h2>
          <button className="btn btn--primary btn--sm"
            onClick={() => { setEditTarget(null); setModalOpen(true); }}>
            + New Contract
          </button>
        </div>
 
        {loading ? <Loader /> : contracts.length === 0 ? (
          <EmptyState icon="📄" text="Nuk ka kontrata aktive." />
        ) : (
          <>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Property</th>
                    <th>Buyer ID</th>
                    <th>Sale Price</th>
                    <th>Contract Date</th>
                    <th>Handover</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contracts.map((c) => (
                    <tr key={c.id}>
                      <td style={{ color: "#94a3b8", fontSize: 12 }}>{c.id}</td>
                      <td>
                        <span style={{
                          background: "#eef2ff", color: "#6366f1",
                          padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500,
                        }}>
                          #{c.property_id}
                        </span>
                      </td>
                      <td style={{ fontWeight: 500 }}>#{c.buyer_id}</td>
                      <td style={{ fontWeight: 600 }}>{fmtPrice(c.sale_price, c.currency)}</td>
                      <td className="text-muted">{fmtDate(c.contract_date)}</td>
                      <td className="text-muted">{fmtDate(c.handover_date)}</td>
                      <td><Badge label={c.status} /></td>
                      <td>
                        <div className="flex gap-2">
                          {c.status === "PENDING" && c.agent_id === currentUserId && (
                            <>
                              <button className="btn btn--secondary btn--sm"
                                onClick={() => { setEditTarget(c); setModalOpen(true); }}>Edit</button>
                              <button className="btn btn--ghost btn--sm"
                                onClick={() => setStatusTarget(c)}>Status</button>
                            </>
                          )}
                          {c.agent_id === currentUserId && (
                            <button className="btn btn--primary btn--sm"
                              onClick={() => onSelectPayment({ contractId:c.id, salePrice:c.sale_price })}>
                              Payments →
                            </button>
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
 
      {modalOpen && (
        <ContractModal
          initial={editTarget}
          prefill={prefill}
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            setModalOpen(false);
            fetchContracts();
            notify(editTarget ? "Kontrata u ndryshua" : "Kontrata u krijua");
          }}
          notify={notify}
        />
      )}
 
      {statusTarget && (
        <ContractStatusModal
          contract={statusTarget}
          onClose={() => setStatusTarget(null)}
          onSuccess={() => {
            setStatusTarget(null);
            fetchContracts();
            notify("Statusi i kontratës u ndryshua");
          }}
          notify={notify}
        />
      )}
    </>
  );
}
 
function ContractModal({ initial, prefill, onClose, onSuccess, notify }) {
  const [form, setForm] = useState({
    property_id: initial?.property_id ?? prefill?.propertyId ?? "",
    listing_id:  initial?.listing_id  ?? prefill?.listingId  ?? "",
    buyer_id:    initial?.buyer_id    ?? "",
    sale_price:  initial?.sale_price  ?? prefill?.price       ?? "",
    currency:    initial?.currency    ?? "EUR",
    contract_date:  initial?.contract_date  ?? "",
    handover_date:  initial?.handover_date  ?? "",
    contract_file_url: initial?.contract_file_url ?? "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
 
  const handleSubmit = async () => {
    if (!form.property_id || !form.buyer_id || !form.sale_price) {
      notify("Property ID, Buyer ID dhe çmimi janë të detyrueshme", "error");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        property_id:  Number(form.property_id),
        listing_id:   form.listing_id ? Number(form.listing_id) : null,
        buyer_id:     Number(form.buyer_id),
        sale_price:   Number(form.sale_price),
        currency:     form.currency,
        contract_date:    form.contract_date    || null,
        handover_date:    form.handover_date    || null,
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
    <Modal title={initial ? `Edit Contract #${initial.id}` : "New Sale Contract"} onClose={onClose} wide>
      <FormRow>
        <Field label="Property ID" required>
          <input className="form-input" type="number" value={form.property_id}
            onChange={(e) => set("property_id", e.target.value)}
            disabled={!!initial} placeholder="ex: 42" />
        </Field>
        <Field label="Listing ID">
          <input className="form-input" type="number" value={form.listing_id}
            onChange={(e) => set("listing_id", e.target.value)}
            placeholder="(opcional)" />
        </Field>
      </FormRow>
      <FormRow>
        <Field label="Buyer ID" required>
          <input className="form-input" type="number" value={form.buyer_id}
            onChange={(e) => set("buyer_id", e.target.value)}
            disabled={!!initial} placeholder="ID e blerësit" />
        </Field>
        <Field label="Sale Price" required>
          <input className="form-input" type="number" value={form.sale_price}
            onChange={(e) => set("sale_price", e.target.value)}
            placeholder="ex: 145000" />
        </Field>
      </FormRow>
      <FormRow>
        <Field label="Currency">
          <select className="form-select" value={form.currency}
            onChange={(e) => set("currency", e.target.value)}>
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
            <option value="ALL">ALL</option>
          </select>
        </Field>
        <Field label="Contract Date">
          <input className="form-input" type="date" value={form.contract_date}
            onChange={(e) => set("contract_date", e.target.value)} />
        </Field>
      </FormRow>
      <FormRow>
        <Field label="Handover Date">
          <input className="form-input" type="date" value={form.handover_date}
            onChange={(e) => set("handover_date", e.target.value)}
            min={form.contract_date || new Date().toISOString().split("T")[0]} />
        </Field>
        <Field label="Contract File URL">
          <input className="form-input" value={form.contract_file_url}
            onChange={(e) => set("contract_file_url", e.target.value)}
            placeholder="https://..." />
        </Field>
      </FormRow>
      <div className="flex gap-2" style={{ justifyContent: "flex-end", marginTop: 6 }}>
        <button className="btn btn--secondary" onClick={onClose}>Anulo</button>
        <button className="btn btn--primary" onClick={handleSubmit} disabled={saving}>
          {saving ? "Duke ruajtur..." : initial ? "Ruaj ndryshimet" : "Krijo kontratë"}
        </button>
      </div>
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
      notify(err.response?.data?.message || "Gabim", "error");
    } finally {
      setSaving(false);
    }
  };
 
  return (
    <Modal title={`Ndrysho statusin e Kontratës #${contract.id}`} onClose={onClose}>
      <p style={{ fontSize: 13.5, color: "#475569", marginBottom: 18 }}>
        Statusi aktual: <Badge label={contract.status} />
      </p>
      <Field label="Statusi i ri" required>
        <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="COMPLETED">COMPLETED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </Field>
      {status === "COMPLETED" && (
  <div style={{
    background: "#eff6ff", border: "1px solid #bfdbfe",
    borderRadius: 8, padding: "10px 14px", marginBottom: 14,
    fontSize: 13, color: "#1e40af",
  }}>
    💡 Duke shënuar COMPLETED, sistemi do të krijojë automatikisht
    pagesat e komisionit (3% e çmimit të shitjes).
    <br />
    <span style={{ fontSize: 12, opacity: 0.8 }}>
      Nëse prona vjen nga një lead klienti, do të krijohet edhe pagesa
      FULL (97%) për pronarin.
    </span>
  </div>
)}

      {status === "CANCELLED" && (
        <div style={{
          background: "#fef2f2", border: "1px solid #fecaca",
          borderRadius: 8, padding: "10px 14px", marginBottom: 14,
          fontSize: 13, color: "#b91c1c",
        }}>
          ⚠️ Anulimi i kontratës është i pakthyeshëm.
        </div>
      )}

      {status === "COMPLETED" && (
        <div style={{
          background: "#ecfdf5", border: "1px solid #a7f3d0",
          borderRadius: 8, padding: "10px 14px", marginBottom: 18,
          fontSize: 13, color: "#047857",
        }}>
          ✓ Kontrata do të shënohet si e përfunduar me sukses.
        </div>
      )}
      <div className="flex gap-2" style={{ justifyContent: "flex-end" }}>
        <button className="btn btn--secondary" onClick={onClose}>Anulo</button>
        <button
          className={`btn ${status === "CANCELLED" ? "btn--danger" : "btn--primary"}`}
          onClick={handleSubmit} disabled={saving}>
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
  const [contractStatus, setContractStatus] = useState(null);
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [payTarget, setPayTarget] = useState(null);
 
  // auto-load when coming from contracts
  useEffect(() => {
    if (prefill?.contractId) {
      setContractId(prefill.contractId);
    }
  }, [prefill]);
 
  useEffect(() => {
    if (contractId) fetchPayments();
    // eslint-disable-next-line
  }, [contractId]);
 
  const fetchPayments = async () => {
    if (!contractId) return;
    setLoading(true);
    try {
      const [listRes, sumRes, contractRes] = await Promise.all([
        api.get(`/api/sales/payments/contract/${contractId}`),
        api.get(`/api/sales/payments/contract/${contractId}/summary`),
        api.get(`/api/sales/contracts/${contractId}`),
      ]);
      setPayments(listRes.data || []);
      setSummary(sumRes.data);
      setContractStatus(contractRes.data?.status ?? null);
    } catch {
      notify("Gabim gjatë ngarkimit të pagesave", "error");
    } finally {
      setLoading(false);
    }
  };
 
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
 
  const paidPct = summary && Number(summary.total_paid) > 0 && prefill?.salePrice
    ? Math.min(100, Math.round((Number(summary.total_paid) / Number(prefill.salePrice)) * 100))
    : null;
 
  return (
    <>
      <div className="card">
        <div className="card__header">
          <h2 className="card__title">Sale Payments</h2>
          <div className="flex gap-2 items-center">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <label style={{ fontSize: 13, color: "#64748b", whiteSpace: "nowrap" }}>Contract #</label>
              <input
                className="form-input"
                type="number"
                style={{ width: 110, height: 34, padding: "0 10px", fontSize: 13 }}
                value={contractId}
                onChange={(e) => setContractId(e.target.value)}
                placeholder="ID..."
              />
              <button className="btn btn--secondary btn--sm" onClick={fetchPayments}>Load</button>
            </div>
            {contractId && contractStatus !== "COMPLETED" && contractStatus !== "CANCELLED" && (
              <button className="btn btn--primary btn--sm"
                onClick={() => setCreateOpen(true)}>
                + Add Payment
              </button>
            )}
            {contractId && contractStatus === "COMPLETED" && (
              <span style={{
                fontSize: 12, color: "#059669", fontWeight: 500,
                background: "#ecfdf5", padding: "4px 12px",
                borderRadius: 20, border: "1px solid #a7f3d0"
              }}>
                ✓ Pagesat u finalizuan automatikisht
              </span>
            )}
          </div>
        </div>
 
        {/* Summary bar */}
        {summary && (
          <div style={{
            display: "flex", gap: 16, padding: "14px 20px",
            background: "#f8fafc", borderBottom: "1px solid #e8edf4",
            alignItems: "center", flexWrap: "wrap",
          }}>
            {/* Total Payments */}
            <div style={summaryItem}>
              <span style={summaryLabel}>Total Payments</span>
              <span style={summaryVal}>{summary.total_payments}</span>
            </div>

            <div style={summaryDivider} />

            {/* Total Paid */}
            <div style={summaryItem}>
              <span style={summaryLabel}>Total Paid</span>
              <span style={{ ...summaryVal, color: "#059669" }}>
                €{Number(summary.total_paid).toLocaleString("de-DE")}
              </span>
            </div>

            {/* Already Paid */}
            {payments.some(p => p.payment_type === "DEPOSIT" 
                 || p.payment_type === "INSTALLMENT") && (
              <>
                <div style={summaryDivider} />
                <div style={summaryItem}>
                  <span style={summaryLabel}>Kaparro / Këste</span>
                  <span style={{ ...summaryVal, color: "#854d0e", fontSize: 16 }}>
                    €{payments
                        .filter(p => (p.payment_type === "DEPOSIT" 
                                  || p.payment_type === "INSTALLMENT")
                                  && p.status === "PAID")
                        .reduce((s, p) => s + Number(p.amount), 0)
                        .toLocaleString("de-DE")}
                  </span>
                </div>
              </>
            )}

            {/* Progress bar — vetëm kur ka sale price */}
            {paidPct !== null && (
              <>
                <div style={summaryDivider} />
                <div style={{ flex: 1, minWidth: 160 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={summaryLabel}>Paguar</span>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: "#6366f1" }}>{paidPct}%</span>
                  </div>
                  <div style={{ height: 6, background: "#e8edf4", borderRadius: 99 }}>
                    <div style={{
                      height: "100%", borderRadius: 99,
                      width: `${paidPct}%`,
                      background: paidPct === 100 ? "#10b981" : "#6366f1",
                      transition: "width .4s ease",
                    }} />
                  </div>
                </div>
              </>
            )}

            {/* ← E RE: Breakdown komisioni — shfaqet vetëm kur ekzistojnë */}
            {payments.some(p => p.payment_type === "AGENT_COMMISSION") && (
              <>
                <div style={summaryDivider} />
                <div style={summaryItem}>
                  <span style={summaryLabel}>Pronari / Klienti</span>
                  <span style={{ ...summaryVal, color: "#7e22ce", fontSize: 16 }}>
                    €{payments
                        .filter(p => p.payment_type === "FULL")
                        .reduce((s, p) => s + Number(p.amount), 0)
                        .toLocaleString("de-DE")}
                  </span>
                </div>

                <div style={summaryDivider} />

                <div style={summaryItem}>
                  <span style={summaryLabel}>Komisioni Agjentit</span>
                  <span style={{ ...summaryVal, color: "#1d4ed8", fontSize: 16 }}>
                    €{payments
                        .filter(p => p.payment_type === "AGENT_COMMISSION")
                        .reduce((s, p) => s + Number(p.amount), 0)
                        .toLocaleString("de-DE")}
                  </span>
                </div>

                <div style={summaryDivider} />

                <div style={summaryItem}>
                  <span style={summaryLabel}>Kompania</span>
                  <span style={{ ...summaryVal, color: "#059669", fontSize: 16 }}>
                    €{payments
                        .filter(p => p.payment_type === "COMMISSION")
                        .reduce((s, p) => s + Number(p.amount), 0)
                        .toLocaleString("de-DE")}
                  </span>
                </div>
              </>
            )}
          </div>
        )}
 
        {!contractId ? (
          <EmptyState icon="💳" text="Shkruaj Contract ID dhe kliko Load për të parë pagesat." />
        ) : loading ? <Loader /> : payments.length === 0 ? (
          <EmptyState icon="💳" text="Nuk ka pagesa për këtë kontratë." />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Amount</th>
                  <th>Type</th>
                  <th>Recipient</th>
                  <th>Method</th>
                  <th>Paid Date</th>
                  <th>Ref</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => {
                  const typeStyle = TYPE_COLORS[p.payment_type] || TYPE_COLORS.FULL;
                  return (
                    <tr key={p.id}>
                      <td style={{ color: "#94a3b8", fontSize: 12 }}>{p.id}</td>
                      <td style={{ fontWeight: 600 }}>{fmtPrice(p.amount, p.currency)}</td>
                      <td>
                        <span style={{
                          background: typeStyle.bg, color: typeStyle.color,
                          padding: "2px 8px", borderRadius: 20,
                          fontSize: 11.5, fontWeight: 500,
                        }}>
                          {p.payment_type}
                        </span>
                      </td>

                                    <td>
                        {p.recipient_name ? (
                          <span style={{ fontSize: 13, color: "#475569" }}>
                            {p.recipient_type === "AGENT"
                              ? `👤 ${p.recipient_name}`
                              : p.payment_type === "FULL"
                                ? `🏠 ${p.recipient_name} (Pronar)`
                                : `🎁 ${p.recipient_name} (Bonus)`
                            }
                          </span>
                        ) : (
                          <span style={{
                            fontSize: 12, color: "#059669", fontWeight: 500,
                            background: "#ecfdf5", padding: "2px 8px", borderRadius: 20
                          }}>
                            🏢 Kompania
                          </span>
                        )}
                      </td>

                      <td className="text-muted">{p.payment_method || "—"}</td>
                      <td className="text-muted">{fmtDate(p.paid_date)}</td>
                      <td style={{ fontSize: 12, color: "#94a3b8" }}>{p.transaction_ref || "—"}</td>
                      <td><Badge label={p.status} /></td>
                      <td>
                        {p.status === "PENDING" && (
                          <button className="btn btn--primary btn--sm"
                            onClick={() => setPayTarget(p)}>
                            Mark Paid
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
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
    amount: "",
    currency: "EUR",
    payment_type: "DEPOSIT",
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
      notify(err.response?.data?.message || "Gabim", "error");
    } finally {
      setSaving(false);
    }
  };
 
  return (
    <Modal title={`New Payment — Contract #${contractId}`} onClose={onClose}>
      <div style={{
        background: "#f0f4ff", border: "1px solid #c7d7fe",
        borderRadius: 8, padding: "10px 14px", marginBottom: 16,
        fontSize: 12.5, color: "#4338ca",
      }}>
        💡 Këtu regjistro vetëm pagesa paraprake (kaparro ose këste).
        <br />
        <span style={{ opacity: 0.8 }}>
          Pagesat FULL, COMMISSION dhe AGENT_COMMISSION krijohen
          automatikisht kur kontrata shënohet COMPLETED.
          Çdo shumë e dhënë këtu do të zbritet nga pagesa finale.
        </span>
      </div>
      
      <FormRow>
        <Field label="Amount" required>
          <input className="form-input" type="number" value={form.amount}
            onChange={(e) => set("amount", e.target.value)} placeholder="ex: 14500" />
        </Field>
        <Field label="Currency">
          <select className="form-select" value={form.currency}
            onChange={(e) => set("currency", e.target.value)}>
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
            <option value="ALL">ALL</option>
          </select>
        </Field>
      </FormRow>
      <FormRow>
        <Field label="Payment Type">
          <select className="form-select" value={form.payment_type}
            onChange={(e) => set("payment_type", e.target.value)}>
            {MANUAL_PAYMENT_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Payment Method">
          <select className="form-select" value={form.payment_method}
            onChange={(e) => set("payment_method", e.target.value)}>
            {PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}
          </select>
        </Field>
      </FormRow>
      <div className="flex gap-2" style={{ justifyContent: "flex-end", marginTop: 6 }}>
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
        <select className="form-select" value={form.payment_method}
          onChange={(e) => set("payment_method", e.target.value)}>
          {PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}
        </select>
      </Field>
      <FormRow>
        <Field label="Transaction Ref">
          <input className="form-input" value={form.transaction_ref}
            onChange={(e) => set("transaction_ref", e.target.value)}
            placeholder="TXN-12345" />
        </Field>
        <Field label="Paid Date">
          <input className="form-input" type="date" value={form.paid_date}
            onChange={(e) => set("paid_date", e.target.value)} />
        </Field>
      </FormRow>
      <div className="flex gap-2" style={{ justifyContent: "flex-end", marginTop: 6 }}>
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
 
export default function AgentSales() {
  const { user } = useContext(AuthContext);
  const [tab, setTab] = useState("listings");
  const [toast, setToast] = useState(null);
 
  // Cross-section prefill state for workflow
  const [contractPrefill, setContractPrefill] = useState(null);
  const [paymentPrefill, setPaymentPrefill] = useState(null);
 
  const notify = useCallback((msg, type = "success") => {
    setToast({ msg, type, key: Date.now() });
  }, []);
 
  const goToContract = (prefill) => {
    setContractPrefill(prefill);
    setTab("contracts");
  };
 
  const goToPayment = (prefill) => {
    setPaymentPrefill(prefill);
    setTab("payments");
  };
 
  return (
    <MainLayout role="agent">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .form-textarea {
          width: 100%;
          padding: 9px 12px;
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-md);
          font-size: 14px;
          font-family: var(--font-body);
          color: var(--text-primary);
          background: var(--surface-0);
          outline: none;
          resize: vertical;
          transition: border-color .15s, box-shadow .15s;
        }
        .form-textarea:focus {
          border-color: var(--brand-400);
          box-shadow: 0 0 0 3px rgba(99,102,241,.1);
        }
      `}</style>
 
      <div className="page-header">
        <div>
          <h1 className="page-title">Sales Management</h1>
          <p className="page-subtitle">
            Menaxho listings, kontratat dhe pagesat e shitjes —
            <span style={{ color: "#6366f1", fontWeight: 500 }}> Listing → Contract → Payment</span>
          </p>
        </div>
      </div>
 
      {/* Workflow breadcrumb */}
      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        marginBottom: 22, padding: "10px 16px",
        background: "#f0f4ff", borderRadius: 10,
        border: "1px solid #c7d7fe", fontSize: 13,
      }}>
        <span style={{ fontWeight: 600, color: tab === "listings" ? "#6366f1" : "#94a3b8" }}>
          🏷️ 1. Listing
        </span>
        <span style={{ color: "#c7d7fe" }}>────</span>
        <span style={{ fontWeight: 600, color: tab === "contracts" ? "#6366f1" : "#94a3b8" }}>
          📄 2. Contract
        </span>
        <span style={{ color: "#c7d7fe" }}>────</span>
        <span style={{ fontWeight: 600, color: tab === "payments" ? "#6366f1" : "#94a3b8" }}>
          💳 3. Payment
        </span>
        <span style={{ marginLeft: "auto", color: "#6366f1", fontSize: 12 }}>
          Kliko "Contract →" ose "Payments →" për workflow të shpejtë
        </span>
      </div>
 
      <SectionTabs active={tab} onChange={setTab} />
 
      {tab === "listings" && (
        <ListingsSection
          onSelectContract={goToContract}
          notify={notify}
          currentUserId={user?.id}
        />
      )}
      {tab === "contracts" && (
        <ContractsSection
          prefill={contractPrefill}
          onSelectPayment={goToPayment}
          notify={notify}
          currentUserId={user?.id}
        />
      )}
      {tab === "payments" && (
        <PaymentsSection
          prefill={paymentPrefill}
          notify={notify}
        />
      )}
 
      {toast && (
        <Toast
          key={toast.key}
          msg={toast.msg}
          type={toast.type}
          onDone={() => setToast(null)}
        />
      )}
    </MainLayout>
  );
}
 
// ─── Inline styles ────────────────────────────────────────────────────────────
 
const overlay = {
  position: "fixed", inset: 0, zIndex: 1000,
  background: "rgba(15, 23, 42, 0.45)",
  display: "flex", alignItems: "center", justifyContent: "center",
  padding: 20,
};
 
const modalBox = {
  width: "100%",
  background: "#ffffff",
  borderRadius: 16,
  boxShadow: "0 20px 60px rgba(15,23,42,0.18)",
  animation: "fadeUp .2s ease",
  maxHeight: "90vh",
  overflowY: "auto",
};
 
const modalHead = {
  display: "flex", alignItems: "center", justifyContent: "space-between",
  padding: "18px 24px", borderBottom: "1px solid #e8edf4",
};
 
const closeBtn = {
  width: 30, height: 30, display: "flex", alignItems: "center",
  justifyContent: "center", border: "none", background: "none",
  color: "#94a3b8", cursor: "pointer", fontSize: 16, borderRadius: 6,
};
 
const spinnerStyle = {
  width: 28, height: 28, margin: "0 auto",
  border: "3px solid #e8edf4",
  borderTop: "3px solid #6366f1",
  borderRadius: "50%",
  animation: "spin 0.7s linear infinite",
};
 
const summaryItem = { display: "flex", flexDirection: "column", gap: 3 };
const summaryLabel = { fontSize: 11, color: "#94a3b8", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" };
const summaryVal   = { fontSize: 20, fontWeight: 600, color: "#0f172a", letterSpacing: "-0.02em" };
const summaryDivider = { width: 1, height: 32, background: "#e8edf4" };