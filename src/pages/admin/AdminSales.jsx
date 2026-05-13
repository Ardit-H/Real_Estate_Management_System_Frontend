import { useState, useEffect, useCallback } from "react";
import MainLayout from "../../components/layout/Layout";
import api from "../../api/axios";

// ─── Constants ────────────────────────────────────────────────────────────────

const SALE_STATUSES     = ["ACTIVE", "SOLD", "PENDING", "CANCELLED"];
const CONTRACT_STATUSES = ["PENDING", "COMPLETED", "CANCELLED"];
const PAYMENT_TYPES     = ["FULL", "DEPOSIT", "INSTALLMENT", "COMMISSION"];
const PAYMENT_METHODS   = ["BANK_TRANSFER", "CASH", "CARD", "CHECK", "ONLINE"];
const CURRENCIES        = ["EUR", "USD", "ALL", "GBP", "CHF"];

// ─── Global CSS ───────────────────────────────────────────────────────────────

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
  .as-wrap * { box-sizing: border-box; }
  .as-wrap { font-family: 'DM Sans', system-ui, sans-serif; }
  .as-row:hover td { background: rgba(138,125,94,0.06) !important; }
  .as-btn:hover { opacity: 0.82; transform: translateY(-1px); }
  .as-btn { transition: all 0.14s ease; }
  .as-tab:hover { color: #c9b87a !important; }
  .as-pg:hover:not(:disabled) { background: rgba(201,184,122,0.1) !important; border-color: #c9b87a !important; color: #c9b87a !important; }
  @keyframes as-spin  { to { transform: rotate(360deg); } }
  @keyframes as-scale { from{opacity:0;transform:scale(0.97)} to{opacity:1;transform:scale(1)} }
  @keyframes as-toast { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes as-pulse { 0%,100%{opacity:.35} 50%{opacity:.75} }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtPrice = (v, cur = "EUR") =>
  v != null ? `€${Number(v).toLocaleString("de-DE")}` : "—";

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" }) : "—";

const fmtDateTime = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—";

// ─── Badge ────────────────────────────────────────────────────────────────────

const BADGE_MAP = {
  ACTIVE:    { bg: "rgba(29,158,117,0.12)",  color: "#1D9E75",  border: "rgba(29,158,117,0.25)"  },
  SOLD:      { bg: "rgba(55,138,221,0.12)",  color: "#378ADD",  border: "rgba(55,138,221,0.25)"  },
  PENDING:   { bg: "rgba(201,184,122,0.15)", color: "#c9b87a",  border: "rgba(201,184,122,0.3)"  },
  CANCELLED: { bg: "rgba(216,90,48,0.12)",   color: "#D85A30",  border: "rgba(216,90,48,0.25)"   },
  COMPLETED: { bg: "rgba(29,158,117,0.12)",  color: "#1D9E75",  border: "rgba(29,158,117,0.25)"  },
  PAID:      { bg: "rgba(29,158,117,0.12)",  color: "#1D9E75",  border: "rgba(29,158,117,0.25)"  },
  FAILED:    { bg: "rgba(216,90,48,0.12)",   color: "#D85A30",  border: "rgba(216,90,48,0.25)"   },
  REFUNDED:  { bg: "rgba(136,135,128,0.12)", color: "#888780",  border: "rgba(136,135,128,0.25)" },
};

function Badge({ label }) {
  const s = BADGE_MAP[label] || { bg: "rgba(136,135,128,0.12)", color: "#888780", border: "rgba(136,135,128,0.25)" };
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
        background: "rgba(8,6,4,0.82)",
        backdropFilter: "blur(10px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
        fontFamily: "'DM Sans', sans-serif",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        width: "100%", maxWidth,
        background: "#faf7f2", borderRadius: 18,
        boxShadow: "0 44px 100px rgba(0,0,0,0.55)",
        maxHeight: "90vh", overflowY: "auto",
        animation: "as-scale 0.22s ease",
        overflow: "hidden",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 24px",
          borderBottom: "1px solid rgba(138,125,94,0.15)",
          position: "sticky", top: 0, background: "#faf7f2", zIndex: 1,
        }}>
          <span style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontWeight: 700, fontSize: 17, color: "#1a1714",
          }}>{title}</span>
          <button onClick={onClose} style={{
            width: 30, height: 30, display: "flex", alignItems: "center",
            justifyContent: "center",
            border: "1px solid rgba(138,125,94,0.2)",
            background: "rgba(138,125,94,0.08)",
            color: "#8a7d5e", cursor: "pointer", fontSize: 15, borderRadius: 8,
          }}>✕</button>
        </div>
        <div style={{ padding: "22px 24px", overflowY: "auto", maxHeight: "calc(90vh - 60px)" }}>{children}</div>
      </div>
    </div>
  );
}

// ─── Form field helpers ───────────────────────────────────────────────────────

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

function Row({ children }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>{children}</div>;
}

const inputSt = {
  width: "100%", padding: "9px 12px", fontSize: 13,
  border: "1.5px solid rgba(138,125,94,0.25)", borderRadius: 9,
  background: "#fff", color: "#1a1714", outline: "none",
  boxSizing: "border-box", fontFamily: "'DM Sans', sans-serif",
};
const selectSt   = { ...inputSt, cursor: "pointer" };
const textareaSt = { ...inputSt, resize: "vertical", lineHeight: 1.6 };

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ msg, type = "success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{
      position: "fixed", bottom: 26, right: 26, zIndex: 9999,
      background: "#1a1714",
      color: type === "error" ? "#f09090" : "#90c8a8",
      padding: "11px 18px", borderRadius: 12,
      fontSize: 13, fontWeight: 400,
      boxShadow: "0 10px 36px rgba(0,0,0,0.32)",
      border: `1px solid ${type === "error" ? "rgba(240,128,128,0.15)" : "rgba(144,200,168,0.15)"}`,
      maxWidth: 320, fontFamily: "'DM Sans', sans-serif",
      animation: "as-toast 0.2s ease",
      display: "flex", alignItems: "center", gap: 8,
    }}>
      <span style={{ fontSize: 14 }}>{type === "error" ? "⚠️" : "✅"}</span>
      {msg}
    </div>
  );
}

