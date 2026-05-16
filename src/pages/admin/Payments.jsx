import { useState, useEffect, useCallback } from "react";
import MainLayout from "../../components/layout/Layout";
import api from "../../api/axios";

import "../../styles/admin/AdminPayments.css";
import PaymentsStats        from "../../components/admin/payments/PaymentsStats";
import PaymentsSummaryBar   from "../../components/admin/payments/PaymentsSummaryBar";
import PaymentsTabs         from "../../components/admin/payments/PaymentsTabs";
import PaymentsToolbar      from "../../components/admin/payments/PaymentsToolbar";
import PaymentsTable        from "../../components/admin/payments/PaymentsTable";
import PaymentViewModal     from "../../components/admin/payments/PaymentViewModal";
import PaymentCreateModal   from "../../components/admin/payments/PaymentCreateModal";
import PaymentMarkPaidModal from "../../components/admin/payments/PaymentMarkPaidModal";
import PaymentStatusModal   from "../../components/admin/payments/PaymentStatusModal";

function Toast({ msg, type, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3400); return () => clearTimeout(t); }, [onDone]);
  return <div className={`pm-toast ${type}`}>{type === "success" ? "✅" : "❌"} {msg}</div>;
}

export default function AdminPayments() {
  const [tab,          setTab]          = useState("status");
  const [contractId,   setContractId]   = useState("");
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [search,       setSearch]       = useState("");

  const [payments,     setPayments]     = useState([]);
  const [summary,      setSummary]      = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [page,         setPage]         = useState(0);
  const [totalPages,   setTotalPages]   = useState(0);
  const [revenue,      setRevenue]      = useState(null);
  const [overdueCount, setOverdueCount] = useState(0);

  const [createOpen,   setCreateOpen]   = useState(false);
  const [viewTarget,   setViewTarget]   = useState(null);
  const [paidTarget,   setPaidTarget]   = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);

  const [toast, setToast] = useState(null);
  const notify = (msg, type = "success") => setToast({ msg, type, key: Date.now() });

  const PAGE_SIZE = 15;

  const refreshCounters = () => {
    api.get("/api/payments/revenue").then(r => setRevenue(r.data)).catch(() => {});
    api.get("/api/payments/overdue").then(r => setOverdueCount((r.data || []).length)).catch(() => {});
  };

  useEffect(() => { refreshCounters(); }, []);

  const fetchByContract = useCallback(async (cid) => {
    const id = cid ?? contractId;
    if (!id) return;
    setLoading(true); setSummary(null);
    try {
      const [listRes, sumRes] = await Promise.all([
        api.get(`/api/payments/contract/${id}`),
        api.get(`/api/payments/contract/${id}/summary`),
      ]);
      setPayments(Array.isArray(listRes.data) ? listRes.data : []);
      setSummary(sumRes.data);
      setTotalPages(1);
    } catch {
      notify("Kontrata nuk u gjet ose nuk ka pagesa", "error");
      setPayments([]);
    } finally { setLoading(false); }
  }, [contractId]);

  const fetchByStatus = useCallback(async () => {
    setLoading(true); setSummary(null);
    try {
      const res = await api.get(`/api/payments/status/${statusFilter}?page=${page}&size=${PAGE_SIZE}`);
      setPayments(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
    } catch {
      notify("Gabim gjatë ngarkimit", "error");
    } finally { setLoading(false); }
  }, [statusFilter, page]);

  const fetchOverdue = useCallback(async () => {
    setLoading(true); setSummary(null);
    try {
      const res = await api.get("/api/payments/overdue");
      setPayments(Array.isArray(res.data) ? res.data : []);
      setTotalPages(1);
    } catch {
      notify("Gabim gjatë ngarkimit", "error");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (tab === "status")   fetchByStatus();
    if (tab === "overdue")  fetchOverdue();
    if (tab === "contract") { setPayments([]); setSummary(null); }
  }, [tab, fetchByStatus, fetchOverdue]);

  const handleSuccess = (msg = "Operacioni u krye me sukses") => {
    setCreateOpen(false); setPaidTarget(null); setStatusTarget(null);
    notify(msg);
    if (tab === "contract" && contractId) fetchByContract(contractId);
    else if (tab === "status") fetchByStatus();
    else fetchOverdue();
    refreshCounters();
  };

  const filtered = payments.filter(p => {
    const q = search.toLowerCase();
    return !q ||
      String(p.id).includes(q) ||
      String(p.contract_id).includes(q) ||
      (p.payment_type || "").toLowerCase().includes(q) ||
      (p.recipient_name || "").toLowerCase().includes(q) ||
      (p.status || "").toLowerCase().includes(q);
  });

  return (
    <MainLayout role="admin">
      <div className="pm">

        <p className="pm-eyebrow">Finance Management</p>
        <h1 className="pm-title">Lease <span>Payments</span></h1>
        <p className="pm-subtitle">Menaxho pagesat e qirasë — shëno, filtro dhe krijo pagesa të reja</p>

        <PaymentsStats
          revenue={revenue}
          total={payments.length}
          paid={payments.filter(p => p.status === "PAID").length}
          overdueCount={overdueCount}
        />

        <PaymentsSummaryBar summary={summary} />

        <PaymentsTabs
          tab={tab}
          setTab={setTab}
          setPage={setPage}
          setPayments={setPayments}
          setSummary={setSummary}
          overdueCount={overdueCount}
        />

        <PaymentsToolbar
          tab={tab}
          search={search}
          setSearch={setSearch}
          contractId={contractId}
          setContractId={setContractId}
          onLoadContract={fetchByContract}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          setPage={setPage}
          count={filtered.length}
          onNew={() => setCreateOpen(true)}
        />

        <div className="pm-table-wrap">
          <PaymentsTable
            payments={filtered}
            loading={loading}
            tab={tab}
            contractId={contractId}
            page={page}
            totalPages={totalPages}
            setPage={setPage}
            onView={setViewTarget}
            onMarkPaid={setPaidTarget}
            onStatus={setStatusTarget}
          />
        </div>

      </div>

      {createOpen && (
        <PaymentCreateModal
          onClose={() => setCreateOpen(false)}
          onSuccess={() => handleSuccess("Pagesa u krijua me sukses ✓")}
          notify={notify}
        />
      )}
      {viewTarget && (
        <PaymentViewModal
          payment={viewTarget}
          onClose={() => setViewTarget(null)}
          onMarkPaid={setPaidTarget}
          onStatus={setStatusTarget}
        />
      )}
      {paidTarget && (
        <PaymentMarkPaidModal
          payment={paidTarget}
          onClose={() => setPaidTarget(null)}
          onSuccess={() => handleSuccess("Pagesa u shënua si PAID ✓")}
          notify={notify}
        />
      )}
      {statusTarget && (
        <PaymentStatusModal
          payment={statusTarget}
          onClose={() => setStatusTarget(null)}
          onSuccess={() => handleSuccess("Statusi u ndryshua ✓")}
          notify={notify}
        />
      )}
      {toast && <Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </MainLayout>
  );
}