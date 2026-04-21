import { useState, useEffect, useCallback, useContext } from "react";
import MainLayout from "../../components/layout/Layout";
import api from "../../api/axios";
import { AuthContext } from "../../context/AuthProvider";

// NDRYSHIM: shtuar DECLINED në statuset e listës
const LEAD_STATUSES = ["NEW", "IN_PROGRESS", "DONE", "REJECTED"];

// NDRYSHIM: shtuar stili për DECLINED
const STATUS_STYLE = {
  NEW:         { bg: "#eff6ff", color: "#2563eb",  label: "New" },
  IN_PROGRESS: { bg: "#f5f3ff", color: "#7c3aed",  label: "In Progress" },
  DONE:        { bg: "#ecfdf5", color: "#059669",  label: "Done" },
  REJECTED:    { bg: "#fef2f2", color: "#dc2626",  label: "Rejected" },
  DECLINED:    { bg: "#fff7ed", color: "#ea580c",  label: "Declined" }, // shtuar
};

const TYPE_ICON   = { SELL: "🏷️", BUY: "🏠", RENT: "🔑", VALUATION: "📊" };
const SOURCE_ICON = { WEBSITE: "🌐", PHONE: "📞", EMAIL: "✉️", REFERRAL: "👥", SOCIAL: "📱" };

const fmtDate     = (d) => d ? new Date(d).toLocaleDateString("sq-AL") : "—";
const fmtDateTime = (d) => d ? new Date(d).toLocaleString("sq-AL", {
  day: "2-digit", month: "2-digit", year: "numeric",
  hour: "2-digit", minute: "2-digit",
}) : "—";
const fmtBudget = (v) => v != null ? `€${Number(v).toLocaleString("de-DE")}` : "—";

// ─── Shared UI ────────────────────────────────────────────────────────────────

function Toast({ msg, type = "success", onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3200);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div style={{
      position: "fixed", bottom: 28, right: 28, zIndex: 9999,
      background: type === "error" ? "#fee2e2" : "#ecfdf5",
      color: type === "error" ? "#b91c1c" : "#047857",
      padding: "12px 20px", borderRadius: 10, fontSize: 13.5, fontWeight: 500,
      boxShadow: "0 4px 18px rgba(0,0,0,0.12)", maxWidth: 340,
      animation: "fadeUp .25s ease",
    }}>{msg}</div>
  );
}

function Loader() {
  return (
    <div style={{ textAlign: "center", padding: "60px 0" }}>
      <div style={{
        width: 32, height: 32, margin: "0 auto",
        border: "3px solid #e8edf4", borderTop: "3px solid #6366f1",
        borderRadius: "50%", animation: "spin 0.7s linear infinite",
      }} />
    </div>
  );
}

function EmptyState({ icon, text, subtext }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px", color: "#94a3b8" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
      <p style={{ fontSize: 15, fontWeight: 500, color: "#64748b", marginBottom: 4 }}>{text}</p>
      {subtext && <p style={{ fontSize: 13 }}>{subtext}</p>}
    </div>
  );
}

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || { bg: "#f1f5f9", color: "#475569", label: status };
  return (
    <span style={{
      background: s.bg, color: s.color, padding: "3px 10px", borderRadius: 20,
      fontSize: 11.5, fontWeight: 600,
      display: "inline-flex", alignItems: "center", gap: 5,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%",
        background: s.color, display: "inline-block" }} />
      {s.label}
    </span>
  );
}

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6,
      justifyContent: "flex-end", padding: "14px 16px" }}>
      <button className="btn btn--secondary btn--sm"
        disabled={page === 0} onClick={() => onChange(page - 1)}>← Prev</button>
      <span style={{ fontSize: 13, color: "#64748b", padding: "0 8px" }}>
        {page + 1} / {totalPages}
      </span>
      <button className="btn btn--secondary btn--sm"
        disabled={page >= totalPages - 1} onClick={() => onChange(page + 1)}>Next →</button>
    </div>
  );
}

