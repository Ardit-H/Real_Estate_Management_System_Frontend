import { useState, useEffect, useContext, useCallback } from "react";
import MainLayout from "../../components/layout/Layout";
import { AuthContext } from "../../context/AuthProvider";
import api from "../../api/axios";

import "../../styles/admin/AdminAllAgents.css";
import AgentsStats          from "../../components/admin/agents/AgentsStats";
import AgentsToolbar        from "../../components/admin/agents/AgentsToolbar";
import AgentsTable          from "../../components/admin/agents/AgentsTable";
import AgentViewModal       from "../../components/admin/agents/AgentViewModal";
import AgentImpersonateModal from "../../components/admin/agents/AgentImpersonateModal";
import { getFullName }      from "../../components/admin/agents/agentsHelpers";

export default function AdminAllAgents() {
  const { startImpersonation } = useContext(AuthContext);

  const [agents,        setAgents]        = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState("");
  const [filterActive,  setFilterActive]  = useState(null);
  const [viewTarget,    setViewTarget]    = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [impersonating, setImpersonating] = useState(false);
  const [togglingId,    setTogglingId]    = useState(null);
  const [toast,         setToast]         = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchAgents = useCallback(async () => {
    setLoading(true);
    try {
      const usersRes   = await api.get("/api/users");
      const agentUsers = (usersRes.data || []).filter(u => u.role?.toLowerCase() === "agent");

      const withProfiles = await Promise.allSettled(
        agentUsers.map(async (u) => {
          try {
            const r = await api.get(`/api/users/agents/${u.id}`, { validateStatus: s => s < 500 });
            return { ...u, profile: r.status === 200 ? r.data : null };
          } catch {
            return { ...u, profile: null };
          }
        })
      );

      setAgents(withProfiles.map(r => r.status === "fulfilled" ? r.value : { ...r.reason, profile: null }));
    } catch {
      showToast("Failed to load agents", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAgents(); }, [fetchAgents]);

  const filtered = agents.filter(a => {
    const q    = search.toLowerCase();
    const name = getFullName(a).toLowerCase();
    const matchSearch = !q ||
      name.includes(q) ||
      a.email?.toLowerCase().includes(q) ||
      a.profile?.specialization?.toLowerCase().includes(q);
    const matchActive = filterActive === null || a.is_active === filterActive;
    return matchSearch && matchActive;
  });

  const stats = {
    total:    agents.length,
    active:   agents.filter(a => a.is_active).length,
    inactive: agents.filter(a => !a.is_active).length,
    avgRating: (() => {
      const rated = agents.filter(a => a.profile?.rating);
      if (!rated.length) return "—";
      return (rated.reduce((s, a) => s + parseFloat(a.profile.rating), 0) / rated.length).toFixed(1);
    })(),
  };

  const handleImpersonate = async () => {
    if (!confirmTarget) return;
    setImpersonating(true);
    try {
      await startImpersonation(confirmTarget.id);
      showToast(`Now acting as ${confirmTarget.email}`);
      setConfirmTarget(null);
    } catch {
      showToast("Impersonation failed", "error");
    } finally {
      setImpersonating(false);
    }
  };

  const handleToggleActive = async (agent) => {
    setTogglingId(agent.id);
    try {
      await api.patch(`/api/users/${agent.id}/status`, { is_active: !agent.is_active });
      showToast(`${getFullName(agent)} ${!agent.is_active ? "activated" : "deactivated"} successfully`);
      await fetchAgents();
    } catch {
      showToast("Failed to update status", "error");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <MainLayout role="admin">
      <div className="aa-root">

        <div className="aa-header">
          <p className="aa-eyebrow">Team Management</p>
          <h1 className="aa-title">All <span>Agents</span></h1>
          <p className="aa-subtitle">Manage and monitor all real estate agents in your company</p>
        </div>

        <AgentsStats stats={stats} />

        <AgentsToolbar
          search={search}
          setSearch={setSearch}
          filterActive={filterActive}
          setFilterActive={setFilterActive}
          count={filtered.length}
        />

        <div className="aa-table-wrap">
          <AgentsTable
            agents={filtered}
            loading={loading}
            onView={setViewTarget}
            onImpersonate={setConfirmTarget}
            onToggleActive={handleToggleActive}
            togglingId={togglingId}
          />
        </div>

      </div>

      {viewTarget && (
        <AgentViewModal
          agent={viewTarget}
          onClose={() => setViewTarget(null)}
          onImpersonate={setConfirmTarget}
          onToggleActive={handleToggleActive}
        />
      )}

      {confirmTarget && (
        <AgentImpersonateModal
          agent={confirmTarget}
          onClose={() => setConfirmTarget(null)}
          onConfirm={handleImpersonate}
          impersonating={impersonating}
        />
      )}

      {toast && (
        <div className={`aa-toast ${toast.type}`}>
          <span>{toast.type === "success" ? "✅" : "❌"}</span>
          {toast.msg}
        </div>
      )}
    </MainLayout>
  );
}