// ─── Empty / Loader ───────────────────────────────────────────────────────────

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
      <div style={{
        width: 26, height: 26, margin: "0 auto",
        border: "2px solid rgba(138,125,94,0.15)", borderTop: "2px solid #8a7d5e",
        borderRadius: "50%", animation: "as-spin .8s linear infinite",
      }} />
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end", padding: "14px 16px 8px" }}>
      <button disabled={page === 0} onClick={() => onChange(page - 1)} className="as-pg" style={pgBtn(page === 0)}>← Prev</button>
      <span style={{ fontSize: 13, color: "#8a7d5e", padding: "0 6px", fontFamily: "'DM Sans', sans-serif" }}>
        {page + 1} / {totalPages}
      </span>
      <button disabled={page >= totalPages - 1} onClick={() => onChange(page + 1)} className="as-pg" style={pgBtn(page >= totalPages - 1)}>Next →</button>
    </div>
  );
}

const pgBtn = (disabled) => ({
  fontSize: 13, padding: "5px 12px", borderRadius: 9,
  border: "1.5px solid rgba(138,125,94,0.2)", background: "transparent",
  color: disabled ? "rgba(138,125,94,0.3)" : "#8a7d5e",
  cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.5 : 1,
  fontFamily: "'DM Sans', sans-serif",
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
      display: "flex", gap: 2, marginBottom: 22,
      background: "linear-gradient(160deg, #141210 0%, #1e1a14 100%)",
      borderRadius: 12,
      border: "1px solid rgba(201,184,122,0.12)",
      padding: 6,
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,#c9b87a 30%,#c9b87a 70%,transparent)" }} />
      {tabs.map((t) => (
        <button key={t.id} onClick={() => onChange(t.id)} className="as-tab" style={{
          flex: 1, padding: "10px 16px",
          border: "none",
          borderRadius: 9,
          background: active === t.id ? "rgba(201,184,122,0.12)" : "transparent",
          color: active === t.id ? "#c9b87a" : "rgba(245,240,232,0.38)",
          fontWeight: active === t.id ? 600 : 400,
          fontSize: 13.5, cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
          borderBottom: active === t.id ? "none" : "none",
          outline: "none",
          transition: "all 0.15s",
          boxShadow: active === t.id ? "0 0 0 1px rgba(201,184,122,0.2)" : "none",
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
  fontWeight: 600, fontSize: 10.5, color: "#8a7d5e",
  borderBottom: "1px solid rgba(138,125,94,0.15)",
  background: "rgba(138,125,94,0.04)",
  whiteSpace: "nowrap",
  textTransform: "uppercase", letterSpacing: "0.5px",
};
const TD = {
  padding: "10px 12px",
  borderBottom: "1px solid rgba(138,125,94,0.08)",
  fontSize: 13, color: "#1a1714",
  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
};

// ─── Delete confirm modal ─────────────────────────────────────────────────────

function DeleteModal({ id, label, onCancel, onConfirm, loading }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(8,6,4,0.82)", backdropFilter: "blur(10px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      fontFamily: "'DM Sans', sans-serif",
    }}
      onClick={(e) => e.target === e.currentTarget && !loading && onCancel()}
    >
      <div style={{
        width: "100%", maxWidth: 440,
        background: "#faf7f2", borderRadius: 18,
        boxShadow: "0 44px 100px rgba(0,0,0,0.55)",
        animation: "as-scale 0.22s ease", overflow: "hidden",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 24px", borderBottom: "1px solid rgba(138,125,94,0.15)",
        }}>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 17, color: "#1a1714" }}>
            Konfirmo fshirjen
          </span>
          <button onClick={onCancel} disabled={loading} style={{
            width: 30, height: 30, border: "1px solid rgba(138,125,94,0.2)",
            background: "rgba(138,125,94,0.08)", color: "#8a7d5e", cursor: "pointer", fontSize: 15, borderRadius: 8,
          }}>✕</button>
        </div>
        <div style={{ padding: "22px 24px" }}>
          <p style={{ fontSize: 14, color: "#4a4438", marginBottom: 18, lineHeight: 1.6 }}>
            A jeni i sigurt që dëshironi të fshini{" "}
            <strong style={{ color: "#1a1714" }}>{label} #{id}</strong>?
            Ky veprim nuk mund të kthehet.
          </p>
          <div style={{
            background: "rgba(216,90,48,0.08)", border: "1px solid rgba(216,90,48,0.2)",
            borderRadius: 10, padding: "10px 15px", marginBottom: 22,
            fontSize: 13, color: "#D85A30",
          }}>
            Soft delete — rekordi shënohet me{" "}
            <code style={{ background: "rgba(216,90,48,0.12)", padding: "1px 6px", borderRadius: 4, fontSize: 12 }}>deleted_at</code>{" "}
            dhe nuk shfaqet më.
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button onClick={onCancel} disabled={loading} style={secondaryBtn}>Anulo</button>
            <button onClick={onConfirm} disabled={loading} style={dangerBtn}>
              {loading ? "Duke fshirë..." : "Fshi"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Shared button styles ─────────────────────────────────────────────────────

const primaryBtn = {
  fontSize: 13, padding: "8px 16px", borderRadius: 10, border: "none",
  background: "linear-gradient(135deg,#c9b87a 0%,#b0983e 100%)",
  color: "#1a1714", cursor: "pointer", fontWeight: 700, whiteSpace: "nowrap",
  fontFamily: "'DM Sans', sans-serif",
};
const secondaryBtn = {
  fontSize: 13, padding: "8px 15px", borderRadius: 10,
  border: "1.5px solid rgba(138,125,94,0.25)", background: "transparent",
  color: "#6b6248", cursor: "pointer", whiteSpace: "nowrap",
  fontFamily: "'DM Sans', sans-serif",
};
const dangerBtn = {
  fontSize: 13, padding: "8px 16px", borderRadius: 10, border: "none",
  background: "#D85A30", color: "#fff", cursor: "pointer", fontWeight: 700,
  fontFamily: "'DM Sans', sans-serif",
};
const btnSm = (bg, color, border) => ({
  fontSize: 11, padding: "4px 9px", borderRadius: 7,
  border: `1px solid ${border}`, background: bg, color,
  cursor: "pointer", whiteSpace: "nowrap", fontWeight: 600,
  fontFamily: "'DM Sans', sans-serif",
});
const pillGold = {
  background: "rgba(201,184,122,0.12)", color: "#c9b87a",
  border: "1px solid rgba(201,184,122,0.25)",
  padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600,
};

// ─── Card wrapper ─────────────────────────────────────────────────────────────

const card = {
  background: "#fff",
  borderRadius: 14,
  border: "1px solid rgba(138,125,94,0.15)",
  overflow: "hidden",
  boxShadow: "0 2px 20px rgba(20,16,10,0.06)",
};
const cardHeader = {
  display: "flex", alignItems: "center", justifyContent: "space-between",
  padding: "18px 20px", borderBottom: "1px solid rgba(138,125,94,0.12)",
  flexWrap: "wrap", gap: 10,
};
const cardTitle = {
  fontFamily: "'Cormorant Garamond', Georgia, serif",
  fontSize: 18, fontWeight: 700, margin: 0, color: "#1a1714", letterSpacing: "-0.2px",
};

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

  const activeCount = rows.filter((r) => r.status === "ACTIVE").length;

  return (
    <>
      <div style={card}>
        <div style={cardHeader}>
          <div>
            <h2 style={cardTitle}>Sale Listings</h2>
            <p style={{ fontSize: 12, color: "#b0a890", margin: 0, fontFamily: "'DM Sans', sans-serif" }}>
              {total} total · {activeCount} active on this page
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <select value={statusF} onChange={(e) => { setStatusF(e.target.value); setPage(0); }}
              style={{ ...selectSt, width: 150, height: 36, padding: "0 10px" }}>
              <option value="">All statuses</option>
              {SALE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <button onClick={() => setCreateOpen(true)} style={primaryBtn}>+ New Listing</button>
          </div>
        </div>

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
                    <tr key={l.id} className="as-row">
                      <td style={{ ...TD, fontFamily: "monospace", color: "#b0a890", fontSize: 11.5 }}>{l.id}</td>
                      <td style={TD}><span style={pillGold}>#{l.property_id}</span></td>
                      <td style={{ ...TD, color: "#8a7d5e" }}>{l.agent_id ? `#${l.agent_id}` : "—"}</td>
                      <td style={{ ...TD, fontWeight: 600 }}>{fmtPrice(l.price, l.currency)}</td>
                      <td style={TD}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: l.negotiable ? "#1D9E75" : "#b0a890" }}>
                          {l.negotiable ? "✓ Yes" : "No"}
                        </span>
                      </td>
                      <td style={TD}><Badge label={l.status} /></td>
                      <td style={{ ...TD, color: "#b0a890" }}>{fmtDate(l.created_at)}</td>
                      <td style={TD}>
                        <div style={{ display: "flex", gap: 5 }}>
                          <button className="as-btn" style={btnSm("rgba(201,184,122,0.08)", "#c9b87a", "rgba(201,184,122,0.25)")} onClick={() => setDetail(l)}>Detail</button>
                          <button className="as-btn" style={btnSm("rgba(29,158,117,0.08)", "#1D9E75", "rgba(29,158,117,0.25)")} onClick={() => setEditTarget(l)}>Edit</button>
                          <button className="as-btn" style={btnSm("rgba(55,138,221,0.08)", "#378ADD", "rgba(55,138,221,0.25)")}
                            onClick={() => onGoContract({ listingId: l.id, propertyId: l.property_id, price: l.price })}>
                            Contract →
                          </button>
                          <button className="as-btn" style={btnSm("rgba(216,90,48,0.08)", "#D85A30", "rgba(216,90,48,0.25)")} onClick={() => setDeleteId(l.id)}>Del</button>
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

      {createOpen && <ListingFormModal onClose={() => setCreateOpen(false)} onSuccess={() => { setCreateOpen(false); fetch(); notify("Listing u krijua me sukses"); }} notify={notify} />}
      {editTarget && <ListingFormModal initial={editTarget} onClose={() => setEditTarget(null)} onSuccess={() => { setEditTarget(null); fetch(); notify("Listing u ndryshua"); }} notify={notify} />}
      {detailTarget && <ListingDetailModal listing={detailTarget} onClose={() => setDetail(null)} />}
      {deleteId && <DeleteModal id={deleteId} label="Listing" onCancel={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleting} />}
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
    if (!form.property_id || !form.price) { notify("Property ID dhe çmimi janë të detyrueshme", "error"); return; }
    setSaving(true);
    try {
      const payload = {
        property_id: Number(form.property_id), price: Number(form.price),
        currency: form.currency, negotiable: form.negotiable,
        description: form.description || null, highlights: form.highlights || null,
        ...(initial && { status: form.status }),
      };
      if (initial) { await api.put(`/api/sales/listings/${initial.id}`, payload); }
      else { await api.post("/api/sales/listings", payload); }
      onSuccess();
    } catch (err) {
      notify(err.response?.data?.message || "Gabim gjatë ruajtjes", "error");
    } finally { setSaving(false); }
  };

  return (
    <Modal title={initial ? `Edit Listing #${initial.id}` : "New Sale Listing"} onClose={onClose}>
      <Row>
        <Field label="Property ID" required>
          <input style={inputSt} type="number" value={form.property_id} onChange={(e) => set("property_id", e.target.value)} disabled={!!initial} placeholder="ex: 42" />
        </Field>
        <Field label="Price (€)" required>
          <input style={inputSt} type="number" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="ex: 145000" />
        </Field>
      </Row>
      <Row>
        <Field label="Currency">
          <select style={selectSt} value={form.currency} onChange={(e) => set("currency", e.target.value)}>
            {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Negotiable">
          <select style={selectSt} value={String(form.negotiable)} onChange={(e) => set("negotiable", e.target.value === "true")}>
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
        <textarea style={textareaSt} rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Përshkrim i pronës..." />
      </Field>
      <Field label="Highlights">
        <textarea style={textareaSt} rows={2} value={form.highlights} onChange={(e) => set("highlights", e.target.value)} placeholder="Tiparet kryesore..." />
      </Field>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 6 }}>
        <button style={secondaryBtn} onClick={onClose}>Anulo</button>
        <button style={primaryBtn} onClick={handleSubmit} disabled={saving}>
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
          ["ID", `#${l.id}`], ["Property", `#${l.property_id}`],
          ["Agent", l.agent_id ? `#${l.agent_id}` : "—"], ["Price", fmtPrice(l.price, l.currency)],
          ["Negotiable", l.negotiable ? "Yes" : "No"], ["Status", "badge"],
          ["Created", fmtDateTime(l.created_at)], ["Updated", fmtDateTime(l.updated_at)],
        ].map(([label, val]) => (
          <div key={label}>
            <p style={{ fontSize: 10, color: "#b0a890", textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 3px", fontFamily: "'DM Sans', sans-serif" }}>{label}</p>
            {val === "badge" ? <Badge label={l.status} /> : <p style={{ fontSize: 14, fontWeight: 500, margin: 0, color: "#1a1714", fontFamily: "'Cormorant Garamond', serif" }}>{val}</p>}
          </div>
        ))}
      </div>
      {l.description && (
        <div style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 10, color: "#b0a890", textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 5px" }}>Description</p>
          <p style={{ fontSize: 13, color: "#4a4438", lineHeight: 1.6, margin: 0 }}>{l.description}</p>
        </div>
      )}
      {l.highlights && (
        <div>
          <p style={{ fontSize: 10, color: "#b0a890", textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 5px" }}>Highlights</p>
          <p style={{ fontSize: 13, color: "#4a4438", lineHeight: 1.6, margin: 0 }}>{l.highlights}</p>
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
    } finally { setLoading(false); }
  }, [page, notify]);

  useEffect(() => { fetch(); }, [fetch]);

  useEffect(() => {
    if (prefill?.listingId) { setEditTarget(null); setCreateOpen(true); }
  }, [prefill]);

  return (
    <>
      <div style={card}>
        <div style={cardHeader}>
          <div>
            <h2 style={cardTitle}>Sale Contracts</h2>
            <p style={{ fontSize: 12, color: "#b0a890", margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{total} kontrata gjithsej</p>
          </div>
          <button onClick={() => { setEditTarget(null); setCreateOpen(true); }} style={primaryBtn}>+ New Contract</button>
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
                    <tr key={c.id} className="as-row">
                      <td style={{ ...TD, fontFamily: "monospace", color: "#b0a890", fontSize: 11.5 }}>{c.id}</td>
                      <td style={TD}><span style={pillGold}>#{c.property_id}</span></td>
                      <td style={{ ...TD, color: "#8a7d5e" }}>{c.listing_id ? `#${c.listing_id}` : "—"}</td>
                      <td style={TD}>{c.buyer_id ? `#${c.buyer_id}` : "—"}</td>
                      <td style={{ ...TD, color: "#8a7d5e" }}>{c.agent_id ? `#${c.agent_id}` : "—"}</td>
                      <td style={{ ...TD, fontWeight: 600 }}>{fmtPrice(c.sale_price, c.currency)}</td>
                      <td style={{ ...TD, color: "#8a7d5e" }}>{fmtDate(c.contract_date)}</td>
                      <td style={{ ...TD, color: "#8a7d5e" }}>{fmtDate(c.handover_date)}</td>
                      <td style={TD}><Badge label={c.status} /></td>
                      <td style={TD}>
                        <div style={{ display: "flex", gap: 5, flexWrap: "nowrap" }}>
                          <button className="as-btn" style={btnSm("rgba(201,184,122,0.08)", "#c9b87a", "rgba(201,184,122,0.25)")} onClick={() => setDetail(c)}>Detail</button>
                          {c.status === "PENDING" && (
                            <>
                              <button className="as-btn" style={btnSm("rgba(29,158,117,0.08)", "#1D9E75", "rgba(29,158,117,0.25)")} onClick={() => setEditTarget(c)}>Edit</button>
                              <button className="as-btn" style={btnSm("rgba(201,184,122,0.08)", "#c9b87a", "rgba(201,184,122,0.25)")} onClick={() => setStatusTgt(c)}>Status</button>
                            </>
                          )}
                          <button className="as-btn" style={btnSm("rgba(55,138,221,0.08)", "#378ADD", "rgba(55,138,221,0.25)")}
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

      {createOpen && <ContractFormModal prefill={prefill} onClose={() => setCreateOpen(false)} onSuccess={() => { setCreateOpen(false); fetch(); notify("Kontrata u krijua me sukses"); }} notify={notify} />}
      {editTarget && <ContractFormModal initial={editTarget} onClose={() => setEditTarget(null)} onSuccess={() => { setEditTarget(null); fetch(); notify("Kontrata u ndryshua"); }} notify={notify} />}
      {detailTarget && <ContractDetailModal contract={detailTarget} onClose={() => setDetail(null)} />}
      {statusTarget && <ContractStatusModal contract={statusTarget} onClose={() => setStatusTgt(null)} onSuccess={() => { setStatusTgt(null); fetch(); notify("Statusi i kontratës u ndryshua"); }} notify={notify} />}
    </>
  );
}

function ContractFormModal({ initial, prefill, onClose, onSuccess, notify }) {
  const [form, setForm] = useState({
    property_id:       initial?.property_id       ?? prefill?.propertyId ?? "",
    listing_id:        initial?.listing_id        ?? prefill?.listingId  ?? "",
    buyer_id:          initial?.buyer_id          ?? "",
    sale_price:        initial?.sale_price        ?? prefill?.price      ?? "",
    currency:          initial?.currency          ?? "EUR",
    contract_date:     initial?.contract_date     ?? "",
    handover_date:     initial?.handover_date     ?? "",
    contract_file_url: initial?.contract_file_url ?? "",
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((p) => {
    const next = { ...p, [k]: v };
    if (k === "contract_date" && next.handover_date && next.handover_date < v) next.handover_date = "";
    return next;
  });

  const dateError =
    form.contract_date && form.handover_date && form.handover_date < form.contract_date
      ? "Data e dorëzimit (Handover) nuk mund të jetë para datës së kontratës." : null;

  const handleSubmit = async () => {
    if (!form.property_id || !form.buyer_id || !form.sale_price) { notify("Property ID, Buyer ID dhe çmimi janë të detyrueshme", "error"); return; }
    if (dateError) { notify(dateError, "error"); return; }
    setSaving(true);
    try {
      const payload = {
        property_id: Number(form.property_id), listing_id: form.listing_id ? Number(form.listing_id) : null,
        buyer_id: Number(form.buyer_id), sale_price: Number(form.sale_price), currency: form.currency,
        contract_date: form.contract_date || null, handover_date: form.handover_date || null,
        contract_file_url: form.contract_file_url || null,
      };
      if (initial) { await api.put(`/api/sales/contracts/${initial.id}`, payload); }
      else { await api.post("/api/sales/contracts", payload); }
      onSuccess();
    } catch (err) {
      notify(err.response?.data?.message || "Gabim gjatë ruajtjes", "error");
    } finally { setSaving(false); }
  };

  return (
    <Modal title={initial ? `Edit Contract #${initial.id}` : "New Sale Contract"} onClose={onClose} maxWidth={620}>
      <Row>
        <Field label="Property ID" required>
          <input style={inputSt} type="number" value={form.property_id} onChange={(e) => set("property_id", e.target.value)} disabled={!!initial} placeholder="ex: 42" />
        </Field>
        <Field label="Listing ID">
          <input style={inputSt} type="number" value={form.listing_id} onChange={(e) => set("listing_id", e.target.value)} placeholder="(opcional)" />
        </Field>
      </Row>
      <Row>
        <Field label="Buyer ID" required>
          <input style={inputSt} type="number" value={form.buyer_id} onChange={(e) => set("buyer_id", e.target.value)} disabled={!!initial} placeholder="ID e blerësit" />
        </Field>
        <Field label="Sale Price (€)" required>
          <input style={inputSt} type="number" value={form.sale_price} onChange={(e) => set("sale_price", e.target.value)} placeholder="ex: 145000" />
        </Field>
      </Row>
      <Row>
        <Field label="Currency">
          <select style={selectSt} value={form.currency} onChange={(e) => set("currency", e.target.value)}>
            {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Contract Date">
          <input style={inputSt} type="date" value={form.contract_date} onChange={(e) => set("contract_date", e.target.value)} />
          {form.contract_date && <p style={{ fontSize: 11, color: "#8a7d5e", margin: "4px 0 0", fontFamily: "'DM Sans', sans-serif" }}>📋 Handover duhet të jetë në këtë datë ose më vonë.</p>}
        </Field>
      </Row>
      <Row>
        <Field label="Handover Date">
          <input
            style={{ ...inputSt, borderColor: dateError ? "#D85A30" : "rgba(138,125,94,0.25)", background: dateError ? "rgba(216,90,48,0.04)" : "#fff" }}
            type="date" value={form.handover_date} min={form.contract_date || undefined}
            onChange={(e) => {
              const val = e.target.value;
              if (form.contract_date && val && val < form.contract_date) { notify("Data e dorëzimit nuk mund të jetë para datës së kontratës.", "error"); return; }
              set("handover_date", val);
            }}
          />
          {dateError
            ? <p style={{ fontSize: 11, color: "#D85A30", margin: "4px 0 0", display: "flex", alignItems: "center", gap: 4 }}>⚠ {dateError}</p>
            : !form.contract_date && <p style={{ fontSize: 11, color: "#b0a890", margin: "4px 0 0" }}>Zgjidh Contract Date fillimisht.</p>}
        </Field>
        <Field label="Contract File URL">
          <input style={inputSt} value={form.contract_file_url} onChange={(e) => set("contract_file_url", e.target.value)} placeholder="https://..." />
        </Field>
      </Row>

      {form.contract_date && form.handover_date && !dateError && (
        <div style={{
          display: "flex", alignItems: "center",
          background: "rgba(29,158,117,0.06)", border: "1px solid rgba(29,158,117,0.2)",
          borderRadius: 10, padding: "12px 18px", marginTop: 4, marginBottom: 4,
        }}>
          <div style={{ textAlign: "center", flexShrink: 0 }}>
            <div style={{ fontSize: 20, marginBottom: 2 }}>📝</div>
            <div style={{ fontWeight: 600, fontSize: 12, color: "#1D9E75", fontFamily: "'DM Sans', sans-serif" }}>Kontratë</div>
            <div style={{ fontSize: 12, color: "#8a7d5e", fontFamily: "'DM Sans', sans-serif" }}>{fmtDate(form.contract_date)}</div>
          </div>
          <div style={{ flex: 1, height: 2, background: "linear-gradient(90deg,#1D9E75,#c9b87a)", margin: "0 14px", borderRadius: 999 }} />
          <div style={{ textAlign: "center", flexShrink: 0 }}>
            <div style={{ fontSize: 20, marginBottom: 2 }}>🏠</div>
            <div style={{ fontWeight: 600, fontSize: 12, color: "#1D9E75", fontFamily: "'DM Sans', sans-serif" }}>Dorëzim</div>
            <div style={{ fontSize: 12, color: "#8a7d5e", fontFamily: "'DM Sans', sans-serif" }}>{fmtDate(form.handover_date)}</div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
        <button style={secondaryBtn} onClick={onClose}>Anulo</button>
        <button style={{ ...primaryBtn, opacity: dateError ? 0.55 : 1, cursor: dateError ? "not-allowed" : "pointer" }} onClick={handleSubmit} disabled={saving || !!dateError}>
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
          ["ID", `#${c.id}`], ["Property", `#${c.property_id}`],
          ["Listing", c.listing_id ? `#${c.listing_id}` : "—"], ["Buyer", c.buyer_id ? `#${c.buyer_id}` : "—"],
          ["Agent", c.agent_id ? `#${c.agent_id}` : "—"], ["Sale Price", fmtPrice(c.sale_price, c.currency)],
          ["Contract Date", fmtDate(c.contract_date)], ["Handover Date", fmtDate(c.handover_date)],
          ["Status", "badge"], ["Created", fmtDateTime(c.created_at)], ["Updated", fmtDateTime(c.updated_at)],
        ].map(([label, val]) => (
          <div key={label}>
            <p style={{ fontSize: 10, color: "#b0a890", textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 3px" }}>{label}</p>
            {val === "badge" ? <Badge label={c.status} /> : <p style={{ fontSize: 14, fontWeight: 500, margin: 0, color: "#1a1714", wordBreak: "break-all", fontFamily: "'Cormorant Garamond', serif" }}>{val}</p>}
          </div>
        ))}
      </div>
      {c.contract_file_url && (
        <div>
          <p style={{ fontSize: 10, color: "#b0a890", textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 5px" }}>Contract File</p>
          <a href={c.contract_file_url} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: "#c9b87a", fontFamily: "'DM Sans', sans-serif" }}>📎 Open file</a>
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
    } finally { setSaving(false); }
  };

  const isCancel = status === "CANCELLED";
  return (
    <Modal title={`Ndrysho Statusin — Contract #${contract.id}`} onClose={onClose}>
      <p style={{ fontSize: 13, color: "#8a7d5e", marginBottom: 16 }}>Statusi aktual: <Badge label={contract.status} /></p>
      <Field label="Statusi i ri" required>
        <select style={selectSt} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="COMPLETED">COMPLETED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </Field>
      <div style={{
        background: isCancel ? "rgba(216,90,48,0.06)" : "rgba(29,158,117,0.06)",
        border: `1px solid ${isCancel ? "rgba(216,90,48,0.2)" : "rgba(29,158,117,0.2)"}`,
        borderRadius: 10, padding: "10px 14px", marginBottom: 20,
        fontSize: 13, color: isCancel ? "#D85A30" : "#1D9E75",
      }}>
        {isCancel ? "⚠️ Anulimi i kontratës është i pakthyeshëm." : "✓ Kontrata do të shënohet si e përfunduar me sukses."}
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
    } finally { setLoading(false); }
  }, [contractId, notify]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  useEffect(() => {
    if (prefill?.contractId) { setInputId(String(prefill.contractId)); setContractId(prefill.contractId); }
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

  const totalPaid  = summary ? Number(summary.total_paid) : 0;
  const salePrice  = prefill?.salePrice ? Number(prefill.salePrice) : 0;
  const paidPct    = salePrice > 0 ? Math.min(100, Math.round((totalPaid / salePrice) * 100)) : null;
  const pendingCount = payments.filter((p) => p.status === "PENDING").length;
  const paidCount    = payments.filter((p) => p.status === "PAID").length;

  return (
    <>
      <div style={card}>
        <div style={cardHeader}>
          <div>
            <h2 style={cardTitle}>Sale Payments</h2>
            {summary && (
              <p style={{ fontSize: 12, color: "#b0a890", margin: 0, fontFamily: "'DM Sans', sans-serif" }}>
                {summary.total_payments} pagesa · {paidCount} PAID · {pendingCount} PENDING
              </p>
            )}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <label style={{ fontSize: 13, color: "#8a7d5e", fontFamily: "'DM Sans', sans-serif" }}>Contract #</label>
            <input type="number" value={inputId} onChange={(e) => setInputId(e.target.value)} placeholder="ID..."
              style={{ ...inputSt, width: 100, height: 36, padding: "0 10px" }} />
            <button style={secondaryBtn} onClick={() => setContractId(inputId ? Number(inputId) : "")}>Load</button>
            {contractId && <button style={primaryBtn} onClick={() => setCreateOpen(true)}>+ Add Payment</button>}
          </div>
        </div>

        {summary && contractId && (
          <div style={{
            display: "flex", gap: 16, padding: "14px 20px",
            background: "rgba(138,125,94,0.04)", borderBottom: "1px solid rgba(138,125,94,0.1)",
            alignItems: "center", flexWrap: "wrap",
          }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <span style={{ fontSize: 10, color: "#b0a890", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", fontFamily: "'DM Sans', sans-serif" }}>Total Payments</span>
              <span style={{ fontSize: 22, fontWeight: 700, color: "#1a1714", letterSpacing: "-0.03em", fontFamily: "'Cormorant Garamond', serif" }}>{summary.total_payments}</span>
            </div>
            <div style={{ width: 1, height: 36, background: "rgba(138,125,94,0.15)" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <span style={{ fontSize: 10, color: "#b0a890", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", fontFamily: "'DM Sans', sans-serif" }}>Total Paid</span>
              <span style={{ fontSize: 22, fontWeight: 700, color: "#1D9E75", letterSpacing: "-0.03em", fontFamily: "'Cormorant Garamond', serif" }}>€{totalPaid.toLocaleString("de-DE")}</span>
            </div>
            {paidPct !== null && (
              <>
                <div style={{ width: 1, height: 36, background: "rgba(138,125,94,0.15)" }} />
                <div style={{ flex: 1, minWidth: 160 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 10, color: "#b0a890", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", fontFamily: "'DM Sans', sans-serif" }}>Paguar nga çmimi</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#c9b87a", fontFamily: "'DM Sans', sans-serif" }}>{paidPct}%</span>
                  </div>
                  <div style={{ height: 6, background: "rgba(138,125,94,0.1)", borderRadius: 999 }}>
                    <div style={{
                      height: "100%", borderRadius: 999,
                      width: `${paidPct}%`,
                      background: paidPct === 100 ? "#1D9E75" : "linear-gradient(90deg,#8a7d5e,#c9b87a)",
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
                  <tr key={p.id} className="as-row">
                    <td style={{ ...TD, fontFamily: "monospace", color: "#b0a890", fontSize: 11.5 }}>{p.id}</td>
                    <td style={{ ...TD, fontWeight: 600 }}>{fmtPrice(p.amount, p.currency)}</td>
                    <td style={TD}>
                      <span style={{ background: "rgba(138,125,94,0.08)", color: "#8a7d5e", border: "1px solid rgba(138,125,94,0.15)", padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
                        {p.payment_type}
                      </span>
                    </td>
                    <td style={{ ...TD, color: "#8a7d5e" }}>{p.payment_method || "—"}</td>
                    <td style={{ ...TD, color: "#8a7d5e" }}>{fmtDate(p.paid_date)}</td>
                    <td style={{ ...TD, fontSize: 12, color: "#b0a890", maxWidth: 120 }} title={p.transaction_ref || ""}>{p.transaction_ref || "—"}</td>
                    <td style={TD}><Badge label={p.status} /></td>
                    <td style={TD}>
                      {p.status === "PENDING" && (
                        <button className="as-btn" style={btnSm("rgba(29,158,117,0.08)", "#1D9E75", "rgba(29,158,117,0.25)")} onClick={() => setPayTarget(p)}>Mark Paid</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {createOpen && <PaymentCreateModal contractId={contractId} onClose={() => setCreateOpen(false)} onSuccess={() => { setCreateOpen(false); fetchPayments(); notify("Pagesa u krijua"); }} notify={notify} />}
      {payTarget && <MarkPaidModal payment={payTarget} onClose={() => setPayTarget(null)} onSubmit={handleMarkPaid} notify={notify} />}
    </>
  );
}

function PaymentCreateModal({ contractId, onClose, onSuccess, notify }) {
  const [form, setForm] = useState({ amount: "", currency: "EUR", payment_type: "FULL", payment_method: "BANK_TRANSFER" });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.amount) { notify("Shuma është e detyrueshme", "error"); return; }
    setSaving(true);
    try {
      await api.post("/api/sales/payments", { contract_id: Number(contractId), amount: Number(form.amount), currency: form.currency, payment_type: form.payment_type, payment_method: form.payment_method });
      onSuccess();
    } catch (err) {
      notify(err.response?.data?.message || "Gabim gjatë krijimit", "error");
    } finally { setSaving(false); }
  };

  return (
    <Modal title={`New Payment — Contract #${contractId}`} onClose={onClose}>
      <Row>
        <Field label="Amount (€)" required><input style={inputSt} type="number" value={form.amount} onChange={(e) => set("amount", e.target.value)} placeholder="ex: 14500" /></Field>
        <Field label="Currency"><select style={selectSt} value={form.currency} onChange={(e) => set("currency", e.target.value)}>{CURRENCIES.map((c) => <option key={c}>{c}</option>)}</select></Field>
      </Row>
      <Row>
        <Field label="Payment Type"><select style={selectSt} value={form.payment_type} onChange={(e) => set("payment_type", e.target.value)}>{PAYMENT_TYPES.map((t) => <option key={t}>{t}</option>)}</select></Field>
        <Field label="Payment Method"><select style={selectSt} value={form.payment_method} onChange={(e) => set("payment_method", e.target.value)}>{PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}</select></Field>
      </Row>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 6 }}>
        <button style={secondaryBtn} onClick={onClose}>Anulo</button>
        <button style={primaryBtn} onClick={handleSubmit} disabled={saving}>{saving ? "Duke krijuar..." : "Krijo pagesë"}</button>
      </div>
    </Modal>
  );
}

function MarkPaidModal({ payment, onClose, onSubmit, notify }) {
  const [form, setForm] = useState({ payment_method: payment.payment_method || "BANK_TRANSFER", transaction_ref: "", paid_date: new Date().toISOString().split("T")[0] });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    setSaving(true);
    try { await onSubmit({ payment_method: form.payment_method, transaction_ref: form.transaction_ref || null, paid_date: form.paid_date }); }
    finally { setSaving(false); }
  };

  return (
    <Modal title={`Mark Payment #${payment.id} as PAID`} onClose={onClose}>
      <div style={{ background: "rgba(29,158,117,0.06)", border: "1px solid rgba(29,158,117,0.2)", borderRadius: 10, padding: "10px 14px", marginBottom: 18, fontSize: 13, color: "#1D9E75" }}>
        Shuma: <strong>{fmtPrice(payment.amount, payment.currency)}</strong>
      </div>
      <Field label="Payment Method"><select style={selectSt} value={form.payment_method} onChange={(e) => set("payment_method", e.target.value)}>{PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}</select></Field>
      <Row>
        <Field label="Transaction Ref"><input style={inputSt} value={form.transaction_ref} onChange={(e) => set("transaction_ref", e.target.value)} placeholder="TXN-12345" /></Field>
        <Field label="Paid Date"><input style={inputSt} type="date" value={form.paid_date} onChange={(e) => set("paid_date", e.target.value)} /></Field>
      </Row>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 6 }}>
        <button style={secondaryBtn} onClick={onClose}>Anulo</button>
        <button style={primaryBtn} onClick={handleSubmit} disabled={saving}>{saving ? "Duke shënuar..." : "✓ Konfirmo PAID"}</button>
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

  const notify = useCallback((msg, type = "success") => setToast({ msg, type, key: Date.now() }), []);
  const goToContract = (pf) => { setContractPrefill(pf); setTab("contracts"); };
  const goToPayment  = (pf) => { setPaymentPrefill(pf);  setTab("payments");  };

  return (
    <MainLayout role="admin">
      <style>{CSS}</style>
      <div className="as-wrap" style={{ padding: "1.5rem 0" }}>

        {/* ── Hero Header ─────────────────────────────────────────── */}
        <div style={{
          background: "linear-gradient(160deg, #141210 0%, #1e1a14 45%, #241e16 100%)",
          borderRadius: 16, padding: "28px 28px 24px", marginBottom: 22,
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.015) 1px,transparent 1px)", backgroundSize: "22px 22px", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,#c9b87a 30%,#c9b87a 70%,transparent)" }} />
          <div style={{ position: "relative" }}>
            <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 28, fontWeight: 700, color: "#f5f0e8", margin: "0 0 4px", letterSpacing: "-0.4px" }}>
              Sales Management
            </h1>
            <p style={{ fontSize: 13, color: "rgba(245,240,232,0.35)", margin: "0 0 16px", fontFamily: "'DM Sans', sans-serif" }}>
              Admin view — full control over sale listings, contracts and payments.
            </p>
            {/* Workflow guide */}
            <div style={{
              display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap",
              padding: "10px 14px",
              background: "rgba(201,184,122,0.06)", borderRadius: 9,
              border: "1px solid rgba(201,184,122,0.12)", fontSize: 13,
            }}>
              {["🏷️ 1. Listing", "────", "📄 2. Contract", "────", "💳 3. Payment"].map((t, i) => (
                <span key={i} style={{
                  fontWeight: t.includes(".") ? 600 : 400,
                  color: t.includes(".")
                    ? (
                        (t.includes("1") && tab === "listings") ||
                        (t.includes("2") && tab === "contracts") ||
                        (t.includes("3") && tab === "payments")
                      ) ? "#c9b87a" : "rgba(245,240,232,0.28)"
                    : "rgba(201,184,122,0.25)",
                  fontFamily: "'DM Sans', sans-serif",
                }}>{t}</span>
              ))}
              <span style={{ marginLeft: "auto", color: "rgba(201,184,122,0.5)", fontSize: 11.5, fontFamily: "'DM Sans', sans-serif" }}>
                Kliko "Contract →" ose "Payments →" për workflow të shpejtë
              </span>
            </div>
          </div>
        </div>

        {/* ── Tabs ────────────────────────────────────────────────── */}
        <Tabs active={tab} onChange={setTab} />

        {/* ── Sections ────────────────────────────────────────────── */}
        {tab === "listings"  && <ListingsSection  onGoContract={goToContract} notify={notify} />}
        {tab === "contracts" && <ContractsSection prefill={contractPrefill} onGoPayment={goToPayment} notify={notify} />}
        {tab === "payments"  && <PaymentsSection  prefill={paymentPrefill} notify={notify} />}

        {toast && <Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
      </div>
    </MainLayout>
  );
}
