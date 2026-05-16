import { useState, useEffect } from "react";
import api from "../../../api/axios";
import { C, CAT_EMOJI, CATEGORIES, PRIORITIES, STATUSES, fmtMoney, fmtDT } from "./maintenanceHelpers";
import { Modal, Field, Row2, PBadge, SBadge } from "./MaintenanceBadges";

export function MaintenanceDetailModal({ item, onClose, onRefresh, notify }) {
  const [tab, setTab] = useState("details");
  const [stForm, setStForm] = useState({ status: item.status, actual_cost: item.actual_cost || "" });
  const [assignId, setAssignId] = useState(item.assigned_to || "");
  const [agents, setAgents] = useState([]);
  const [agentsLoading, setAgentsLoading] = useState(false);
  const [editF, setEditF] = useState({
    title: item.title,
    description: item.description || "",
    category: item.category,
    priority: item.priority,
    estimated_cost: item.estimated_cost || "",
    actual_cost: item.actual_cost || "",
  });
  const [saving, setSaving] = useState(false);

  const done = (msg) => { notify(msg); onRefresh(); onClose(); };

  // Load agents when "assign" tab opens
  useEffect(() => {
    if (tab !== "assign") return;
    setAgentsLoading(true);
    api.get("/api/users/agents/list")
      .then(r => setAgents(r.data || []))
      .catch(() => notify("Gabim në ngarkimin e agjentëve", "error"))
      .finally(() => setAgentsLoading(false));
  }, [tab]);

  const updateStatus = async () => {
    setSaving(true);
    try {
      await api.patch(`/api/maintenance/${item.id}/status`, {
        status: stForm.status,
        actual_cost: stForm.actual_cost ? Number(stForm.actual_cost) : null,
      });
      done("Status updated ✓");
    } catch (err) {
      notify(err.response?.data?.message || "Error", "error");
    } finally {
      setSaving(false);
    }
  };

  const assign = async () => {
    if (!assignId) { notify("Zgjidh një agjent", "error"); return; }
    setSaving(true);
    try {
      await api.patch(`/api/maintenance/${item.id}/assign`, { assigned_to: Number(assignId) });
      done("Assigned ✓");
    } catch (err) {
      notify(err.response?.data?.message || "Error", "error");
    } finally {
      setSaving(false);
    }
  };

  const edit = async () => {
    setSaving(true);
    try {
      await api.put(`/api/maintenance/${item.id}`, {
        title: editF.title,
        description: editF.description || null,
        category: editF.category,
        priority: editF.priority,
        estimated_cost: editF.estimated_cost ? Number(editF.estimated_cost) : null,
        actual_cost: editF.actual_cost ? Number(editF.actual_cost) : null,
      });
      done("Saved ✓");
    } catch (err) {
      notify(err.response?.data?.message || "Error", "error");
    } finally {
      setSaving(false);
    }
  };

  const TABS = [
    { id: "details", label: "Details" },
    { id: "status",  label: "Update Status" },
    { id: "assign",  label: "Assign" },
    { id: "edit",    label: "Edit" },
  ];

  return (
    <Modal title={`Request #${item.id} — ${item.title}`} onClose={onClose} wide>
      {/* Tab Bar */}
      <div style={{ display: "flex", gap: 2, borderBottom: `1px solid ${C.border}`, marginBottom: 20, marginTop: -4 }}>
        {TABS.map(t => (
          <button
            key={t.id}
            className="ad-btn"
            onClick={() => setTab(t.id)}
            style={{
              padding: "8px 14px", background: "none",
              color: tab === t.id ? C.dark : C.muted,
              fontWeight: tab === t.id ? 600 : 400,
              fontSize: 13,
              borderBottom: tab === t.id ? `2px solid ${C.gold}` : "2px solid transparent",
              marginBottom: -1,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Details Tab */}
      {tab === "details" && (
        <div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
            <PBadge p={item.priority} />
            <SBadge s={item.status} />
            <span style={{ background: "#f0ece3", color: C.textSub, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
              {CAT_EMOJI[item.category]} {item.category}
            </span>
          </div>

          {item.description && (
            <p style={{ fontSize: 13.5, color: C.textSub, lineHeight: 1.7, marginBottom: 16, padding: "12px 14px", background: "#f5f0e8", borderRadius: 10 }}>
              {item.description}
            </p>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              ["Property ID",   `#${item.property_id}`],
              ["Lease ID",      item.lease_id ? `#${item.lease_id}` : "—"],
              ["Requested By",  item.requested_by ? `User #${item.requested_by}` : "—"],
              ["Assigned To",   item.assigned_to ? `User #${item.assigned_to}` : "Unassigned"],
              ["Estimated Cost", fmtMoney(item.estimated_cost)],
              ["Actual Cost",   fmtMoney(item.actual_cost)],
              ["Created",       fmtDT(item.created_at)],
              ["Completed",     fmtDT(item.completed_at)],
            ].map(([l, v]) => (
              <div key={l} style={{ background: "#f5f0e8", borderRadius: 10, padding: "10px 14px" }}>
                <p style={{ margin: 0, fontSize: 10, fontWeight: 600, color: C.textMut, textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 4 }}>{l}</p>
                <p style={{ margin: 0, fontSize: 13.5, fontWeight: 500, color: C.text }}>{v}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status Tab */}
      {tab === "status" && (
        <div>
          <Field label="New Status">
            <select className="ad-in" value={stForm.status} onChange={e => setStForm(p => ({ ...p, status: e.target.value }))}>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Actual Cost (€)">
            <input className="ad-in" type="number" min="0" step="0.01" value={stForm.actual_cost} onChange={e => setStForm(p => ({ ...p, actual_cost: e.target.value }))} />
          </Field>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button className="ad-btn" onClick={onClose} style={{ padding: "10px 18px", borderRadius: 10, border: "1.5px solid #e4ddd0", background: "transparent", color: C.textSub, fontSize: 13 }}>Cancel</button>
            <button className="ad-btn" onClick={updateStatus} disabled={saving} style={{ padding: "10px 22px", borderRadius: 10, background: `linear-gradient(135deg,${C.gold},#b0983e)`, color: C.dark, fontSize: 13, fontWeight: 700 }}>
              {saving ? "Updating..." : "Update Status"}
            </button>
          </div>
        </div>
      )}

      {/* Assign Tab */}
      {tab === "assign" && (
        <div>
          <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "12px 14px", marginBottom: 16, fontSize: 13, color: "#1d4ed8" }}>
            💡 Admin mund të caktojë çdo agjent. Caktimi e vendos statusin në IN_PROGRESS automatikisht.
          </div>
          <Field label="Cakto te Agjenti">
            {agentsLoading
              ? <div style={{ padding: "10px 13px", border: "1.5px solid #e4ddd0", borderRadius: 10, fontSize: 13, color: C.muted, background: "#fafafa" }}>Duke ngarkuar agjentët...</div>
              : (
                <select className="ad-in" value={assignId} onChange={e => setAssignId(e.target.value)}>
                  <option value="">— Zgjidh agjentin —</option>
                  {agents.map(a => (
                    <option key={a.id} value={a.id}>{a.first_name} {a.last_name} (#{a.id})</option>
                  ))}
                </select>
              )
            }
          </Field>
          {assignId && agents.length > 0 && (() => {
            const a = agents.find(x => String(x.id) === String(assignId));
            return a ? (
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#166534", marginBottom: 4 }}>
                ✓ {a.first_name} {a.last_name} do të caktohet (ID: #{a.id})
              </div>
            ) : null;
          })()}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 14 }}>
            <button className="ad-btn" onClick={onClose} style={{ padding: "10px 18px", borderRadius: 10, border: "1.5px solid #e4ddd0", background: "transparent", color: C.textSub, fontSize: 13 }}>Cancel</button>
            <button className="ad-btn" onClick={assign} disabled={saving || !assignId} style={{ padding: "10px 22px", borderRadius: 10, background: C.dark, color: "#f5f0e8", fontSize: 13, fontWeight: 600, opacity: !assignId ? .5 : 1 }}>
              {saving ? "Duke caktuar..." : "Cakto Agjentin"}
            </button>
          </div>
        </div>
      )}

      {/* Edit Tab */}
      {tab === "edit" && (
        <div>
          <Field label="Title" required>
            <input className="ad-in" value={editF.title} onChange={e => setEditF(p => ({ ...p, title: e.target.value }))} maxLength={255} />
          </Field>
          <Field label="Description">
            <textarea className="ad-in" rows={3} value={editF.description} onChange={e => setEditF(p => ({ ...p, description: e.target.value }))} style={{ resize: "vertical" }} />
          </Field>
          <Row2>
            <Field label="Category">
              <select className="ad-in" value={editF.category} onChange={e => setEditF(p => ({ ...p, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Priority">
              <select className="ad-in" value={editF.priority} onChange={e => setEditF(p => ({ ...p, priority: e.target.value }))}>
                {PRIORITIES.map(p => <option key={p}>{p}</option>)}
              </select>
            </Field>
          </Row2>
          <Row2>
            <Field label="Estimated Cost (€)">
              <input className="ad-in" type="number" min="0" step="0.01" value={editF.estimated_cost} onChange={e => setEditF(p => ({ ...p, estimated_cost: e.target.value }))} />
            </Field>
            <Field label="Actual Cost (€)">
              <input className="ad-in" type="number" min="0" step="0.01" value={editF.actual_cost} onChange={e => setEditF(p => ({ ...p, actual_cost: e.target.value }))} />
            </Field>
          </Row2>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button className="ad-btn" onClick={onClose} style={{ padding: "10px 18px", borderRadius: 10, border: "1.5px solid #e4ddd0", background: "transparent", color: C.textSub, fontSize: 13 }}>Cancel</button>
            <button className="ad-btn" onClick={edit} disabled={saving} style={{ padding: "10px 22px", borderRadius: 10, background: `linear-gradient(135deg,${C.gold},#b0983e)`, color: C.dark, fontSize: 13, fontWeight: 700 }}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}