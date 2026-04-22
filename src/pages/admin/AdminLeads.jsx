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

const TYPE_ICON  = { SELL: "🏷️", BUY: "🏠", RENT: "🔑", VALUATION: "📊" };
const SOURCE_ICON = { WEBSITE: "🌐", PHONE: "📞", EMAIL: "✉️", REFERRAL: "👥", SOCIAL: "📱" };

const fmtDate     = (d) => d ? new Date(d).toLocaleDateString("sq-AL") : "—";
const fmtDateTime = (d) => d ? new Date(d).toLocaleString("sq-AL", {
  day: "2-digit", month: "2-digit", year: "numeric",
  hour: "2-digit", minute: "2-digit",
}) : "—";
const fmtBudget = (v) => v != null ? `€${Number(v).toLocaleString("de-DE")}` : "—";

// ─── Shared UI ────────────────────────────────────────────────────────────────
function Toast({ msg, type = "success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{
      position: "fixed", bottom: 28, right: 28, zIndex: 9999,
      background: type === "error" ? "#fee2e2" : "#ecfdf5",
      color: type === "error" ? "#b91c1c" : "#047857",
      padding: "12px 20px", borderRadius: 10, fontSize: 13.5, fontWeight: 500,
      boxShadow: "0 4px 18px rgba(0,0,0,0.12)", maxWidth: 340,
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
  const s = STATUS_STYLE[status] || { bg: "#f1f5f9", color: "#475569", label: status };
  return (
    <span style={{ background: s.bg, color: s.color, padding: "3px 10px", borderRadius: 20,
      fontSize: 11.5, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 5 }}>
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
      <div style={{ width: "100%", maxWidth: wide ? 640 : 500, background: "#fff",
        borderRadius: 16, boxShadow: "0 20px 60px rgba(15,23,42,0.18)",
        maxHeight: "90vh", overflowY: "auto", animation: "fadeUp .2s ease" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 24px", borderBottom: "1px solid #e8edf4" }}>
          <span style={{ fontWeight: 600, fontSize: 15 }}>{title}</span>
          <button onClick={onClose} style={{ width: 30, height: 30, border: "none",
            background: "none", color: "#94a3b8", cursor: "pointer", fontSize: 16 }}>✕</button>
        </div>
        <div style={{ padding: "22px 24px" }}>{children}</div>
      </div>
    </div>
  );
}

// ─── Assign Agent Modal ───────────────────────────────────────────────────────
function AssignModal({ lead, onClose, onSuccess, notify }) {
  const [agents, setAgents] = useState([]);
  const [agentId, setAgentId] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/api/users/agents")
      .then(r => setAgents(r.data || []))
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
      <div style={{ background: "#f8fafc", borderRadius: 8, padding: "10px 14px",
        marginBottom: 18, fontSize: 13, color: "#475569" }}>
        <strong>{TYPE_ICON[lead.type]} {lead.type}</strong>
        {lead.client_name && ` · Klienti: ${lead.client_name}`}
        {lead.budget && ` · ${fmtBudget(lead.budget)}`}
      </div>
      <Field label="Agjenti" required>
        <select className="form-select" value={agentId}
          onChange={e => setAgentId(e.target.value)}>
          <option value="">— Zgjidh agjentin —</option>
          {agents.map(a => (
            <option key={a.user_id} value={a.user_id}>
              {a.phone ? `Agjent #${a.user_id}` : `Agjent #${a.user_id}`}
              {a.specialization ? ` (${a.specialization})` : ""}
              {a.rating > 0 ? ` ★ ${Number(a.rating).toFixed(1)}` : ""}
            </option>
          ))}
        </select>
      </Field>
      {lead.assigned_agent_id && (
        <p style={{ fontSize: 12.5, color: "#d97706", marginTop: -10, marginBottom: 14 }}>
          ⚠️ Aktualisht asignuar tek:{" "}
          <strong>{lead.agent_name || `#${lead.assigned_agent_id}`}</strong>
          {" "}— do të zëvendësohet.
        </p>
      )}
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button className="btn btn--secondary" onClick={onClose}>Anulo</button>
        <button className="btn btn--primary" onClick={handleSubmit} disabled={saving}>
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

  const ALLOWED = {
    NEW:         ["IN_PROGRESS"],
    IN_PROGRESS: ["DONE", "REJECTED"],
  };
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
        <p style={{ fontSize: 14, color: "#475569", marginBottom: 18 }}>
          Leadi me status <StatusBadge status={lead.status} /> nuk mund të ndryshohet.
        </p>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button className="btn btn--secondary" onClick={onClose}>Mbyll</button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title={`Ndrysho statusin — Lead #${lead.id}`} onClose={onClose}>
      <p style={{ fontSize: 13.5, color: "#475569", marginBottom: 16 }}>
        Statusi aktual: <StatusBadge status={lead.status} />
      </p>
      <Field label="Statusi i ri" required>
        <select className="form-select" value={status}
          onChange={e => setStatus(e.target.value)}>
          {options.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </Field>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button className="btn btn--secondary" onClick={onClose}>Anulo</button>
        <button className={`btn ${status === "REJECTED" ? "btn--danger" : "btn--primary"}`}
          onClick={handleSubmit} disabled={saving}>
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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 20, padding: "12px 16px",
        background: "#f8fafc", borderRadius: 10, border: "1px solid #e8edf4" }}>
        <div>
          <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600,
            textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
            Statusi
          </p>
          <StatusBadge status={lead.status} />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {lead.status !== "DONE" && lead.status !== "REJECTED" && (
            <>
              <button className="btn btn--secondary btn--sm"
                onClick={() => { onClose(); onAssign(lead); }}>
                👤 {lead.assigned_agent_id ? "Reassign" : "Assign"} agjent
              </button>
              <button className="btn btn--primary btn--sm"
                onClick={() => { onClose(); onStatusChange(lead); }}>
                Ndrysho statusin
              </button>
            </>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
        {[
          { label: "Klienti",       value: lead.client_name  || `#${lead.client_id}` },
          { label: "Agjenti",       value: lead.agent_name   || (lead.assigned_agent_id ? `#${lead.assigned_agent_id}` : "—") },
          { label: "Prona",         value: lead.property_title || (lead.property_id ? `#${lead.property_id}` : "—") },
          { label: "Tipi",          value: `${TYPE_ICON[lead.type] || ""} ${lead.type}` },
          { label: "Burimi",        value: `${SOURCE_ICON[lead.source] || ""} ${lead.source}` },
          { label: "Buxheti",       value: fmtBudget(lead.budget) },
          { label: "Data preferuar",value: fmtDate(lead.preferred_date) },
          { label: "Krijuar",       value: fmtDateTime(lead.created_at) },
          { label: "Ndryshuar",     value: fmtDateTime(lead.updated_at) },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: "#f8fafc", borderRadius: 8,
            padding: "10px 14px", border: "1px solid #e8edf4" }}>
            <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600,
              textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{label}</p>
            <p style={{ fontSize: 13.5, fontWeight: 500, color: "#0f172a" }}>{value}</p>
          </div>
        ))}
      </div>

      {lead.message && (
        <div style={{ background: "#f8fafc", border: "1px solid #e8edf4",
          borderRadius: 10, padding: "14px 16px" }}>
          <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600,
            textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
            Mesazhi i klientit
          </p>
          <p style={{ fontSize: 13.5, color: "#374151", lineHeight: 1.6, fontStyle: "italic" }}>
            "{lead.message}"
          </p>
        </div>
      )}
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function AdminLeads() {
  const [activeTab, setActiveTab] = useState("all");  // "all" | "unassigned" | "property"
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState("NEW");
  const [propertyId, setPropertyId] = useState("");
  const [selectedLead, setSelectedLead] = useState(null);
  const [assignTarget, setAssignTarget] = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);
  const [toast, setToast] = useState(null);

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

  // Stats për unassigned badge
  const unassignedCount = activeTab === "unassigned" ? leads.length : null;

  return (
    <MainLayout role="admin">
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px);} to{opacity:1;transform:translateY(0);} }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="page-header">
        <div>
          <h1 className="page-title">Leads Management</h1>
          <p className="page-subtitle">Menaxho të gjitha kërkesat, asigno agjentë dhe gjurmo progresin</p>
        </div>
      </div>

      {/* Flow guide për admin */}
      <div style={{ display: "flex", alignItems: "center", gap: 8,
        marginBottom: 20, padding: "11px 16px",
        background: "#f0f4ff", borderRadius: 10, border: "1px solid #c7d7fe",
        fontSize: 13, flexWrap: "wrap" }}>
        <span>📋</span>
        <span style={{ color: "#3730a3" }}>
          <strong>Flow:</strong> Krijo/Merr lead →
          <strong> Assign agjent</strong> (mbetet NEW) →
          Agent Accept (IN_PROGRESS) →
          Agent Complete (<strong>DONE</strong>) ose Reject (<strong>REJECTED</strong>)
        </span>
        <span style={{ marginLeft: "auto", fontSize: 12, color: "#6366f1" }}>
          Tab <strong>Pa agjent</strong> tregon leads që presin asignimin
        </span>
      </div>

      {/* Tabs + filters */}
      <div style={{ display: "flex", alignItems: "center",
        justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 4, borderBottom: "1px solid #e8edf4", paddingBottom: 0 }}>
          {[
            { id: "all",        label: "Të gjitha",  icon: "📋" },
            { id: "unassigned", label: "Pa agjent",  icon: "⚠️" },
            { id: "property",   label: "By Property",icon: "🏠" },
          ].map(t => (
            <button key={t.id}
              onClick={() => { setActiveTab(t.id); setPage(0); setLeads([]); }}
              style={{ padding: "9px 16px", border: "none",
                borderBottom: activeTab === t.id ? "2px solid #6366f1" : "2px solid transparent",
                background: "none",
                color: activeTab === t.id ? "#6366f1" : "#64748b",
                fontWeight: activeTab === t.id ? 600 : 400,
                fontSize: 13.5, cursor: "pointer", fontFamily: "inherit",
                marginBottom: -1, display: "flex", alignItems: "center", gap: 5 }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {activeTab === "all" && (
            <select className="form-select"
              style={{ height: 34, padding: "0 10px", fontSize: 13, width: 160 }}
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(0); }}>
              {LEAD_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          )}
          {activeTab === "property" && (
            <>
              <input className="form-input"
                style={{ height: 34, padding: "0 10px", fontSize: 13, width: 130 }}
                type="number" placeholder="Property ID..."
                value={propertyId}
                onChange={e => setPropertyId(e.target.value)}
                onKeyDown={e => e.key === "Enter" && fetchByProperty()} />
              <button className="btn btn--primary btn--sm" onClick={fetchByProperty}>
                Search
              </button>
            </>
          )}
        </div>
      </div>

      {/* Alert për unassigned */}
      {activeTab === "unassigned" && leads.length > 0 && (
        <div style={{ background: "#fffbeb", border: "1px solid #fde68a",
          borderRadius: 10, padding: "11px 18px", marginBottom: 16,
          fontSize: 13.5, color: "#92400e", fontWeight: 500 }}>
          ⚠️ {leads.length} lead{leads.length > 1 ? "s" : ""} pret{leads.length > 1 ? "ë" : ""} asignimin
        </div>
      )}

      {/* Table */}
      <div className="card">
        <div className="card__header">
          <h2 className="card__title">
            {activeTab === "all"        ? `Të gjitha Leads — ${statusFilter}` : ""}
            {activeTab === "unassigned" ? "Leads pa agjent — Presin asignimin" : ""}
            {activeTab === "property"   ? "Leads by Property" : ""}
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
            icon={activeTab === "unassigned" ? "✅" : activeTab === "property" ? "🔍" : "📭"}
            text={
              activeTab === "unassigned" ? "Të gjitha leads janë të asignuara" :
              activeTab === "property"   ? "Shkruaj Property ID dhe kliko Search" :
              "Nuk ka leads me këtë status"
            }
          />
        ) : (
          <>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Tipi</th>
                    <th>Klienti</th>
                    <th>Agjenti</th>
                    <th>Prona</th>
                    <th>Buxheti</th>
                    <th>Burimi</th>
                    <th>Statusi</th>
                    <th>Krijuar</th>
                    <th>Veprime</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map(lead => (
                    <tr key={lead.id}>
                      <td style={{ color: "#94a3b8", fontSize: 12 }}>{lead.id}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 16 }}>{TYPE_ICON[lead.type] || "📋"}</span>
                          <span style={{ fontWeight: 500, fontSize: 13 }}>{lead.type}</span>
                        </div>
                      </td>
                      <td>
                        <p style={{ fontWeight: 500, fontSize: 13, margin: 0 }}>
                          {lead.client_name || `#${lead.client_id}`}
                        </p>
                      </td>
                      <td>
                        {lead.agent_name
                          ? <p style={{ fontWeight: 500, fontSize: 13, margin: 0, color: "#059669" }}>
                              {lead.agent_name}
                            </p>
                          : <span style={{ fontSize: 12, color: "#ea580c",
                              background: "#fff7ed", padding: "2px 8px",
                              borderRadius: 20, fontWeight: 500 }}>
                              Pa agjent
                            </span>}
                      </td>
                      <td style={{ fontSize: 12.5, color: "#475569" }}>
                        {lead.property_title || (lead.property_id ? `#${lead.property_id}` : "—")}
                      </td>
                      <td style={{ fontWeight: 600, fontSize: 13 }}>{fmtBudget(lead.budget)}</td>
                      <td style={{ fontSize: 12.5, color: "#64748b" }}>
                        {SOURCE_ICON[lead.source]} {lead.source}
                      </td>
                      <td><StatusBadge status={lead.status} /></td>
                      <td style={{ fontSize: 12, color: "#94a3b8" }}>{fmtDate(lead.created_at)}</td>
                      <td>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          <button className="btn btn--ghost btn--sm"
                            onClick={() => setSelectedLead(lead)}>View</button>
                          {lead.status !== "DONE" && lead.status !== "REJECTED" && (
                            <>
                              <button className="btn btn--primary btn--sm"
                                onClick={() => setAssignTarget(lead)}
                                title={lead.assigned_agent_id ? "Reassign" : "Assign agjent"}>
                                {lead.assigned_agent_id ? "↩ Reassign" : "👤 Assign"}
                              </button>
                              <button className="btn btn--secondary btn--sm"
                                onClick={() => setStatusTarget(lead)}>
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

      {/* Modals */}
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onAssign={setAssignTarget}
          onStatusChange={setStatusTarget}
        />
      )}
      {assignTarget && (
        <AssignModal
          lead={assignTarget}
          onClose={() => setAssignTarget(null)}
          onSuccess={() => handleSuccess(
            `Lead #${assignTarget.id} u asignua me sukses`
          )}
          notify={notify}
        />
      )}
      {statusTarget && (
        <StatusModal
          lead={statusTarget}
          onClose={() => setStatusTarget(null)}
          onSuccess={() => handleSuccess(
            `Statusi i Lead #${statusTarget.id} u ndryshua`
          )}
          notify={notify}
        />
      )}

      {toast && (
        <Toast key={toast.key} msg={toast.msg} type={toast.type}
          onDone={() => setToast(null)} />
      )}
    </MainLayout>
  );
}