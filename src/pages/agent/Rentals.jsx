import { useState, useEffect, useCallback } from "react";
import MainLayout from "../../components/layout/Layout";
import api from "../../api/axios";

import "../../styles/agent/AgentRentals.css";

import { fmtPrice, fmtDate, fmtMoney, BTN_PRI, BTN_SEC } from "../../components/agent/rentals/rentalHelpers";
import { Toast, Loader, EmptyState, Pagination, StatusBadge } from "../../components/agent/rentals/RentalBadges";
import { ListingModal }      from "../../components/agent/rentals/ListingModal";
import { ApplicationsPanel } from "../../components/agent/rentals/ApplicationsPanel";
import { Modal }             from "../../components/agent/rentals/RentalBadges";

export default function AgentRentals() {
  const [listings, setListings]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [page, setPage]             = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [modalOpen, setModalOpen]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteId, setDeleteId]     = useState(null);
  const [appsTarget, setAppsTarget] = useState(null);
  const [toast, setToast]           = useState(null);

  const notify = useCallback((msg, type = "success") => setToast({ msg, type, key: Date.now() }), []);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/rentals/listings?page=${page}&size=12&sortBy=createdAt&sortDir=desc`);
      setListings(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
    } catch {
      notify("Gabim gjatë ngarkimit", "error");
    } finally {
      setLoading(false);
    }
  }, [page, notify]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  const handleDelete = async () => {
    try {
      await api.delete(`/api/rentals/listings/${deleteId}`);
      notify("Listing u fshi me sukses");
      setDeleteId(null);
      fetchListings();
    } catch (err) {
      notify(err.response?.data?.message || "Gabim gjatë fshirjes", "error");
    }
  };

  return (
    <MainLayout role="agent">
      <div className="ar">

        {/* ── Hero ── */}
        <div style={{
          background: "linear-gradient(160deg,#141210 0%,#1e1a14 45%,#241e16 100%)",
          minHeight: 260, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "36px 32px", position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.018) 1px,transparent 1px)", backgroundSize: "22px 22px", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: "-60px", left: "10%", width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle,rgba(126,184,164,0.07) 0%,transparent 70%)", pointerEvents: "none", animation: "ar-glow 4s ease-in-out infinite" }} />
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg,transparent,#c9b87a 30%,#c9b87a 70%,transparent)" }} />

          <div style={{ position: "relative", zIndex: 1, maxWidth: 700, width: "100%", textAlign: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(126,184,164,0.1)", border: "1px solid rgba(126,184,164,0.2)", borderRadius: 999, padding: "4px 14px", marginBottom: 14 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#7eb8a4", display: "inline-block" }} />
              <span style={{ fontSize: 10.5, fontWeight: 600, color: "#7eb8a4", letterSpacing: "1.2px", textTransform: "uppercase" }}>Rental Management</span>
            </div>

            <h1 style={{ margin: "0 0 10px", fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "clamp(26px,4vw,42px)", fontWeight: 700, color: "#f5f0e8", letterSpacing: "-0.7px" }}>
              Rental{" "}
              <span style={{ background: "linear-gradient(90deg,#7eb8a4,#a4d4c0,#7eb8a4)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                Listings
              </span>
            </h1>
            <p style={{ margin: "0 auto 22px", fontSize: 13.5, color: "rgba(245,240,232,0.38)" }}>
              Menaxho listat e qirasë dhe aplikimet e klientëve
            </p>

            <button
              className="ar-btn"
              onClick={() => { setEditTarget(null); setModalOpen(true); }}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "linear-gradient(135deg,#c9b87a,#b0983e)", color: "#1a1714", border: "none", borderRadius: 11, padding: "11px 24px", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", boxShadow: "0 6px 22px rgba(201,184,122,0.2)" }}
            >
              + New Listing
            </button>

            {!loading && listings.length > 0 && (
              <div style={{ marginTop: 18 }}>
                <span style={{ background: "rgba(245,240,232,0.06)", backdropFilter: "blur(10px)", borderRadius: 12, padding: "8px 16px", border: "1px solid rgba(245,240,232,0.09)", fontSize: 13, color: "rgba(245,240,232,0.5)", fontFamily: "'DM Sans',sans-serif" }}>
                  {listings.length} listings
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Toolbar ── */}
        <div style={{ background: "#fff", borderBottom: "1.5px solid #e8e2d6", padding: "0 28px", height: 46, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, fontFamily: "'DM Sans',sans-serif", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 10px rgba(20,16,10,0.05)" }}>
          <p style={{ margin: 0, fontSize: 12.5, color: "#9a8c6e" }}>{loading ? "Loading…" : `${listings.length} listings`}</p>
          <button className="ar-btn" onClick={() => { setEditTarget(null); setModalOpen(true); }} style={{ ...BTN_PRI, padding: "5px 14px", fontSize: 12 }}>
            + New Listing
          </button>
        </div>

        {/* ── Content ── */}
        <div style={{ padding: "20px 24px", maxWidth: 1440, margin: "0 auto" }}>
          <div style={{ background: "#fff", borderRadius: 14, border: "1.5px solid #ece6da", boxShadow: "0 2px 16px rgba(20,16,10,0.07)", overflow: "hidden" }}>

            {/* Card header */}
            <div style={{ padding: "14px 20px", borderBottom: "1.5px solid #e8e2d6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontWeight: 700, fontSize: 17, color: "#1a1714" }}>Të gjitha Rental Listings</span>
              {listings.length > 0 && (
                <span style={{ background: "rgba(201,184,122,0.1)", color: "#c9b87a", border: "1px solid rgba(201,184,122,0.22)", borderRadius: 999, padding: "2px 10px", fontSize: 10.5, fontWeight: 700 }}>
                  {listings.length} listings
                </span>
              )}
            </div>

            {loading ? (
              <Loader />
            ) : listings.length === 0 ? (
              <EmptyState icon="🔑" text="Nuk ka rental listings. Krijo listingun e parë." />
            ) : (
              <>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#faf7f2" }}>
                        {["#","Titull / Property","Çmimi","Depozita","Disponueshëm","Min. muaj","Statusi","Veprime"].map(h => (
                          <th key={h} style={{ textAlign: "left", fontSize: 10.5, fontWeight: 600, color: "#b0a890", textTransform: "uppercase", letterSpacing: "0.8px", padding: "10px 16px", borderBottom: "1.5px solid #e8e2d6", whiteSpace: "nowrap" }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {listings.map(l => (
                        <tr
                          key={l.id}
                          style={{ borderBottom: "1px solid #f0ece3", transition: "background 0.12s" }}
                          onMouseEnter={e => e.currentTarget.style.background = "#faf7f2"}
                          onMouseLeave={e => e.currentTarget.style.background = ""}
                        >
                          <td style={{ padding: "12px 16px", color: "#b0a890", fontSize: 12 }}>{l.id}</td>
                          <td style={{ padding: "12px 16px" }}>
                            <p style={{ fontWeight: 500, fontSize: 13.5, margin: "0 0 3px", color: "#1a1714" }}>{l.title || `Listing #${l.id}`}</p>
                            <span style={{ background: "rgba(201,184,122,0.1)", color: "#c9b87a", border: "1px solid rgba(201,184,122,0.22)", padding: "1px 7px", borderRadius: 999, fontSize: 10.5, fontWeight: 600 }}>
                              prop #{l.property_id}
                            </span>
                          </td>
                          <td style={{ padding: "12px 16px", fontWeight: 700, fontSize: 13.5, color: "#1a1714", fontFamily: "'Cormorant Garamond',Georgia,serif" }}>{fmtPrice(l.price, l.currency, l.price_period)}</td>
                          <td style={{ padding: "12px 16px", fontSize: 13, color: "#6b6248" }}>{fmtMoney(l.deposit)}</td>
                          <td style={{ padding: "12px 16px" }}>
                            <p style={{ fontSize: 12, color: "#9a8c6e", margin: "0 0 2px" }}>{fmtDate(l.available_from)} →</p>
                            <p style={{ fontSize: 12, color: "#9a8c6e", margin: 0 }}>{fmtDate(l.available_until)}</p>
                          </td>
                          <td style={{ padding: "12px 16px", textAlign: "center", fontSize: 13, color: "#6b6248" }}>{l.min_lease_months || "—"}</td>
                          <td style={{ padding: "12px 16px" }}><StatusBadge status={l.status} /></td>
                          <td style={{ padding: "12px 16px" }}>
                            <div style={{ display: "flex", gap: 5 }}>
                              <button className="ar-btn" onClick={() => setAppsTarget(l)} style={{ padding: "5px 11px", borderRadius: 9, border: "1.5px solid rgba(201,184,122,0.3)", background: "rgba(201,184,122,0.08)", color: "#8a7230", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Aplikimet</button>
                              <button className="ar-btn" onClick={() => { setEditTarget(l); setModalOpen(true); }} style={{ ...BTN_SEC, padding: "5px 11px", fontSize: 12 }}>Edit</button>
                              <button className="ar-btn" onClick={() => setDeleteId(l.id)} style={{ padding: "5px 11px", borderRadius: 9, border: "1.5px solid rgba(212,133,90,0.3)", background: "rgba(212,133,90,0.08)", color: "#8b4013", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Del</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination page={page} totalPages={totalPages} onChange={setPage} />
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Modalet ── */}
      {modalOpen && (
        <ListingModal
          initial={editTarget}
          onClose={() => setModalOpen(false)}
          onSuccess={() => { setModalOpen(false); fetchListings(); notify(editTarget ? "Listing u ndryshua" : "Listing u krijua"); }}
          notify={notify}
        />
      )}

      {deleteId && (
        <Modal title="Konfirmo fshirjen" onClose={() => setDeleteId(null)}>
          <p style={{ fontSize: 14, color: "#6b6248", marginBottom: 20 }}>
            A jeni i sigurt që dëshironi të fshini listing <strong style={{ color: "#1a1714" }}>#{deleteId}</strong>?
          </p>
          <div style={{ display: "flex", gap: 9, justifyContent: "flex-end" }}>
            <button style={BTN_SEC} onClick={() => setDeleteId(null)}>Anulo</button>
            <button style={{ ...BTN_PRI, background: "#8b3a1c" }} onClick={handleDelete}>Fshi</button>
          </div>
        </Modal>
      )}

      {appsTarget && <ApplicationsPanel listing={appsTarget} onClose={() => setAppsTarget(null)} notify={notify} />}
      {toast && <Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </MainLayout>
  );
}