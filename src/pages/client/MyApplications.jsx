import { useEffect, useState, useCallback } from "react";
import MainLayout from "../../components/layout/Layout";
import api from "../../api/axios";

// ─── Icons ────────────────────────────────────────────────────────────────────
const CalendarIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const EuroIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 10h12"/><path d="M4 14h9"/><path d="M19 6a7 7 0 1 0 0 12"/>
  </svg>
);
const HomeIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const ClockIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 18-6-6 6-6"/>
  </svg>
);
const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type = "success", onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3200);
    return () => clearTimeout(t);
  }, [onDone]);
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

// ─── Confirm Cancel Modal ─────────────────────────────────────────────────────
function ConfirmCancelModal({ onConfirm, onClose, loading }) {
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 3000, background: "rgba(15,23,42,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: "#fff", borderRadius: 16, padding: "28px 28px 24px", maxWidth: 400, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.18)", animation: "fadeUp .18s ease" }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>⚠️</div>
          <p style={{ fontWeight: 700, fontSize: 16, margin: "0 0 6px", color: "#1e293b" }}>Anulo aplikimin?</p>
          <p style={{ fontSize: 13.5, color: "#64748b", margin: 0 }}>Ky veprim nuk mund të kthehet prapa.</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#f8fafc", color: "#475569", fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}
          >
            Jo, mbaje
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: loading ? "#fca5a5" : "#ef4444", color: "#fff", fontWeight: 700, fontSize: 14, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit" }}
          >
            {loading ? "Duke anuluar..." : "Po, anulo"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Listing Detail Inline ────────────────────────────────────────────────────
function ListingDetail({ listingId }) {
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await api.get(`/api/rentals/listings/${listingId}`);
        if (!cancelled) setListing(res.data);
      } catch {
        // silently fail
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [listingId]);

  if (loading) return (
    <div style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 12, color: "#94a3b8", marginTop: 6 }}>
      <div style={{ width: 12, height: 12, border: "2px solid #e2e8f0", borderTop: "2px solid #94a3b8", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
      Duke ngarkuar detajet e listingut...
    </div>
  );

  if (!listing) return (
    <div style={{ marginTop: 6, fontSize: 12, color: "#94a3b8" }}>
      Listing #{listingId}
    </div>
  );

  const fmtMoney = (v) => v != null ? `€${Number(v).toLocaleString("de-DE")}` : null;
  const fmtDate  = (d) => d ? new Date(d).toLocaleDateString("sq-AL") : null;

  return (
    <div style={{ marginTop: 10, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 14px" }}>
      <p style={{ fontWeight: 700, fontSize: 13.5, margin: "0 0 4px", color: "#1e293b" }}>
        {listing.title || `Listing #${listing.id}`}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 20px", fontSize: 12.5, color: "#64748b" }}>
        {listing.price != null && (
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <EuroIcon />
            {fmtMoney(listing.price)} / {(listing.price_period || "monthly").toLowerCase()}
          </span>
        )}
        {listing.deposit != null && (
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <EuroIcon />
            Depozita: {fmtMoney(listing.deposit)}
          </span>
        )}
        {listing.min_lease_months && (
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <ClockIcon />
            Min. {listing.min_lease_months} muaj
          </span>
        )}
        {listing.available_from && (
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <CalendarIcon />
            Nga {fmtDate(listing.available_from)}
          </span>
        )}
        {listing.available_until && (
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <CalendarIcon />
            Deri {fmtDate(listing.available_until)}
          </span>
        )}
      </div>
      {listing.description && (
        <p style={{ margin: "8px 0 0", fontSize: 12.5, color: "#475569", lineHeight: 1.5 }}>
          {listing.description}
        </p>
      )}
    </div>
  );
}

// ─── Application Card ─────────────────────────────────────────────────────────
function ApplicationCard({ app, onCancel }) {
  const [cancelling,   setCancelling]   = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);

  const STATUS_CONFIG = {
    PENDING:   { bg: "#fffbeb", color: "#d97706", border: "#fde68a", label: "Në pritje", icon: "⏳" },
    APPROVED:  { bg: "#ecfdf5", color: "#059669", border: "#a7f3d0", label: "Aprovuar",  icon: "✅" },
    REJECTED:  { bg: "#fef2f2", color: "#dc2626", border: "#fecaca", label: "Refuzuar",  icon: "❌" },
    CANCELLED: { bg: "#f1f5f9", color: "#64748b", border: "#e2e8f0", label: "Anuluar",   icon: "🚫" },
  };

  const s        = STATUS_CONFIG[app.status] || STATUS_CONFIG.CANCELLED;
  const fmtDate  = (d) => d ? new Date(d).toLocaleDateString("sq-AL", { day: "2-digit", month: "long", year: "numeric" }) : "—";
  const fmtMoney = (v) => v != null ? `€${Number(v).toLocaleString("de-DE")}` : null;

  const handleConfirmCancel = async () => {
    setCancelling(true);
    await onCancel(app.id);
    setCancelling(false);
    setShowConfirm(false);
  };

  return (
    <>
      <div style={{
        background: "#fff",
        borderRadius: 14,
        border: "1px solid #e5e0d4",
        boxShadow: "0 2px 12px rgba(90,95,58,0.08)",
        overflow: "hidden",
        transition: "box-shadow 0.18s",
      }}>
        {/* Coloured status strip at top */}
        <div style={{ height: 4, background: s.color, opacity: 0.6 }} />

        <div style={{ padding: "18px 20px" }}>
          {/* Top row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#a0997e", textTransform: "uppercase", letterSpacing: "0.6px" }}>
                  Aplikim #{app.id}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#8a8469", fontSize: 12.5 }}>
                <CalendarIcon />
                <span>Dërguar më {fmtDate(app.created_at)}</span>
              </div>
            </div>
            <span style={{
              background: s.bg, color: s.color, border: `1px solid ${s.border}`,
              padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700,
              display: "flex", alignItems: "center", gap: 4, flexShrink: 0,
            }}>
              {s.icon} {s.label}
            </span>
          </div>

          {/* Listing detail */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: "#6b6651", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 2 }}>
              <HomeIcon /> Listing
            </div>
            <ListingDetail listingId={app.listing_id} />
          </div>

          {/* Application details */}
          {(app.income || app.move_in_date) && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 20px", marginTop: 12, padding: "10px 12px", background: "#faf8f3", borderRadius: 8, border: "1px solid #e5e0d4" }}>
              {app.income != null && (
                <span style={{ fontSize: 12.5, color: "#4a4a36", display: "flex", alignItems: "center", gap: 4 }}>
                  <EuroIcon /> Të ardhura: <strong>{fmtMoney(app.income)}/muaj</strong>
                </span>
              )}
              {app.move_in_date && (
                <span style={{ fontSize: 12.5, color: "#4a4a36", display: "flex", alignItems: "center", gap: 4 }}>
                  <CalendarIcon /> Hyrja: <strong>{fmtDate(app.move_in_date)}</strong>
                </span>
              )}
            </div>
          )}

          {/* Message */}
          {app.message && (
            <div style={{ marginTop: 12, padding: "10px 14px", background: "#f8fafc", borderLeft: "3px solid #c8d4b0", borderRadius: "0 8px 8px 0" }}>
              <p style={{ margin: 0, fontSize: 13, color: "#475569", fontStyle: "italic", lineHeight: 1.6 }}>
                "{app.message}"
              </p>
            </div>
          )}

          {/* Status-specific banners */}
          {app.status === "APPROVED" && (
            <div style={{ marginTop: 12, background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: 10, padding: "12px 14px", fontSize: 13, color: "#047857", display: "flex", alignItems: "center", gap: 8 }}>
              🎉 <span>Aplikimi juaj u aprovua! Agjenti do t'ju kontaktojë së shpejti.</span>
            </div>
          )}

          {app.status === "CANCELLED" && (
            <div style={{ marginTop: 12, background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 14px", fontSize: 13, color: "#64748b", display: "flex", alignItems: "center", gap: 8 }}>
              🚫 <span>Ky aplikim është anuluar.</span>
            </div>
          )}

          {app.status === "REJECTED" && (
            <div style={{ marginTop: 12, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "12px 14px", fontSize: 13, color: "#dc2626", display: "flex", alignItems: "center", gap: 8 }}>
              ❌ <span>Aplikimi juaj u refuzua.</span>
            </div>
          )}

          {/* Cancel action — only for PENDING */}
          {app.status === "PENDING" && (
            <div style={{ marginTop: 14 }}>
              <button
                onClick={() => setShowConfirm(true)}
                style={{
                  padding: "8px 18px", borderRadius: 8,
                  border: "1.5px solid #fecaca", background: "#fff",
                  color: "#dc2626", fontSize: 13, fontWeight: 600,
                  cursor: "pointer", fontFamily: "inherit",
                  transition: "all 0.15s",
                  display: "flex", alignItems: "center", gap: 6,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "#fef2f2"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#fff"; }}
              >
                ✕ Anulo aplikimin
              </button>
            </div>
          )}
        </div>
      </div>

      {showConfirm && (
        <ConfirmCancelModal
          loading={cancelling}
          onConfirm={handleConfirmCancel}
          onClose={() => setShowConfirm(false)}
        />
      )}
    </>
  );
}

// ─── Status filter config ─────────────────────────────────────────────────────
const STATUS_FILTERS = [
  { value: "",          label: "Të gjitha" },
  { value: "PENDING",   label: "Në pritje"  },
  { value: "APPROVED",  label: "Aprovuar"   },
  { value: "REJECTED",  label: "Refuzuar"   },
  { value: "CANCELLED", label: "Anuluar"    },
];

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function MyApplications() {
  const [apps,          setApps]          = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [page,          setPage]          = useState(0);
  const [totalPages,    setTotalPages]    = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  // Per-status counts fetched once (unfiltered) so the stats in the hero are always accurate
  const [allCounts,     setAllCounts]     = useState({ PENDING: 0, APPROVED: 0, total: 0 });
  const [toast,         setToast]         = useState(null);
  const [statusFilter,  setStatusFilter]  = useState("");

  const notify = useCallback((msg, type = "success") =>
    setToast({ msg, type, key: Date.now() }), []);

  // ── Load applications (server-side filtered) ────────────────────────────────
  const loadApps = useCallback(async (pg = 0, status = statusFilter) => {
    setLoading(true);
    try {
      const params = { page: pg, size: 10 };
      // Only send status param when a specific filter is selected
      if (status) params.status = status;

      const res = await api.get("/api/rentals/applications/my", { params });
      const data = res.data;

      setApps(data.content         || []);
      setTotalPages(data.totalPages    || 0);
      setTotalElements(data.totalElements || 0);
      setPage(pg);
    } catch {
      notify("Gabim gjatë ngarkimit të aplikimeve", "error");
    } finally {
      setLoading(false);
    }
  }, [notify, statusFilter]);

  // ── Load summary counts (always unfiltered) ─────────────────────────────────
  const loadCounts = useCallback(async () => {
    try {
      // Fetch all applications without status filter to get accurate counts
      const res  = await api.get("/api/rentals/applications/my", { params: { page: 0, size: 1 } });
      const total = res.data.totalElements || 0;

      // Fetch PENDING count
      const pendingRes  = await api.get("/api/rentals/applications/my", { params: { page: 0, size: 1, status: "PENDING" } });
      const pendingTotal = pendingRes.data.totalElements || 0;

      // Fetch APPROVED count
      const approvedRes  = await api.get("/api/rentals/applications/my", { params: { page: 0, size: 1, status: "APPROVED" } });
      const approvedTotal = approvedRes.data.totalElements || 0;

      setAllCounts({ PENDING: pendingTotal, APPROVED: approvedTotal, total });
    } catch {
      // silently fail — counts are non-critical
    }
  }, []);

  // ── On filter change, reset to page 0 ──────────────────────────────────────
  useEffect(() => {
    loadApps(0, statusFilter);
  }, [statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Load summary counts once on mount ──────────────────────────────────────
  useEffect(() => {
    loadCounts();
  }, [loadCounts]);

  const handleCancel = async (appId) => {
    try {
      await api.patch(`/api/rentals/applications/${appId}/cancel`);
      notify("Aplikimi u anulua me sukses");
      // Reload current page and refresh counts
      loadApps(page, statusFilter);
      loadCounts();
    } catch (err) {
      notify(err.response?.data?.message || "Gabim gjatë anulimit", "error");
    }
  };

  return (
    <MainLayout role="client">
      <div style={{ background: "#f5f2eb", minHeight: "100vh", fontFamily: "'Georgia', serif" }}>

        {/* Hero */}
        <div style={{ background: "linear-gradient(135deg, #5a5f3a 0%, #3d4228 100%)", padding: "40px 24px 36px", textAlign: "center" }}>
          <h1 style={{ margin: "0 0 6px", fontSize: "28px", fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>
            📋 Aplikimet e Mia
          </h1>
          <p style={{ margin: 0, color: "#c8ccaa", fontSize: "14.5px" }}>
            Shiko dhe menaxho aplikimet tuaja për qira
          </p>

          {/* Quick stats — use allCounts so they don't change when filtering */}
          {allCounts.total > 0 && (
            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 20, flexWrap: "wrap" }}>
              {[
                { label: "Gjithsej",  value: allCounts.total,    color: "#c8ccaa" },
                { label: "Në pritje", value: allCounts.PENDING,  color: "#fbbf24" },
                { label: "Aprovuar",  value: allCounts.APPROVED, color: "#34d399" },
              ].map(stat => (
                <div key={stat.label} style={{ background: "rgba(255,255,255,0.12)", borderRadius: 10, padding: "8px 20px", backdropFilter: "blur(4px)" }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: stat.color }}>{stat.value}</div>
                  <div style={{ fontSize: 11.5, color: "#c8ccaa", fontWeight: 600 }}>{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ maxWidth: "860px", margin: "0 auto", padding: "28px 24px" }}>

          {/* Status filter tabs */}
          <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
            {STATUS_FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                style={{
                  padding: "7px 16px", borderRadius: 20,
                  border: "1.5px solid",
                  borderColor: statusFilter === f.value ? "#5a5f3a" : "#d9d4c7",
                  background:  statusFilter === f.value ? "#5a5f3a" : "#fff",
                  color:       statusFilter === f.value ? "#fff"    : "#5a5f3a",
                  fontSize: 13, fontWeight: 600, cursor: "pointer",
                  fontFamily: "inherit", transition: "all 0.15s",
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Content */}
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} style={{ background: "#f0ece3", borderRadius: 14, height: 160, animation: "pulse 1.4s ease-in-out infinite" }} />
              ))}
            </div>
          ) : apps.length === 0 ? (
            <div style={{ textAlign: "center", padding: "64px 20px", color: "#8a8469" }}>
              <div style={{ fontSize: 48, marginBottom: 14 }}>📭</div>
              <h3 style={{ color: "#5a5f3a", margin: "0 0 8px", fontSize: 18 }}>
                {statusFilter ? "Nuk ka aplikime me këtë status" : "Nuk keni dërguar aplikime ende"}
              </h3>
              <p style={{ margin: "0 0 20px", fontSize: 14 }}>
                {statusFilter ? "Provoni të ndryshoni filtrin." : "Shikoni pronat dhe aplikoni për qira."}
              </p>
              {statusFilter && (
                <button
                  onClick={() => setStatusFilter("")}
                  style={{ padding: "9px 22px", borderRadius: 10, background: "#5a5f3a", color: "#fff", border: "none", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
                >
                  Shfaq të gjitha
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Results count label */}
              <p style={{ margin: "0 0 14px", fontSize: 13, color: "#8a8469" }}>
                {totalElements} aplikim{totalElements !== 1 ? "e" : ""}
                {statusFilter ? ` · ${STATUS_FILTERS.find(f => f.value === statusFilter)?.label}` : ""}
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {apps.map(app => (
                  <ApplicationCard key={app.id} app={app} onCancel={handleCancel} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 28 }}>
                  <button
                    disabled={page === 0}
                    onClick={() => loadApps(page - 1, statusFilter)}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 8, border: "1.5px solid #d9d4c7", background: page === 0 ? "#f5f2eb" : "#fff", color: page === 0 ? "#c5bfaf" : "#5a5f3a", cursor: page === 0 ? "not-allowed" : "pointer" }}
                  >
                    <ChevronLeftIcon />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i)
                    .filter(p => p === 0 || p === totalPages - 1 || Math.abs(p - page) <= 1)
                    .map((p, i, arr) => (
                      <span key={p} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {arr[i - 1] != null && p - arr[i - 1] > 1 && (
                          <span style={{ color: "#8a8469", fontSize: 14 }}>…</span>
                        )}
                        <button
                          onClick={() => loadApps(p, statusFilter)}
                          style={{ width: 36, height: 36, borderRadius: 8, border: "1.5px solid", borderColor: p === page ? "#5a5f3a" : "#d9d4c7", background: p === page ? "#5a5f3a" : "#fff", color: p === page ? "#fff" : "#5a5f3a", fontWeight: p === page ? 700 : 400, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}
                        >
                          {p + 1}
                        </button>
                      </span>
                    ))
                  }
                  <button
                    disabled={page >= totalPages - 1}
                    onClick={() => loadApps(page + 1, statusFilter)}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 8, border: "1.5px solid #d9d4c7", background: page >= totalPages - 1 ? "#f5f2eb" : "#fff", color: page >= totalPages - 1 ? "#c5bfaf" : "#5a5f3a", cursor: page >= totalPages - 1 ? "not-allowed" : "pointer" }}
                  >
                    <ChevronRightIcon />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {toast && (
        <Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />
      )}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:.9} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px);} to{opacity:1;transform:translateY(0);} }
        @keyframes spin { to { transform:rotate(360deg); } }
      `}</style>
    </MainLayout>
  );
}


