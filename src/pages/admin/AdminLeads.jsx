import { useState, useEffect, useCallback } from "react";
import MainLayout from "../../components/layout/Layout";
import api from "../../api/axios";

// ─── Constants ────────────────────────────────────────────────────────────────
const LEAD_STATUSES = ["NEW", "IN_PROGRESS", "DONE", "REJECTED"];

const STATUS_STYLE = {
  NEW:         { bg: "#eff6ff", color: "#2563eb",  label: "New" },
  IN_PROGRESS: { bg: "#f5f3ff", color: "#7c3aed",  label: "In Progress" },
  DONE:        { bg: "#ecfdf5", color: "#059669",  label: "Done" },
  REJECTED:    { bg: "#fef2f2", color: "#dc2626",  label: "Rejected" },
  DECLINED:    { bg: "#fff7ed", color: "#ea580c",  label: "Declined" },
};

const TYPE_ICON   = { SELL: "🏷️", BUY: "🏠", RENT: "🔑", RENT_SEEKING: "🔎", VALUATION: "📊" };
const SOURCE_ICON = { WEBSITE: "🌐", PHONE: "📞", EMAIL: "✉️", REFERRAL: "👥", SOCIAL: "📱" };

const fmtDate     = (d) => d ? new Date(d).toLocaleDateString("sq-AL") : "—";
const fmtDateTime = (d) => d ? new Date(d).toLocaleString("sq-AL", {
  day: "2-digit", month: "2-digit", year: "numeric",
  hour: "2-digit", minute: "2-digit",
}) : "—";

