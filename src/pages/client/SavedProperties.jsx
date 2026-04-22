import { useState, useEffect, useCallback, useRef } from "react";
import MainLayout from "../../components/layout/Layout";
import api from "../../api/axios";

// ─── Icons ────────────────────────────────────────────────────────────────────
const HeartIcon = ({ filled }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);
const BedIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 4v16"/><path d="M22 8H2"/><path d="M22 20V8l-4-4H6L2 8"/><path d="M6 8v4"/><path d="M18 8v4"/>
  </svg>
);
const BathIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/>
    <line x1="10" y1="5" x2="8" y2="7"/><line x1="2" y1="12" x2="22" y2="12"/>
  </svg>
);
const AreaIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3h7v7H3z"/><path d="M14 3h7v7h-7z"/><path d="M14 14h7v7h-7z"/><path d="M3 14h7v7H3z"/>
  </svg>
);
const LocationIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const StarIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);
const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
  </svg>
);
const EyeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const GridIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/>
    <rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>
  </svg>
);
const ListIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
    <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
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
const MaximizeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/>
    <path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>
  </svg>
);
const PhoneIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.61 4.38 2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);
const MessageIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const FloorIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9h18"/><path d="M3 15h18"/><path d="M3 3h18"/><path d="M3 21h18"/>
  </svg>
);
const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

// ─── Constants ────────────────────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='260' viewBox='0 0 400 260'%3E%3Crect fill='%23e8e4da' width='400' height='260'/%3E%3Cpath d='M160 180 L200 120 L240 180Z' fill='%23c5bfaf'/%3E%3Crect x='175' y='155' width='50' height='25' fill='%23b0a894'/%3E%3C/svg%3E";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatPrice = (price, currency = "EUR") => {
  if (!price) return "–";
  return new Intl.NumberFormat("en-EU", { style: "currency", currency, maximumFractionDigits: 0 }).format(price);
};
const typeLabel = (type) => ({
  APARTMENT: "Apartment", HOUSE: "House", VILLA: "Villa",
  COMMERCIAL: "Commercial", LAND: "Land", OFFICE: "Office",
}[type] || type);
const listingBadge = (type) => ({
  SALE: { label: "For Sale", color: "#2a6049" },
  RENT: { label: "For Rent", color: "#5a3e2b" },
  BOTH: { label: "Sale / Rent", color: "#3a3a6b" },
}[type] || { label: type || "–", color: "#555" });
const imgUrl = (src) => {
  if (!src) return null;
  return src.startsWith("http") ? src : BASE_URL + src;
};

/**
 * Normalise a saved-property entry from the API.
 *
 * The backend returns a SavedProperty entity whose `property` field is a
 * PropertySummaryResponse. Field names follow Java camelCase from the DTO:
 *   listingType, areaSqm, isFeatured, viewCount, primaryImage, agentId, createdAt
 *
 * This helper flattens everything into one predictable shape so every
 * sub-component can use a single consistent object.
 */
function normaliseEntry(entry) {
  // entry may be the SavedProperty wrapper OR a raw PropertySummaryResponse
  const p = entry.property ?? entry;

  return {
    // — wrapper metadata —
    savedAt: entry.savedAt ?? entry.saved_at ?? null,
    note:    entry.note    ?? null,

    // — property core fields (prefer camelCase from DTO, fall back to snake_case) —
    id:          p.id,
    title:       p.title,
    type:        p.type,
    status:      p.status,
    listingType: p.listingType  ?? p.listing_type,
    bedrooms:    p.bedrooms,
    bathrooms:   p.bathrooms,
    areaSqm:     p.areaSqm     ?? p.area_sqm,
    price:       p.price,
    currency:    p.currency    ?? "EUR",
    isFeatured:  p.isFeatured  ?? p.is_featured ?? false,
    viewCount:   p.viewCount   ?? p.view_count  ?? 0,

    // — location (PropertySummaryResponse has flat city/country) —
    city:    p.city    ?? p.address?.city    ?? null,
    country: p.country ?? p.address?.country ?? null,

    // — image (PropertySummaryResponse has primaryImage) —
    primaryImage: p.primaryImage ?? p.primary_image ?? p.imageUrl ?? null,

    // — extended fields only present in PropertyResponse (when detail modal loads) —
    description:  p.description  ?? null,
    floor:        p.floor        ?? null,
    totalFloors:  p.totalFloors  ?? p.total_floors ?? null,
    yearBuilt:    p.yearBuilt    ?? p.year_built   ?? null,
    pricePerSqm:  p.pricePerSqm  ?? p.price_per_sqm ?? null,
    images:       p.images       ?? [],
    features:     p.features     ?? [],
    address:      p.address      ?? null,
    agentId:      p.agentId      ?? p.agent_id ?? null,
    createdAt:    p.createdAt    ?? p.created_at ?? null,
  };
}