// ─── NDRYSHIM: StatusActions ──────────────────────────────────────────────────
// Para: kishte Accept + Reject për NEW, Complete + Reject për IN_PROGRESS
//       Por shfaqej edhe në All Leads / By Property (gabim)
// Tani: isMyLead kontrollon ku shfaqen butonat
//       NEW (My Leads):         Accept + Decline (jo Reject)
//       IN_PROGRESS (My Leads): Complete + Reject
//       All Leads / By Property: asnjë buton veprimi

function StatusActions({ lead, onStatusChange, onDecline, loading, isMyLead }) {
  const { status } = lead;

  // DONE dhe REJECTED: finale absolute — asnjë buton
  if (status === "DONE" || status === "REJECTED") {
    return <span style={{ fontSize: 12, color: "#94a3b8", fontStyle: "italic" }}>Final</span>;
  }

  // All Leads / By Property: vetëm info, pa buton veprimi
  // NDRYSHIM: hequr butonat nga kjo pamje — isMyLead = false
  if (!isMyLead) {
  // Dallo: NEW pa agjent vs NEW me agjent (pret pranimin)
  if (status === "NEW" && !lead.assigned_agent_id) {
    return (
      <span style={{
        fontSize: 11.5, color: "#64748b", background: "#f1f5f9",
        padding: "3px 10px", borderRadius: 20,
      }}>
        🕐 Pa asignuar
      </span>
    );
  }
  if (status === "NEW" && lead.assigned_agent_id) {
    return (
      <span style={{
        fontSize: 11.5, color: "#d97706", background: "#fffbeb",
        padding: "3px 10px", borderRadius: 20,
      }}>
        ⏳ Pret pranimin
      </span>
    );
  }
  // IN_PROGRESS, DONE, REJECTED — vetëm shiko
  return (
    <span style={{
      fontSize: 11.5, color: "#94a3b8", background: "#f1f5f9",
      padding: "3px 10px", borderRadius: 20, fontStyle: "italic",
    }}>
      Vetëm shiko
    </span>
  );
}

  // My Leads — NEW: Accept + Decline
  // NDRYSHIM: shtohet Decline, hiqet Reject nga NEW
  // Logjika: nëse agjenti nuk dëshiron ta marrë, klikon Decline (operacional)
  //          Reject është vetëm pas pranimit (IN_PROGRESS) — vendim biznesi
  if (status === "NEW") {
    return (
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <button
          className="btn btn--primary btn--sm"
          onClick={() => onStatusChange(lead.id, "IN_PROGRESS")}
          disabled={loading}
          title="Prano lead-in dhe fillo punën"
        >
          ▶ Accept
        </button>
        {/* SHTUAR: Decline — kthen lead tek admini si NEW pa agjent */}
        <button
          className="btn btn--secondary btn--sm"
          onClick={() => onDecline(lead.id)}
          disabled={loading}
          title="Nuk mund ta trajtosh? Kthehet tek admini për reassignment"
          style={{ color: "#ea580c", borderColor: "#fed7aa" }}
        >
          ↩ Decline
        </button>
      </div>
    );
  }

  // My Leads — IN_PROGRESS: Complete + Reject
  // NDRYSHIM: Reject mbetet vetëm këtu (pas pranimit — vendim final biznesi)
  if (status === "IN_PROGRESS") {
    return (
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <button
          className="btn btn--sm"
          style={{ background: "#ecfdf5", color: "#059669", border: "1px solid #a7f3d0" }}
          onClick={() => onStatusChange(lead.id, "DONE")}
          disabled={loading}
        >
          ✓ Complete
        </button>
        <button
          className="btn btn--danger btn--sm"
          onClick={() => onStatusChange(lead.id, "REJECTED")}
          disabled={loading}
          title="Refuzo definitivisht — vendim final biznesi"
        >
          ✕ Reject
        </button>
      </div>
    );
  }

  return null;
}

// ─── Lead Detail Modal ────────────────────────────────────────────────────────
// NDRYSHIM: shtohet onDecline prop dhe banner informues sipas statusit

