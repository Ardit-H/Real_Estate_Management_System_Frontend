import { useState, useEffect, useCallback } from "react";
import MainLayout from "../../components/layout/Layout";
import api from "../../api/axios";

import "../../styles/admin/AdminRentalApplications.css";
import RentalAppStatCards      from "../../components/admin/rentalApplications/RentalAppStatCards";
import RentalAppToolbar        from "../../components/admin/rentalApplications/RentalAppToolbar";
import RentalAppTable          from "../../components/admin/rentalApplications/RentalAppTable";
import RentalAppDetailModal    from "../../components/admin/rentalApplications/RentalAppDetailModal";
import RentalAppReviewModal    from "../../components/admin/rentalApplications/RentalAppReviewModal";
import RentalAppsByListingModal from "../../components/admin/rentalApplications/RentalAppsByListingModal";

function Toast({ msg, type = "success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{
      position: "fixed", bottom: 26, right: 26, zIndex: 9999,
      background: "#1a1714", color: type === "error" ? "#f09090" : "#90c8a8",
      padding: "11px 18px", borderRadius: 12, fontSize: 13,
      boxShadow: "0 10px 36px rgba(0,0,0,0.32)",
      border: `1px solid ${type === "error" ? "rgba(240,128,128,0.15)" : "rgba(144,200,168,0.15)"}`,
      maxWidth: 320, fontFamily: "'DM Sans', sans-serif",
      animation: "ara-toast 0.2s ease", display: "flex", alignItems: "center", gap: 8,
    }}>
      <span style={{ fontSize: 14 }}>{type === "error" ? "⚠️" : "✅"}</span>
      {msg}
    </div>
  );
}

export default function AdminRentalApplications() {
  const [listingId,    setListingId]    = useState("");
  const [inputId,      setInputId]      = useState("");
  const [apps,         setApps]         = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [statusF,      setStatusF]      = useState("");

  const [detailTarget,  setDetailTarget]  = useState(null);
  const [reviewTarget,  setReviewTarget]  = useState(null);
  const [listingModal,  setListingModal]  = useState(null);

  const [toast, setToast] = useState(null);
  const notify = useCallback((msg, type = "success") => setToast({ msg, type, key: Date.now() }), []);

  const fetchApps = useCallback(async () => {
    if (!listingId) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/rentals/applications/listing/${listingId}`);
      setApps(res.data || []);
    } catch (err) {
      notify(err.response?.data?.message || "Gabim gjatë ngarkimit", "error");
    } finally { setLoading(false); }
  }, [listingId, notify]);

  useEffect(() => { fetchApps(); }, [fetchApps]);

  const displayed = statusF ? apps.filter(a => a.status === statusF) : apps;

  return (
    <MainLayout role="admin">
      <div className="ara-wrap" style={{ padding: "1.5rem 0" }}>

        {/* ── Hero Header ── */}
        <div style={{
          background: "linear-gradient(160deg, #141210 0%, #1e1a14 45%, #241e16 100%)",
          borderRadius: 16, padding: "28px 28px 24px", marginBottom: 22,
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.015) 1px,transparent 1px)", backgroundSize: "22px 22px", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,#c9b87a 30%,#c9b87a 70%,transparent)" }} />
          <div style={{ position: "relative" }}>
            <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 28, fontWeight: 700, color: "#f5f0e8", margin: "0 0 4px", letterSpacing: "-0.4px" }}>Rental Applications</h1>
            <p style={{ fontSize: 13, color: "rgba(245,240,232,0.35)", margin: 0, fontFamily: "'DM Sans', sans-serif" }}>Admin view — shiko dhe shqyrto aplikimet sipas listing</p>
          </div>
        </div>

        <RentalAppStatCards apps={apps} />

        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid rgba(138,125,94,0.15)", overflow: "hidden", boxShadow: "0 2px 20px rgba(20,16,10,0.06)" }}>
          <RentalAppToolbar
            inputId={inputId}
            setInputId={setInputId}
            onLoad={() => setListingId(inputId ? Number(inputId) : "")}
            listingId={listingId}
            onOpenModal={() => setListingModal(listingId)}
            statusF={statusF}
            setStatusF={setStatusF}
          />
          <RentalAppTable
            apps={displayed}
            loading={loading}
            listingId={listingId}
            statusF={statusF}
            onDetail={setDetailTarget}
            onReview={setReviewTarget}
          />
        </div>

      </div>

      {detailTarget && (
        <RentalAppDetailModal app={detailTarget} onClose={() => setDetailTarget(null)} />
      )}
      {reviewTarget && (
        <RentalAppReviewModal
          app={reviewTarget}
          onClose={() => setReviewTarget(null)}
          onSuccess={() => { setReviewTarget(null); fetchApps(); notify("Aplikimi u shqyrtua"); }}
          notify={notify}
        />
      )}
      {listingModal && (
        <RentalAppsByListingModal
          listingId={listingModal}
          onClose={() => setListingModal(null)}
          notify={notify}
        />
      )}
      {toast && (
        <Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />
      )}
    </MainLayout>
  );
}