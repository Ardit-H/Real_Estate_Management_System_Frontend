import { useState, useEffect, useCallback } from "react";
import MainLayout from "../../components/layout/Layout";
import api from "../../api/axios";

// ─── Constants ────────────────────────────────────────────────────────────────

const RENTAL_STATUSES = ["ACTIVE", "INACTIVE", "EXPIRED", "RENTED"];
const PRICE_PERIODS   = ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"];
const CURRENCIES      = ["EUR", "USD", "GBP", "CHF", "ALL", "MKD"];

// ─── Global CSS ───────────────────────────────────────────────────────────────

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
  .ar-wrap * { box-sizing: border-box; }
  .ar-wrap { font-family: 'DM Sans', system-ui, sans-serif; }
  .ar-row:hover td { background: rgba(138,125,94,0.06) !important; }
  .ar-btn { transition: all 0.14s ease; }
  .ar-btn:hover { opacity: 0.82; transform: translateY(-1px); }
  .ar-pg:hover:not(:disabled) { background: rgba(201,184,122,0.1) !important; border-color: #c9b87a !important; color: #c9b87a !important; }
  @keyframes ar-spin  { to { transform: rotate(360deg); } }
  @keyframes ar-scale { from{opacity:0;transform:scale(0.97)} to{opacity:1;transform:scale(1)} }
  @keyframes ar-toast { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes ar-pulse { 0%,100%{opacity:.35} 50%{opacity:.75} }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtPrice = (v, cur = "EUR") =>
  v != null ? `€${Number(v).toLocaleString("de-DE")}` : "—";

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" }) : "—";

const fmtDateTime = (d) =>
  d ? new Date(d).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—";

// ─── Badge ────────────────────────────────────────────────────────────────────

const BADGE_CFG = {
  ACTIVE:   { bg: "rgba(29,158,117,0.12)",  color: "#1D9E75",  border: "rgba(29,158,117,0.25)"  },
  INACTIVE: { bg: "rgba(136,135,128,0.12)", color: "#888780",  border: "rgba(136,135,128,0.25)" },
  EXPIRED:  { bg: "rgba(201,184,122,0.15)", color: "#c9b87a",  border: "rgba(201,184,122,0.3)"  },
  RENTED:   { bg: "rgba(55,138,221,0.12)",  color: "#378ADD",  border: "rgba(55,138,221,0.25)"  },
};

function Badge({ label }) {
  const s = BADGE_CFG[label] || { bg: "rgba(136,135,128,0.12)", color: "#888780", border: "rgba(136,135,128,0.25)" };
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

// ─── Shared modal ─────────────────────────────────────────────────────────────

function Modal({ title, onClose, children, maxWidth = 560 }) {
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(8,6,4,0.82)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "'DM Sans', sans-serif" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ width: "100%", maxWidth, background: "#faf7f2", borderRadius: 18, boxShadow: "0 44px 100px rgba(0,0,0,0.55)", maxHeight: "90vh", overflowY: "auto", animation: "ar-scale 0.22s ease", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid rgba(138,125,94,0.15)", position: "sticky", top: 0, background: "#faf7f2", zIndex: 1 }}>
          <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 700, fontSize: 17, color: "#1a1714" }}>{title}</span>
          <button onClick={onClose} style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(138,125,94,0.2)", background: "rgba(138,125,94,0.08)", color: "#8a7d5e", cursor: "pointer", fontSize: 15, borderRadius: 8 }}>✕</button>
        </div>
        <div style={{ padding: "22px 24px", overflowY: "auto", maxHeight: "calc(90vh - 60px)" }}>{children}</div>
      </div>
    </div>
  );
}

// ─── Form helpers ─────────────────────────────────────────────────────────────

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

const inputSt    = { width: "100%", padding: "9px 12px", fontSize: 13, border: "1.5px solid rgba(138,125,94,0.25)", borderRadius: 9, background: "#fff", color: "#1a1714", outline: "none", boxSizing: "border-box", fontFamily: "'DM Sans', sans-serif" };
const selectSt   = { ...inputSt, cursor: "pointer" };
const textareaSt = { ...inputSt, resize: "vertical", lineHeight: 1.6 };

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
      animation: "ar-toast 0.2s ease", display: "flex", alignItems: "center", gap: 8,
    }}>
      <span style={{ fontSize: 14 }}>{type === "error" ? "⚠️" : "✅"}</span>
      {msg}
    </div>
  );
}

