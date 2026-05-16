import { useState, useEffect, useCallback } from "react";
import MainLayout from "../../components/layout/Layout";
import api from "../../api/axios";

import "../../styles/admin/AdminRentals.css";
import RentalsStatCards   from "../../components/admin/rentals/RentalsStatCards";
import RentalsToolbar     from "../../components/admin/rentals/RentalsToolbar";
import RentalsTable       from "../../components/admin/rentals/RentalsTable";
import RentalDetailModal  from "../../components/admin/rentals/RentalDetailModal";
import RentalFormModal    from "../../components/admin/rentals/RentalFormModal";
import RentalDeleteModal  from "../../components/admin/rentals/RentalDeleteModal";
import { primaryBtn }     from "../../components/admin/rentals/rentalsHelpers";

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
      animation: "ar-toast 0.2s ease", display: "flex", alignItems: "center", gap: 8,
    }}>
      <span style={{ fontSize: 14 }}>{type === "error" ? "⚠️" : "✅"}</span>
      {msg}
    </div>
  );
}

export default function AdminRentals() {
  const [rows,       setRows]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [page,       setPage]       = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [total,      setTotal]      = useState(0);
  const [statusF,    setStatusF]    = useState("");
  const [search,     setSearch]     = useState("");

  const [createOpen,   setCreateOpen]   = useState(false);
  const [editTarget,   setEditTarget]   = useState(null);
  const [detailTarget, setDetailTarget] = useState(null);
  const [deleteId,     setDeleteId]     = useState(null);
  const [deleting,     setDeleting]     = useState(false);

  const [toast, setToast] = useState(null);
  const notify = useCallback((msg, type = "success") => setToast({ msg, type, key: Date.now() }), []);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, size: 10 };
      if (statusF) params.status = statusF;
      const res = await api.get("/api/rentals/listings", { params });
      const d = res.data;
      const content = d.content ?? (Array.isArray(d) ? d : []);
      setRows(content);
      setTotalPages(d.totalPages ?? 1);
      setTotal(d.totalElements ?? content.length);
    } catch (err) {
      notify(err.response?.data?.message || "Gabim gjatë ngarkimit", "error");
    } finally { setLoading(false); }
  }, [page, statusF, notify]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/api/rentals/listings/${deleteId}`);
      notify("Listing u fshi me sukses");
      setDeleteId(null);
      fetchListings();
    } catch (err) {
      notify(err.response?.data?.message || "Gabim gjatë fshirjes", "error");
    } finally { setDeleting(false); }
  };

  const displayed = rows
    .filter(r => !statusF || r.status === statusF)
    .filter(r =>
      !search.trim() ||
      String(r.id).includes(search) ||
      (r.title && r.title.toLowerCase().includes(search.toLowerCase())) ||
      String(r.property_id).includes(search) ||
      String(r.agent_id || "").includes(search)
    );

  return (
    <MainLayout role="admin">
      <div style={{ backgroundColor: "#f2ede4", minHeight: "100vh", padding: 24 }}>
        <div className="ar-wrap" style={{ padding: "1.5rem 0" }}>

          {/* ── Hero Header ── */}
          <div style={{
            background: "linear-gradient(160deg, #141210 0%, #1e1a14 45%, #241e16 100%)",
            borderRadius: 16, padding: "28px 28px 24px", marginBottom: 22,
            position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.015) 1px,transparent 1px)", backgroundSize: "22px 22px", pointerEvents: "none" }} />
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,#c9b87a 30%,#c9b87a 70%,transparent)" }} />
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap", position: "relative" }}>
              <div>
                <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 28, fontWeight: 700, color: "#f5f0e8", margin: "0 0 4px", letterSpacing: "-0.4px" }}>Rental Listings</h1>
                <p style={{ fontSize: 13, color: "rgba(245,240,232,0.35)", margin: 0, fontFamily: "'DM Sans', sans-serif" }}>Admin view — full CRUD access të gjitha listings ({total} gjithsej)</p>
              </div>
              <button onClick={() => setCreateOpen(true)} style={primaryBtn}>+ New Listing</button>
            </div>
          </div>

          <RentalsStatCards total={total} rows={rows} />

          <div style={{ background: "#fff", borderRadius: 14, border: "1px solid rgba(138,125,94,0.15)", overflow: "hidden", boxShadow: "0 2px 20px rgba(20,16,10,0.06)" }}>
            <RentalsToolbar
              search={search}
              setSearch={setSearch}
              statusF={statusF}
              setStatusF={setStatusF}
              setPage={setPage}
              total={total}
            />
            <RentalsTable
              rows={displayed}
              loading={loading}
              search={search}
              page={page}
              totalPages={totalPages}
              onPage={setPage}
              onDetail={setDetailTarget}
              onEdit={setEditTarget}
              onDelete={setDeleteId}
            />
          </div>

        </div>
      </div>

      {createOpen && (
        <RentalFormModal
          onClose={() => setCreateOpen(false)}
          onSuccess={() => { setCreateOpen(false); setPage(0); fetchListings(); notify("Listing u krijua"); }}
          notify={notify}
        />
      )}
      {editTarget && (
        <RentalFormModal
          initial={editTarget}
          onClose={() => setEditTarget(null)}
          onSuccess={() => { setEditTarget(null); fetchListings(); notify("Listing u ndryshua"); }}
          notify={notify}
        />
      )}
      {detailTarget && (
        <RentalDetailModal listing={detailTarget} onClose={() => setDetailTarget(null)} />
      )}
      {deleteId && (
        <RentalDeleteModal
          id={deleteId}
          onCancel={() => setDeleteId(null)}
          onConfirm={handleDelete}
          loading={deleting}
        />
      )}
      {toast && (
        <Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />
      )}
    </MainLayout>
  );
}