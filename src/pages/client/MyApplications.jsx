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
const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
  </svg>
);
const ChevronLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 18-6-6 6-6"/>
  </svg>
);
const ChevronRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: "fixed", inset: 0, background: "rgba(20,20,10,0.72)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", animation: "fadeInOverlay 0.2s ease" }}
    >
      <div style={{ background: "#faf8f3", borderRadius: "18px", width: "100%", maxWidth: "400px", boxShadow: "0 24px 64px rgba(0,0,0,0.35)", animation: "slideUpModal 0.25s ease", padding: "32px 28px 26px" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>⚠️</div>
          <p style={{ fontWeight: 800, fontSize: "17px", margin: "0 0 8px", color: "#2c2c1e" }}>Anulo aplikimin?</p>
          <p style={{ fontSize: "13.5px", color: "#8a8469", margin: 0, lineHeight: 1.5 }}>Ky veprim nuk mund të kthehet prapa.</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose}
            style={{ flex: 1, padding: "11px", borderRadius: "10px", border: "1.5px solid #d9d4c7", background: "#fff", color: "#5a5f3a", fontWeight: 600, fontSize: "14px", cursor: "pointer", fontFamily: "inherit" }}>
            Jo, mbaje
          </button>
          <button onClick={onConfirm} disabled={loading}
            style={{ flex: 1, padding: "11px", borderRadius: "10px", border: "none", background: loading ? "#c5a08a" : "#8b4513", color: "#fff", fontWeight: 700, fontSize: "14px", cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
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
      } catch {}
      finally { if (!cancelled) setLoading(false); }
    };
    load();
    return () => { cancelled = true; };
  }, [listingId]);

  if (loading) return (
    <div style={{ display: "flex", gap: 6, alignItems: "center", fontSize: "12px", color: "#a0997e", marginTop: 6 }}>
      <div style={{ width: 12, height: 12, border: "2px solid #e5e0d4", borderTop: "2px solid #5a5f3a", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
      Duke ngarkuar detajet...
    </div>
  );

  if (!listing) return <div style={{ marginTop: 6, fontSize: "12px", color: "#a0997e" }}>Listing #{listingId}</div>;

  const fmtMoney = (v) => v != null ? `€${Number(v).toLocaleString("de-DE")}` : null;
  const fmtDate  = (d) => d ? new Date(d).toLocaleDateString("sq-AL") : null;

  return (
    <div style={{ marginTop: 10, background: "#f5f2eb", border: "1px solid #e5e0d4", borderRadius: "10px", padding: "12px 16px" }}>
      <p style={{ fontWeight: 700, fontSize: "13.5px", margin: "0 0 6px", color: "#2c2c1e" }}>
        {listing.title || `Listing #${listing.id}`}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 18px", fontSize: "12.5px", color: "#6b6651" }}>
        {listing.price != null && (
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <EuroIcon />{fmtMoney(listing.price)} / {(listing.price_period || "monthly").toLowerCase()}
          </span>
        )}
        {listing.deposit != null && (
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <EuroIcon />Depozita: {fmtMoney(listing.deposit)}
          </span>
        )}
        {listing.min_lease_months && (
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <ClockIcon />Min. {listing.min_lease_months} muaj
          </span>
        )}
        {listing.available_from && (
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <CalendarIcon />Nga {fmtDate(listing.available_from)}
          </span>
        )}
        {listing.available_until && (
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <CalendarIcon />Deri {fmtDate(listing.available_until)}
          </span>
        )}
      </div>
      {listing.description && (
        <p style={{ margin: "8px 0 0", fontSize: "12.5px", color: "#4a4a36", lineHeight: 1.6 }}>
          {listing.description}
        </p>
      )}
    </div>
  );
}

// ─── Application Card ─────────────────────────────────────────────────────────
function ApplicationCard({ app, onCancel }) {
  const [cancelling,  setCancelling]  = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const STATUS_CONFIG = {
    PENDING:   { bg: "#fffbeb", color: "#c9a84c", border: "#f0d878", label: "Në pritje", icon: "⏳", strip: "#c9a84c" },
    APPROVED:  { bg: "#edf5f0", color: "#2a6049", border: "#a3c9b0", label: "Aprovuar",  icon: "✅", strip: "#2a6049" },
    REJECTED:  { bg: "#fef2f2", color: "#8b4513", border: "#f5c6a0", label: "Refuzuar",  icon: "❌", strip: "#8b4513" },
    CANCELLED: { bg: "#f5f2eb", color: "#8a8469", border: "#d9d4c7", label: "Anuluar",   icon: "🚫", strip: "#a0997e" },
  };

  const s       = STATUS_CONFIG[app.status] || STATUS_CONFIG.CANCELLED;
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("sq-AL", { day: "2-digit", month: "long", year: "numeric" }) : "—";
  const fmtMon  = (v) => v != null ? `€${Number(v).toLocaleString("de-DE")}` : null;

  const handleConfirmCancel = async () => {
    setCancelling(true);
    await onCancel(app.id);
    setCancelling(false);
    setShowConfirm(false);
  };

  return (
    <>
      <div
        style={{ background: "#fff", borderRadius: "14px", overflow: "hidden", boxShadow: "0 2px 12px rgba(90,95,58,0.10)", border: "1px solid #ede9df", transition: "transform 0.18s, box-shadow 0.18s" }}
        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(90,95,58,0.18)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(90,95,58,0.10)"; }}
      >
        {/* status colour strip — identical to PropertyCard listing badge pattern */}
        <div style={{ height: "4px", background: s.strip }} />

        <div style={{ padding: "18px 22px" }}>
          {/* Top row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "14px" }}>
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#a0997e", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "4px" }}>
                Aplikim #{app.id}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "#8a8469", fontSize: "12.5px" }}>
                <CalendarIcon />
                <span>Dërguar më {fmtDate(app.created_at)}</span>
              </div>
            </div>
            {/* status badge — same rounded pill as BrowseProperties listingBadge */}
            <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, padding: "3px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}>
              {s.icon} {s.label}
            </span>
          </div>

          {/* Listing section */}
          <div style={{ marginBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11.5px", fontWeight: 700, color: "#6b6651", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "2px" }}>
              <HomeIcon /> Listing
            </div>
            <ListingDetail listingId={app.listing_id} />
          </div>

          {/* Income / move-in info bar */}
          {(app.income != null || app.move_in_date) && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 20px", padding: "10px 14px", background: "#f5f2eb", borderRadius: "8px", border: "1px solid #e5e0d4", marginBottom: "12px" }}>
              {app.income != null && (
                <span style={{ fontSize: "12.5px", color: "#4a4a36", display: "flex", alignItems: "center", gap: 4 }}>
                  <EuroIcon /> Të ardhura: <strong>{fmtMon(app.income)}/muaj</strong>
                </span>
              )}
              {app.move_in_date && (
                <span style={{ fontSize: "12.5px", color: "#4a4a36", display: "flex", alignItems: "center", gap: 4 }}>
                  <CalendarIcon /> Hyrja: <strong>{fmtDate(app.move_in_date)}</strong>
                </span>
              )}
            </div>
          )}

          {/* Message quote */}
          {app.message && (
            <div style={{ padding: "10px 14px", background: "#f5f2eb", borderLeft: "3px solid #a3a380", borderRadius: "0 8px 8px 0", marginBottom: "12px" }}>
              <p style={{ margin: 0, fontSize: "13px", color: "#4a4a36", fontStyle: "italic", lineHeight: 1.6 }}>"{app.message}"</p>
            </div>
          )}

          {/* Status banners */}
          {app.status === "APPROVED" && (
            <div style={{ background: "#edf5f0", border: "1px solid #a3c9b0", borderRadius: "10px", padding: "12px 14px", fontSize: "13px", color: "#2a6049", display: "flex", alignItems: "center", gap: 8, marginBottom: "4px" }}>
              🎉 <span>Aplikimi juaj u aprovua! Agjenti do t'ju kontaktojë së shpejti.</span>
            </div>
          )}
          {app.status === "CANCELLED" && (
            <div style={{ background: "#f5f2eb", border: "1px solid #d9d4c7", borderRadius: "10px", padding: "12px 14px", fontSize: "13px", color: "#8a8469", display: "flex", alignItems: "center", gap: 8, marginBottom: "4px" }}>
              🚫 <span>Ky aplikim është anuluar.</span>
            </div>
          )}
          {app.status === "REJECTED" && (
            <div style={{ background: "#fff5ee", border: "1px solid #f5c6a0", borderRadius: "10px", padding: "12px 14px", fontSize: "13px", color: "#8b4513", display: "flex", alignItems: "center", gap: 8, marginBottom: "4px" }}>
              ❌ <span>Aplikimi juaj u refuzua.</span>
            </div>
          )}

          {/* Cancel button — PENDING only */}
          {app.status === "PENDING" && (
            <div style={{ marginTop: "14px" }}>
              <button
                onClick={() => setShowConfirm(true)}
                style={{ padding: "8px 18px", borderRadius: "8px", border: "1.5px solid #d9c4b0", background: "#fff", color: "#8b4513", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s", display: "flex", alignItems: "center", gap: 6 }}
                onMouseEnter={e => { e.currentTarget.style.background = "#fff5ee"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#fff"; }}
              >
                <CloseIcon /> Anulo aplikimin
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

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ page, totalPages, onLoadApps, statusFilter }) {
  if (totalPages <= 1) return null;
  const pages   = Array.from({ length: totalPages }, (_, i) => i);
  const visible = pages.filter(p => p === 0 || p === totalPages - 1 || Math.abs(p - page) <= 1);
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginTop: "36px", flexWrap: "wrap" }}>
      <button disabled={page === 0} onClick={() => onLoadApps(page - 1, statusFilter)}
        style={S.pageBtn(false, page === 0)}><ChevronLeftIcon /></button>
      {visible.map((p, i) => {
        const gap = visible[i - 1] != null && p - visible[i - 1] > 1;
        return (
          <span key={p} style={{ display: "flex", gap: "6px" }}>
            {gap && <span style={{ padding: "6px 4px", color: "#8a8469" }}>…</span>}
            <button onClick={() => onLoadApps(p, statusFilter)} style={S.pageBtn(p === page, false)}>{p + 1}</button>
          </span>
        );
      })}
      <button disabled={page === totalPages - 1} onClick={() => onLoadApps(page + 1, statusFilter)}
        style={S.pageBtn(false, page === totalPages - 1)}><ChevronRightIcon /></button>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} style={{ background: "#f0ece3", borderRadius: "14px", height: "160px", animation: "pulse 1.4s ease-in-out infinite" }} />
      ))}
    </div>
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

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MyApplications() {
  const [apps,          setApps]          = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [page,          setPage]          = useState(0);
  const [totalPages,    setTotalPages]    = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [allCounts,     setAllCounts]     = useState({ PENDING: 0, APPROVED: 0, total: 0 });
  const [toast,         setToast]         = useState(null);
  const [statusFilter,  setStatusFilter]  = useState("");

  const notify = useCallback((msg, type = "success") =>
    setToast({ msg, type, key: Date.now() }), []);

  const loadApps = useCallback(async (pg = 0, status = statusFilter) => {
    setLoading(true);
    try {
      const params = { page: pg, size: 10 };
      if (status) params.status = status;
      const res  = await api.get("/api/rentals/applications/my", { params });
      const data = res.data;
      setApps(data.content        || []);
      setTotalPages(data.totalPages   || 0);
      setTotalElements(data.totalElements || 0);
      setPage(pg);
    } catch {
      notify("Gabim gjatë ngarkimit të aplikimeve", "error");
    } finally {
      setLoading(false);
    }
  }, [notify, statusFilter]);

  const loadCounts = useCallback(async () => {
    try {
      const [totalRes, pendingRes, approvedRes] = await Promise.all([
        api.get("/api/rentals/applications/my", { params: { page: 0, size: 1 } }),
        api.get("/api/rentals/applications/my", { params: { page: 0, size: 1, status: "PENDING" } }),
        api.get("/api/rentals/applications/my", { params: { page: 0, size: 1, status: "APPROVED" } }),
      ]);
      setAllCounts({
        total:    totalRes.data.totalElements    || 0,
        PENDING:  pendingRes.data.totalElements  || 0,
        APPROVED: approvedRes.data.totalElements || 0,
      });
    } catch {}
  }, []);

  useEffect(() => { loadApps(0, statusFilter); }, [statusFilter]); // eslint-disable-line
  useEffect(() => { loadCounts(); }, [loadCounts]);

  const handleCancel = async (appId) => {
    try {
      await api.patch(`/api/rentals/applications/${appId}/cancel`);
      notify("Aplikimi u anulua me sukses");
      loadApps(page, statusFilter);
      loadCounts();
    } catch (err) {
      notify(err.response?.data?.message || "Gabim gjatë anulimit", "error");
    }
  };

  return (
    <MainLayout role="client">
      {/* ── Exact same outer wrapper as BrowseProperties ── */}
      <div style={{ background: "#f5f2eb", minHeight: "100vh", fontFamily: "'Georgia', serif" }}>

        {/* ── Hero — same gradient, same padding ── */}
        <div style={{ background: "linear-gradient(135deg, #5a5f3a 0%, #3d4228 100%)", padding: "48px 32px 40px", textAlign: "center" }}>
          <h1 style={{ margin: "0 0 8px", fontSize: "32px", fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>
            Aplikimet e Mia
          </h1>
          <p style={{ margin: "0 0 24px", color: "#c8ccaa", fontSize: "15px" }}>
            Shiko dhe menaxho aplikimet tuaja për qira
          </p>

          {/* Stat pills — same glass style as BrowseProperties */}
          {allCounts.total > 0 && (
            <div style={{ display: "flex", gap: "10px", maxWidth: "480px", margin: "0 auto", justifyContent: "center", flexWrap: "wrap" }}>
              {[
                { label: "Gjithsej",  value: allCounts.total,    color: "#c8ccaa" },
                { label: "Në pritje", value: allCounts.PENDING,  color: "#c9a84c" },
                { label: "Aprovuar",  value: allCounts.APPROVED, color: "#a3c9b0" },
              ].map(stat => (
                <div key={stat.label} style={{ background: "rgba(255,255,255,0.13)", backdropFilter: "blur(6px)", borderRadius: "10px", padding: "10px 20px", border: "1px solid rgba(255,255,255,0.18)" }}>
                  <div style={{ fontSize: "24px", fontWeight: 900, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
                  <div style={{ fontSize: "11px", color: "#c8ccaa", fontWeight: 600, marginTop: "3px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Body — same padding & maxWidth as BrowseProperties ── */}
        <div style={{ padding: "28px 24px", maxWidth: "1400px", margin: "0 auto" }}>

          {/* Toolbar row — mirrors BrowseProperties count + filter row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "10px" }}>

            {/* Left: count + active-filter chip */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <span style={{ color: "#8a8469", fontSize: "13.5px" }}>
                {loading ? "Duke ngarkuar…" : `${totalElements} aplikim${totalElements !== 1 ? "e" : ""} gjithsej`}
              </span>
              {statusFilter && (
                <button onClick={() => setStatusFilter("")}
                  style={{ display: "flex", alignItems: "center", gap: "5px", background: "#fff0f0", color: "#c0392b", border: "1px solid #f5c6c6", borderRadius: "8px", padding: "5px 12px", fontSize: "12.5px", cursor: "pointer", fontFamily: "inherit" }}>
                  Pastro filtrin <CloseIcon />
                </button>
              )}
              {statusFilter && (
                <span style={{ background: "#edf2e8", color: "#5a5f3a", border: "1px solid #c8d4b0", borderRadius: "8px", padding: "4px 10px", fontSize: "12.5px" }}>
                  Status: <strong>{STATUS_FILTERS.find(f => f.value === statusFilter)?.label}</strong>
                </span>
              )}
            </div>

            {/* Right: filter pills — same style as grid/list toggle in BrowseProperties */}
            <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
              {STATUS_FILTERS.map(f => (
                <button key={f.value} onClick={() => setStatusFilter(f.value)}
                  style={{ padding: "7px 14px", borderRadius: "8px", border: "none", background: statusFilter === f.value ? "#5a5f3a" : "#f0ece3", color: statusFilter === f.value ? "#fff" : "#5a5f3a", cursor: "pointer", fontSize: "13px", fontWeight: 600, transition: "all 0.15s", fontFamily: "inherit" }}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Empty state */}
          {!loading && apps.length === 0 && (
            <div style={{ textAlign: "center", padding: "64px 32px", color: "#8a8469" }}>
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>📭</div>
              <h3 style={{ color: "#5a5f3a", margin: "0 0 8px" }}>
                {statusFilter ? "Nuk ka aplikime me këtë status" : "Nuk keni dërguar aplikime ende"}
              </h3>
              <p style={{ margin: "0 0 16px" }}>
                {statusFilter ? "Provoni të ndryshoni filtrin." : "Shikoni pronat dhe aplikoni për qira."}
              </p>
              {statusFilter && (
                <button onClick={() => setStatusFilter("")}
                  style={{ ...S.applyBtn, width: "auto", padding: "10px 24px" }}>
                  Shfaq të gjitha
                </button>
              )}
            </div>
          )}

          {loading && <Skeleton />}

          {!loading && apps.length > 0 && (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {apps.map(app => (
                  <ApplicationCard key={app.id} app={app} onCancel={handleCancel} />
                ))}
              </div>
              <Pagination page={page} totalPages={totalPages} onLoadApps={loadApps} statusFilter={statusFilter} />
            </>
          )}
        </div>
      </div>

      {toast && <Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}

      <style>{`
        @keyframes pulse         { 0%,100%{opacity:.5} 50%{opacity:.9} }
        @keyframes fadeInOverlay { from{opacity:0} to{opacity:1} }
        @keyframes slideUpModal  { from{transform:translateY(24px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes fadeUp        { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin          { to{transform:rotate(360deg)} }
      `}</style>
    </MainLayout>
  );
}

// ─── Styles — same S object as BrowseProperties ───────────────────────────────
const S = {
  applyBtn: {
    width: "100%", padding: "11px", background: "#5a5f3a", color: "#fff",
    border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 700,
    cursor: "pointer", fontFamily: "'Georgia', serif",
  },
  pageBtn: (active, disabled) => ({
    padding: "7px 13px", borderRadius: "8px", border: "1.5px solid",
    borderColor: active ? "#5a5f3a" : "#d9d4c7",
    background:  active ? "#5a5f3a" : "#fff",
    color: active ? "#fff" : disabled ? "#c5bfaf" : "#5a5f3a",
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: "13px", fontWeight: active ? 700 : 400,
    fontFamily: "inherit", transition: "all 0.15s",
    display: "flex", alignItems: "center", justifyContent: "center",
    minWidth: "36px", minHeight: "36px",
  }),
};