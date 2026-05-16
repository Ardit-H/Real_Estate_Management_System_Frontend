import { useState, useEffect, useCallback } from "react";
import MainLayout from "../../components/layout/Layout";
import api from "../../api/axios";

import "../../styles/admin/AdminMaintenance.css";

import { C } from "../../components/admin/maintenance/maintenanceHelpers";
import { Toast }                    from "../../components/admin/maintenance/MaintenanceBadges";
import { MaintenanceStats }         from "../../components/admin/maintenance/MaintenanceStats";
import { MaintenanceToolbar }       from "../../components/admin/maintenance/MaintenanceToolbar";
import { MaintenanceTable }         from "../../components/admin/maintenance/MaintenanceTable";
import { MaintenanceDetailModal }   from "../../components/admin/maintenance/MaintenanceDetailModal";

export default function AdminMaintenance() {
  const [tab, setTab]                     = useState("all");
  const [items, setItems]                 = useState([]);
  const [loading, setLoading]             = useState(true);
  const [page, setPage]                   = useState(0);
  const [totalPages, setTotalPages]       = useState(0);
  const [statusFilter, setStatusFilter]   = useState("OPEN");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [propertySearch, setPropertySearch] = useState("");
  const [selected, setSelected]           = useState(null);
  const [toast, setToast]                 = useState(null);
  const [counts, setCounts]               = useState({ open: 0, inProgress: 0, completed: 0, urgent: 0 });

  const notify = useCallback((msg, type = "success") => setToast({ msg, type, key: Date.now() }), []);

  // Load global KPI counts
  useEffect(() => {
    Promise.all([
      api.get("/api/maintenance?status=OPEN&page=0&size=1"),
      api.get("/api/maintenance?status=IN_PROGRESS&page=0&size=1"),
      api.get("/api/maintenance?status=COMPLETED&page=0&size=1"),
      api.get("/api/maintenance/urgent"),
    ]).then(([o, ip, c, u]) => setCounts({
      open:       o.data.totalElements || 0,
      inProgress: ip.data.totalElements || 0,
      completed:  c.data.totalElements || 0,
      urgent:     Array.isArray(u.data) ? u.data.length : 0,
    })).catch(() => {});
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === "all") {
        const r = await api.get(`/api/maintenance?status=${statusFilter}&page=${page}&size=15`);
        setItems(r.data.content || []);
        setTotalPages(r.data.totalPages || 0);
      } else if (tab === "urgent") {
        const r = await api.get("/api/maintenance/urgent");
        setItems(Array.isArray(r.data) ? r.data : []);
        setTotalPages(1);
      } else if (tab === "property" && propertySearch) {
        const r = await api.get(`/api/maintenance/property/${propertySearch}`);
        setItems(Array.isArray(r.data) ? r.data : []);
        setTotalPages(1);
      }
    } catch {
      notify("Error loading", "error");
    } finally {
      setLoading(false);
    }
  }, [tab, statusFilter, page, propertySearch, notify]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filteredItems = priorityFilter ? items.filter(i => i.priority === priorityFilter) : items;

  const handleTabChange = (newTab) => { setTab(newTab); setPage(0); };
  const handleStatusChange = (s) => { setStatusFilter(s); setPage(0); };

  return (
    <MainLayout role="admin">
      <div className="ad">
        {/* Hero */}
        <div style={{
          background: "linear-gradient(160deg,#1a1714 0%,#1e1a14 50%,#241e16 100%)",
          minHeight: 190, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "36px 32px", position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,.018) 1px,transparent 1px)", backgroundSize: "22px 22px", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(90deg,transparent,${C.gold} 30%,${C.gold} 70%,transparent)` }} />
          <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
            <p style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 600, color: C.gold, textTransform: "uppercase", letterSpacing: "2.5px" }}>Admin · Maintenance</p>
            <h1 style={{ margin: "0 0 8px", fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "clamp(24px,3vw,38px)", fontWeight: 700, color: "#f5f0e8", letterSpacing: "-0.4px" }}>
              Maintenance{" "}
              <span style={{ background: `linear-gradient(90deg,${C.gold},${C.goldL})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                Control Center
              </span>
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: "rgba(245,240,232,.38)" }}>Full oversight — manage, assign and close all maintenance requests across the platform</p>
          </div>
        </div>

        <div style={{ padding: "24px 28px", maxWidth: 1400, margin: "0 auto" }}>
          <MaintenanceStats
            counts={counts}
            tab={tab}
            onViewUrgent={() => handleTabChange("urgent")}
          />

          <MaintenanceToolbar
            tab={tab}
            onTabChange={handleTabChange}
            statusFilter={statusFilter}
            onStatusChange={handleStatusChange}
            priorityFilter={priorityFilter}
            onPriorityChange={setPriorityFilter}
            propertySearch={propertySearch}
            onPropertySearchChange={setPropertySearch}
            onPropertySearch={fetchAll}
            urgentCount={counts.urgent}
          />

          <MaintenanceTable
            items={filteredItems}
            loading={loading}
            tab={tab}
            propertySearch={propertySearch}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            onManage={setSelected}
          />
        </div>

        {selected && (
          <MaintenanceDetailModal
            item={selected}
            onClose={() => setSelected(null)}
            onRefresh={fetchAll}
            notify={notify}
          />
        )}

        {toast && (
          <Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />
        )}
      </div>
    </MainLayout>
  );
}