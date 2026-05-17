import { useState, useEffect } from "react";
import api from "../../../api/axios";
import { C, TYPE_ICON, SOURCE_ICON, fmtDate, fmtDateTime } from "./leadsConstants.js";
import { Modal, Field, StatusBadge } from "./LeadsUI.jsx";
 
export function AssignModal({ lead, onClose, onSuccess, notify }) {
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
          return { ...p, full_name: u ? `${u.first_name} ${u.last_name}`.trim() : `Agent #${p.user_id}` };
        });
        setAgents(merged);
      })
      .catch(() => notify("Error loading agents", "error"));
  }, [notify]);
 
  const handleSubmit = async () => {
    if (!agentId) { notify("Select an agent", "error"); return; }
    setSaving(true);
    try {
      await api.patch(`/api/leads/${lead.id}/assign`, { agent_id: Number(agentId) });
      onSuccess();
    } catch (err) {
      notify(err.response?.data?.message || "Error assigning agent", "error");
    } finally {
      setSaving(false);
    }
  };
 
  return (
    <Modal title={`Assign agent — Lead #${lead.id}`} onClose={onClose}>
      <div style={{ background: "#f0ece3", borderRadius: 9, padding: "10px 14px", marginBottom: 18, fontSize: 13, color: C.textSub, border: `1px solid ${C.border}` }}>
        <strong>{TYPE_ICON[lead.type]} {lead.type}</strong>
        {lead.client_name && ` · Client: ${lead.client_name}`}
      </div>
      <Field label="Agent" required>
        <select style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: `1.5px solid ${C.border}`, background: C.surface, fontSize: 13, color: C.text, fontFamily: "'DM Sans',sans-serif" }}
          value={agentId} onChange={e => setAgentId(e.target.value)}>
          <option value="">— Select agent —</option>
          {agents.map(a => (
            <option key={a.user_id} value={a.user_id}>
              {a.full_name}{a.specialization ? ` (${a.specialization})` : ""}{a.rating > 0 ? ` ★ ${Number(a.rating).toFixed(1)}` : ""}
            </option>
          ))}
        </select>
      </Field>
      {lead.assigned_agent_id && (
        <p style={{ fontSize: 12.5, color: "#d97706", marginTop: -8, marginBottom: 14 }}>
          ⚠️ Currently assigned to: <strong>{lead.agent_name || `#${lead.assigned_agent_id}`}</strong> — will be replaced.
        </p>
      )}
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button className="al-btn" onClick={onClose}
          style={{ padding: "8px 16px", borderRadius: 9, border: `1.5px solid ${C.border}`, background: "transparent", color: C.textSub, fontSize: 13, fontWeight: 500 }}>
          Cancel
        </button>
        <button className="al-btn" onClick={handleSubmit} disabled={saving}
          style={{ padding: "8px 18px", borderRadius: 9, background: C.dark, color: C.goldL, fontSize: 13, fontWeight: 500, border: `1px solid ${C.gold}40`, opacity: saving ? .7 : 1 }}>
          {saving ? "Assigning..." : "Assign agent"}
        </button>
      </div>
    </Modal>
  );
}
 
