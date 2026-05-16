import { useState, useEffect, useContext, useCallback } from "react";
import MainLayout from "../../components/layout/Layout";
import { AuthContext } from "../../context/AuthProvider";
import api from "../../api/axios";

import "../../styles/admin/AdminAllClients.css";
import ClientsStats           from "../../components/admin/clients/ClientsStats";
import ClientsToolbar         from "../../components/admin/clients/ClientsToolbar";
import ClientsTable           from "../../components/admin/clients/ClientsTable";
import ClientViewModal        from "../../components/admin/clients/ClientViewModal";
import ClientImpersonateModal from "../../components/admin/clients/ClientImpersonateModal";
import { getFullName }        from "../../components/admin/clients/clientsHelpers";

export default function AdminAllClients() {
  const { user, startImpersonation } = useContext(AuthContext);

  const [clients,       setClients]       = useState([]);
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

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const usersRes    = await api.get("/api/users");
      const clientUsers = (usersRes.data || []).filter(u => u.role?.toLowerCase() === "client");

      const withProfiles = await Promise.allSettled(
        clientUsers.map(async (u) => {
          try {
            const r = await api.get(`/api/users/clients/${u.id}`, { validateStatus: s => s < 500 });
            return { ...u, profile: r.status === 200 ? r.data : null };
          } catch {
            return { ...u, profile: null };
          }
        })
      );

      setClients(withProfiles.map(r => r.status === "fulfilled" ? r.value : { ...r.reason, profile: null }));
    } catch {
      showToast("Failed to load clients", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  const filtered = clients.filter(c => {
    const q    = search.toLowerCase();
    const name = getFullName(c).toLowerCase();
    const matchSearch = !q ||
      name.includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.profile?.preferred_city?.toLowerCase().includes(q);
    const matchActive = filterActive === null || c.is_active === filterActive;
    return matchSearch && matchActive;
  });

  const stats = {
    total:       clients.length,
    active:      clients.filter(c => c.is_active).length,
    inactive:    clients.filter(c => !c.is_active).length,
    withProfile: clients.filter(c => c.profile !== null).length,
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

  const handleToggleActive = async (client) => {
    setTogglingId(client.id);
    try {
      await api.patch(`/api/users/${client.id}/status`, { is_active: !client.is_active });
      showToast(`${getFullName(client)} ${!client.is_active ? "activated" : "deactivated"} successfully`);
      await fetchClients();
    } catch {
      showToast("Failed to update status", "error");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <MainLayout role="admin">
      <div className="ac-root">

        <div className="ac-header">
          <p className="ac-eyebrow">Client Management</p>
          <h1 className="ac-title">All <span>Clients</span></h1>
          <p className="ac-subtitle">View and manage all registered clients in your company</p>
        </div>

        <ClientsStats stats={stats} />

        <ClientsToolbar
          search={search}
          setSearch={setSearch}
          filterActive={filterActive}
          setFilterActive={setFilterActive}
          count={filtered.length}
          tenantSlug={user?.tenantSlug}
        />

        <div className="ac-table-wrap">
          <ClientsTable
            clients={filtered}
            loading={loading}
            onView={setViewTarget}
            onImpersonate={setConfirmTarget}
            onToggleActive={handleToggleActive}
            togglingId={togglingId}
          />
        </div>

      </div>

      {viewTarget && (
        <ClientViewModal
          client={viewTarget}
          onClose={() => setViewTarget(null)}
          onImpersonate={setConfirmTarget}
          onToggleActive={handleToggleActive}
        />
      )}

      {confirmTarget && (
        <ClientImpersonateModal
          client={confirmTarget}
          onClose={() => setConfirmTarget(null)}
          onConfirm={handleImpersonate}
          impersonating={impersonating}
        />
      )}

      {toast && (
        <div className={`ac-toast ${toast.type}`}>
          <span>{toast.type === "success" ? "✅" : "❌"}</span>
          {toast.msg}
        </div>
      )}
    </MainLayout>
  );
}