// ─── Palette (same as Notifications) ─────────────────────────────────────────
const C = {
  dark: "#1a1714", gold: "#c9b87a", goldL: "#e8d9a0",
  border: "#e8e2d6", surface: "#faf7f2", muted: "#9a8c6e",
  text: "#1a1714", textMut: "#b0a890", textSub: "#6b6340",
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
  .al *{box-sizing:border-box}
  .al{font-family:'DM Sans',system-ui,sans-serif;background:#f2ede4;min-height:100vh}
  .al-btn{transition:all .17s ease;cursor:pointer;font-family:'DM Sans',sans-serif;border:none}
  .al-btn:hover{opacity:.85;transform:translateY(-1px)}
  .al-card{background:#faf7f2;border:1.5px solid #e8e2d6;border-radius:14px;box-shadow:0 2px 16px rgba(20,16,10,.06);overflow:hidden}
  .al-row{transition:background .15s;cursor:pointer}
  .al-row:hover{background:#f5f0e8!important}
  .al-tab-btn{transition:all .17s;cursor:pointer;font-family:'DM Sans',sans-serif;border:none;background:none;display:flex;align-items:center;gap:5px}
  @keyframes al-fade-up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes al-fade-in{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:scale(1)}}
  @keyframes al-spin{to{transform:rotate(360deg)}}
  .al-card{animation:al-fade-up .35s ease both}
  .al-modal-inner{animation:al-fade-in .2s ease}
`;

// ─── Shared UI ────────────────────────────────────────────────────────────────
function Toast({ msg, type = "success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{
      position: "fixed", bottom: 26, right: 26, zIndex: 9999,
      background: C.dark, color: type === "error" ? "#f09090" : "#90c8a8",
      padding: "11px 18px", borderRadius: 12, fontSize: 13,
      boxShadow: "0 10px 36px rgba(0,0,0,.32)",
      border: `1px solid ${type === "error" ? "rgba(240,128,128,.15)" : "rgba(144,200,168,.15)"}`,
      fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", gap: 8,
    }}>
      {type === "error" ? "⚠️" : "✅"} {msg}
    </div>
  );
}

function Loader() {
  return (
    <div style={{ textAlign: "center", padding: "52px 0" }}>
      <div style={{ width: 28, height: 28, margin: "0 auto", border: `2.5px solid ${C.border}`, borderTop: `2.5px solid ${C.gold}`, borderRadius: "50%", animation: "al-spin .7s linear infinite" }} />
    </div>
  );
}

function EmptyState({ icon, text }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px", color: C.textMut }}>
      <div style={{ fontSize: 44, marginBottom: 12 }}>{icon}</div>
      <p style={{ fontSize: 16, fontWeight: 700, color: C.textSub, margin: 0, fontFamily: "'Cormorant Garamond',Georgia,serif" }}>{text}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || { bg: "#f0ece3", color: C.textSub, label: status };
  return (
    <span style={{ background: s.bg, color: s.color, padding: "2px 9px", borderRadius: 20, fontSize: 10, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 5 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.color, display: "inline-block" }} />
      {s.label}
    </span>
  );
}

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end", padding: "14px 18px" }}>
      <button className="al-btn" disabled={page === 0} onClick={() => onChange(page - 1)}
        style={{ padding: "6px 14px", borderRadius: 9, border: `1.5px solid ${C.border}`, background: "transparent", color: C.textSub, fontSize: 13, opacity: page === 0 ? .4 : 1 }}>
        Prev
      </button>
      <span style={{ fontSize: 12.5, color: C.muted, padding: "0 8px" }}>{page + 1} / {totalPages}</span>
      <button className="al-btn" disabled={page >= totalPages - 1} onClick={() => onChange(page + 1)}
        style={{ padding: "6px 14px", borderRadius: 9, border: `1.5px solid ${C.border}`, background: "transparent", color: C.textSub, fontSize: 13, opacity: page >= totalPages - 1 ? .4 : 1 }}>
        Next
      </button>
    </div>
  );
}

function Field({ label, children, required }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: C.textMut, textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 6 }}>
        {label}{required && <span style={{ color: "#dc2626", marginLeft: 2 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

// ─── Modal shell ──────────────────────────────────────────────────────────────
function Modal({ title, onClose, children, wide = false }) {
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(26,23,20,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="al-modal-inner" style={{ width: "100%", maxWidth: wide ? 660 : 500, background: C.surface, borderRadius: 16, border: `1.5px solid ${C.border}`, boxShadow: "0 24px 64px rgba(26,23,20,.22)", maxHeight: "90vh", overflowY: "auto" }}>
        {/* Modal header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 22px", borderBottom: `1px solid ${C.border}`, background: "#fdf9f4" }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: C.text, fontFamily: "'Cormorant Garamond',Georgia,serif" }}>{title}</span>
          <button onClick={onClose} className="al-btn" style={{ width: 28, height: 28, borderRadius: 7, background: "#f0ece3", border: `1px solid ${C.border}`, color: C.muted, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        <div style={{ padding: "20px 22px" }}>{children}</div>
      </div>
    </div>
  );
}

// ─── Assign Agent Modal ───────────────────────────────────────────────────────
function AssignModal({ lead, onClose, onSuccess, notify }) {
  const [agents, setAgents]   = useState([]);
  const [agentId, setAgentId] = useState("");
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    Promise.all([api.get("/api/users/agents"), api.get("/api/users")])
      .then(([profilesRes, usersRes]) => {
        const profiles = profilesRes.data || [];
        const users    = usersRes.data   || [];
        const merged = profiles.map(p => {
          const u = users.find(u => u.id === p.user_id);
          return { ...p, full_name: u ? `${u.first_name} ${u.last_name}`.trim() : `Agjent #${p.user_id}` };
        });
        setAgents(merged);
      })
      .catch(() => notify("Gabim gjatë ngarkimit të agjentëve", "error"));
  }, [notify]);

  const handleSubmit = async () => {
    if (!agentId) { notify("Zgjidh një agjent", "error"); return; }
    setSaving(true);
    try {
      await api.patch(`/api/leads/${lead.id}/assign`, { agent_id: Number(agentId) });
      onSuccess();
    } catch (err) {
      notify(err.response?.data?.message || "Gabim gjatë asignimit", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={`Asigno agjent — Lead #${lead.id}`} onClose={onClose}>
      <div style={{ background: "#f0ece3", borderRadius: 9, padding: "10px 14px", marginBottom: 18, fontSize: 13, color: C.textSub, border: `1px solid ${C.border}` }}>
        <strong>{TYPE_ICON[lead.type]} {lead.type}</strong>
        {lead.client_name && ` · Klienti: ${lead.client_name}`}
      </div>
      <Field label="Agjenti" required>
        <select style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: `1.5px solid ${C.border}`, background: C.surface, fontSize: 13, color: C.text, fontFamily: "'DM Sans',sans-serif" }}
          value={agentId} onChange={e => setAgentId(e.target.value)}>
          <option value="">— Zgjidh agjentin —</option>
          {agents.map(a => (
            <option key={a.user_id} value={a.user_id}>
              {a.full_name}{a.specialization ? ` (${a.specialization})` : ""}{a.rating > 0 ? ` ★ ${Number(a.rating).toFixed(1)}` : ""}
            </option>
          ))}
        </select>
      </Field>
      {lead.assigned_agent_id && (
        <p style={{ fontSize: 12.5, color: "#d97706", marginTop: -8, marginBottom: 14 }}>
          ⚠️ Aktualisht asignuar tek: <strong>{lead.agent_name || `#${lead.assigned_agent_id}`}</strong> — do të zëvendësohet.
        </p>
      )}
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button className="al-btn" onClick={onClose}
          style={{ padding: "8px 16px", borderRadius: 9, border: `1.5px solid ${C.border}`, background: "transparent", color: C.textSub, fontSize: 13, fontWeight: 500 }}>
          Anulo
        </button>
        <button className="al-btn" onClick={handleSubmit} disabled={saving}
          style={{ padding: "8px 18px", borderRadius: 9, background: C.dark, color: C.goldL, fontSize: 13, fontWeight: 500, border: `1px solid ${C.gold}40`, opacity: saving ? .7 : 1 }}>
          {saving ? "Duke asignuar..." : "Asigno agjentin"}
        </button>
      </div>
    </Modal>
  );
}

