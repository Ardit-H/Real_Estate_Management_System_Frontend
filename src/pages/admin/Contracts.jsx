import { useState, useEffect, useCallback } from "react";
import MainLayout from "../../components/layout/Layout";
import api from "../../api/axios";

import "../../styles/admin/AdminContracts.css";
import ContractsStats        from "../../components/admin/contracts/ContractsStats";
import ContractsToolbar      from "../../components/admin/contracts/ContractsToolbar";
import ContractsTable        from "../../components/admin/contracts/ContractsTable";
import ContractViewModal     from "../../components/admin/contracts/ContractViewModal";
import ContractCreateModal   from "../../components/admin/contracts/ContractCreateModal";
import ContractEditModal     from "../../components/admin/contracts/ContractEditModal";
import ContractStatusModal   from "../../components/admin/contracts/ContractStatusModal";

function Toast({ msg, type, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3400); return () => clearTimeout(t); }, [onDone]);
  return <div className={`lc-toast ${type}`}>{type === "success" ? "✅" : "❌"} {msg}</div>;
}

export default function AdminContracts() {
  const [contracts,     setContracts]     = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [page,          setPage]          = useState(0);
  const [totalPages,    setTotalPages]    = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [search,        setSearch]        = useState("");
  const [statusFilter,  setStatusFilter]  = useState("ALL");
  const [expiring,      setExpiring]      = useState([]);

  const [createOpen,   setCreateOpen]   = useState(false);
  const [viewTarget,   setViewTarget]   = useState(null);
  const [editTarget,   setEditTarget]   = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);
  const [detailCache,  setDetailCache]  = useState({});

  const [toast, setToast] = useState(null);
  const notify = (msg, type = "success") => setToast({ msg, type, key: Date.now() });

  const PAGE_SIZE = 10;

  const fetchContracts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/contracts/lease?page=${page}&size=${PAGE_SIZE}`);
      setContracts(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setTotalElements(res.data.totalElements || 0);
    } catch {
      notify("Gabim gjatë ngarkimit të kontratave", "error");
    } finally { setLoading(false); }
  }, [page]);

  const fetchExpiring = useCallback(async () => {
    try {
      const res = await api.get("/api/contracts/lease/expiring");
      setExpiring(Array.isArray(res.data) ? res.data : []);
    } catch {}
  }, []);

  useEffect(() => { fetchContracts(); }, [fetchContracts]);
  useEffect(() => { fetchExpiring(); }, [fetchExpiring]);

  const handleViewContract = async (c) => {
    if (detailCache[c.id]) { setViewTarget(detailCache[c.id]); return; }
    try {
      const res = await api.get(`/api/contracts/lease/${c.id}`);
      setDetailCache(prev => ({ ...prev, [c.id]: res.data }));
      setViewTarget(res.data);
    } catch {
      notify("Nuk u gjet kontrata", "error");
    }
  };

  const handleSuccess = (msg = "Operacioni u krye me sukses") => {
    setCreateOpen(false); setEditTarget(null); setStatusTarget(null);
    setDetailCache({});
    notify(msg);
    fetchContracts();
    fetchExpiring();
  };

  const filtered = contracts.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      String(c.id).includes(q) ||
      String(c.property_id).includes(q) ||
      String(c.client_id).includes(q) ||
      String(c.agent_id).includes(q);
    const matchStatus = statusFilter === "ALL" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total:    totalElements,
    active:   contracts.filter(c => c.status === "ACTIVE").length,
    pending:  contracts.filter(c => c.status === "PENDING_SIGNATURE").length,
    expiring: expiring.length,
  };

  return (
    <MainLayout role="admin">
      <div className="lc">

        <p className="lc-eyebrow">Finance Management</p>
        <h1 className="lc-title">Lease <span>Contracts</span></h1>
        <p className="lc-subtitle">Menaxho të gjitha kontratat e qirasë — krijo, edito dhe ndrysho statusin</p>

        <ContractsStats stats={stats} />

        {expiring.length > 0 && (
          <div className="lc-alert">
            <span style={{ fontSize: 18 }}>⚠️</span>
            <div>
              <strong>{expiring.length} kontrata</strong> skadojnë brenda 30 ditëve —{" "}
              {expiring.slice(0, 3).map(c => `#${c.id}`).join(", ")}
              {expiring.length > 3 ? ` dhe ${expiring.length - 3} të tjera` : ""}
            </div>
          </div>
        )}

        <ContractsToolbar
          search={search}
          setSearch={setSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          setPage={setPage}
          count={filtered.length}
          onNew={() => setCreateOpen(true)}
        />

        <div className="lc-table-wrap">
          <ContractsTable
            contracts={filtered}
            loading={loading}
            search={search}
            statusFilter={statusFilter}
            expiring={expiring}
            page={page}
            totalPages={totalPages}
            onPage={setPage}
            onView={handleViewContract}
            onEdit={setEditTarget}
            onStatus={setStatusTarget}
          />
        </div>

      </div>

      {createOpen && (
        <ContractCreateModal
          onClose={() => setCreateOpen(false)}
          onSuccess={() => handleSuccess("Kontrata u krijua me sukses ✓")}
          notify={notify}
        />
      )}
      {viewTarget && (
        <ContractViewModal
          contract={viewTarget}
          onClose={() => setViewTarget(null)}
          onEdit={c => setEditTarget(c)}
          onStatus={c => setStatusTarget(c)}
        />
      )}
      {editTarget && (
        <ContractEditModal
          contract={editTarget}
          onClose={() => setEditTarget(null)}
          onSuccess={() => handleSuccess("Kontrata u ndryshua me sukses ✓")}
          notify={notify}
        />
      )}
      {statusTarget && (
        <ContractStatusModal
          contract={statusTarget}
          onClose={() => setStatusTarget(null)}
          onSuccess={() => handleSuccess("Statusi u ndryshua me sukses ✓")}
          notify={notify}
        />
      )}
      {toast && <Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </MainLayout>
  );
}