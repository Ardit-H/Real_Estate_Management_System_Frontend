import { useState, useEffect, useCallback } from "react";
import MainLayout from "../../components/layout/Layout";
import api from "../../api/axios";

// ─── Constants ────────────────────────────────────────────────────────────────
const ROLES = ["ALL", "ADMIN", "AGENT", "CLIENT"];

const ROLE_STYLE = {
  ADMIN:  { bg: "#eef2ff", color: "#4338ca", label: "Admin" },
  AGENT:  { bg: "#f0f9ff", color: "#0284c7", label: "Agent" },
  CLIENT: { bg: "#f0fdf4", color: "#15803d", label: "Client" },
};

const STATUS_STYLE = {
  true:  { bg: "#f0fdf4", color: "#15803d", label: "Active" },
  false: { bg: "#fef2f2", color: "#dc2626", label: "Inactive" },
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit", month: "2-digit", year: "numeric",
  }) : "—";

// ─── API helpers — direct calls with full error capture ───────────────────────
// Each returns { ok: true } or { ok: false, message: string }

async function apiChangeRole(userId, newRole) {
  try {
    // Backend: PATCH /api/users/{id}/role
    // Body:    { "role": "AGENT" }   ← UserRoleRequest record field name is "role"
    const res = await api.patch(`/api/users/${userId}/role`, { role: newRole });
    return { ok: true, data: res.data };
  } catch (err) {
    return {
      ok: false,
      message: extractError(err, "Failed to change role"),
      status: err.response?.status,
    };
  }
}

async function apiChangeStatus(userId, isActive) {
  try {
    // Backend: PATCH /api/users/{id}/status
    // Body:    { "is_active": true }  ← @JsonProperty("is_active") on UserStatusRequest.isActive
    const res = await api.patch(`/api/users/${userId}/status`, { is_active: isActive });
    return { ok: true, data: res.data };
  } catch (err) {
    return {
      ok: false,
      message: extractError(err, "Failed to update status"),
      status: err.response?.status,
    };
  }
}

async function apiDeleteUser(userId) {
  try {
    // Backend: DELETE /api/users/{id}   → soft delete (sets deletedAt)
    await api.delete(`/api/users/${userId}`);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      message: extractError(err, "Failed to delete user"),
      status: err.response?.status,
    };
  }
}

function extractError(err, fallback) {
  if (!err.response) return `Network error: ${err.message}`;
  const d = err.response.data;
  if (typeof d === "string") return d;
  if (d?.message) return d.message;
  if (d?.error) return d.error;
  // Validation errors map
  if (d?.errors) return Object.values(d.errors).join(", ");
  return `${fallback} (HTTP ${err.response.status})`;
}

// ─── Shared UI ────────────────────────────────────────────────────────────────
function Toast({ msg, type = "success", onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 4000);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div style={{
      position: "fixed", bottom: 28, right: 28, zIndex: 9999,
      background: type === "error" ? "#fee2e2" : "#ecfdf5",
      color: type === "error" ? "#b91c1c" : "#047857",
      padding: "12px 20px", borderRadius: 10, fontSize: 13.5, fontWeight: 500,
      boxShadow: "0 4px 18px rgba(0,0,0,0.12)", maxWidth: 380,
      borderLeft: `4px solid ${type === "error" ? "#dc2626" : "#059669"}`,
    }}>{msg}</div>
  );
}

