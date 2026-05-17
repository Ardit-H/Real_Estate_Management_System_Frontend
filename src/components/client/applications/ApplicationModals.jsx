import { useState, useEffect } from "react";
import api from "../../../api/axios";
import { CalendarIcon, EuroIcon, ClockIcon } from "./applicationsConstants";
 
// ─── Confirm Cancel Modal ─────────────────────────────────────────────────────
export function ConfirmCancelModal({ onConfirm, onClose, loading }) {
  useEffect(() => {
    const h = e => e.key === "Escape" && onClose();
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
          <p style={{ fontWeight: 800, fontSize: "17px", margin: "0 0 8px", color: "#2c2c1e" }}>Cancel application?</p>
          <p style={{ fontSize: "13.5px", color: "#8a8469", margin: 0, lineHeight: 1.5 }}>This action cannot be undone.</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose}
            style={{ flex: 1, padding: "11px", borderRadius: "10px", border: "1.5px solid #d9d4c7", background: "#fff", color: "#5a5f3a", fontWeight: 600, fontSize: "14px", cursor: "pointer", fontFamily: "inherit" }}>
            No, keep it
          </button>
          <button onClick={onConfirm} disabled={loading}
            style={{ flex: 1, padding: "11px", borderRadius: "10px", border: "none", background: loading ? "#c5a08a" : "#8b4513", color: "#fff", fontWeight: 700, fontSize: "14px", cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
            {loading ? "Canceling..." : "Yes, cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}
 
// ─── Listing Detail ───────────────────────────────────────────────────────────
export function ListingDetail({ listingId }) {
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
      Loading details...
    </div>
  );
 
  if (!listing) return <div style={{ marginTop: 6, fontSize: "12px", color: "#a0997e" }}>Listing #{listingId}</div>;
 
  const fmtMoney = v => v != null ? `€${Number(v).toLocaleString("de-DE")}` : null;
  const fmtDate  = d => d ? new Date(d).toLocaleDateString("sq-AL") : null;
 
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
            <EuroIcon />Deposit: {fmtMoney(listing.deposit)}
          </span>
        )}
        {listing.min_lease_months && (
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <ClockIcon />Min. {listing.min_lease_months} months
          </span>
        )}
        {listing.available_from && (
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <CalendarIcon />From {fmtDate(listing.available_from)}
          </span>
        )}
        {listing.available_until && (
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <CalendarIcon />Until {fmtDate(listing.available_until)}
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
 