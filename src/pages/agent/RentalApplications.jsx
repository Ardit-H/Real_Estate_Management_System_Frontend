import { useState, useEffect, useCallback } from "react";
import MainLayout from "../../components/layout/Layout";
import api from "../../api/axios";

const APP_STATUS_STYLE = {
  PENDING:   { bg: "#fffbeb", color: "#d97706" },
  APPROVED:  { bg: "#ecfdf5", color: "#059669" },
  REJECTED:  { bg: "#fef2f2", color: "#dc2626" },
  CANCELLED: { bg: "#f1f5f9", color: "#64748b" },
};

const fmtDate  = (d) => d ? new Date(d).toLocaleDateString("sq-AL") : "—";
const fmtDT    = (d) => d ? new Date(d).toLocaleString("sq-AL", {
  day: "2-digit", month: "2-digit", year: "numeric",
  hour: "2-digit", minute: "2-digit" }) : "—";
const fmtMoney = (v) => v != null ? `€${Number(v).toLocaleString("de-DE")}` : "—";

// ─── Shared ───────────────────────────────────────────────────────────────────
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
  const s = APP_STATUS_STYLE[status] || { bg: "#f1f5f9", color: "#64748b" };
  return (
    <span style={{ background: s.bg, color: s.color,
      padding: "3px 10px", borderRadius: 20, fontSize: 11.5, fontWeight: 600,
      display: "inline-flex", alignItems: "center", gap: 5 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%",
        background: s.color, display: "inline-block" }} />
      {status}
    </span>
  );
}

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6,
      justifyContent: "flex-end", padding: "14px 16px" }}>
      <button className="btn btn--secondary btn--sm" disabled={page === 0}
        onClick={() => onChange(page - 1)}>← Prev</button>
      <span style={{ fontSize: 13, color: "#64748b", padding: "0 8px" }}>
        {page + 1} / {totalPages}
      </span>
      <button className="btn btn--secondary btn--sm" disabled={page >= totalPages - 1}
        onClick={() => onChange(page + 1)}>Next →</button>
    </div>
  );
}