function Loader() {
  return (
    <div style={{ textAlign: "center", padding: "52px 0" }}>
      <div style={{
        width: 30, height: 30, margin: "0 auto",
        border: "3px solid #e8edf4", borderTop: "3px solid #6366f1",
        borderRadius: "50%", animation: "spin .7s linear infinite",
      }} />
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

function RoleBadge({ role }) {
  const s = ROLE_STYLE[role] || { bg: "#f1f5f9", color: "#475569", label: role };
  return (
    <span style={{
      background: s.bg, color: s.color, padding: "3px 10px",
      borderRadius: 20, fontSize: 11.5, fontWeight: 600,
      display: "inline-flex", alignItems: "center", gap: 5,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.color, display: "inline-block" }} />
      {s.label}
    </span>
  );
}

function StatusBadge({ active }) {
  const key = String(active);
  const s = STATUS_STYLE[key] || STATUS_STYLE.true;
  return (
    <span style={{
      background: s.bg, color: s.color, padding: "3px 10px",
      borderRadius: 20, fontSize: 11.5, fontWeight: 600,
      display: "inline-flex", alignItems: "center", gap: 5,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.color, display: "inline-block" }} />
      {s.label}
    </span>
  );
}

function Modal({ title, onClose, children, wide = false }) {
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(15,23,42,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        width: "100%", maxWidth: wide ? 640 : 480, background: "#fff",
        borderRadius: 16, boxShadow: "0 20px 60px rgba(15,23,42,0.2)",
        maxHeight: "90vh", overflowY: "auto", animation: "fadeUp .2s ease",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 24px", borderBottom: "1px solid #e8edf4",
        }}>
          <span style={{ fontWeight: 600, fontSize: 15 }}>{title}</span>
          <button onClick={onClose} style={{
            width: 30, height: 30, border: "none",
            background: "none", color: "#94a3b8", cursor: "pointer", fontSize: 18,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>✕</button>
        </div>
        <div style={{ padding: "22px 24px" }}>{children}</div>
      </div>
    </div>
  );
}

// ─── Role Change Modal ────────────────────────────────────────────────────────
function RoleModal({ user, onClose, onSuccess, notify }) {
  const [role, setRole] = useState(user.role);
  const [saving, setSaving] = useState(false);
  const [errDetail, setErrDetail] = useState(null);

  const handleSubmit = async () => {
    if (role === user.role) {
      notify("Select a different role first", "error");
      return;
    }
    setSaving(true);
    setErrDetail(null);

    const result = await apiChangeRole(user.id, role);

    if (result.ok) {
      onSuccess(`${user.first_name} ${user.last_name} role changed to ${role}`);
    } else {
      setErrDetail(result.message);
      notify(result.message, "error");
      setSaving(false);
    }
  };

  return (
    <Modal title={`Change Role — ${user.first_name} ${user.last_name}`} onClose={onClose}>
      <div style={{
        background: "#f8fafc", borderRadius: 8, padding: "10px 14px",
        marginBottom: 18, fontSize: 13, color: "#475569",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        Current role: <RoleBadge role={user.role} />
      </div>

      <div style={{ marginBottom: 18 }}>
        <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
          New Role <span style={{ color: "#ef4444" }}>*</span>
        </label>
        <select
          value={role}
          onChange={e => setRole(e.target.value)}
          style={{
            width: "100%", height: 38, padding: "0 10px", fontSize: 13.5,
            border: "1px solid #d1d5db", borderRadius: 8, background: "#fff",
            color: "#0f172a", cursor: "pointer", outline: "none",
          }}
        >
          {["ADMIN", "AGENT", "CLIENT"].map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {errDetail && (
        <div style={{
          background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8,
          padding: "10px 12px", marginBottom: 14, fontSize: 12.5, color: "#dc2626",
        }}>
          {errDetail}
        </div>
      )}

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button
          onClick={onClose}
          disabled={saving}
          style={{
            padding: "8px 18px", border: "1px solid #d1d5db", borderRadius: 8,
            background: "#fff", color: "#374151", cursor: "pointer", fontSize: 13.5,
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={saving || role === user.role}
          style={{
            padding: "8px 18px", border: "none", borderRadius: 8,
            background: saving || role === user.role ? "#a5b4fc" : "#6366f1",
            color: "#fff", cursor: saving || role === user.role ? "not-allowed" : "pointer",
            fontSize: 13.5, fontWeight: 500,
          }}
        >
          {saving ? "Saving..." : "Confirm"}
        </button>
      </div>
    </Modal>
  );
}

// ─── Status Change Modal ──────────────────────────────────────────────────────
function StatusModal({ user, onClose, onSuccess, notify }) {
  const [saving, setSaving] = useState(false);
  const [errDetail, setErrDetail] = useState(null);
  const newActive = !user.is_active;

  const handleSubmit = async () => {
    setSaving(true);
    setErrDetail(null);

    const result = await apiChangeStatus(user.id, newActive);

    if (result.ok) {
      onSuccess(`${user.first_name} ${user.last_name} ${newActive ? "activated" : "deactivated"}`);
    } else {
      setErrDetail(result.message);
      notify(result.message, "error");
      setSaving(false);
    }
  };

  return (
    <Modal
      title={`${newActive ? "Activate" : "Deactivate"} — ${user.first_name} ${user.last_name}`}
      onClose={onClose}
    >
      <p style={{ fontSize: 14, color: "#475569", marginBottom: 20, lineHeight: 1.65 }}>
        {newActive
          ? `Are you sure you want to activate ${user.first_name} ${user.last_name}? They will be able to log in again.`
          : `Are you sure you want to deactivate ${user.first_name} ${user.last_name}? They will no longer be able to log in.`}
      </p>

      {errDetail && (
        <div style={{
          background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8,
          padding: "10px 12px", marginBottom: 14, fontSize: 12.5, color: "#dc2626",
        }}>
          {errDetail}
        </div>
      )}

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button
          onClick={onClose}
          disabled={saving}
          style={{
            padding: "8px 18px", border: "1px solid #d1d5db", borderRadius: 8,
            background: "#fff", color: "#374151", cursor: "pointer", fontSize: 13.5,
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={saving}
          style={{
            padding: "8px 18px", border: "none", borderRadius: 8,
            background: saving ? "#9ca3af" : (newActive ? "#6366f1" : "#dc2626"),
            color: "#fff", cursor: saving ? "not-allowed" : "pointer",
            fontSize: 13.5, fontWeight: 500,
          }}
        >
          {saving ? "Saving..." : newActive ? "Activate" : "Deactivate"}
        </button>
      </div>
    </Modal>
  );
}

// ─── Delete Modal ─────────────────────────────────────────────────────────────
function DeleteModal({ user, onClose, onSuccess, notify }) {
  const [saving, setSaving] = useState(false);
  const [errDetail, setErrDetail] = useState(null);

  const handleDelete = async () => {
    setSaving(true);
    setErrDetail(null);

    const result = await apiDeleteUser(user.id);

    if (result.ok) {
      onSuccess(`${user.first_name} ${user.last_name} deleted`);
    } else {
      setErrDetail(result.message);
      notify(result.message, "error");
      setSaving(false);
    }
  };

  return (
    <Modal title={`Delete User — ${user.first_name} ${user.last_name}`} onClose={onClose}>
      <div style={{
        background: "#fef2f2", border: "1px solid #fecaca",
        borderRadius: 8, padding: "12px 14px", marginBottom: 16,
        fontSize: 13, color: "#991b1b",
      }}>
        ⚠️ This action cannot be undone. The user will be soft-deleted and will not be able to log in.
      </div>
      <p style={{ fontSize: 13.5, color: "#475569", marginBottom: 20 }}>
        Are you sure you want to delete <strong>{user.first_name} {user.last_name}</strong> ({user.email})?
      </p>

      {errDetail && (
        <div style={{
          background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8,
          padding: "10px 12px", marginBottom: 14, fontSize: 12.5, color: "#dc2626",
        }}>
          {errDetail}
        </div>
      )}

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button
          onClick={onClose}
          disabled={saving}
          style={{
            padding: "8px 18px", border: "1px solid #d1d5db", borderRadius: 8,
            background: "#fff", color: "#374151", cursor: "pointer", fontSize: 13.5,
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleDelete}
          disabled={saving}
          style={{
            padding: "8px 18px", border: "none", borderRadius: 8,
            background: saving ? "#9ca3af" : "#dc2626",
            color: "#fff", cursor: saving ? "not-allowed" : "pointer",
            fontSize: 13.5, fontWeight: 500,
          }}
        >
          {saving ? "Deleting..." : "Confirm Delete"}
        </button>
      </div>
    </Modal>
  );
}

// ─── User Detail Modal ────────────────────────────────────────────────────────
function UserDetailModal({ user, onClose, onRoleChange, onStatusChange, onDelete }) {
  return (
    <Modal title={`User #${user.id} — Details`} onClose={onClose} wide>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
        <div style={{
          width: 52, height: 52, borderRadius: "50%",
          background: ROLE_STYLE[user.role]?.bg || "#f1f5f9",
          color: ROLE_STYLE[user.role]?.color || "#475569",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 600, fontSize: 18, flexShrink: 0,
        }}>
          {(user.first_name?.[0] || "?").toUpperCase()}{(user.last_name?.[0] || "").toUpperCase()}
        </div>
        <div>
          <p style={{ fontWeight: 600, fontSize: 16, margin: 0, color: "#0f172a" }}>
            {user.first_name} {user.last_name}
          </p>
          <p style={{ fontSize: 13, color: "#64748b", margin: "2px 0 0" }}>{user.email}</p>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexShrink: 0 }}>
          <RoleBadge role={user.role} />
          <StatusBadge active={user.is_active} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
        {[
          { label: "ID",        value: user.id },
          { label: "Tenant",    value: `#${user.tenant_id}` },
          { label: "Created",   value: fmtDate(user.created_at) },
          { label: "Role",      value: user.role },
        ].map(({ label, value }) => (
          <div key={label} style={{
            background: "#f8fafc", borderRadius: 8,
            padding: "10px 14px", border: "1px solid #e8edf4",
          }}>
            <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{label}</p>
            <p style={{ fontSize: 13.5, fontWeight: 500, color: "#0f172a", margin: 0 }}>{value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end", paddingTop: 14, borderTop: "1px solid #e8edf4" }}>
        <button
          onClick={() => { onClose(); onRoleChange(user); }}
          style={{ padding: "8px 16px", border: "1px solid #d1d5db", borderRadius: 8, background: "#fff", color: "#374151", cursor: "pointer", fontSize: 13 }}
        >
          Change Role
        </button>
        <button
          onClick={() => { onClose(); onStatusChange(user); }}
          style={{
            padding: "8px 16px", border: "1px solid #d1d5db", borderRadius: 8,
            background: user.is_active ? "#fff7ed" : "#f0fdf4",
            color: user.is_active ? "#c2410c" : "#15803d",
            cursor: "pointer", fontSize: 13,
          }}
        >
          {user.is_active ? "Deactivate" : "Activate"}
        </button>
        <button
          onClick={() => { onClose(); onDelete(user); }}
          style={{ padding: "8px 16px", border: "none", borderRadius: 8, background: "#dc2626", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 500 }}
        >
          Delete
        </button>
      </div>
    </Modal>
  );
}

// ─── Agent Profile Panel ──────────────────────────────────────────────────────
function AgentProfilePanel({ agents }) {
  if (!agents.length) return <EmptyState icon="👥" text="No agent profiles found" />;
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {agents.map(a => (
        <div key={a.user_id} style={{
          background: "#f8fafc", border: "1px solid #e8edf4",
          borderRadius: 10, padding: "14px 16px",
          display: "flex", alignItems: "center", gap: 14,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: "50%",
            background: "#f0f9ff", color: "#0284c7",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 600, fontSize: 15, flexShrink: 0,
          }}>
            {String(a.user_id).slice(-2)}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 600, fontSize: 13.5, margin: 0, color: "#0f172a" }}>Agent #{a.user_id}</p>
            {a.specialization && <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0 0" }}>{a.specialization}</p>}
          </div>
          <div style={{ display: "flex", gap: 12, fontSize: 12, color: "#475569" }}>
            {a.phone && <span>📞 {a.phone}</span>}
            {a.experience_years != null && <span>⏱ {a.experience_years} yrs</span>}
            {a.rating > 0 && <span style={{ color: "#d97706", fontWeight: 600 }}>★ {Number(a.rating).toFixed(1)}</span>}
          </div>
          {a.license && (
            <span style={{ background: "#eef2ff", color: "#4338ca", padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
              {a.license}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Client Profile Panel ─────────────────────────────────────────────────────
function ClientProfilePanel({ clients }) {
  if (!clients.length) return <EmptyState icon="👤" text="No client profiles found" />;
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {clients.map(c => (
        <div key={c.user_id} style={{
          background: "#f8fafc", border: "1px solid #e8edf4",
          borderRadius: 10, padding: "14px 16px",
          display: "flex", alignItems: "center", gap: 14,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: "50%",
            background: "#f0fdf4", color: "#15803d",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 600, fontSize: 15, flexShrink: 0,
          }}>
            {String(c.user_id).slice(-2)}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 600, fontSize: 13.5, margin: 0, color: "#0f172a" }}>Client #{c.user_id}</p>
            {c.preferred_city && <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0 0" }}>📍 {c.preferred_city}</p>}
          </div>
          <div style={{ display: "flex", gap: 12, fontSize: 12, color: "#475569" }}>
            {c.phone && <span>📞 {c.phone}</span>}
            {c.preferred_contact && <span>💬 {c.preferred_contact}</span>}
            {(c.budget_min || c.budget_max) && (
              <span>
                💰 {c.budget_min ? `€${Number(c.budget_min).toLocaleString()}` : "?"} — {c.budget_max ? `€${Number(c.budget_max).toLocaleString()}` : "?"}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function AdminUsers() {
  const [activeTab, setActiveTab]     = useState("users");
  const [users, setUsers]             = useState([]);
  const [agents, setAgents]           = useState([]);
  const [clients, setClients]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [roleFilter, setRoleFilter]   = useState("ALL");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [search, setSearch]           = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [roleTarget, setRoleTarget]   = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast]             = useState(null);

  const notify = useCallback((msg, type = "success") =>
    setToast({ msg, type, key: Date.now() }), []);

  // ── Data fetchers ─────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/users");
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      notify(`Failed to load users: ${extractError(err, "server error")}`, "error");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  const fetchAgents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/users/agents");
      setAgents(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      notify(`Failed to load agents: ${extractError(err, "server error")}`, "error");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/users");
      const all = Array.isArray(res.data) ? res.data : [];
      const clientUsers = all.filter(u => u.role === "CLIENT");
      const profiles = await Promise.all(
        clientUsers.slice(0, 30).map(u =>
          api.get(`/api/users/clients/${u.id}`)
            .then(r => r.data)
            .catch(() => ({ user_id: u.id }))
        )
      );
      setClients(profiles);
    } catch (err) {
      notify(`Failed to load clients: ${extractError(err, "server error")}`, "error");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    if (activeTab === "users")   fetchUsers();
    if (activeTab === "agents")  fetchAgents();
    if (activeTab === "clients") fetchClients();
  }, [activeTab, fetchUsers, fetchAgents, fetchClients]);

  // ── After successful mutation: close all modals + refresh ─────
  const handleSuccess = useCallback((msg) => {
    setRoleTarget(null);
    setStatusTarget(null);
    setDeleteTarget(null);
    setSelectedUser(null);
    notify(msg, "success");
    // Small delay so user sees the toast before table refreshes
    setTimeout(() => fetchUsers(), 300);
  }, [fetchUsers, notify]);

  // ── Filtered users ────────────────────────────────────────────
  const filtered = users.filter(u => {
    if (roleFilter !== "ALL" && u.role !== roleFilter) return false;
    if (activeFilter !== "ALL" && String(u.is_active) !== activeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const name = `${u.first_name || ""} ${u.last_name || ""}`.toLowerCase();
      if (!name.includes(q) && !u.email?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const stats = {
    total:   users.length,
    admins:  users.filter(u => u.role === "ADMIN").length,
    agents:  users.filter(u => u.role === "AGENT").length,
    clients: users.filter(u => u.role === "CLIENT").length,
    active:  users.filter(u => u.is_active).length,
  };

  return (
    <MainLayout role="admin">
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Users Management</h1>
          <p className="page-subtitle">Manage all users, roles, and access within this tenant</p>
        </div>
        <button
          onClick={fetchUsers}
          style={{
            padding: "8px 16px", border: "1px solid #d1d5db", borderRadius: 8,
            background: "#fff", color: "#374151", cursor: "pointer", fontSize: 13,
            display: "flex", alignItems: "center", gap: 6,
          }}
        >
          ↻ Refresh
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Total Users", value: stats.total,   color: "#6366f1", bg: "#eef2ff" },
          { label: "Admins",      value: stats.admins,  color: "#4338ca", bg: "#e8e9fd" },
          { label: "Agents",      value: stats.agents,  color: "#0284c7", bg: "#e0f2fe" },
          { label: "Clients",     value: stats.clients, color: "#15803d", bg: "#dcfce7" },
          { label: "Active",      value: stats.active,  color: "#059669", bg: "#ecfdf5" },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: 10, padding: "14px 16px" }}>
            <p style={{ fontSize: 11, color: s.color, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 4px" }}>
              {s.label}
            </p>
            <p style={{ fontSize: 26, fontWeight: 700, color: s.color, margin: 0 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, borderBottom: "1px solid #e8edf4", marginBottom: 16 }}>
        {[
          { id: "users",   label: "All Users",       icon: "👥" },
          { id: "agents",  label: "Agent Profiles",  icon: "🏢" },
          { id: "clients", label: "Client Profiles", icon: "🤝" },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            padding: "9px 16px", border: "none",
            borderBottom: activeTab === t.id ? "2px solid #6366f1" : "2px solid transparent",
            background: "none",
            color: activeTab === t.id ? "#6366f1" : "#64748b",
            fontWeight: activeTab === t.id ? 600 : 400,
            fontSize: 13.5, cursor: "pointer", fontFamily: "inherit",
            marginBottom: -1, display: "flex", alignItems: "center", gap: 6,
          }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Filters — users tab only */}
      {activeTab === "users" && (
        <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
          <input
            style={{
              height: 36, padding: "0 10px", fontSize: 13, width: 240,
              border: "1px solid #d1d5db", borderRadius: 8, outline: "none",
            }}
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            style={{ height: 36, padding: "0 10px", fontSize: 13, width: 150, border: "1px solid #d1d5db", borderRadius: 8, outline: "none", background: "#fff" }}
          >
            {ROLES.map(r => <option key={r} value={r}>{r === "ALL" ? "All Roles" : r}</option>)}
          </select>
          <select
            value={activeFilter}
            onChange={e => setActiveFilter(e.target.value)}
            style={{ height: 36, padding: "0 10px", fontSize: 13, width: 140, border: "1px solid #d1d5db", borderRadius: 8, outline: "none", background: "#fff" }}
          >
            <option value="ALL">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
          {(roleFilter !== "ALL" || activeFilter !== "ALL" || search) && (
            <button
              onClick={() => { setRoleFilter("ALL"); setActiveFilter("ALL"); setSearch(""); }}
              style={{ padding: "6px 12px", border: "1px solid #d1d5db", borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 13, color: "#6b7280" }}
            >
              ✕ Clear
            </button>
          )}
          <span style={{ marginLeft: "auto", fontSize: 13, color: "#64748b" }}>
            Showing {filtered.length} of {users.length}
          </span>
        </div>
      )}

      {/* Content */}
      <div className="card">
        {/* ── All Users ─────────────────────────────────────── */}
        {activeTab === "users" && (
          <>
            <div className="card__header">
              <h2 className="card__title">All Users</h2>
            </div>

            {loading ? <Loader /> : filtered.length === 0 ? (
              <EmptyState icon="🔍" text="No users match these filters" />
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #e8edf4" }}>
                      {["#", "Name", "Email", "Role", "Status", "Tenant", "Created", "Actions"].map(h => (
                        <th key={h} style={{
                          padding: "10px 14px", textAlign: "left",
                          fontSize: 11.5, fontWeight: 600, color: "#6b7280",
                          textTransform: "uppercase", letterSpacing: "0.05em",
                          whiteSpace: "nowrap",
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(u => (
                      <tr key={u.id} style={{ borderBottom: "1px solid #f1f5f9" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                        onMouseLeave={e => e.currentTarget.style.background = ""}
                      >
                        <td style={{ padding: "12px 14px", color: "#94a3b8", fontSize: 12 }}>{u.id}</td>
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{
                              width: 34, height: 34, borderRadius: "50%",
                              background: ROLE_STYLE[u.role]?.bg || "#f1f5f9",
                              color: ROLE_STYLE[u.role]?.color || "#475569",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontWeight: 600, fontSize: 12, flexShrink: 0,
                            }}>
                              {(u.first_name?.[0] || "?").toUpperCase()}{(u.last_name?.[0] || "").toUpperCase()}
                            </div>
                            <span style={{ fontWeight: 500, color: "#0f172a" }}>
                              {u.first_name} {u.last_name}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: "12px 14px", color: "#475569" }}>{u.email}</td>
                        <td style={{ padding: "12px 14px" }}><RoleBadge role={u.role} /></td>
                        <td style={{ padding: "12px 14px" }}><StatusBadge active={u.is_active} /></td>
                        <td style={{ padding: "12px 14px", color: "#94a3b8", fontSize: 12 }}>#{u.tenant_id}</td>
                        <td style={{ padding: "12px 14px", color: "#94a3b8", fontSize: 12, whiteSpace: "nowrap" }}>
                          {fmtDate(u.created_at)}
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ display: "flex", gap: 6, flexWrap: "nowrap" }}>
                            {/* View */}
                            <button
                              onClick={() => setSelectedUser(u)}
                              style={{ padding: "5px 12px", border: "1px solid #d1d5db", borderRadius: 6, background: "#fff", cursor: "pointer", fontSize: 12.5, color: "#374151", whiteSpace: "nowrap" }}
                            >
                              View
                            </button>
                            {/* Change Role */}
                            <button
                              onClick={() => setRoleTarget({ ...u })}
                              style={{ padding: "5px 12px", border: "1px solid #c7d2fe", borderRadius: 6, background: "#eef2ff", cursor: "pointer", fontSize: 12.5, color: "#4338ca", whiteSpace: "nowrap" }}
                            >
                              Role
                            </button>
                            {/* Activate / Deactivate */}
                            <button
                              onClick={() => setStatusTarget({ ...u })}
                              style={{
                                padding: "5px 12px", border: "none", borderRadius: 6,
                                background: u.is_active ? "#fff7ed" : "#f0fdf4",
                                color: u.is_active ? "#c2410c" : "#15803d",
                                cursor: "pointer", fontSize: 12.5, whiteSpace: "nowrap",
                              }}
                            >
                              {u.is_active ? "Deactivate" : "Activate"}
                            </button>
                            {/* Delete */}
                            <button
                              onClick={() => setDeleteTarget({ ...u })}
                              style={{ padding: "5px 12px", border: "none", borderRadius: 6, background: "#fef2f2", color: "#dc2626", cursor: "pointer", fontSize: 12.5, whiteSpace: "nowrap" }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ── Agent Profiles ───────────────────────────────── */}
        {activeTab === "agents" && (
          <>
            <div className="card__header">
              <h2 className="card__title">Agent Profiles</h2>
            </div>
            {loading ? <Loader /> : (
              <div style={{ padding: "0 16px 16px" }}>
                <AgentProfilePanel agents={agents} />
              </div>
            )}
          </>
        )}

        {/* ── Client Profiles ──────────────────────────────── */}
        {activeTab === "clients" && (
          <>
            <div className="card__header">
              <h2 className="card__title">Client Profiles</h2>
            </div>
            {loading ? <Loader /> : (
              <div style={{ padding: "0 16px 16px" }}>
                <ClientProfilePanel clients={clients} />
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Modals ──────────────────────────────────────────── */}
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onRoleChange={(u) => { setSelectedUser(null); setRoleTarget({ ...u }); }}
          onStatusChange={(u) => { setSelectedUser(null); setStatusTarget({ ...u }); }}
          onDelete={(u) => { setSelectedUser(null); setDeleteTarget({ ...u }); }}
        />
      )}

      {roleTarget && (
        <RoleModal
          user={roleTarget}
          onClose={() => setRoleTarget(null)}
          onSuccess={handleSuccess}
          notify={notify}
        />
      )}

      {statusTarget && (
        <StatusModal
          user={statusTarget}
          onClose={() => setStatusTarget(null)}
          onSuccess={handleSuccess}
          notify={notify}
        />
      )}

      {deleteTarget && (
        <DeleteModal
          user={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onSuccess={handleSuccess}
          notify={notify}
        />
      )}

      {/* ── Toast ───────────────────────────────────────────── */}
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
