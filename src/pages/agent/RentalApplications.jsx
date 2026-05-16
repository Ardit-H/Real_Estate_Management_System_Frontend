import { useState, useCallback } from "react";
import MainLayout from "../../components/layout/Layout";
import api from "../../api/axios";

import "../../styles/agent/AgentRentalApplications.css";

import { C, validateListingId, validateRejectionReason, fmtDate, fmtDT, fmtMoney } from "../../components/agent/rentalApplications/rentalApplicationHelpers";
import { Toast, Skeleton, EmptyState, StatusPill, SectionHeader, StatCard } from "../../components/agent/rentalApplications/RentalApplicationBadges";
import AppDetailModal from "../../components/agent/rentalApplications/AppDetailModal";

export default function AgentRentalApplications() {
  const [listingId,    setListingId]    = useState("");
  const [applications, setApplications] = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [selectedApp,  setSelectedApp]  = useState(null);
  const [toast,        setToast]        = useState(null);

  const stats = {
    total:    applications.length,
    pending:  applications.filter(a => a.status === "PENDING").length,
    approved: applications.filter(a => a.status === "APPROVED").length,
    rejected: applications.filter(a => a.status === "REJECTED").length,
  };

  const notify = useCallback((msg, type = "success") =>
    setToast({ msg, type, key: Date.now() }), []);

  const fetchApplications = async () => {
    if (!validateListingId(listingId, notify)) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/rentals/applications/listing/${Number(listingId)}`);
      setApplications(Array.isArray(res.data) ? res.data : []);
    } catch {
      notify("Gabim — listing nuk u gjet ose nuk ka aplikime", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (appId, status, reason) => {
    if (status === "REJECTED" && !validateRejectionReason(reason, notify)) return;
    try {
      await api.patch(`/api/rentals/applications/${appId}/review`, {
        status,
        rejection_reason: reason || null,
      });
      setApplications(prev => prev.map(a =>
        a.id === appId ? { ...a, status, rejection_reason: reason } : a
      ));
      if (selectedApp?.id === appId) {
        setSelectedApp(prev => ({ ...prev, status, rejection_reason: reason }));
      }
      notify(`Aplikimi #${appId} → ${status}`);
    } catch (err) {
      notify(err.response?.data?.message || "Gabim", "error");
    }
  };

  return (
    <MainLayout role="agent">
      <div className="ra">

        {/* ── HERO — same as AgentDashboard ── */}
        <div style={{
          background: `linear-gradient(160deg, ${C.dark} 0%, #1e1a14 50%, #241e16 100%)`,
          minHeight: 190, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "36px 32px", position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.018) 1px,transparent 1px)", backgroundSize: "22px 22px", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: "-60px", right: "5%", width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle,rgba(201,184,122,0.07) 0%,transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(90deg,transparent,${C.gold} 30%,${C.gold} 70%,transparent)` }} />

          <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 680, width: "100%" }}>
            <p style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 600, color: C.gold,
              textTransform: "uppercase", letterSpacing: "2.5px", fontFamily: "'DM Sans',sans-serif" }}>
              Rental Management
            </p>
            <h1 style={{
              margin: "0 0 8px",
              fontFamily: "'Cormorant Garamond',Georgia,serif",
              fontSize: "clamp(22px,3.2vw,34px)",
              fontWeight: 700, color: "#f5f0e8", letterSpacing: "-0.4px", lineHeight: 1.1,
            }}>
              Rental{" "}
              <span style={{
                background: `linear-gradient(90deg,${C.gold},${C.goldL},${C.gold})`,
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>
                Applications
              </span>
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: "rgba(245,240,232,0.38)", fontFamily: "'DM Sans',sans-serif" }}>
              Shiko dhe shqyrto aplikimet e klientëve për listings
            </p>
          </div>
        </div>

        <div style={{ padding: "24px 28px", maxWidth: 1400, margin: "0 auto" }}>

          {/* ── Search card ── */}
          <div className="ra-card ra-section" style={{ marginBottom: 24 }}>
            <SectionHeader title="Kërko Aplikime" />
            <div style={{ padding: "20px 22px", display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
              <div>
                <p style={{ margin: "0 0 7px", fontSize: 12, fontWeight: 600, color: C.textMut,
                  textTransform: "uppercase", letterSpacing: "0.7px" }}>
                  Listing ID <span style={{ color: "#ef4444" }}>*</span>
                </p>
                <div style={{ display: "flex", gap: 10 }}>
                  <input
                    className="ra-input"
                    type="number"
                    min="1"
                    style={{ width: 160, height: 40 }}
                    placeholder="p.sh. 42"
                    value={listingId}
                    onChange={e => setListingId(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && fetchApplications()}
                  />
                  <button className="ra-btn" onClick={fetchApplications} disabled={loading}
                    style={{
                      padding: "0 20px", height: 40, borderRadius: 10,
                      background: C.dark, color: "#f5f0e8",
                      fontSize: 13, fontWeight: 500,
                      display: "flex", alignItems: "center", gap: 7,
                    }}>
                    {loading
                      ? <><div style={{ width: 14, height: 14, border: "2px solid rgba(245,240,232,0.3)", borderTop: "2px solid #f5f0e8", borderRadius: "50%", animation: "ra-spin 0.7s linear infinite" }} /> Duke ngarkuar…</>
                      : <>🔍 Shiko aplikimet</>}
                  </button>
                </div>
                <p style={{ margin: "5px 0 0", fontSize: 11, color: C.textMut }}>
                  Duhet të jetë numër pozitiv
                </p>
              </div>
            </div>
          </div>

          {/* ── Stat Cards — only when results loaded ── */}
          {applications.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(175px,1fr))", gap: 14, marginBottom: 24 }}>
              <StatCard icon="📋" label="Total"    value={stats.total}    accent={C.gold}    />
              <StatCard icon="⏳" label="Pending"  value={stats.pending}  accent="#d97706"   />
              <StatCard icon="✅" label="Approved" value={stats.approved} accent="#5aaa80"   />
              <StatCard icon="✕"  label="Rejected" value={stats.rejected} accent="#dc2626"   />
            </div>
          )}

          {/* ── Applications table ── */}
          <div className="ra-card ra-section">
            <SectionHeader
              title={listingId && applications.length > 0
                ? `Aplikimet për Listing #${listingId}`
                : "Aplikimet"}
              count={applications.length > 0 ? applications.length : undefined}
            />

            {loading ? (
              <Skeleton rows={5} h={58} />
            ) : applications.length === 0 ? (
              <EmptyState
                icon="📝"
                title={listingId ? "Nuk ka aplikime" : "Asnjë kërkim akoma"}
                sub={listingId
                  ? "Nuk ka aplikime për këtë listing ID"
                  : "Shkruaj Listing ID dhe kliko Shiko aplikimet"}
              />
            ) : (
              <div className="ra-table-wrap">
                <table className="ra-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Client ID</th>
                      <th>Të ardhura</th>
                      <th>Move-in</th>
                      <th>Statusi</th>
                      <th>Krijuar</th>
                      <th>Shqyrtuar</th>
                      <th>Veprime</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app) => (
                      <tr key={app.id} className="ra-row" style={{ transition: "background 0.15s" }}>
                        <td style={{ color: C.textMut, fontSize: 12 }}>{app.id}</td>
                        <td>
                          <span style={{
                            background: `${C.gold}18`, color: C.textSub,
                            padding: "2px 9px", borderRadius: 20,
                            fontSize: 12, fontWeight: 600,
                          }}>#{app.client_id}</span>
                        </td>
                        <td style={{ fontWeight: 500 }}>{fmtMoney(app.income)}</td>
                        <td style={{ fontSize: 12.5, color: C.textSub }}>
                          {fmtDate(app.move_in_date)}
                        </td>
                        <td><StatusPill status={app.status} /></td>
                        <td style={{ fontSize: 12, color: C.textMut }}>
                          {fmtDT(app.created_at)}
                        </td>
                        <td style={{ fontSize: 12, color: C.textMut }}>
                          {app.reviewed_at ? fmtDT(app.reviewed_at) : "—"}
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                            {/* View */}
                            <button className="ra-btn" onClick={() => setSelectedApp(app)}
                              style={{
                                padding: "5px 12px", borderRadius: 8,
                                background: "#f0ece3", color: C.textSub,
                                border: `1px solid ${C.border}`, fontSize: 11.5, fontWeight: 500,
                              }}>
                              View
                            </button>

                            {app.status === "PENDING" && (
                              <>
                                {/* Quick approve */}
                                <button className="ra-btn"
                                  onClick={() => handleReview(app.id, "APPROVED", null)}
                                  title="Aprovo"
                                  style={{
                                    width: 30, height: 30, borderRadius: 8,
                                    background: "#ecfdf5", color: "#059669",
                                    border: "1px solid #a7f3d0",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: 13,
                                  }}>✓</button>

                                {/* Open modal for rejection */}
                                <button className="ra-btn"
                                  onClick={() => setSelectedApp(app)}
                                  title="Refuzo"
                                  style={{
                                    width: 30, height: 30, borderRadius: 8,
                                    background: "#fef2f2", color: "#dc2626",
                                    border: "1px solid #fecaca",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: 13,
                                  }}>✕</button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Modal */}
        {selectedApp && (
          <AppDetailModal
            app={selectedApp}
            onClose={() => setSelectedApp(null)}
            onReview={handleReview}
            notify={notify}
          />
        )}

        {/* Toast */}
        {toast && (
          <Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />
        )}
      </div>
    </MainLayout>
  );
}