function LeadDetailModal({ lead, onClose, onStatusChange, onDecline, statusLoading, isMyLead }) {
  const { user } = useContext(AuthContext); 
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(15,23,42,0.45)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{
        width: "100%", maxWidth: 580, background: "#fff",
        borderRadius: 16, boxShadow: "0 20px 60px rgba(15,23,42,0.18)",
        maxHeight: "90vh", overflowY: "auto", animation: "fadeUp .2s ease",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 24px", borderBottom: "1px solid #e8edf4",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>{TYPE_ICON[lead.type] || "📋"}</span>
            <div>
              <h3 style={{ fontWeight: 600, fontSize: 15, margin: 0 }}>
                Lead #{lead.id} — {lead.type}
              </h3>
              <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>
                Krijuar: {fmtDateTime(lead.created_at)}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 30, height: 30, border: "none", background: "none",
            color: "#94a3b8", cursor: "pointer", fontSize: 16, borderRadius: 6,
          }}>✕</button>
        </div>

        <div style={{ padding: "22px 24px" }}>

          {/* NDRYSHIM: banner informues sipas kontekstit */}
          {!isMyLead && (
            <div style={{
              background: "#fffbeb", border: "1px solid #fde68a",
              borderRadius: 8, padding: "10px 14px", marginBottom: 18,
              fontSize: 13, color: "#92400e", display: "flex", alignItems: "center", gap: 8,
            }}>
              <span>ℹ️</span>
              <span>
                {!lead.assigned_agent_id
                  ? "Ky lead nuk i është asignuar ende asnjë agjenti."
                  : lead.assigned_agent_id === user?.id
                    ? "Ky lead ju është asignuar juve."           // ← ID e juaja
                    : `Ky lead i është asignuar agjentit ${lead.agent_name}.`}
              </span>
            </div>
          )}

          {/* Status + actions */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: 20, padding: "12px 16px",
            background: "#f8fafc", borderRadius: 10, border: "1px solid #e8edf4",
          }}>
            <div>
              <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600,
                textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>
                Statusi
              </p>
              <StatusBadge status={lead.status} />
            </div>
            {/* NDRYSHIM: passo onDecline */}
            <StatusActions
              lead={lead}
              onStatusChange={onStatusChange}
              onDecline={onDecline}
              loading={statusLoading}
              isMyLead={isMyLead}
            />
          </div>

          {/* Info grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
            {[
              { label: "Klienti",   value: lead.client_name  || `#${lead.client_id}` },
              { label: "Titulli i Pronës",     value: lead.property_title || (lead.property_id ? `#${lead.property_id}` : "—") },
              { label: "Tipi",           value: `${TYPE_ICON[lead.type] || ""} ${lead.type}` },
              { label: "Burimi",         value: `${SOURCE_ICON[lead.source] || ""} ${lead.source}` },
              { label: "Buxheti",        value: fmtBudget(lead.budget) },
              { label: "Data preferuar", value: fmtDate(lead.preferred_date) },
              { label: "Agjenti",   value: lead.agent_name   || (lead.assigned_agent_id ? `#${lead.assigned_agent_id}` : "—") },
              { label: "Ndryshuar më",   value: fmtDateTime(lead.updated_at) },
            ].map(({ label, value }) => (
              <div key={label} style={{
                background: "#f8fafc", borderRadius: 8, padding: "10px 14px",
                border: "1px solid #e8edf4",
              }}>
                <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600,
                  textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                  {label}
                </p>
                <p style={{ fontSize: 13.5, fontWeight: 500, color: "#0f172a" }}>{value}</p>
              </div>
            ))}
          </div>

          {lead.message && (
            <div style={{
              background: "#f8fafc", border: "1px solid #e8edf4",
              borderRadius: 10, padding: "14px 16px",
            }}>
              <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600,
                textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                Mesazhi
              </p>
              <p style={{ fontSize: 13.5, color: "#374151", lineHeight: 1.6 }}>
                {lead.message}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Lead Row ─────────────────────────────────────────────────────────────────
// NDRYSHIM: shtohet onDecline dhe isMyLead prop

function LeadRow({ lead, onView, onStatusChange, onDecline, statusLoading, isMyLead }) {
  return (
    <tr>
      <td style={{ color: "#94a3b8", fontSize: 12 }}>{lead.id}</td>
      <td>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 16 }}>{TYPE_ICON[lead.type] || "📋"}</span>
          <span style={{ fontWeight: 500, fontSize: 13.5 }}>{lead.type}</span>
        </div>
      </td>
      <td>
        <div>
          <p style={{ fontWeight: 500, fontSize: 13, margin: 0 }}>
            {lead.client_name || `#${lead.client_id}`}
          </p>
        </div>
      </td>
      <td>
        {lead.property_title
          ? <span style={{ fontSize: 13 }}>#{lead.property_id}</span>
          : <span style={{ color: "#94a3b8" }}>—</span>}
      </td>
      {/* NDRYSHIM: shfaq kolonën "Agjenti" vetëm jashtë My Leads */}
      {!isMyLead && (
        <td>
          {lead.agent_name
  ? <span style={{ fontWeight: 500, fontSize: 13 }}>{lead.agent_name}</span>
  : <span style={{ color: "#94a3b8", fontSize: 12, fontStyle: "italic" }}>Pa agjent</span>}

        </td>
      )}
      <td style={{ fontSize: 12.5, color: "#64748b" }}>
        {SOURCE_ICON[lead.source]} {lead.source}
      </td>
      <td style={{ fontWeight: 600, fontSize: 13 }}>{fmtBudget(lead.budget)}</td>
      <td><StatusBadge status={lead.status} /></td>
      <td style={{ fontSize: 12, color: "#94a3b8" }}>{fmtDate(lead.created_at)}</td>
      <td>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <button className="btn btn--ghost btn--sm" onClick={() => onView(lead)}>
            View
          </button>
          {/* NDRYSHIM: passo onDecline dhe isMyLead */}
          <StatusActions
            lead={lead}
            onStatusChange={onStatusChange}
            onDecline={onDecline}
            loading={statusLoading}
            isMyLead={isMyLead}
          />
        </div>
      </td>
    </tr>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function AgentLeads() {
  const [activeTab, setActiveTab] = useState("my");
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState("NEW");
  const [propertyId, setPropertyId] = useState("");
  const [selectedLead, setSelectedLead] = useState(null);
  const [toast, setToast] = useState(null);

  // NDRYSHIM: stats — shtuar declined, hequr "new" (normalisht 0 në My Leads)
  const [stats, setStats] = useState({ new: 0, inProgress: 0, done: 0, rejected: 0 });

  const notify = useCallback((msg, type = "success") =>
    setToast({ msg, type, key: Date.now() }), []);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      let url;
      if (activeTab === "my") {
        url = `/api/leads/my/agent?page=${page}&size=15`;
      } else if (activeTab === "all") {
        url = `/api/leads?status=${statusFilter}&page=${page}&size=15`;
      } else {
        setLoading(false);
        return;
      }
      const res  = await api.get(url);
      const data = res.data;
      if (data.content !== undefined) {
        setLeads(data.content || []);
        setTotalPages(data.totalPages || 0);
      } else {
        setLeads(Array.isArray(data) ? data : []);
        setTotalPages(1);
      }
    } catch {
      notify("Gabim gjatë ngarkimit të leads", "error");
    } finally {
      setLoading(false);
    }
  }, [activeTab, page, statusFilter, notify]);

  useEffect(() => {
    if (activeTab !== "property") fetchLeads();
  }, [fetchLeads, activeTab]);

  useEffect(() => {
    if (activeTab === "my") {
      setStats({
        new:        leads.filter((l) => l.status === "NEW").length,
        inProgress: leads.filter((l) => l.status === "IN_PROGRESS").length,
        done:       leads.filter((l) => l.status === "DONE").length,
        rejected:   leads.filter((l) => l.status === "REJECTED").length,
      });
    }
  }, [leads, activeTab]);

  const fetchByProperty = async () => {
    if (!propertyId) { notify("Shkruaj Property ID", "error"); return; }
    setLoading(true);
    try {
      const res = await api.get(`/api/leads/property/${propertyId}`);
      setLeads(Array.isArray(res.data) ? res.data : []);
      setTotalPages(1);
    } catch {
      notify("Gabim ose prona nuk u gjet", "error");
    } finally {
      setLoading(false);
    }
  };

  // ── pa ndryshim ───────────────────────────────────────────────────────────
  const handleStatusChange = async (id, newStatus) => {
    setStatusLoading(true);
    try {
      await api.patch(`/api/leads/${id}/status`, { status: newStatus });
      notify(`Lead #${id} → ${newStatus}`);
      setLeads((prev) => prev.map((l) => l.id === id ? { ...l, status: newStatus } : l));
      if (selectedLead?.id === id) {
        setSelectedLead((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      notify(err.response?.data?.message || "Gabim gjatë ndryshimit të statusit", "error");
    } finally {
      setStatusLoading(false);
    }
  };

  // SHTUAR: handleDecline — thërret PATCH /api/leads/{id}/decline
  const handleDecline = async (id) => {
    setStatusLoading(true);
    try {
      await api.patch(`/api/leads/${id}/decline`);
      notify(`Lead #${id} u kthye tek admini — do të asinohet tek agjent tjetër`);
      // Largo nga lista My Leads — tani nuk i takon këtij agjenti
      setLeads((prev) => prev.filter((l) => l.id !== id));
      if (selectedLead?.id === id) setSelectedLead(null);
    } catch (err) {
      notify(err.response?.data?.message || "Gabim gjatë decline", "error");
    } finally {
      setStatusLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(0);
    setLeads([]);
  };

  const isMyLeadsTab = activeTab === "my";

  // NDRYSHIM: stat cards — shtuar "New" sepse tani agjenti mund të ketë NEW në My Leads
  const statCards = [
    { label: "New",         value: stats.new,        color: "#2563eb", bg: "#eff6ff" },
    { label: "In Progress", value: stats.inProgress,  color: "#7c3aed", bg: "#f5f3ff" },
    { label: "Done",        value: stats.done,        color: "#059669", bg: "#ecfdf5" },
    { label: "Rejected",    value: stats.rejected,    color: "#dc2626", bg: "#fef2f2" },
  ];

  return (
    <MainLayout role="agent">
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px);} to{opacity:1;transform:translateY(0);} }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="page-header">
        <div>
          <h1 className="page-title">Leads Management</h1>
          <p className="page-subtitle">Menaxho kërkesat e klientëve dhe gjurmo progresin</p>
        </div>
      </div>

      {isMyLeadsTab && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
          {statCards.map((s) => (
            <div key={s.label} className="stat-card">
              <div className="stat-card__label">{s.label}</div>
              <div className="stat-card__value" style={{ color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* NDRYSHIM: flow guide i përditësuar me Decline */}
      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        marginBottom: 20, padding: "11px 16px",
        background: isMyLeadsTab ? "#f0fdf4" : "#f0f4ff",
        borderRadius: 10,
        border: `1px solid ${isMyLeadsTab ? "#bbf7d0" : "#c7d7fe"}`,
        fontSize: 13, flexWrap: "wrap",
      }}>
        {isMyLeadsTab ? (
          <>
            <span>🔵 NEW</span>
            <span style={{ color: "#94a3b8" }}>→</span>
            <span style={{ color: "#6366f1", fontWeight: 600 }}>▶ Accept</span>
            <span style={{ color: "#94a3b8" }}>→</span>
            <span>🟣 IN_PROGRESS</span>
            <span style={{ color: "#94a3b8" }}>→</span>
            <span style={{ color: "#059669", fontWeight: 600 }}>✓ Complete</span>
            <span style={{ color: "#94a3b8" }}>→</span>
            <span>🟢 DONE</span>
            <span style={{ color: "#94a3b8", margin: "0 4px" }}>|</span>
            {/* SHTUAR: Decline në flow guide */}
            <span style={{ color: "#ea580c", fontWeight: 600 }}>↩ Decline</span>
            <span style={{ color: "#94a3b8" }}>→ kthehet tek admini</span>
            <span style={{ color: "#94a3b8", margin: "0 4px" }}>|</span>
            <span style={{ color: "#dc2626", fontWeight: 600 }}>✕ Reject</span>
            <span style={{ color: "#94a3b8" }}>→ 🔴 REJECTED (final)</span>
          </>
        ) : (
          <>
            <span>ℹ️</span>
            <span style={{ color: "#3730a3" }}>
              Leads <strong>NEW</strong> presin asignimin nga admini.
              Menaxho leads të tuat nga tab-i <strong>My Leads</strong>.
            </span>
          </>
        )}
      </div>

      {/* Tabs + filters */}
      <div style={{ display: "flex", alignItems: "center",
        justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 4, borderBottom: "1px solid #e8edf4", paddingBottom: 0 }}>
          {[
            { id: "my",       label: "My Leads",    icon: "👤" },
            { id: "all",      label: "All Leads",   icon: "📋" },
            { id: "property", label: "By Property", icon: "🏠" },
          ].map((t) => (
            <button key={t.id} onClick={() => handleTabChange(t.id)} style={{
              padding: "9px 16px", border: "none",
              borderBottom: activeTab === t.id ? "2px solid #6366f1" : "2px solid transparent",
              background: "none",
              color: activeTab === t.id ? "#6366f1" : "#64748b",
              fontWeight: activeTab === t.id ? 600 : 400,
              fontSize: 13.5, cursor: "pointer", fontFamily: "inherit",
              marginBottom: -1, display: "flex", alignItems: "center", gap: 5,
            }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {activeTab === "all" && (
            <select className="form-select"
              style={{ height: 34, padding: "0 10px", fontSize: 13, width: 160 }}
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}>
              {/* NDRYSHIM: shtuar DECLINED në dropdown */}
              {LEAD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          )}
          {activeTab === "property" && (
            <>
              <input className="form-input"
                style={{ height: 34, padding: "0 10px", fontSize: 13, width: 130 }}
                type="number" placeholder="Property ID..."
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchByProperty()} />
              <button className="btn btn--primary btn--sm" onClick={fetchByProperty}>
                Search
              </button>
            </>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card__header">
          <h2 className="card__title">
            {activeTab === "my"       ? "My Assigned Leads" : ""}
            {activeTab === "all"      ? `All Leads — ${statusFilter}` : ""}
            {activeTab === "property" ? "Leads by Property" : ""}
          </h2>
          {leads.length > 0 && (
            <span style={{ background: "#eef2ff", color: "#6366f1",
              padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500 }}>
              {leads.length} leads
            </span>
          )}
        </div>

        {loading ? <Loader /> : leads.length === 0 ? (
          <EmptyState
            icon={activeTab === "property" ? "🔍" : "📭"}
            text={activeTab === "property"
              ? "Shkruaj Property ID dhe kliko Search"
              : "Nuk ka leads në këtë kategori"}
            subtext={activeTab === "my"
              ? "Leads do të shfaqen kur admini t'i asignojë tek ju"
              : undefined}
          />
        ) : (
          <>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ textAlign: "center" }}>#</th>
                    <th style={{ textAlign: "center" }}>Tipi</th>
                    <th style={{ textAlign: "center" }}>Klienti</th>
                    <th style={{ textAlign: "center" }}>ID e Pronës</th>
                    {/* NDRYSHIM: kolona Agjenti vetëm jashtë My Leads */}
                    {!isMyLeadsTab && <th style={{ textAlign: "center" }}>Agjenti</th>}
                    <th style={{ textAlign: "center" }}>Burimi</th>
                    <th style={{ textAlign: "center" }}>Buxheti</th>
                    <th style={{ textAlign: "center" }}>Statusi</th>
                    <th style={{ textAlign: "center" }}>Krijuar</th>
                    <th style={{ textAlign: "center" }}>Veprime</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <LeadRow
                      key={lead.id}
                      lead={lead}
                      onView={setSelectedLead}
                      onStatusChange={handleStatusChange}
                      onDecline={handleDecline}       // SHTUAR
                      statusLoading={statusLoading}
                      isMyLead={isMyLeadsTab}         // SHTUAR
                    />
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </>
        )}
      </div>

      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onStatusChange={handleStatusChange}
          onDecline={handleDecline}             // SHTUAR
          statusLoading={statusLoading}
          isMyLead={isMyLeadsTab}               // SHTUAR
        />
      )}

      {toast && (
        <Toast key={toast.key} msg={toast.msg} type={toast.type}
          onDone={() => setToast(null)} />
      )}
    </MainLayout>
  );
}