// ─── Toast ────────────────────────────────────────────────────────────────────
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

// ─── Property Detail Modal ────────────────────────────────────────────────────
function PropertyDetailModal({ property, onClose, onUnsave, onApply }) {
  const [imgIndex,   setImgIndex]   = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  // When modal opens, try to load the full PropertyResponse for richer details
  const [detail, setDetail] = useState(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    const fn = (e) => {
      if (e.key === "Escape") { if (fullscreen) setFullscreen(false); else onClose(); }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose, fullscreen]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Fetch full property details (PropertyResponse has images array, description, etc.)
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/api/properties/${property.id}`);
        setDetail(normaliseEntry(res.data));
      } catch {
        // silently fall back to summary data already in `property`
      }
    };
    load();
  }, [property.id]);

  // Prefer the richer detail once loaded, otherwise use summary
  const p = detail ?? property;

  const badge  = listingBadge(p.listingType);
  const isRent = ["RENT", "BOTH"].includes(p.listingType);
  const addr   = p.address;
  const addrStr = addr
    ? [addr.street, addr.city, addr.country].filter(Boolean).join(", ")
    : [p.city, p.country].filter(Boolean).join(", ");

  // Build image list: prefer images array from full response, else primaryImage
  const images = (p.images?.length
    ? p.images.map(i => imgUrl(i.imageUrl ?? i.image_url)).filter(Boolean)
    : [imgUrl(p.primaryImage)].filter(Boolean));

  const mainImg = images[imgIndex] || PLACEHOLDER;

  const prevImg = () => setImgIndex(i => (i - 1 + images.length) % images.length);
  const nextImg = () => setImgIndex(i => (i + 1) % images.length);

  return (
    <>
      <div
        ref={overlayRef}
        onClick={e => { if (e.target === overlayRef.current) onClose(); }}
        style={{
          position: "fixed", inset: 0, background: "rgba(20,20,10,0.72)",
          backdropFilter: "blur(4px)", zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "20px", animation: "fadeInOverlay 0.2s ease",
        }}
      >
        <div style={{
          background: "#faf8f3", borderRadius: "18px", width: "100%",
          maxWidth: "820px", maxHeight: "90vh", overflowY: "auto",
          boxShadow: "0 24px 64px rgba(0,0,0,0.35)",
          animation: "slideUpModal 0.25s ease", position: "relative",
        }}>
          <button onClick={onClose} style={{
            position: "sticky", top: "12px", float: "right", marginRight: "12px",
            zIndex: 10, background: "rgba(255,255,255,0.9)", border: "none",
            borderRadius: "50%", width: "34px", height: "34px", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.18)", color: "#4a4a36",
          }}><CloseIcon /></button>

          {/* Image gallery */}
          <div style={{ position: "relative", height: "300px", background: "#1a1a14", borderRadius: "18px 18px 0 0", overflow: "hidden" }}>
            <img src={mainImg} alt={p.title}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              onError={e => { e.target.src = PLACEHOLDER; }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 50%)" }} />
            <div style={{ position: "absolute", top: "14px", left: "14px", display: "flex", gap: 7 }}>
              <span style={{ background: badge.color, color: "#fff", fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "20px" }}>{badge.label}</span>
              {p.isFeatured && (
                <span style={{ background: "#c9a84c", color: "#fff", fontSize: "11px", fontWeight: 700, padding: "3px 8px", borderRadius: "20px", display: "flex", alignItems: "center", gap: 3 }}><StarIcon /> Featured</span>
              )}
            </div>
            <div style={{ position: "absolute", top: "14px", right: "50px", background: "rgba(0,0,0,0.5)", color: "#fff", fontSize: "11px", padding: "3px 9px", borderRadius: "12px", display: "flex", alignItems: "center", gap: 4, backdropFilter: "blur(4px)" }}>
              <EyeIcon /> {p.viewCount ?? 0} views
            </div>
            <button onClick={() => setFullscreen(true)}
              style={{ position: "absolute", bottom: "12px", right: "12px", background: "rgba(0,0,0,0.5)", border: "none", borderRadius: "8px", color: "#fff", padding: "5px 9px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: "11px", backdropFilter: "blur(4px)" }}>
              <MaximizeIcon /> Fullscreen
            </button>
            {images.length > 1 && (
              <>
                <button onClick={prevImg} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.85)", border: "none", borderRadius: "50%", width: "34px", height: "34px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><ChevronLeftIcon /></button>
                <button onClick={nextImg} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.85)", border: "none", borderRadius: "50%", width: "34px", height: "34px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><ChevronRightIcon /></button>
              </>
            )}
            {images.length > 1 && (
              <div style={{ position: "absolute", bottom: "12px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: 5 }}>
                {images.map((_, i) => (
                  <button key={i} onClick={() => setImgIndex(i)}
                    style={{ width: i === imgIndex ? 18 : 7, height: 7, borderRadius: 4, background: i === imgIndex ? "#fff" : "rgba(255,255,255,0.5)", border: "none", cursor: "pointer", padding: 0, transition: "all 0.2s" }} />
                ))}
              </div>
            )}
          </div>

          {/* Body */}
          <div style={{ padding: "22px 26px 26px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 6, flexWrap: "wrap" }}>
              <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: "#2c2c1e", flex: 1 }}>{p.title}</h2>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "24px", fontWeight: 900, color: "#5a5f3a", whiteSpace: "nowrap" }}>{formatPrice(p.price, p.currency)}</div>
                {p.pricePerSqm && (
                  <div style={{ fontSize: "12px", color: "#8a8469" }}>{formatPrice(p.pricePerSqm, p.currency)} / m²</div>
                )}
              </div>
            </div>

            {addrStr && (
              <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#8a8469", fontSize: "13px", marginBottom: 14 }}>
                <LocationIcon /> {addrStr}
              </div>
            )}

            {/* Status / type chips */}
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 18 }}>
              {[
                { bg: "#edf2e8", color: "#3d5227", border: "#c8d4b0", label: p.status || "AVAILABLE" },
                { bg: "#f0ece3", color: "#5a5f3a", border: "#d9d4c7", label: typeLabel(p.type) },
              ].map((c, i) => (
                <span key={i} style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}`, borderRadius: "20px", padding: "3px 12px", fontSize: "12px", fontWeight: 700 }}>{c.label}</span>
              ))}
            </div>

            {/* Specs */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px,1fr))", gap: 10, marginBottom: 20 }}>
              {[
                { icon: <BedIcon />,      label: "Bedrooms",  val: p.bedrooms },
                { icon: <BathIcon />,     label: "Bathrooms", val: p.bathrooms },
                { icon: <AreaIcon />,     label: "Area",      val: p.areaSqm, unit: "m²" },
                { icon: <FloorIcon />,    label: "Floor",     val: p.floor != null ? `${p.floor} / ${p.totalFloors ?? "–"}` : null },
                { icon: <CalendarIcon />, label: "Year Built", val: p.yearBuilt },
              ].filter(s => s.val != null).map((s, i) => (
                <div key={i} style={{ background: "#fff", border: "1px solid #e5e0d4", borderRadius: 10, padding: "10px 12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#a0997e", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 3 }}>
                    {s.icon} {s.label}
                  </div>
                  <div style={{ fontSize: "15px", fontWeight: 800, color: "#2c2c1e" }}>{s.val}{s.unit ? ` ${s.unit}` : ""}</div>
                </div>
              ))}
            </div>

            {/* Features */}
            {p.features?.length > 0 && (
              <div style={{ marginBottom: 18 }}>
                <h4 style={{ margin: "0 0 8px", fontSize: "12px", fontWeight: 700, color: "#6b6651", textTransform: "uppercase", letterSpacing: "0.6px" }}>Features</h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {p.features.map((f, i) => (
                    <span key={i} style={{ background: "#edf2e8", color: "#3d5227", border: "1px solid #c8d4b0", borderRadius: "20px", padding: "3px 11px", fontSize: "12px", fontWeight: 600 }}>
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {p.description && (
              <div style={{ marginBottom: 18 }}>
                <h4 style={{ margin: "0 0 7px", fontSize: "12px", fontWeight: 700, color: "#6b6651", textTransform: "uppercase", letterSpacing: "0.6px" }}>Description</h4>
                <p style={{ margin: 0, fontSize: "13.5px", lineHeight: 1.7, color: "#4a4a36", whiteSpace: "pre-wrap" }}>{p.description}</p>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 4 }}>
              <button style={{ display: "flex", alignItems: "center", gap: 6, background: "#5a5f3a", color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", fontSize: "13.5px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                <MessageIcon /> Send Message
              </button>
              <button style={{ display: "flex", alignItems: "center", gap: 6, background: "#f0ece3", color: "#5a5f3a", border: "1.5px solid #d9d4c7", borderRadius: 10, padding: "10px 18px", fontSize: "13.5px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                <PhoneIcon /> Request Viewing
              </button>
              {isRent && (p.status === "AVAILABLE" || !p.status) && (
                <button
                  onClick={() => { onClose(); onApply(p); }}
                  style={{ display: "flex", alignItems: "center", gap: 6, background: "#c9a84c", color: "#1f1f1f", border: "none", borderRadius: 10, padding: "10px 18px", fontSize: "13.5px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
                >
                  🔑 Apliko për Qira
                </button>
              )}
              <button
                onClick={() => { onUnsave(p.id); onClose(); }}
                style={{ display: "flex", alignItems: "center", gap: 6, background: "#fee2e2", color: "#dc2626", border: "1.5px solid #fecaca", borderRadius: 10, padding: "10px 18px", fontSize: "13.5px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
              >
                <HeartIcon filled /> Hiq nga të preferuarat
              </button>
            </div>
          </div>
        </div>
      </div>

      {fullscreen && (
        <div onClick={() => setFullscreen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.95)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", cursor: "zoom-out" }}>
          <img src={mainImg} alt="" style={{ maxWidth: "95vw", maxHeight: "95vh", objectFit: "contain" }} />
          {images.length > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); prevImg(); }} style={{ position: "fixed", left: "16px", top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: "44px", height: "44px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}><ChevronLeftIcon /></button>
              <button onClick={e => { e.stopPropagation(); nextImg(); }} style={{ position: "fixed", right: "16px", top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: "44px", height: "44px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}><ChevronRightIcon /></button>
            </>
          )}
          <button onClick={() => setFullscreen(false)} style={{ position: "fixed", top: "16px", right: "16px", background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: "40px", height: "40px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}><CloseIcon /></button>
        </div>
      )}
    </>
  );
}

// ─── Rental Apply Modal ───────────────────────────────────────────────────────
function RentalApplyModal({ property, onClose, onSuccess, notify }) {
  const [listings,  setListings]  = useState([]);
  const [loadingL,  setLoadingL]  = useState(true);
  const [selectedL, setSelectedL] = useState(null);
  const [form,      setForm]      = useState({ message: "", income: "", move_in_date: "" });
  const [saving,    setSaving]    = useState(false);

  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  useEffect(() => {
    const load = async () => {
      setLoadingL(true);
      try {
        const res = await api.get(`/api/rentals/listings/property/${property.id}`);
        const active = (Array.isArray(res.data) ? res.data : []).filter(l => l.status === "ACTIVE");
        setListings(active);
        if (active.length === 1) setSelectedL(active[0]);
      } catch {
        notify("Nuk u ngarkuan listings-et", "error");
      } finally {
        setLoadingL(false);
      }
    };
    load();
  }, [property.id, notify]);

  const handleSubmit = async () => {
    if (!selectedL) { notify("Zgjidh një listing", "error"); return; }
    setSaving(true);
    try {
      await api.post("/api/rentals/applications", {
        listing_id: selectedL.id,
        message: form.message || null,
        income: form.income ? Number(form.income) : null,
        move_in_date: form.move_in_date || null,
      });
      onSuccess();
    } catch (err) {
      notify(err.response?.data?.message || "Gabim gjatë aplikimit", "error");
    } finally {
      setSaving(false);
    }
  };

  const fmtMoney = (v) => v != null ? `€${Number(v).toLocaleString("de-DE")}` : "—";

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(15,23,42,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ width: "100%", maxWidth: 520, background: "#fff", borderRadius: 16, boxShadow: "0 20px 60px rgba(15,23,42,0.2)", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ padding: "16px 22px", borderBottom: "1px solid #e8edf4", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: 15, margin: "0 0 2px" }}>Apliko për Qira</p>
            <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>{property.title}</p>
          </div>
          <button onClick={onClose} style={{ border: "none", background: "none", color: "#94a3b8", cursor: "pointer", fontSize: 16, padding: "4px" }}>✕</button>
        </div>
        <div style={{ padding: "18px 22px" }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: 6 }}>Listing disponueshëm *</label>
            {loadingL ? (
              <div style={{ padding: "12px", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>Duke ngarkuar...</div>
            ) : listings.length === 0 ? (
              <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 8, padding: "12px", fontSize: 13, color: "#c2410c" }}>
                ⚠️ Nuk ka listings aktive aktualisht.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {listings.map(l => (
                  <div key={l.id} onClick={() => setSelectedL(l)}
                    style={{ padding: "11px 13px", borderRadius: 10, cursor: "pointer", border: `2px solid ${selectedL?.id === l.id ? "#6366f1" : "#e2e8f0"}`, background: selectedL?.id === l.id ? "#eef2ff" : "#f8fafc", transition: "all 0.15s" }}>
                    <p style={{ fontWeight: 600, fontSize: 13.5, margin: "0 0 2px" }}>{l.title || `Listing #${l.id}`}</p>
                    <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>
                      {fmtMoney(l.price)} / {(l.price_period || "MONTHLY").toLowerCase()}
                      {l.deposit ? ` · Depozita: ${fmtMoney(l.deposit)}` : ""}
                      {l.min_lease_months ? ` · Min. ${l.min_lease_months} muaj` : ""}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
          {listings.length > 0 && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: 5 }}>Të ardhura mujore (€)</label>
                  <input type="number" placeholder="p.sh. 1500" value={form.income} onChange={e => setForm(f => ({ ...f, income: e.target.value }))}
                    style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 13.5, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: 5 }}>Data e hyrjes</label>
                  <input type="date" value={form.move_in_date} onChange={e => setForm(f => ({ ...f, move_in_date: e.target.value }))}
                    style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 13.5, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
                </div>
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: 5 }}>Mesazhi (opcional)</label>
                <textarea rows={3} placeholder="Prezantohuni shkurtimisht..." value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  style={{ width: "100%", padding: "9px 12px", border: "1px solid #cbd5e1", borderRadius: 10, fontSize: 13.5, fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box" }} />
              </div>
            </>
          )}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button onClick={onClose} style={{ padding: "9px 20px", borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#f8fafc", color: "#475569", fontWeight: 600, fontSize: 13.5, cursor: "pointer", fontFamily: "inherit" }}>Anulo</button>
            <button onClick={handleSubmit} disabled={saving || listings.length === 0 || !selectedL}
              style={{ padding: "9px 20px", borderRadius: 10, border: "none", background: saving || !selectedL ? "#a3a380" : "#5a5f3a", color: "#fff", fontWeight: 700, fontSize: 13.5, cursor: saving || !selectedL ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
              {saving ? "Duke dërguar..." : "Dërgo Aplikimin"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Saved Property Card ──────────────────────────────────────────────────────
function SavedPropertyCard({ property, savedAt, viewMode, onOpen, onUnsave }) {
  const badge    = listingBadge(property.listingType);
  const img      = imgUrl(property.primaryImage) || PLACEHOLDER;
  const isGrid   = viewMode === "grid";
  const savedAtFmt = savedAt ? new Date(savedAt).toLocaleDateString("sq-AL") : null;

  const handleUnsave = (e) => {
    e.stopPropagation();
    onUnsave(property.id);
  };

  return (
    <div
      onClick={() => onOpen(property)}
      style={{
        background: "#fff", borderRadius: "14px", overflow: "hidden",
        boxShadow: "0 2px 12px rgba(90,95,58,0.10)", cursor: "pointer",
        display: isGrid ? "block" : "flex",
        transition: "transform 0.18s, box-shadow 0.18s",
        border: "1px solid #ede9df",
        minHeight: isGrid ? "auto" : "160px",
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(90,95,58,0.18)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(90,95,58,0.10)"; }}
    >
      <div style={{ position: "relative", width: isGrid ? "100%" : "220px", minWidth: isGrid ? "auto" : "220px", height: isGrid ? "200px" : "100%", minHeight: isGrid ? "200px" : "160px", background: "#f0ece3", flexShrink: 0 }}>
        <img src={img} alt={property.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={e => { e.target.src = PLACEHOLDER; }} />
        <div style={{ position: "absolute", top: "10px", left: "10px", display: "flex", gap: 6 }}>
          <span style={{ background: badge.color, color: "#fff", fontSize: "11px", fontWeight: 700, padding: "3px 9px", borderRadius: "20px" }}>{badge.label}</span>
          {property.isFeatured && (
            <span style={{ background: "#c9a84c", color: "#fff", fontSize: "11px", fontWeight: 700, padding: "3px 8px", borderRadius: "20px", display: "flex", alignItems: "center", gap: 3 }}><StarIcon /> Featured</span>
          )}
        </div>
        {/* Unsave button */}
        <button
          onClick={handleUnsave}
          title="Hiq nga të preferuarat"
          style={{
            position: "absolute", top: "10px", right: "10px",
            background: "#e74c3c", border: "none", borderRadius: "50%",
            width: "32px", height: "32px", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.18)", color: "#fff",
            transition: "all 0.18s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#c0392b"; e.currentTarget.style.transform = "scale(1.1)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#e74c3c"; e.currentTarget.style.transform = "scale(1)"; }}
        >
          <HeartIcon filled />
        </button>
        <span style={{ position: "absolute", bottom: "10px", right: "10px", background: "rgba(0,0,0,0.55)", color: "#fff", fontSize: "11px", padding: "2px 8px", borderRadius: "8px", backdropFilter: "blur(4px)" }}>
          {typeLabel(property.type)}
        </span>
      </div>

      <div style={{ padding: isGrid ? "16px" : "16px 20px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          {(property.city || property.country) && (
            <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#8a8469", fontSize: "12px", marginBottom: 5 }}>
              <LocationIcon /><span>{[property.city, property.country].filter(Boolean).join(", ")}</span>
            </div>
          )}
          <h3 style={{ margin: "0 0 7px", fontSize: isGrid ? "15px" : "16px", fontWeight: 700, color: "#2c2c1e", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
            {property.title}
          </h3>
          <div style={{ fontSize: isGrid ? "18px" : "20px", fontWeight: 800, color: "#5a5f3a", marginBottom: 9 }}>
            {formatPrice(property.price, property.currency)}
          </div>
        </div>

        <div>
          <div style={{ display: "flex", gap: "13px", color: "#6b6651", fontSize: "12.5px", flexWrap: "wrap", marginBottom: savedAtFmt ? 8 : 0 }}>
            {property.bedrooms  != null && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><BedIcon />{property.bedrooms} bed{property.bedrooms !== 1 ? "s" : ""}</span>}
            {property.bathrooms != null && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><BathIcon />{property.bathrooms} bath{property.bathrooms !== 1 ? "s" : ""}</span>}
            {property.areaSqm   != null && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><AreaIcon />{property.areaSqm} m²</span>}
          </div>
          {savedAtFmt && (
            <div style={{ fontSize: 11.5, color: "#a0997e", marginTop: 4 }}>
              ❤️ Ruajtur më {savedAtFmt}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function SavedProperties() {
  const [savedList,     setSavedList]     = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [page,          setPage]          = useState(0);
  const [totalPages,    setTotalPages]    = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [viewMode,      setViewMode]      = useState("grid");
  const [toast,         setToast]         = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [applyTarget,   setApplyTarget]   = useState(null);

  const notify = useCallback((msg, type = "success") =>
    setToast({ msg, type, key: Date.now() }), []);

  const loadSaved = useCallback(async (pg = 0) => {
    setLoading(true);
    try {
      const res  = await api.get(`/api/saved-properties?page=${pg}&size=12`);
      const data = res.data;

      // API returns Page<SavedPropertyResponse> or plain array
      const raw = Array.isArray(data) ? data : (data.content ?? []);

      // Normalise each entry so field names are consistent
      setSavedList(raw.map(normaliseEntry));

      if (Array.isArray(data)) {
        setTotalPages(1);
        setTotalElements(data.length);
      } else {
        setTotalPages(data.totalPages    ?? 0);
        setTotalElements(data.totalElements ?? 0);
      }
      setPage(pg);
    } catch {
      notify("Gabim gjatë ngarkimit të të preferuarave", "error");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => { loadSaved(0); }, [loadSaved]);

  const handleUnsave = useCallback(async (propertyId) => {
    // Optimistic removal
    setSavedList(prev => prev.filter(p => p.id !== propertyId));
    setTotalElements(prev => prev - 1);
    try {
      await api.delete(`/api/saved-properties/${propertyId}`);
      notify("Prona u hoq nga të preferuarat");
    } catch (err) {
      // Revert on failure
      loadSaved(page);
      notify(err.response?.data?.message || "Gabim gjatë heqjes", "error");
    }
  }, [loadSaved, notify, page]);

  const gridStyle = (mode) => ({
    display: mode === "grid" ? "grid" : "flex",
    gridTemplateColumns: mode === "grid" ? "repeat(auto-fill, minmax(280px, 1fr))" : undefined,
    flexDirection: mode === "list" ? "column" : undefined,
    gap: "16px",
  });

  return (
    <MainLayout role="client">
      <div style={{ background: "#f5f2eb", minHeight: "100vh", fontFamily: "'Georgia', serif" }}>

        {/* Hero */}
        <div style={{ background: "linear-gradient(135deg, #5a5f3a 0%, #3d4228 100%)", padding: "40px 24px 36px", textAlign: "center" }}>
          <h1 style={{ margin: "0 0 6px", fontSize: "28px", fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>
            ❤️ Pronat e Preferuara
          </h1>
          <p style={{ margin: 0, color: "#c8ccaa", fontSize: "14.5px" }}>
            {loading ? "Duke ngarkuar..." : `${totalElements} pronë të ruajtura`}
          </p>
        </div>

        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "28px 24px" }}>

          {/* Toolbar */}
          {!loading && savedList.length > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
              <span style={{ color: "#8a8469", fontSize: "13.5px" }}>
                {totalElements} pronë të preferuara
              </span>
              <div style={{ display: "flex", gap: 4 }}>
                {[{ m: "grid", icon: <GridIcon /> }, { m: "list", icon: <ListIcon /> }].map(({ m, icon }) => (
                  <button key={m} onClick={() => setViewMode(m)} style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "7px 10px", borderRadius: "8px", border: "none", background: viewMode === m ? "#5a5f3a" : "#f0ece3", color: viewMode === m ? "#fff" : "#5a5f3a", cursor: "pointer", transition: "all 0.15s" }}>{icon}</button>
                ))}
              </div>
            </div>
          )}

          {/* Content */}
          {loading ? (
            <div style={gridStyle("grid")}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ background: "#f0ece3", borderRadius: "14px", height: "300px", animation: "pulse 1.4s ease-in-out infinite" }} />
              ))}
            </div>
          ) : savedList.length === 0 ? (
            <div style={{ textAlign: "center", padding: "72px 32px", color: "#8a8469" }}>
              <div style={{ fontSize: 52, marginBottom: 14 }}>🏠</div>
              <h3 style={{ color: "#5a5f3a", margin: "0 0 8px", fontSize: 20 }}>Nuk keni prona të ruajtura</h3>
              <p style={{ margin: "0 0 22px", fontSize: 14 }}>
                Klikoni ikonën ❤️ në kartat e pronave për t'i shtuar këtu.
              </p>
              <a href="/client/browseproperties" style={{ padding: "10px 26px", borderRadius: 10, background: "#5a5f3a", color: "#fff", textDecoration: "none", fontSize: 14, fontWeight: 700, fontFamily: "inherit" }}>
                Shfleto Pronat
              </a>
            </div>
          ) : (
            <>
              <div style={gridStyle(viewMode)}>
                {savedList.map((property) => (
                  <SavedPropertyCard
                    key={property.id}
                    property={property}
                    savedAt={property.savedAt}
                    viewMode={viewMode}
                    onOpen={setSelectedProperty}
                    onUnsave={handleUnsave}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 32 }}>
                  <button disabled={page === 0} onClick={() => loadSaved(page - 1)}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 8, border: "1.5px solid #d9d4c7", background: page === 0 ? "#f5f2eb" : "#fff", color: page === 0 ? "#c5bfaf" : "#5a5f3a", cursor: page === 0 ? "not-allowed" : "pointer" }}>
                    <ChevronLeftIcon />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i)
                    .filter(p => p === 0 || p === totalPages - 1 || Math.abs(p - page) <= 1)
                    .map((p, i, arr) => (
                      <span key={p} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {arr[i - 1] != null && p - arr[i - 1] > 1 && <span style={{ color: "#8a8469" }}>…</span>}
                        <button onClick={() => loadSaved(p)}
                          style={{ width: 36, height: 36, borderRadius: 8, border: "1.5px solid", borderColor: p === page ? "#5a5f3a" : "#d9d4c7", background: p === page ? "#5a5f3a" : "#fff", color: p === page ? "#fff" : "#5a5f3a", fontWeight: p === page ? 700 : 400, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                          {p + 1}
                        </button>
                      </span>
                    ))
                  }
                  <button disabled={page >= totalPages - 1} onClick={() => loadSaved(page + 1)}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 8, border: "1.5px solid #d9d4c7", background: page >= totalPages - 1 ? "#f5f2eb" : "#fff", color: page >= totalPages - 1 ? "#c5bfaf" : "#5a5f3a", cursor: page >= totalPages - 1 ? "not-allowed" : "pointer" }}>
                    <ChevronRightIcon />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Property detail modal */}
      {selectedProperty && (
        <PropertyDetailModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          onUnsave={(id) => {
            handleUnsave(id);
            setSelectedProperty(null);
          }}
          onApply={(property) => {
            setSelectedProperty(null);
            setApplyTarget(property);
          }}
        />
      )}

      {/* Rental apply modal */}
      {applyTarget && (
        <RentalApplyModal
          property={applyTarget}
          onClose={() => setApplyTarget(null)}
          onSuccess={() => {
            setApplyTarget(null);
            notify("Aplikimi u dërgua me sukses! 🎉");
          }}
          notify={notify}
        />
      )}

      {toast && (
        <Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />
      )}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:.9} }
        @keyframes fadeInOverlay { from{opacity:0} to{opacity:1} }
        @keyframes slideUpModal { from{transform:translateY(24px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px);} to{opacity:1;transform:translateY(0);} }
      `}</style>
    </MainLayout>
  );
}