// ─── Shared table styles ──────────────────────────────────────────────────────

const TH = { padding: "10px 12px", textAlign: "left", fontWeight: 600, fontSize: 10.5, color: "#8a7d5e", borderBottom: "1px solid rgba(138,125,94,0.15)", background: "rgba(138,125,94,0.04)", whiteSpace: "nowrap", textTransform: "uppercase", letterSpacing: "0.5px" };
const TD = { padding: "10px 12px", borderBottom: "1px solid rgba(138,125,94,0.08)", fontSize: 13, color: "#1a1714", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" };

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
      <div style={{ width: 26, height: 26, margin: "0 auto", border: "2px solid rgba(138,125,94,0.15)", borderTop: "2px solid #8a7d5e", borderRadius: "50%", animation: "ar-spin .8s linear infinite" }} />
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end", padding: "14px 16px 8px" }}>
      <button disabled={page === 0} onClick={() => onChange(page - 1)} className="ar-pg" style={pgBtn(page === 0)}>← Prev</button>
      <span style={{ fontSize: 13, color: "#8a7d5e", padding: "0 6px", fontFamily: "'DM Sans', sans-serif" }}>{page + 1} / {totalPages}</span>
      <button disabled={page >= totalPages - 1} onClick={() => onChange(page + 1)} className="ar-pg" style={pgBtn(page >= totalPages - 1)}>Next →</button>
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

// ─── Delete confirm modal ─────────────────────────────────────────────────────

function DeleteModal({ id, label, onCancel, onConfirm, loading }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(8,6,4,0.82)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "'DM Sans', sans-serif" }}
      onClick={(e) => e.target === e.currentTarget && !loading && onCancel()}>
      <div style={{ width: "100%", maxWidth: 440, background: "#faf7f2", borderRadius: 18, boxShadow: "0 44px 100px rgba(0,0,0,0.55)", animation: "ar-scale 0.22s ease", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid rgba(138,125,94,0.15)" }}>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 17, color: "#1a1714" }}>Konfirmo fshirjen</span>
          <button onClick={onCancel} style={{ width: 30, height: 30, border: "1px solid rgba(138,125,94,0.2)", background: "rgba(138,125,94,0.08)", color: "#8a7d5e", cursor: "pointer", fontSize: 15, borderRadius: 8 }}>✕</button>
        </div>
        <div style={{ padding: "22px 24px" }}>
          <p style={{ fontSize: 14, color: "#4a4438", marginBottom: 18, lineHeight: 1.6 }}>A jeni i sigurt që dëshironi të fshini <strong style={{ color: "#1a1714" }}>{label} #{id}</strong>?</p>
          <div style={{ background: "rgba(216,90,48,0.08)", border: "1px solid rgba(216,90,48,0.2)", borderRadius: 10, padding: "10px 15px", marginBottom: 22, fontSize: 13, color: "#D85A30" }}>
            Soft delete — rekordi shënohet me <code style={{ background: "rgba(216,90,48,0.12)", padding: "1px 6px", borderRadius: 4, fontSize: 12 }}>deleted_at</code> dhe nuk shfaqet më.
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button onClick={onCancel} disabled={loading} style={secondaryBtn}>Anulo</button>
            <button onClick={onConfirm} disabled={loading} style={dangerBtn}>{loading ? "Duke fshirë..." : "Fshi"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Button styles ────────────────────────────────────────────────────────────

const primaryBtn = { fontSize: 13, padding: "8px 16px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#c9b87a 0%,#b0983e 100%)", color: "#1a1714", cursor: "pointer", fontWeight: 700, whiteSpace: "nowrap", fontFamily: "'DM Sans', sans-serif" };
const secondaryBtn = { fontSize: 13, padding: "8px 15px", borderRadius: 10, border: "1.5px solid rgba(138,125,94,0.25)", background: "transparent", color: "#6b6248", cursor: "pointer", whiteSpace: "nowrap", fontFamily: "'DM Sans', sans-serif" };
const dangerBtn = { fontSize: 13, padding: "8px 16px", borderRadius: 10, border: "none", background: "#D85A30", color: "#fff", cursor: "pointer", fontWeight: 700, fontFamily: "'DM Sans', sans-serif" };
const btnSm = (bg, color, border) => ({ fontSize: 11, padding: "4px 9px", borderRadius: 7, border: `1px solid ${border}`, background: bg, color, cursor: "pointer", whiteSpace: "nowrap", fontWeight: 600, fontFamily: "'DM Sans', sans-serif" });
const pillGold = { background: "rgba(201,184,122,0.12)", color: "#c9b87a", border: "1px solid rgba(201,184,122,0.25)", padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600 };

// ─── Listing detail modal ─────────────────────────────────────────────────────

function ListingDetailModal({ listing: l, onClose }) {
  return (
    <Modal title={`Rental Listing #${l.id} — Detaje`} onClose={onClose} maxWidth={600}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px", marginBottom: 16 }}>
        {[
          ["ID", `#${l.id}`], ["Property", `#${l.property_id}`],
          ["Agent", l.agent_id ? `#${l.agent_id}` : "—"], ["Price", `${fmtPrice(l.price, l.currency)} / ${l.price_period || "MONTHLY"}`],
          ["Deposit", fmtPrice(l.deposit, l.currency)], ["Min Lease", l.min_lease_months ? `${l.min_lease_months} muaj` : "—"],
          ["Available From", fmtDate(l.available_from)], ["Available Until", fmtDate(l.available_until)],
          ["Status", "badge"], ["Created", fmtDateTime(l.created_at)], ["Updated", fmtDateTime(l.updated_at)],
        ].map(([label, val]) => (
          <div key={label}>
            <p style={{ fontSize: 10, color: "#b0a890", textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 3px" }}>{label}</p>
            {val === "badge" ? <Badge label={l.status} /> : <p style={{ fontSize: 14, fontWeight: 500, margin: 0, color: "#1a1714", fontFamily: "'Cormorant Garamond', serif" }}>{val}</p>}
          </div>
        ))}
      </div>
      {l.title && <div style={{ marginBottom: 10 }}><p style={{ fontSize: 10, color: "#b0a890", textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 4px" }}>Title</p><p style={{ fontSize: 14, fontWeight: 500, margin: 0, color: "#1a1714" }}>{l.title}</p></div>}
      {l.description && <div><p style={{ fontSize: 10, color: "#b0a890", textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 4px" }}>Description</p><p style={{ fontSize: 13, color: "#4a4438", lineHeight: 1.6, margin: 0 }}>{l.description}</p></div>}
    </Modal>
  );
}

// ─── Listing form modal ───────────────────────────────────────────────────────

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
    if (k === "available_from" && next.available_until && next.available_until < v) next.available_until = "";
    return next;
  });

  const dateError = form.available_from && form.available_until && form.available_until < form.available_from
    ? "Available Until nuk mund të jetë para Available From." : null;

  const handleSubmit = async () => {
    if (!form.property_id || !form.price) { notify("Property ID dhe çmimi janë të detyrueshme", "error"); return; }
    if (dateError) { notify(dateError, "error"); return; }
    setSaving(true);
    try {
      const payload = {
        property_id: Number(form.property_id), title: form.title || null,
        description: form.description || null, available_from: form.available_from || null,
        available_until: form.available_until || null, price: Number(form.price),
        currency: form.currency, deposit: form.deposit ? Number(form.deposit) : null,
        price_period: form.price_period, min_lease_months: Number(form.min_lease_months),
        ...(initial && { status: form.status }),
      };
      if (initial) { await api.put(`/api/rentals/listings/${initial.id}`, payload); }
      else { await api.post("/api/rentals/listings", payload); }
      onSuccess();
    } catch (err) {
      notify(err.response?.data?.message || "Gabim gjatë ruajtjes", "error");
    } finally { setSaving(false); }
  };

  return (
    <Modal title={initial ? `Edit Listing #${initial.id}` : "New Rental Listing"} onClose={onClose} maxWidth={620}>
      <Row>
        <Field label="Property ID" required><input style={inputSt} type="number" value={form.property_id} onChange={(e) => set("property_id", e.target.value)} disabled={!!initial} placeholder="ex: 42" /></Field>
        <Field label="Title"><input style={inputSt} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Apartament 2+1 Tirana" /></Field>
      </Row>
      <Row>
        <Field label="Price (€)" required><input style={inputSt} type="number" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="ex: 800" /></Field>
        <Field label="Price Period"><select style={selectSt} value={form.price_period} onChange={(e) => set("price_period", e.target.value)}>{PRICE_PERIODS.map((p) => <option key={p}>{p}</option>)}</select></Field>
      </Row>
      <Row>
        <Field label="Deposit (€)"><input style={inputSt} type="number" value={form.deposit} onChange={(e) => set("deposit", e.target.value)} placeholder="ex: 1600" /></Field>
        <Field label="Currency"><select style={selectSt} value={form.currency} onChange={(e) => set("currency", e.target.value)}>{CURRENCIES.map((c) => <option key={c}>{c}</option>)}</select></Field>
      </Row>
      <Row>
        <Field label="Min Lease (muaj)"><input style={inputSt} type="number" value={form.min_lease_months} onChange={(e) => set("min_lease_months", e.target.value)} placeholder="12" /></Field>
        {initial && <Field label="Status"><select style={selectSt} value={form.status} onChange={(e) => set("status", e.target.value)}>{RENTAL_STATUSES.map((s) => <option key={s}>{s}</option>)}</select></Field>}
      </Row>
      <Row>
        <Field label="Available From"><input style={inputSt} type="date" value={form.available_from} onChange={(e) => set("available_from", e.target.value)} /></Field>
        <Field label="Available Until">
          <input
            style={{ ...inputSt, borderColor: dateError ? "#D85A30" : "rgba(138,125,94,0.25)", background: dateError ? "rgba(216,90,48,0.04)" : "#fff" }}
            type="date" value={form.available_until} min={form.available_from || undefined}
            onChange={(e) => {
              if (form.available_from && e.target.value < form.available_from) { notify("Available Until nuk mund të jetë para Available From.", "error"); return; }
              set("available_until", e.target.value);
            }}
          />
          {dateError && <p style={{ fontSize: 11, color: "#D85A30", margin: "4px 0 0" }}>⚠ {dateError}</p>}
        </Field>
      </Row>
      <Field label="Description"><textarea style={textareaSt} rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Përshkrim i listingut..." /></Field>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 6 }}>
        <button style={secondaryBtn} onClick={onClose}>Anulo</button>
        <button style={{ ...primaryBtn, opacity: dateError ? 0.55 : 1, cursor: dateError ? "not-allowed" : "pointer" }} onClick={handleSubmit} disabled={saving || !!dateError}>
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

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [detailTarget, setDetail]   = useState(null);
  const [deleteId, setDeleteId]     = useState(null);
  const [deleting, setDeleting]     = useState(false);

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
    } finally { setLoading(false); }
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
    } finally { setDeleting(false); }
  };

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

  const statCards = [
    { label: "Total",   val: total,        color: "#c9b87a" },
    { label: "Active",  val: activeCount,  color: "#1D9E75" },
    { label: "Rented",  val: rentedCount,  color: "#378ADD" },
    { label: "Expired", val: expiredCount, color: "#D85A30" },
  ];

  return (
    <MainLayout role="admin">
      <style>{CSS}</style>
      <div className="ar-wrap" style={{ padding: "1.5rem 0" }}>

        {/* ── Hero Header ─────────────────────────────────────────── */}
        <div style={{
          background: "linear-gradient(160deg, #141210 0%, #1e1a14 45%, #241e16 100%)",
          borderRadius: 16, padding: "28px 28px 24px", marginBottom: 22,
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.015) 1px,transparent 1px)", backgroundSize: "22px 22px", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,#c9b87a 30%,#c9b87a 70%,transparent)" }} />
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap", position: "relative" }}>
            <div>
              <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 28, fontWeight: 700, color: "#f5f0e8", margin: "0 0 4px", letterSpacing: "-0.4px" }}>Rental Listings</h1>
              <p style={{ fontSize: 13, color: "rgba(245,240,232,0.35)", margin: 0, fontFamily: "'DM Sans', sans-serif" }}>Admin view — full CRUD access të gjitha listings ({total} gjithsej)</p>
            </div>
            <button onClick={() => setCreateOpen(true)} style={primaryBtn}>+ New Listing</button>
          </div>
        </div>

        {/* ── Stat cards ───────────────────────────────────────────── */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          {statCards.map((s) => (
            <div key={s.label} style={{ background: "#fff", borderRadius: 12, border: "1px solid rgba(138,125,94,0.15)", padding: "14px 18px", flex: "1 1 100px", minWidth: 90, boxShadow: "0 2px 12px rgba(20,16,10,0.05)" }}>
              <p style={{ fontSize: 10, color: "#b0a890", textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 4px", fontFamily: "'DM Sans', sans-serif" }}>{s.label}</p>
              <p style={{ fontSize: 26, fontWeight: 700, color: s.color, margin: 0, letterSpacing: "-0.04em", fontFamily: "'Cormorant Garamond', serif" }}>{s.val}</p>
            </div>
          ))}
        </div>

        {/* ── Table card ───────────────────────────────────────────── */}
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid rgba(138,125,94,0.15)", overflow: "hidden", boxShadow: "0 2px 20px rgba(20,16,10,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid rgba(138,125,94,0.12)", flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              {/* Search */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(138,125,94,0.05)", border: "1px solid rgba(138,125,94,0.15)", borderRadius: 9, padding: "6px 11px", minWidth: 220 }}>
                <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#b0a890" strokeWidth={2}><circle cx={11} cy={11} r={8}/><path d="m21 21-4.35-4.35"/></svg>
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Kërko ID, title, property..."
                  style={{ border: "none", background: "transparent", outline: "none", fontSize: 13, color: "#1a1714", width: "100%", fontFamily: "'DM Sans', sans-serif" }} />
                {search && <button onClick={() => setSearch("")} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 15, color: "#b0a890", padding: 0 }}>×</button>}
              </div>
              <select value={statusF} onChange={(e) => { setStatusF(e.target.value); setPage(0); }} style={{ ...selectSt, width: 150, height: 36, padding: "0 10px" }}>
                <option value="">All statuses</option>
                {RENTAL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

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
                      <tr key={l.id} className="ar-row">
                        <td style={{ ...TD, fontFamily: "monospace", color: "#b0a890", fontSize: 11.5 }}>{l.id}</td>
                        <td style={TD}><span style={pillGold}>#{l.property_id}</span></td>
                        <td style={{ ...TD, color: "#8a7d5e" }}>{l.agent_id ? `#${l.agent_id}` : "—"}</td>
                        <td style={{ ...TD, maxWidth: 160 }} title={l.title || ""}>{l.title || <span style={{ color: "#b0a890" }}>—</span>}</td>
                        <td style={{ ...TD, fontWeight: 600 }}>
                          {fmtPrice(l.price, l.currency)}
                          <span style={{ fontSize: 11, color: "#b0a890", fontWeight: 400, marginLeft: 4 }}>/ {l.price_period || "MONTHLY"}</span>
                        </td>
                        <td style={TD}>{fmtPrice(l.deposit, l.currency)}</td>
                        <td style={{ ...TD, color: "#8a7d5e", fontSize: 12 }}>
                          {l.available_from || l.available_until ? `${fmtDate(l.available_from)} → ${fmtDate(l.available_until)}` : "—"}
                        </td>
                        <td style={TD}><Badge label={l.status} /></td>
                        <td style={{ ...TD, color: "#b0a890", fontSize: 12 }}>{fmtDate(l.created_at)}</td>
                        <td style={TD}>
                          <div style={{ display: "flex", gap: 5 }}>
                            <button className="ar-btn" style={btnSm("rgba(201,184,122,0.08)", "#c9b87a", "rgba(201,184,122,0.25)")} onClick={() => setDetail(l)}>Detail</button>
                            <button className="ar-btn" style={btnSm("rgba(29,158,117,0.08)", "#1D9E75", "rgba(29,158,117,0.25)")} onClick={() => setEditTarget(l)}>Edit</button>
                            <button className="ar-btn" style={btnSm("rgba(216,90,48,0.08)", "#D85A30", "rgba(216,90,48,0.25)")} onClick={() => setDeleteId(l.id)}>Del</button>
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
      </div>
    </MainLayout>
  );
}