export function StatusModal({ lead, onClose, onSuccess, notify }) {
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
      notify(err.response?.data?.message || "Error", "error");
    } finally {
      setSaving(false);
    }
  };
 
  if (options.length === 0) {
    return (
      <Modal title="Change status" onClose={onClose}>
        <p style={{ fontSize: 14, color: C.textSub, marginBottom: 18 }}>
          Lead with status <StatusBadge status={lead.status} /> cannot be changed.
        </p>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button className="al-btn" onClick={onClose}
            style={{ padding: "8px 16px", borderRadius: 9, border: `1.5px solid ${C.border}`, background: "transparent", color: C.textSub, fontSize: 13, fontWeight: 500 }}>
            Close
          </button>
        </div>
      </Modal>
    );
  }
 
  return (
    <Modal title={`Change status — Lead #${lead.id}`} onClose={onClose}>
      <p style={{ fontSize: 13.5, color: C.textSub, marginBottom: 16 }}>
        Current status: <StatusBadge status={lead.status} />
      </p>
      <Field label="New status" required>
        <select style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: `1.5px solid ${C.border}`, background: C.surface, fontSize: 13, color: C.text, fontFamily: "'DM Sans',sans-serif" }}
          value={status} onChange={e => setStatus(e.target.value)}>
          {options.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </Field>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button className="al-btn" onClick={onClose}
          style={{ padding: "8px 16px", borderRadius: 9, border: `1.5px solid ${C.border}`, background: "transparent", color: C.textSub, fontSize: 13, fontWeight: 500 }}>
          Cancel
        </button>
        <button className="al-btn" onClick={handleSubmit} disabled={saving}
          style={{ padding: "8px 18px", borderRadius: 9, fontSize: 13, fontWeight: 500, border: "none", opacity: saving ? .7 : 1,
            background: status === "REJECTED" ? "#dc2626" : C.dark,
            color: status === "REJECTED" ? "#fff" : C.goldL }}>
          {saving ? "Changing..." : `Confirm → ${status}`}
        </button>
      </div>
    </Modal>
  );
}
 
export function LeadDetailModal({ lead, onClose, onAssign, onStatusChange }) {
  return (
    <Modal title={`Lead #${lead.id} — Details`} onClose={onClose} wide>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, padding: "12px 16px", background: "#f0ece3", borderRadius: 10, border: `1px solid ${C.border}` }}>
        <div>
          <p style={{ fontSize: 9.5, color: C.textMut, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 4px" }}>Status</p>
          <StatusBadge status={lead.status} />
        </div>
        {lead.status !== "DONE" && lead.status !== "REJECTED" && (
          <div style={{ display: "flex", gap: 8 }}>
            <button className="al-btn" onClick={() => { onClose(); onAssign(lead); }}
              style={{ padding: "7px 14px", borderRadius: 9, border: `1.5px solid ${C.border}`, background: C.surface, color: C.textSub, fontSize: 12.5, fontWeight: 500 }}>
              👤 {lead.assigned_agent_id ? "Reassign" : "Assign"} agent
            </button>
            <button className="al-btn" onClick={() => { onClose(); onStatusChange(lead); }}
              style={{ padding: "7px 14px", borderRadius: 9, background: C.dark, color: C.goldL, fontSize: 12.5, fontWeight: 500, border: `1px solid ${C.gold}40` }}>
              Change status
            </button>
          </div>
        )}
      </div>
 
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        {[
          { label: "Client",         value: lead.client_name   || `#${lead.client_id}` },
          { label: "Agent",          value: lead.agent_name    || (lead.assigned_agent_id ? `#${lead.assigned_agent_id}` : "—") },
          { label: "Property",       value: lead.property_title || (lead.property_id ? `#${lead.property_id}` : "—") },
          { label: "Type",           value: `${TYPE_ICON[lead.type] || ""} ${lead.type}` },
          { label: "Source",         value: `${SOURCE_ICON[lead.source] || ""} ${lead.source}` },
          { label: "Preferred date", value: fmtDate(lead.preferred_date) },
          { label: "Created",        value: fmtDateTime(lead.created_at) },
          { label: "Updated",        value: fmtDateTime(lead.updated_at) },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: "#f0ece3", borderRadius: 9, padding: "10px 14px", border: `1px solid ${C.border}` }}>
            <p style={{ fontSize: 9.5, color: C.textMut, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 4px" }}>{label}</p>
            <p style={{ fontSize: 13.5, fontWeight: 500, color: C.text, margin: 0 }}>{value}</p>
          </div>
        ))}
      </div>
 
      {lead.message && (
        <div style={{ background: "#f0ece3", border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px" }}>
          <p style={{ fontSize: 9.5, color: C.textMut, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 8px" }}>Client message</p>
          <p style={{ fontSize: 13.5, color: C.textSub, lineHeight: 1.6, fontStyle: "italic", margin: 0 }}>"{lead.message}"</p>
        </div>
      )}
    </Modal>
  );
}
 