// ─── App Detail Modal ─────────────────────────────────────────────────────────
function AppDetailModal({ app, onClose, onReview }) {
  const [rejReason, setRejReason] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const handleApprove = async () => {
    setReviewing(true);
    await onReview(app.id, "APPROVED", null);
    setReviewing(false);
  };

  const handleReject = async () => {
    setReviewing(true);
    await onReview(app.id, "REJECTED", rejReason || null);
    setReviewing(false);
    setShowReject(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(15,23,42,0.45)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ width: "100%", maxWidth: 560, background: "#fff",
        borderRadius: 16, boxShadow: "0 20px 60px rgba(15,23,42,0.18)",
        maxHeight: "90vh", overflowY: "auto", animation: "fadeUp .2s ease" }}>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 24px", borderBottom: "1px solid #e8edf4" }}>
          <h3 style={{ fontWeight: 600, fontSize: 15 }}>Aplikim #{app.id}</h3>
          <button onClick={onClose} style={{ width: 30, height: 30, border: "none",
            background: "none", color: "#94a3b8", cursor: "pointer", fontSize: 16 }}>✕</button>
        </div>

        <div style={{ padding: "22px 24px" }}>
          {/* Status */}
          <div style={{ display: "flex", justifyContent: "space-between",
            alignItems: "center", marginBottom: 20,
            background: "#f8fafc", borderRadius: 10, padding: "12px 16px" }}>
            <StatusBadge status={app.status} />
            {app.reviewed_at && (
              <span style={{ fontSize: 12, color: "#94a3b8" }}>
                Shqyrtuar: {fmtDT(app.reviewed_at)}
              </span>
            )}
          </div>

          {/* Details grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
            {[
              { label: "Client ID",     value: `#${app.client_id}` },
              { label: "Listing ID",    value: `#${app.listing_id}` },
              { label: "Të ardhura",    value: fmtMoney(app.income) },
              { label: "Move-in date",  value: fmtDate(app.move_in_date) },
              { label: "Shqyrtuar nga", value: app.reviewed_by ? `#${app.reviewed_by}` : "—" },
              { label: "Krijuar më",    value: fmtDT(app.created_at) },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: "#f8fafc", borderRadius: 8,
                padding: "10px 14px", border: "1px solid #e8edf4" }}>
                <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600,
                  textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{label}</p>
                <p style={{ fontSize: 13.5, fontWeight: 500 }}>{value}</p>
              </div>
            ))}
          </div>

          {app.message && (
            <div style={{ background: "#f8fafc", border: "1px solid #e8edf4",
              borderRadius: 10, padding: "14px 16px", marginBottom: 18 }}>
              <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600,
                textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                Mesazhi
              </p>
              <p style={{ fontSize: 13.5, color: "#374151", lineHeight: 1.6, fontStyle: "italic" }}>
                "{app.message}"
              </p>
            </div>
          )}

          {app.rejection_reason && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca",
              borderRadius: 10, padding: "12px 16px", marginBottom: 18 }}>
              <p style={{ fontSize: 12.5, color: "#dc2626" }}>
                ✕ Arsyeja e refuzimit: {app.rejection_reason}
              </p>
            </div>
          )}

          {/* Actions */}
          {app.status === "PENDING" && (
            <div style={{ borderTop: "1px solid #e8edf4", paddingTop: 18 }}>
              {!showReject ? (
                <div style={{ display: "flex", gap: 10 }}>
                  <button className="btn btn--sm"
                    style={{ background: "#ecfdf5", color: "#059669",
                      border: "1px solid #a7f3d0", flex: 1 }}
                    onClick={handleApprove} disabled={reviewing}>
                    ✓ Aprovo aplikimin
                  </button>
                  <button className="btn btn--danger btn--sm"
                    style={{ flex: 1 }} onClick={() => setShowReject(true)}>
                    ✕ Refuzo
                  </button>
                </div>
              ) : (
                <div>
                  <p style={{ fontSize: 13.5, fontWeight: 500, marginBottom: 8 }}>
                    Arsyeja e refuzimit (opcionale):
                  </p>
                  <textarea value={rejReason} onChange={e => setRejReason(e.target.value)}
                    rows={3} placeholder="Shkruaj arsyen e refuzimit..."
                    style={{ width: "100%", padding: "9px 12px", border: "1px solid #cbd5e1",
                      borderRadius: 10, fontSize: 14, fontFamily: "inherit",
                      resize: "vertical", outline: "none", marginBottom: 10 }} />
                  <div style={{ display: "flex", gap: 10 }}>
                    <button className="btn btn--secondary"
                      onClick={() => setShowReject(false)}>Anulo</button>
                    <button className="btn btn--danger"
                      onClick={handleReject} disabled={reviewing}>
                      Konfirmo refuzimin
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function AgentRentalApplications() {
  const [selectedListingId, setSelectedListingId] = useState("");
  const [listings, setListings] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingListings, setLoadingListings] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [toast, setToast] = useState(null);

  // Stats
  const stats = {
    total:     applications.length,
    pending:   applications.filter(a => a.status === "PENDING").length,
    approved:  applications.filter(a => a.status === "APPROVED").length,
    rejected:  applications.filter(a => a.status === "REJECTED").length,
  };

  const notify = useCallback((msg, type = "success") =>
    setToast({ msg, type, key: Date.now() }), []);

  // Fetch all rental listings on mount
  useEffect(() => {
    const fetchListings = async () => {
      setLoadingListings(true);
      try {
        const res = await api.get("/api/rentals/listings?page=0&size=100&sortBy=createdAt&sortDir=desc");
        setListings(res.data.content || []);
      } catch (err) {
        console.error("Gabim gjatë ngarkimit të listings", err);
      } finally {
        setLoadingListings(false);
      }
    };
    fetchListings();
  }, []);

  const fetchApplications = async (listingId) => {
    if (!listingId) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/rentals/applications/listing/${listingId}`);
      setApplications(Array.isArray(res.data) ? res.data : []);
      if (res.data.length === 0) {
        notify("Nuk ka aplikime për këtë listing", "info");
      }
    } catch {
      notify("Gabim — nuk mund të ngarkohen aplikimet", "error");
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleListingChange = (e) => {
    const value = e.target.value;
    setSelectedListingId(value);
    if (value) {
      fetchApplications(value);
    } else {
      setApplications([]);
    }
  };

  const handleReview = async (appId, status, reason) => {
    try {
      await api.patch(`/api/rentals/applications/${appId}/review`, {
        status,
        rejection_reason: reason,
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

  const getListingDisplayText = (listing) => {
    const title = listing.title || `Property #${listing.property_id}`;
    return `${title}`;
  };

  const statCards = [
    { label: "Total",    value: stats.total,    color: "#6366f1", bg: "#eef2ff" },
    { label: "Pending",  value: stats.pending,  color: "#d97706", bg: "#fffbeb" },
    { label: "Approved", value: stats.approved, color: "#059669", bg: "#ecfdf5" },
    { label: "Rejected", value: stats.rejected, color: "#dc2626", bg: "#fef2f2" },
  ];

  return (
    <MainLayout role="agent">
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px);} to{opacity:1;transform:translateY(0);} }
        @keyframes spin { to { transform:rotate(360deg); } }
      `}</style>

      <div className="page-header">
        <div>
          <h1 className="page-title">Rental Applications</h1>
          <p className="page-subtitle">Shiko dhe shqyrto aplikimet e klientëve për listings</p>
        </div>
      </div>

      {/* Dropdown selector */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ padding: "18px 20px" }}>
          <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Zgjidh Rental Listing</p>
          <select
            className="form-select"
            value={selectedListingId}
            onChange={handleListingChange}
            disabled={loadingListings}
            style={{ width: "100%", maxWidth: 400 }}
          >
            <option value="">-- Zgjidh një listing --</option>
            {listings.map(listing => (
              <option key={listing.id} value={listing.id}>
                {getListingDisplayText(listing)}
              </option>
            ))}
          </select>
          {loadingListings && <div style={{ marginTop: 8 }}><Loader /></div>}
        </div>
      </div>

      {/* Stats — show only when there are applications */}
      {applications.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)",
          gap: 14, marginBottom: 20 }}>
          {statCards.map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-card__label">{s.label}</div>
              <div className="stat-card__value" style={{ color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="card">
        <div className="card__header">
          <h2 className="card__title">
            {selectedListingId && listings.find(l => l.id == selectedListingId)
              ? `Aplikimet për: ${listings.find(l => l.id == selectedListingId)?.title || `Listing #${selectedListingId}`}`
              : "Aplikimet"}
          </h2>
        </div>

        {loading ? <Loader /> : applications.length === 0 ? (
          <EmptyState 
            icon="📝"
            text={selectedListingId ? "Nuk ka aplikime për këtë listing" : "Zgjidh një listing nga lista për të parë aplikimet"} 
          />
        ) : (
          <div className="table-wrap">
            <table className="table">
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
                {applications.map(app => (
                  <tr key={app.id}>
                    <td style={{ color: "#94a3b8", fontSize: 12 }}>{app.id}</td>
                    <td>
                      <span style={{ background: "#eef2ff", color: "#6366f1",
                        padding: "2px 8px", borderRadius: 20, fontSize: 12, fontWeight: 500 }}>
                        #{app.client_id}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500 }}>{fmtMoney(app.income)}</td>
                    <td style={{ fontSize: 12.5, color: "#64748b" }}>
                      {fmtDate(app.move_in_date)}
                    </td>
                    <td><StatusBadge status={app.status} /></td>
                    <td style={{ fontSize: 12, color: "#64748b" }}>
                      {fmtDT(app.created_at)}
                    </td>
                    <td style={{ fontSize: 12, color: "#64748b" }}>
                      {app.reviewed_at ? fmtDT(app.reviewed_at) : "—"}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn btn--ghost btn--sm"
                          onClick={() => setSelectedApp(app)}>View</button>
                        {app.status === "PENDING" && (
                          <>
                            <button className="btn btn--sm"
                              style={{ background: "#ecfdf5", color: "#059669",
                                border: "1px solid #a7f3d0" }}
                              onClick={() => handleReview(app.id, "APPROVED", null)}>
                              ✓
                            </button>
                            <button className="btn btn--danger btn--sm"
                              onClick={() => setSelectedApp(app)}>✕</button>
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

      {selectedApp && (
        <AppDetailModal
          app={selectedApp}
          onClose={() => setSelectedApp(null)}
          onReview={handleReview}
        />
      )}

      {toast && <Toast key={toast.key} msg={toast.msg} type={toast.type}
        onDone={() => setToast(null)} />}
    </MainLayout>
  );
}