// ─── Status Change Modal ──────────────────────────────────────────────────────
function StatusModal({ lead, onClose, onSuccess, notify }) {
  const [status, setStatus] = useState("IN_PROGRESS");
  const [saving, setSaving] = useState(false);

  const ALLOWED = { NEW: ["IN_PROGRESS"], IN_PROGRESS: ["DONE", "REJECTED"] };
  const options = ALLOWED[lead.status] || [];

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await api.patch(`/api/leads/${lead.id}/status`, { status });
      onSuccess();
    } catch (err) {
      notify(err.response?.data?.message || "Gabim", "error");
    } finally {
      setSaving(false);
    }
  };

  if (options.length === 0) {
    return (
      <Modal title="Ndrysho statusin" onClose={onClose}>
        <p style={{ fontSize: 14, color: C.textSub, marginBottom: 18 }}>
          Leadi me status <StatusBadge status={lead.status} /> nuk mund të ndryshohet.
        </p>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button className="al-btn" onClick={onClose}
            style={{ padding: "8px 16px", borderRadius: 9, border: `1.5px solid ${C.border}`, background: "transparent", color: C.textSub, fontSize: 13, fontWeight: 500 }}>
            Mbyll
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title={`Ndrysho statusin — Lead #${lead.id}`} onClose={onClose}>
      <p style={{ fontSize: 13.5, color: C.textSub, marginBottom: 16 }}>
        Statusi aktual: <StatusBadge status={lead.status} />
      </p>
      <Field label="Statusi i ri" required>
        <select style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: `1.5px solid ${C.border}`, background: C.surface, fontSize: 13, color: C.text, fontFamily: "'DM Sans',sans-serif" }}
          value={status} onChange={e => setStatus(e.target.value)}>
          {options.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </Field>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button className="al-btn" onClick={onClose}
          style={{ padding: "8px 16px", borderRadius: 9, border: `1.5px solid ${C.border}`, background: "transparent", color: C.textSub, fontSize: 13, fontWeight: 500 }}>
          Anulo
        </button>
        <button className="al-btn" onClick={handleSubmit} disabled={saving}
          style={{ padding: "8px 18px", borderRadius: 9, fontSize: 13, fontWeight: 500, border: "none", opacity: saving ? .7 : 1,
            background: status === "REJECTED" ? "#dc2626" : C.dark,
            color: status === "REJECTED" ? "#fff" : C.goldL }}>
          {saving ? "Duke ndryshuar..." : `Konfirmo → ${status}`}
        </button>
      </div>
    </Modal>
  );
}

// ─── Lead Detail Modal ────────────────────────────────────────────────────────
function LeadDetailModal({ lead, onClose, onAssign, onStatusChange }) {
  return (
    <Modal title={`Lead #${lead.id} — Detajet`} onClose={onClose} wide>
      {/* Status + actions bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, padding: "12px 16px", background: "#f0ece3", borderRadius: 10, border: `1px solid ${C.border}` }}>
        <div>
          <p style={{ fontSize: 9.5, color: C.textMut, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 4, margin: "0 0 4px" }}>Statusi</p>
          <StatusBadge status={lead.status} />
        </div>
        {lead.status !== "DONE" && lead.status !== "REJECTED" && (
          <div style={{ display: "flex", gap: 8 }}>
            <button className="al-btn" onClick={() => { onClose(); onAssign(lead); }}
              style={{ padding: "7px 14px", borderRadius: 9, border: `1.5px solid ${C.border}`, background: C.surface, color: C.textSub, fontSize: 12.5, fontWeight: 500 }}>
              👤 {lead.assigned_agent_id ? "Reassign" : "Assign"} agjent
            </button>
            <button className="al-btn" onClick={() => { onClose(); onStatusChange(lead); }}
              style={{ padding: "7px 14px", borderRadius: 9, background: C.dark, color: C.goldL, fontSize: 12.5, fontWeight: 500, border: `1px solid ${C.gold}40` }}>
              Ndrysho statusin
            </button>
          </div>
        )}
      </div>

      {/* Detail grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        {[
          { label: "Klienti",        value: lead.client_name   || `#${lead.client_id}` },
          { label: "Agjenti",        value: lead.agent_name    || (lead.assigned_agent_id ? `#${lead.assigned_agent_id}` : "—") },
          { label: "Prona",          value: lead.property_title || (lead.property_id ? `#${lead.property_id}` : "—") },
          { label: "Tipi",           value: `${TYPE_ICON[lead.type] || ""} ${lead.type}` },
          { label: "Burimi",         value: `${SOURCE_ICON[lead.source] || ""} ${lead.source}` },
          { label: "Data preferuar", value: fmtDate(lead.preferred_date) },
          { label: "Krijuar",        value: fmtDateTime(lead.created_at) },
          { label: "Ndryshuar",      value: fmtDateTime(lead.updated_at) },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: "#f0ece3", borderRadius: 9, padding: "10px 14px", border: `1px solid ${C.border}` }}>
            <p style={{ fontSize: 9.5, color: C.textMut, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 4, margin: "0 0 4px" }}>{label}</p>
            <p style={{ fontSize: 13.5, fontWeight: 500, color: C.text, margin: 0 }}>{value}</p>
          </div>
        ))}
      </div>

      {lead.message && (
        <div style={{ background: "#f0ece3", border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px" }}>
          <p style={{ fontSize: 9.5, color: C.textMut, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 8, margin: "0 0 8px" }}>Mesazhi i klientit</p>
          <p style={{ fontSize: 13.5, color: C.textSub, lineHeight: 1.6, fontStyle: "italic", margin: 0 }}>"{lead.message}"</p>
        </div>
      )}
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE — funksionaliteti identik, vetëm stili ndryshon
// ═══════════════════════════════════════════════════════════════════════════════
export default function AdminLeads() {
  const [activeTab,    setActiveTab]    = useState("all");
  const [leads,        setLeads]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [page,         setPage]         = useState(0);
  const [totalPages,   setTotalPages]   = useState(0);
  const [statusFilter, setStatusFilter] = useState("NEW");
  const [propertyId,   setPropertyId]   = useState("");
  const [selectedLead, setSelectedLead] = useState(null);
  const [assignTarget, setAssignTarget] = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);
  const [toast,        setToast]        = useState(null);

  const notify = useCallback((msg, type = "success") =>
    setToast({ msg, type, key: Date.now() }), []);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      let res;
      if (activeTab === "all") {
        res = await api.get(`/api/leads?status=${statusFilter}&page=${page}&size=15`);
        setLeads(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
      } else if (activeTab === "unassigned") {
        res = await api.get("/api/leads/unassigned");
        setLeads(Array.isArray(res.data) ? res.data : []);
        setTotalPages(1);
      } else {
        setLoading(false);
        return;
      }
    } catch {
      notify("Gabim gjatë ngarkimit", "error");
    } finally {
      setLoading(false);
    }
  }, [activeTab, page, statusFilter, notify]);

  useEffect(() => {
    if (activeTab !== "property") fetchLeads();
  }, [fetchLeads, activeTab]);

  const fetchByProperty = async () => {
    if (!propertyId) { notify("Shkruaj Property ID", "error"); return; }
    setLoading(true);
    try {
      const res = await api.get(`/api/leads/property/${propertyId}`);
      setLeads(Array.isArray(res.data) ? res.data : []);
      setTotalPages(1);
    } catch {
      notify("Prona nuk u gjet", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = (msg) => {
    setAssignTarget(null);
    setStatusTarget(null);
    fetchLeads();
    notify(msg);
  };

  return (
    <MainLayout role="admin">
      <style>{CSS}</style>
      <div className="al">

        {/* ── HERO ── */}
        <div style={{ background: "linear-gradient(160deg,#1a1714 0%,#1e1a14 50%,#241e16 100%)", minHeight: 180, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "36px 32px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,.018) 1px,transparent 1px)", backgroundSize: "22px 22px", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(90deg,transparent,${C.gold} 30%,${C.gold} 70%,transparent)` }} />
          <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
            <p style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 600, color: C.gold, textTransform: "uppercase", letterSpacing: "2.5px" }}>Admin · CRM</p>
            <h1 style={{ margin: "0 0 8px", fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "clamp(24px,3vw,36px)", fontWeight: 700, color: "#f5f0e8", letterSpacing: "-0.4px" }}>
              Leads{" "}
              <span style={{ background: `linear-gradient(90deg,${C.gold},${C.goldL})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Management</span>
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: "rgba(245,240,232,.38)" }}>
              Menaxho të gjitha kërkesat, asigno agjentë dhe gjurmo progresin
            </p>
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div style={{ padding: "24px 28px", maxWidth: 1100, margin: "0 auto" }}>

          {/* Flow guide */}
          <div className="al-card" style={{ marginBottom: 20, padding: "13px 18px", borderLeft: `3px solid ${C.gold}`, display: "flex", alignItems: "flex-start", gap: 10 }}>
            <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>📋</span>
            <p style={{ margin: 0, fontSize: 13, color: C.textSub, lineHeight: 1.6 }}>
              <strong style={{ color: C.text }}>Flow:</strong> Krijo/Merr lead →{" "}
              <strong style={{ color: C.text }}>Assign agjent</strong> (mbetet NEW) →
              Agent Accept (IN_PROGRESS) →
              Agent Complete (<strong style={{ color: "#059669" }}>DONE</strong>) ose Reject (<strong style={{ color: "#dc2626" }}>REJECTED</strong>)
              <span style={{ marginLeft: 16, fontSize: 12, color: C.muted }}>
                · Tab <strong>Pa agjent</strong> tregon leads që presin asignimin
              </span>
            </p>
          </div>

          {/* Tabs + filters */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", gap: 2, borderBottom: `1px solid ${C.border}` }}>
              {[
                { id: "all",        label: "Të gjitha",   icon: "📋" },
                { id: "unassigned", label: "Pa agjent",   icon: "⚠️" },
                { id: "property",   label: "By Property", icon: "🏠" },
              ].map(t => (
                <button key={t.id} className="al-tab-btn"
                  onClick={() => { setActiveTab(t.id); setPage(0); setLeads([]); }}
                  style={{
                    padding: "9px 16px", marginBottom: -1,
                    borderBottom: activeTab === t.id ? `2px solid ${C.gold}` : "2px solid transparent",
                    color: activeTab === t.id ? C.dark : C.muted,
                    fontWeight: activeTab === t.id ? 600 : 400, fontSize: 13.5,
                  }}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {activeTab === "all" && (
                <select
                  style={{ height: 34, padding: "0 10px", fontSize: 13, borderRadius: 9, border: `1.5px solid ${C.border}`, background: C.surface, color: C.text, fontFamily: "'DM Sans',sans-serif", width: 160 }}
                  value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(0); }}>
                  {LEAD_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              )}
              {activeTab === "property" && (
                <>
                  <input
                    style={{ height: 34, padding: "0 10px", fontSize: 13, width: 130, borderRadius: 9, border: `1.5px solid ${C.border}`, background: C.surface, color: C.text, fontFamily: "'DM Sans',sans-serif" }}
                    type="number" placeholder="Property ID..."
                    value={propertyId} onChange={e => setPropertyId(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && fetchByProperty()} />
                  <button className="al-btn" onClick={fetchByProperty}
                    style={{ padding: "7px 14px", borderRadius: 9, background: C.dark, color: C.goldL, fontSize: 13, fontWeight: 500, border: `1px solid ${C.gold}40` }}>
                    Search
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Unassigned alert */}
          {activeTab === "unassigned" && leads.length > 0 && (
            <div style={{ background: "#fffbeb", border: "1.5px solid #fde68a", borderLeft: `3px solid #d97706`, borderRadius: 10, padding: "11px 18px", marginBottom: 16, fontSize: 13.5, color: "#92400e", fontWeight: 500 }}>
              ⚠️ {leads.length} lead{leads.length > 1 ? "s" : ""} pret{leads.length > 1 ? "ë" : ""} asignimin
            </div>
          )}

          {/* Main card */}
          <div className="al-card">
            {/* Card header */}
            <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}`, background: "#fdf9f4", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.text, fontFamily: "'Cormorant Garamond',Georgia,serif" }}>
                {activeTab === "all"        ? `Të gjitha Leads — ${statusFilter}` : ""}
                {activeTab === "unassigned" ? "Leads pa agjent — Presin asignimin" : ""}
                {activeTab === "property"   ? "Leads by Property" : ""}
              </p>
              {leads.length > 0 && (
                <span style={{ background: `${C.gold}22`, color: C.textSub, padding: "2px 9px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                  {leads.length} leads
                </span>
              )}
            </div>

            {loading ? <Loader /> : leads.length === 0 ? (
              <EmptyState
                icon={activeTab === "unassigned" ? "✅" : activeTab === "property" ? "🔍" : "📭"}
                text={
                  activeTab === "unassigned" ? "Të gjitha leads janë të asignuara" :
                  activeTab === "property"   ? "Shkruaj Property ID dhe kliko Search" :
                  "Nuk ka leads me këtë status"
                }
              />
            ) : (
              <>
                {/* Table */}
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'DM Sans',sans-serif" }}>
                    <thead>
                      <tr style={{ background: "#f0ece3", borderBottom: `1px solid ${C.border}` }}>
                        {["#", "Tipi", "Klienti", "Agjenti", "Prona", "Burimi", "Statusi", "Krijuar", "Veprime"].map(h => (
                          <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 10, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.7px", whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {leads.map(lead => (
                        <tr key={lead.id} className="al-row" style={{ borderBottom: `1px solid ${C.border}` }}>
                          <td style={{ padding: "13px 14px", color: C.textMut, fontSize: 12 }}>{lead.id}</td>
                          <td style={{ padding: "13px 14px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{ fontSize: 15 }}>{TYPE_ICON[lead.type] || "📋"}</span>
                              <span style={{ fontWeight: 500, fontSize: 13, color: C.text }}>{lead.type}</span>
                            </div>
                          </td>
                          <td style={{ padding: "13px 14px" }}>
                            <p style={{ fontWeight: 500, fontSize: 13, margin: 0, color: C.text }}>{lead.client_name || `#${lead.client_id}`}</p>
                          </td>
                          <td style={{ padding: "13px 14px" }}>
                            {lead.agent_name
                              ? <p style={{ fontWeight: 500, fontSize: 13, margin: 0, color: "#059669" }}>{lead.agent_name}</p>
                              : <span style={{ fontSize: 11, color: "#ea580c", background: "#fff7ed", padding: "2px 8px", borderRadius: 20, fontWeight: 600 }}>Pa agjent</span>}
                          </td>
                          <td style={{ padding: "13px 14px", fontSize: 12.5, color: C.textSub }}>
                            {lead.property_title || (lead.property_id ? `#${lead.property_id}` : "—")}
                          </td>
                          <td style={{ padding: "13px 14px", fontSize: 12.5, color: C.textSub }}>
                            {SOURCE_ICON[lead.source]} {lead.source}
                          </td>
                          <td style={{ padding: "13px 14px" }}><StatusBadge status={lead.status} /></td>
                          <td style={{ padding: "13px 14px", fontSize: 12, color: C.textMut }}>{fmtDate(lead.created_at)}</td>
                          <td style={{ padding: "13px 14px" }}>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                              <button className="al-btn" onClick={() => setSelectedLead(lead)}
                                style={{ padding: "5px 12px", borderRadius: 7, border: `1.5px solid ${C.border}`, background: "transparent", color: C.textSub, fontSize: 12, fontWeight: 500 }}>
                                View
                              </button>
                              {lead.status !== "DONE" && lead.status !== "REJECTED" && (
                                <>
                                  <button className="al-btn" onClick={() => setAssignTarget(lead)}
                                    style={{ padding: "5px 12px", borderRadius: 7, background: C.dark, color: C.goldL, fontSize: 12, fontWeight: 500, border: `1px solid ${C.gold}40` }}>
                                    {lead.assigned_agent_id ? "↩ Reassign" : "👤 Assign"}
                                  </button>
                                  <button className="al-btn" onClick={() => setStatusTarget(lead)}
                                    style={{ padding: "5px 12px", borderRadius: 7, border: `1.5px solid ${C.border}`, background: C.surface, color: C.textSub, fontSize: 12, fontWeight: 500 }}>
                                    Status
                                  </button>
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

          {/* Status legend */}
          <div style={{ marginTop: 20, display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            {Object.entries(STATUS_STYLE).map(([key, s]) => (
              <span key={key} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: s.bg, color: s.color, padding: "4px 12px", borderRadius: 20, fontSize: 11.5, fontWeight: 500 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.color, display: "inline-block" }} />
                {s.label}
              </span>
            ))}
          </div>
        </div>

        {/* Modals */}
        {selectedLead && (
          <LeadDetailModal lead={selectedLead} onClose={() => setSelectedLead(null)} onAssign={setAssignTarget} onStatusChange={setStatusTarget} />
        )}
        {assignTarget && (
          <AssignModal lead={assignTarget} onClose={() => setAssignTarget(null)}
            onSuccess={() => handleSuccess(`Lead #${assignTarget.id} u asignua me sukses`)} notify={notify} />
        )}
        {statusTarget && (
          <StatusModal lead={statusTarget} onClose={() => setStatusTarget(null)}
            onSuccess={() => handleSuccess(`Statusi i Lead #${statusTarget.id} u ndryshua`)} notify={notify} />
        )}

        {toast && <Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
      </div>
    </MainLayout>
  );
}